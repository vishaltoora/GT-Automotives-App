import { useCallback, useEffect, useRef, useState } from 'react';
import type { MessageDto } from '@gt-automotive/data';
import { pollMessages } from '../../../requests/messaging.requests';

/** Cadence while somebody is actually reading the thread. */
const ACTIVE_INTERVAL_MS = 10_000;
/** Cadence once the thread has been quiet for a while. */
const IDLE_INTERVAL_MS = 60_000;
/** How long without a new message before we consider the thread idle. */
const IDLE_AFTER_MS = 2 * 60_000;

interface PollingState {
  messages: MessageDto[];
  unreadMentions: number;
  conversationUnreads: Record<string, number>;
  loading: boolean;
}

/**
 * Every bit of transport for messaging lives here.
 *
 * Components only ever see the accumulated message list, which is what makes
 * the eventual switch to long polling a change to this file alone.
 *
 * Two things keep the request count honest. Polling stops entirely while the
 * tab is hidden — a tab left open overnight is what turns a reasonable number
 * of requests into a silly one — and the interval backs off once the thread
 * goes quiet, which for a shop doing a couple of hundred messages a day is
 * most of the time.
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
  // happened yet and never see them.
  const cursorRef = useRef<string | undefined>(undefined);
  const lastActivityRef = useRef<number>(Date.now());
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const abortRef = useRef<AbortController | undefined>(undefined);

  const runPoll = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const result = await pollMessages({
        conversationId,
        since: cursorRef.current,
        signal: controller.signal,
      });

      cursorRef.current = result.serverTime;

      setState((prev) => {
        if (result.messages.length > 0) {
          lastActivityRef.current = Date.now();
        }

        // Merge rather than replace: the cursor only ever returns what is new,
        // and a re-send of an id we already hold must not duplicate it.
        const seen = new Set(prev.messages.map((m) => m.id));
        const added = result.messages.filter((m) => !seen.has(m.id));

        return {
          messages: added.length ? [...prev.messages, ...added] : prev.messages,
          unreadMentions: result.unreadMentions,
          conversationUnreads: result.conversationUnreads,
          loading: false,
        };
      });
    } catch (error) {
      if (!controller.signal.aborted) {
        // A failed poll is not worth interrupting anyone over — the next one
        // is seconds away and will catch up from the same cursor.
        setState((prev) => ({ ...prev, loading: false }));
      }
    }
  }, [conversationId]);

  const scheduleNext = useCallback(() => {
    const quietFor = Date.now() - lastActivityRef.current;
    const delay =
      quietFor > IDLE_AFTER_MS ? IDLE_INTERVAL_MS : ACTIVE_INTERVAL_MS;

    timerRef.current = setTimeout(async () => {
      if (!document.hidden) {
        await runPoll();
      }
      scheduleNext();
    }, delay);
  }, [runPoll]);

  useEffect(() => {
    // A new thread starts from scratch: its cursor and history belong to it.
    cursorRef.current = undefined;
    lastActivityRef.current = Date.now();
    setState({
      messages: [],
      unreadMentions: 0,
      conversationUnreads: {},
      loading: Boolean(conversationId),
    });

    void runPoll();
    scheduleNext();

    const onVisibilityChange = () => {
      // Catch up immediately on return rather than making someone wait out
      // the remainder of an interval that elapsed while they were away.
      if (!document.hidden) void runPoll();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      abortRef.current?.abort();
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [conversationId, runPoll, scheduleNext]);

  /** Push a just-sent message in without waiting for the next poll. */
  const appendLocal = useCallback((message: MessageDto) => {
    lastActivityRef.current = Date.now();
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
