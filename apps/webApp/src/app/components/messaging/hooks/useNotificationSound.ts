import { useCallback, useEffect, useRef, useState } from 'react';

const PREFERENCE_KEY = 'gt.messaging.soundEnabled';

/**
 * Kept in localStorage rather than the sessionStorage that usePersistedState
 * uses: filters are per-tab because two tabs are usually two pieces of work,
 * but somebody who turned the ping off meant off, everywhere, until they turn
 * it back on.
 */
function readPreference(): boolean {
  try {
    return localStorage.getItem(PREFERENCE_KEY) !== 'false';
  } catch {
    // Private browsing throws on access. Defaulting to on is the same as
    // never having set it.
    return true;
  }
}

let audioContext: AudioContext | null = null;

/**
 * A short two-note ping, synthesised rather than loaded.
 *
 * No file to ship, no request to make, and nothing to go missing from the
 * bundle. Two notes because a single beep is easy to mistake for the operating
 * system.
 */
function playPing(): void {
  try {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return;

    audioContext = audioContext ?? new Ctor();
    // Browsers suspend the context until the page has been interacted with.
    if (audioContext.state === 'suspended') void audioContext.resume();

    const now = audioContext.currentTime;
    [
      { frequency: 880, at: 0 },
      { frequency: 1174.7, at: 0.11 },
    ].forEach(({ frequency, at }) => {
      const oscillator = audioContext!.createOscillator();
      const gain = audioContext!.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;

      // Eased in and out: a square-edged gain envelope clicks.
      gain.gain.setValueAtTime(0, now + at);
      gain.gain.linearRampToValueAtTime(0.12, now + at + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + at + 0.16);

      oscillator.connect(gain).connect(audioContext!.destination);
      oscillator.start(now + at);
      oscillator.stop(now + at + 0.18);
    });
  } catch {
    // Audio is a courtesy. If the browser refuses, the badge still moved.
  }
}

/**
 * Pings when the unread total goes up.
 *
 * Notification here is in-app only, so the badge is the whole mechanism — and
 * a badge only works on someone already looking at that corner of the screen.
 * The sound is what makes it work for someone who is not.
 *
 * Only ever on an increase, and never on the first reading: otherwise opening
 * the app would replay every unread message that arrived while it was closed.
 */
export function useNotificationSound(unreadTotal: number) {
  const [enabled, setEnabledState] = useState(readPreference);
  const previousTotal = useRef<number | null>(null);

  const setEnabled = useCallback((next: boolean) => {
    setEnabledState(next);
    try {
      localStorage.setItem(PREFERENCE_KEY, String(next));
    } catch {
      // Preference is lost on reload; the toggle still works for this session.
    }
    if (next) playPing(); // Confirms it is audible, and unlocks the context.
  }, []);

  useEffect(() => {
    if (previousTotal.current === null) {
      previousTotal.current = unreadTotal;
      return;
    }

    if (unreadTotal > previousTotal.current && enabled) {
      playPing();
    }
    // Reset on a drop too, so clearing then receiving pings again.
    previousTotal.current = unreadTotal;
  }, [unreadTotal, enabled]);

  return { enabled, setEnabled };
}
