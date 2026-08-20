/**
 * The token format lives in libs/data so the composer and the server cannot
 * drift apart about what counts as a mention — the composer promises an
 * audience, and this is what decides it.
 */
export {
  parseMentionUserIds,
  parseReferences,
  buildMentionToken,
  buildReferenceToken,
  type ParsedReference,
} from '@gt-automotive/data';
