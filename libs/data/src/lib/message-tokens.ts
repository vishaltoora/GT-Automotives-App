/**
 * The wire format for mentions and repair-order references inside a message
 * body. Shared by the server, which derives who may read a message from it,
 * and by the composer, which shows the resulting audience before you send.
 *
 * One definition on purpose. If the two sides ever disagreed about what counts
 * as a mention, the composer would promise an audience the server does not
 * deliver — the worst possible bug for a feature whose whole job is deciding
 * who can read something.
 *
 *   @[Sarah Chen](user:clx123abc)
 *   #[RO-202606-0042](ro:clx456def)
 *
 * Names are for rendering only. Resolving a name at read time would break the
 * moment somebody is renamed, and is ambiguous with two Sarahs.
 */

export const MENTION_TOKEN_PATTERN =
  /@\[[^\]\n]{1,100}\]\(user:([A-Za-z0-9_-]{1,50})\)/g;

export const REFERENCE_TOKEN_PATTERN =
  /#\[([^\]\n]{1,50})\]\(ro:([A-Za-z0-9_-]{1,50})\)/g;

/** Matches any token, capturing the kind, label and id, for rendering. */
export const ANY_TOKEN_PATTERN =
  /([@#])\[([^\]\n]{1,100})\]\((user|ro):([A-Za-z0-9_-]{1,50})\)/g;

export interface ParsedReference {
  entityType: 'REPAIR_ORDER';
  entityId: string;
  label: string;
}

/**
 * User ids tagged in a message, deduplicated, in the order they appear.
 * The presence of any id here is what makes a message private.
 */
export function parseMentionUserIds(body: string): string[] {
  if (!body) return [];

  const seen = new Set<string>();
  for (const match of body.matchAll(MENTION_TOKEN_PATTERN)) {
    seen.add(match[1]);
  }
  return [...seen];
}

/** Repair orders referenced in a message, deduplicated by id. */
export function parseReferences(body: string): ParsedReference[] {
  if (!body) return [];

  const byId = new Map<string, ParsedReference>();
  for (const match of body.matchAll(REFERENCE_TOKEN_PATTERN)) {
    const [, label, entityId] = match;
    if (!byId.has(entityId)) {
      byId.set(entityId, { entityType: 'REPAIR_ORDER', entityId, label });
    }
  }
  return [...byId.values()];
}

export function buildMentionToken(userId: string, displayName: string): string {
  return `@[${displayName}](user:${userId})`;
}

export function buildReferenceToken(roId: string, roNumber: string): string {
  return `#[${roNumber}](ro:${roId})`;
}

export type MessageSegment =
  | { kind: 'text'; text: string }
  | { kind: 'mention'; label: string; userId: string }
  | { kind: 'reference'; label: string; entityId: string };

/**
 * Splits a body into renderable pieces so chips can be drawn without the raw
 * token ever reaching the screen.
 */
export function segmentMessageBody(body: string): MessageSegment[] {
  const segments: MessageSegment[] = [];
  let cursor = 0;

  for (const match of body.matchAll(ANY_TOKEN_PATTERN)) {
    const [full, sigil, label, kind, id] = match;
    const start = match.index ?? 0;

    if (start > cursor) {
      segments.push({ kind: 'text', text: body.slice(cursor, start) });
    }

    segments.push(
      kind === 'user'
        ? { kind: 'mention', label, userId: id }
        : { kind: 'reference', label, entityId: id }
    );

    cursor = start + full.length;
    void sigil;
  }

  if (cursor < body.length) {
    segments.push({ kind: 'text', text: body.slice(cursor) });
  }
  return segments;
}
