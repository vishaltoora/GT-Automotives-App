import type { MessageDto } from '@gt-automotive/data';

/**
 * How many messages have landed at the bottom of a thread since it was last
 * looked at, identified by the message that was newest then.
 *
 * Identity rather than a count, because the list grows for two unrelated
 * reasons: messages arriving, and history being loaded above them. A count
 * cannot tell those apart, and the attempt to — a flag held up for the
 * duration of the "load earlier" request — swallowed anything that arrived
 * while it was in flight: no notice of it, and no way to recover the count
 * afterwards. Prepending leaves the newest message alone, so this returns 0
 * for it without needing to know it happened.
 */
export function arrivalsSince(
  messages: MessageDto[],
  previousNewestId: string | undefined
): number {
  const newest = messages[messages.length - 1];

  // An empty thread, or nothing new at the bottom.
  if (!newest || newest.id === previousNewestId) return 0;

  // Nothing to measure against yet — the caller treats the first paint as its
  // own case, since there is no "since" to count from.
  if (previousNewestId === undefined) return 0;

  const previousIndex = messages.findIndex((m) => m.id === previousNewestId);

  // Gone rather than overtaken: the newest message was deleted and the list
  // shrank back onto an older one.
  if (previousIndex === -1) return 0;

  return messages.length - 1 - previousIndex;
}
