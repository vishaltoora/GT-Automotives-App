import type { ConversationEntity } from '@gt-automotive/data';

/**
 * Mentions and repair-order references are stored inline in the message body
 * as tokens carrying an id, not a display name:
 *
 *   @[Sarah Chen](user:clx123abc)
 *   #[RO-202606-0042](ro:clx456def)
 *
 * Names are for rendering only. Re-resolving a name at read time would break
 * the moment somebody is renamed, and is ambiguous with two Sarahs.
 *
 * Everything here is pure. The server re-runs it on write and ignores whatever
 * the client claims the mentions were — a token typed by hand grants nothing
 * on its own, because access is decided by the MessageMention rows these
 * functions produce.
 */

const MENTION_TOKEN = /@\[[^\]\n]{1,100}\]\(user:([A-Za-z0-9_-]{1,50})\)/g;
const REFERENCE_TOKEN = /#\[([^\]\n]{1,50})\]\(ro:([A-Za-z0-9_-]{1,50})\)/g;

export interface ParsedReference {
  entityType: ConversationEntity;
  entityId: string;
  label: string;
}

/**
 * User ids tagged in a message, deduplicated, in the order they appear.
 *
 * The presence of any id here is what makes a message private, so this is the
 * single place that decides the audience.
 */
export function parseMentionUserIds(body: string): string[] {
  if (!body) return [];

  const seen = new Set<string>();
  for (const match of body.matchAll(MENTION_TOKEN)) {
    seen.add(match[1]);
  }
  return [...seen];
}

/**
 * Repair orders referenced in a message, deduplicated by id. The label is kept
 * so a chip can render without joining back to the repair order.
 */
export function parseReferences(body: string): ParsedReference[] {
  if (!body) return [];

  const byId = new Map<string, ParsedReference>();
  for (const match of body.matchAll(REFERENCE_TOKEN)) {
    const [, label, entityId] = match;
    if (!byId.has(entityId)) {
      byId.set(entityId, {
        entityType: 'REPAIR_ORDER' as ConversationEntity,
        entityId,
        label,
      });
    }
  }
  return [...byId.values()];
}

/** Builds the canonical mention token for a user. */
export function buildMentionToken(userId: string, displayName: string): string {
  return `@[${displayName}](user:${userId})`;
}

/** Builds the canonical reference token for a repair order. */
export function buildReferenceToken(roId: string, roNumber: string): string {
  return `#[${roNumber}](ro:${roId})`;
}
