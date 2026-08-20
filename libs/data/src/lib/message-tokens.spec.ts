import {
  buildMentionToken,
  buildReferenceToken,
  parseMentionUserIds,
  segmentMessageBody,
} from './message-tokens';

/**
 * Segmenting is what keeps a raw token off the screen. A token that fails to
 * segment is rendered as literal "@[Sarah Chen](user:clx1)" text, which looks
 * broken and quietly tells everyone an id they had no reason to see.
 */
describe('segmentMessageBody', () => {
  it('returns plain text as a single segment', () => {
    expect(segmentMessageBody('rear brakes done')).toEqual([
      { kind: 'text', text: 'rear brakes done' },
    ]);
  });

  it('returns nothing for an empty body', () => {
    expect(segmentMessageBody('')).toEqual([]);
  });

  it('splits a mention out of the surrounding text', () => {
    expect(segmentMessageBody('@[Sarah Chen](user:clx1) please order')).toEqual(
      [
        { kind: 'mention', label: 'Sarah Chen', userId: 'clx1' },
        { kind: 'text', text: ' please order' },
      ]
    );
  });

  it('keeps text on both sides of a mention', () => {
    expect(segmentMessageBody('ask @[Mike](user:clx2) about it')).toEqual([
      { kind: 'text', text: 'ask ' },
      { kind: 'mention', label: 'Mike', userId: 'clx2' },
      { kind: 'text', text: ' about it' },
    ]);
  });

  it('handles a mention and a repair order reference together', () => {
    expect(
      segmentMessageBody(
        '@[Sarah](user:clx1) parts for #[RO-202606-0042](ro:clx9)'
      )
    ).toEqual([
      { kind: 'mention', label: 'Sarah', userId: 'clx1' },
      { kind: 'text', text: ' parts for ' },
      { kind: 'reference', label: 'RO-202606-0042', entityId: 'clx9' },
    ]);
  });

  it('leaves a malformed token as plain text rather than dropping it', () => {
    const body = '@[Sarah](clx1) hello';

    expect(segmentMessageBody(body)).toEqual([{ kind: 'text', text: body }]);
  });

  it('does not treat a bare @name as a mention', () => {
    expect(segmentMessageBody('@sarah look at this')).toEqual([
      { kind: 'text', text: '@sarah look at this' },
    ]);
  });

  it('round-trips what the builders produce', () => {
    const body = `${buildMentionToken(
      'clx1',
      'Sarah Chen'
    )} see ${buildReferenceToken('clx9', 'RO-1')}`;

    expect(segmentMessageBody(body)).toEqual([
      { kind: 'mention', label: 'Sarah Chen', userId: 'clx1' },
      { kind: 'text', text: ' see ' },
      { kind: 'reference', label: 'RO-1', entityId: 'clx9' },
    ]);
  });

  // The composer decides what to show from the same body it will send, so
  // these two must agree about what counts as a mention.
  it('agrees with parseMentionUserIds about which ids are mentions', () => {
    const body = '@[Sarah](user:clx1) and @[Ghost](broken:clx2)';

    const fromSegments = segmentMessageBody(body)
      .filter((s) => s.kind === 'mention')
      .map((s) => (s as { userId: string }).userId);

    expect(fromSegments).toEqual(parseMentionUserIds(body));
  });
});
