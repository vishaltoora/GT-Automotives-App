/**
 * Announces that something has been marked read.
 *
 * The badge and the thread are separate components with separate polls, and
 * the poll may be held open for twenty-five seconds — so reading a thread left
 * the count stale for up to that long. The repair order page has no path to
 * the badge at all.
 *
 * A window event reaches all of them without threading a callback through
 * every mount point, and costs nothing when nobody is listening.
 */
const EVENT = 'gt:messaging-read';

export function announceRead(): void {
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function onReadAnnounced(listener: () => void): () => void {
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}
