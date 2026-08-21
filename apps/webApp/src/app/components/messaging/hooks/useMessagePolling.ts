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

/**
 * Poll rate while the tab is in the background.
 *
 * Backgrounded tabs used to stop asking altogether, which meant nothing could
 * tell you a message had arrived while you were somewhere else — the one
 * moment being told is worth anything. A plain request a minute costs about
 * fifteen requests a minute across the whole shop and keeps the badge, the
 * ping and the desktop notification alive without holding a connection open
 * for a tab nobody is looking at.
 */
const BACKGROUND_GAP_MS = 60_000;

/** Backoff after a failure, so an outage is not hammered. */
const ERROR_BACKOFF_MS = 5_000;

interface PollingState {
  messages: MessageDto[];
  unreadMentions: number;
  conversationUnreads: Record<string, number>;
  /** Every unread message counted once — see PollResponseDto. */
  unreadTotal: number;
  /** Whether the thread holds messages older than the ones loaded. */
  hasOlder: boolean;
  loading: boolean;
}

/**
 * Every bit of transport for messaging lives here, so components only ever see
 * an accumulated message list.
 *
 * A tab in front holds a request open, so a message appears the moment it is
 * written. A tab in the background drops to one plain request a minute — cheap
 * enough for a window left open overnight, but still enough to raise the
 * badge, the ping and the desktop notification while somebody is working
 * somewhere else. Coming back polls immediately rather than making them wait
 * out an interval that started before they left.
 */
export function useMessagePolling(conversationId?: string) {
  const [state, setState] = useState<PollingState>({
    messages: [],
    unreadMentions: 0,
    conversationUnreads: {},
    unreadTotal: 0,
    hasOlder: false,
    loading: Boolean(conversationId),
  });

  // The server's clock, echoed back verbatim. Never Date.now(): a browser
  // running fast would ask for messages newer than a moment that has not
  // happened yet, and never see them.
  const cursorRef = useRef<string | undefined>(undefined);
  const abortRef = useRef<AbortController | undefined>(undefined);
  const stoppedRef = useRef(false);
  /** Ends the current wait early. Set only while the loop is between polls. */
  const cutSleepShortRef = useRef<(() => void) | null>(null);

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
          unreadTotal: result.unreadTotal,
          // Only the opening poll answers this; later ones say nothing about
          // history and must not overwrite what it said.
          hasOlder: result.hasOlderMessages ?? prev.hasOlder,
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
      unreadTotal: 0,
      hasOlder: false,
      loading: Boolean(conversationId),
    });

    /*
     * Interruptible, because the background wait is a minute long.
     *
     * Coming back to the tab used to fire a one-off catch-up while the loop
     * itself stayed asleep, so the next held poll could be up to a minute
     * away — a message written ten seconds after somebody returned would not
     * arrive until the interval that started while they were gone ran out.
     */
    const sleep = (ms: number) =>
      new Promise<void>((resolve) => {
        const finish = () => {
          clearTimeout(timer);
          cutSleepShortRef.current = null;
          resolve();
        };
        const timer = setTimeout(finish, ms);
        cutSleepShortRef.current = finish;
      });

    const loop = async () => {
      /*
       * The first trip must not hold.
       *
       * The server only returns early when it has something to send, so an
       * empty thread — every repair order nobody has written in yet — held the
       * very first request for the full twenty-five seconds. The panel sat on
       * a spinner that whole time before admitting it had nothing to show,
       * which read as "messaging is broken" rather than "no messages yet".
       * Ask once without a hold to paint what exists, then settle into holds.
       */
      let holdThisPass = false;

      while (!stoppedRef.current) {
        // Read once per pass: whether the tab is in front decides both how the
        // request is made and how long to wait before the next one.
        const backgrounded = document.hidden;

        const controller = new AbortController();
        abortRef.current = controller;

        try {
          const result = await pollMessages({
            conversationId,
            since: cursorRef.current,
            // Never hold a connection open for a tab nobody is looking at.
            waitMs: backgrounded || !holdThisPass ? undefined : HOLD_MS,
            signal: controller.signal,
          });
          holdThisPass = true;
          if (stoppedRef.current) return;
          applyResult(result);
          await sleep(backgrounded ? BACKGROUND_GAP_MS : GAP_MS);
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
      if (document.hidden) return;
      // Catch up now, and let the loop stop waiting so its next pass holds a
      // connection open again rather than finishing a background interval.
      void runPoll();
      cutSleepShortRef.current?.();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      stoppedRef.current = true;
      abortRef.current?.abort();
      cutSleepShortRef.current?.();
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [conversationId, applyResult, runPoll]);

  /** Put a page of history in front of what is already loaded. */
  const prependLocal = useCallback((older: MessageDto[], hasOlder: boolean) => {
    setState((prev) => {
      const seen = new Set(prev.messages.map((m) => m.id));
      const added = older.filter((m) => !seen.has(m.id));
      return { ...prev, messages: [...added, ...prev.messages], hasOlder };
    });
  }, []);

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

  return {
    ...state,
    refresh: runPoll,
    appendLocal,
    prependLocal,
    replaceLocal,
    removeLocal,
  };
}
