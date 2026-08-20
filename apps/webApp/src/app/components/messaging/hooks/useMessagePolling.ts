import { useCallback, useEffect, useRef, useState } from 'react';
import type { MessageDto } from '@gt-automotive/data';
import { pollMessages } from '../../../requests/messaging.requests';

/**
 * How long the server may hold a request open waiting for something to happen.
 *
 * The hold is the interval. A message comes back the moment it is written
 * rather than up to ten seconds later, and an idle thread costs one request
 * every twenty-five seconds instead of one every ten. Capped server-side too,
 * below the reverse proxy's thirty second timeout.
 */
const HOLD_MS = 25_000;

/** Breather between holds, so a server answering instantly cannot spin. */
const GAP_MS = 500;

/** Backoff after a failure, so an outage is not hammered. */
const ERROR_BACKOFF_MS = 5_000;

interface PollingState {
  messages: MessageDto[];
  unreadMentions: number;
  conversationUnreads: Record<string, number>;
  loading: boolean;
}

/**
 * Every bit of transport for messaging lives here, so components only ever see
 * an accumulated message list.
 *
 * Polling stops entirely while the tab is hidden — a window left open
 * overnight is what turns a reasonable number of requests into a silly one —
 * and resumes with an immediate catch-up when someone comes back, rather than
 * making them wait out a hold that started before they left.
 */
export function useMessagePolling(conversationId?: string) {
  const [state, setState] = useState<PollingState>({
    messages: [],
    unreadMentions: 0,
    conversationUnreads: {},
    loading: Boolean(conversationId),
  });

  // The server's clock, echoed back verbatim. Never Date.now(): a browser
  // running fast would ask for messages newer than a moment that has not
  // happened yet, and never see them.
  const cursorRef = useRef<string | undefined>(undefined);
  const abortRef = useRef<AbortController | undefined>(undefined);
  const stoppedRef = useRef(false);

  const applyResult = useCallback(
    (result: Awaited<ReturnType<typeof pollMessages>>) => {
      cursorRef.current = result.serverTime;

      setState((prev) => {
        // Merge rather than replace: the cursor only returns what is new, and
        // a message we already hold must not appear twice.
        const seen = new Set(prev.messages.map((m) => m.id));
        const added = result.messages.filter((m) => !seen.has(m.id));

        return {
          messages: added.length ? [...prev.messages, ...added] : prev.messages,
          unreadMentions: result.unreadMentions,
          conversationUnreads: result.conversationUnreads,
          loading: false,
        };
      });
    },
    []
  );

  /** One immediate round trip, for mount and for returning to the tab. */
  const runPoll = useCallback(async () => {
    try {
      const result = await pollMessages({
        conversationId,
        since: cursorRef.current,
      });
      if (!stoppedRef.current) applyResult(result);
    } catch {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [conversationId, applyResult]);

  useEffect(() => {
    stoppedRef.current = false;
    cursorRef.current = undefined;
    setState({
      messages: [],
      unreadMentions: 0,
      conversationUnreads: {},
      loading: Boolean(conversationId),
    });

    const sleep = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    const loop = async () => {
      while (!stoppedRef.current) {
        if (document.hidden) {
          await sleep(GAP_MS);
          continue;
        }

        const controller = new AbortController();
        abortRef.current = controller;

        try {
          const result = await pollMessages({
            conversationId,
            since: cursorRef.current,
            waitMs: HOLD_MS,
            signal: controller.signal,
          });
          if (stoppedRef.current) return;
          applyResult(result);
          await sleep(GAP_MS);
        } catch {
          if (stoppedRef.current || controller.signal.aborted) return;
          // A failed poll is not worth interrupting anyone over. Back off and
          // pick up from the same cursor — nothing is lost.
          setState((prev) => ({ ...prev, loading: false }));
          await sleep(ERROR_BACKOFF_MS);
        }
      }
    };

    void loop();

    const onVisibilityChange = () => {
      if (!document.hidden) void runPoll();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      stoppedRef.current = true;
      abortRef.current?.abort();
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [conversationId, applyResult, runPoll]);

  /** Show a just-sent message without waiting for the next round trip. */
  const appendLocal = useCallback((message: MessageDto) => {
    setState((prev) =>
      prev.messages.some((m) => m.id === message.id)
        ? prev
        : { ...prev, messages: [...prev.messages, message] }
    );
  }, []);

  const replaceLocal = useCallback((message: MessageDto) => {
    setState((prev) => ({
      ...prev,
      messages: prev.messages.map((m) => (m.id === message.id ? message : m)),
    }));
  }, []);

  const removeLocal = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      messages: prev.messages.filter((m) => m.id !== id),
    }));
  }, []);

  return { ...state, refresh: runPoll, appendLocal, replaceLocal, removeLocal };
}
