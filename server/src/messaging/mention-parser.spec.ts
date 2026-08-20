import {
  buildMentionToken,
  buildReferenceToken,
  parseMentionUserIds,
  parseReferences,
} from './mention-parser';

describe('parseMentionUserIds', () => {
  it('returns nothing for a plain message', () => {
    expect(parseMentionUserIds('please order 4 Michelins')).toEqual([]);
  });

  it('returns nothing for empty input', () => {
    expect(parseMentionUserIds('')).toEqual([]);
  });

  it('pulls the id out of a mention token', () => {
    expect(
      parseMentionUserIds('@[Sarah Chen](user:clx123abc) please order')
    ).toEqual(['clx123abc']);
  });

  it('keeps several distinct mentions in order', () => {
    const body = '@[Sarah](user:aaa) and @[Mike](user:bbb) please sort this';

    expect(parseMentionUserIds(body)).toEqual(['aaa', 'bbb']);
  });

  it('counts a repeated mention once', () => {
    const body = '@[Sarah](user:aaa) ping @[Sarah](user:aaa) again';

    expect(parseMentionUserIds(body)).toEqual(['aaa']);
  });

  // A bare "@sarah" is how people type when they mean nothing formal. Treating
  // it as a mention would silently hide the message from the shop.
  it('ignores a bare @name that is not a token', () => {
    expect(parseMentionUserIds('@sarah can you order these')).toEqual([]);
  });

  it('ignores an email address', () => {
    expect(parseMentionUserIds('mail sarah@example.com about it')).toEqual([]);
  });

  it.each([
    ['no user: prefix', '@[Sarah](clx123)'],
    ['wrong prefix', '@[Sarah](customer:clx123)'],
    ['unclosed label', '@[Sarah(user:clx123)'],
    ['empty id', '@[Sarah](user:)'],
    ['empty label', '@[](user:clx123)'],
  ])('ignores a malformed token: %s', (_case, body) => {
    expect(parseMentionUserIds(body)).toEqual([]);
  });

  it('does not let a label span lines', () => {
    expect(parseMentionUserIds('@[Sarah\nChen](user:clx123)')).toEqual([]);
  });

  it('reads a mention mid-sentence', () => {
    expect(parseMentionUserIds('ask @[Mike](user:bbb) tomorrow')).toEqual([
      'bbb',
    ]);
  });
});

describe('parseReferences', () => {
  it('returns nothing for a plain message', () => {
    expect(parseReferences('the alignment is done')).toEqual([]);
  });

  it('pulls out a repair order reference', () => {
    expect(parseReferences('see #[RO-202606-0042](ro:clx789)')).toEqual([
      {
        entityType: 'REPAIR_ORDER',
        entityId: 'clx789',
        label: 'RO-202606-0042',
      },
    ]);
  });

  it('deduplicates by id and keeps the first label', () => {
    const body = '#[RO-1](ro:aaa) and again #[RO-1-renamed](ro:aaa)';

    expect(parseReferences(body)).toEqual([
      { entityType: 'REPAIR_ORDER', entityId: 'aaa', label: 'RO-1' },
    ]);
  });

  it('ignores a hashtag that is not a token', () => {
    expect(parseReferences('#urgent get this done')).toEqual([]);
  });

  it('reads mentions and references from the same message', () => {
    const body = '@[Sarah](user:aaa) parts for #[RO-202606-0042](ro:bbb)';

    expect(parseMentionUserIds(body)).toEqual(['aaa']);
    expect(parseReferences(body)).toEqual([
      {
        entityType: 'REPAIR_ORDER',
        entityId: 'bbb',
        label: 'RO-202606-0042',
      },
    ]);
  });
});

describe('token builders round-trip', () => {
  it('builds a mention the parser reads back', () => {
    const token = buildMentionToken('clx123abc', 'Sarah Chen');

    expect(parseMentionUserIds(token)).toEqual(['clx123abc']);
  });

  it('builds a reference the parser reads back', () => {
    const token = buildReferenceToken('clx789', 'RO-202606-0042');

    expect(parseReferences(token)).toEqual([
      {
        entityType: 'REPAIR_ORDER',
        entityId: 'clx789',
        label: 'RO-202606-0042',
      },
    ]);
  });
});
