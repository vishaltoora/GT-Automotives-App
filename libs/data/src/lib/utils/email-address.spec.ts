import {
  containsEmail,
  dedupeEmails,
  isSameEmail,
  normalizeEmail,
} from './email-address';

describe('isSameEmail', () => {
  // The case that put jason@ and Jason@ on the same customer as two addresses.
  it('treats a difference in case as the same address', () => {
    expect(
      isSameEmail('jason@khatraoenterprises.ca', 'Jason@khatraoenterprises.ca')
    ).toBe(true);
  });

  it('ignores surrounding whitespace', () => {
    expect(isSameEmail(' fleet@northern.ca ', 'fleet@northern.ca')).toBe(true);
  });

  it('still tells different addresses apart', () => {
    expect(isSameEmail('jason@example.ca', 'jason@example.com')).toBe(false);
    expect(isSameEmail('jason@example.ca', 'jasons@example.ca')).toBe(false);
  });
});

describe('containsEmail', () => {
  const onFile = ['fleet@northern.ca', 'accounts@northern.ca'];

  it('finds an address already on file regardless of case', () => {
    expect(containsEmail(onFile, 'FLEET@northern.ca')).toBe(true);
  });

  it('does not find one that is genuinely new', () => {
    expect(containsEmail(onFile, 'parts@northern.ca')).toBe(false);
  });

  it('copes with nulls in the list', () => {
    expect(
      containsEmail([null, undefined, 'fleet@northern.ca'], 'fleet@northern.ca')
    ).toBe(true);
  });
});

describe('dedupeEmails', () => {
  it('collapses addresses differing only in case', () => {
    expect(
      dedupeEmails(['jason@example.ca', 'Jason@example.ca', 'JASON@example.ca'])
    ).toEqual(['jason@example.ca']);
  });

  // The stored spelling is what the customer gave us. Not duplicating it is a
  // far smaller claim than deciding what its canonical form should be.
  it('keeps the first spelling rather than lowercasing', () => {
    expect(dedupeEmails(['Jason@example.ca', 'jason@example.ca'])).toEqual([
      'Jason@example.ca',
    ]);
  });

  it('preserves order, so a primary address passed first stays first', () => {
    expect(dedupeEmails(['primary@a.ca', 'second@b.ca', 'third@c.ca'])).toEqual(
      ['primary@a.ca', 'second@b.ca', 'third@c.ca']
    );
  });

  it('drops blanks, whitespace-only entries and nulls', () => {
    expect(
      dedupeEmails(['fleet@northern.ca', '', '   ', null, undefined])
    ).toEqual(['fleet@northern.ca']);
  });

  it('trims what it keeps', () => {
    expect(dedupeEmails(['  fleet@northern.ca  '])).toEqual([
      'fleet@northern.ca',
    ]);
  });

  it('returns nothing for an empty list', () => {
    expect(dedupeEmails([])).toEqual([]);
  });
});

describe('normalizeEmail', () => {
  it('is for comparison only — lowercased and trimmed', () => {
    expect(normalizeEmail('  Jason@Example.CA ')).toBe('jason@example.ca');
  });
});
