import { StringUtils } from './string-utils';

describe('StringUtils', () => {
  describe('formatPhoneNumber', () => {
    it('formats a 10-digit number as (XXX) XXX-XXXX', () => {
      expect(StringUtils.formatPhoneNumber('2505551234')).toBe(
        '(250) 555-1234'
      );
    });

    it('formats an 11-digit number starting with 1 as +1 (XXX) XXX-XXXX', () => {
      expect(StringUtils.formatPhoneNumber('12505551234')).toBe(
        '+1 (250) 555-1234'
      );
    });

    it('strips non-digit characters before formatting', () => {
      expect(StringUtils.formatPhoneNumber('250-555-1234')).toBe(
        '(250) 555-1234'
      );
    });

    it('returns the original string when it cannot be formatted', () => {
      expect(StringUtils.formatPhoneNumber('12345')).toBe('12345');
    });
  });

  describe('titleCase', () => {
    it('capitalizes the first letter of each word', () => {
      expect(StringUtils.titleCase('john doe')).toBe('John Doe');
    });

    it('lowercases the remaining letters', () => {
      expect(StringUtils.titleCase('JOHN DOE')).toBe('John Doe');
    });
  });

  describe('getInitials', () => {
    it('returns uppercase initials for each name part', () => {
      expect(StringUtils.getInitials('john doe')).toBe('JD');
    });
  });

  describe('slugify', () => {
    it('lowercases and hyphenates while dropping special characters', () => {
      expect(StringUtils.slugify('All-Season Tire #1!')).toBe(
        'allseason-tire-1'
      );
    });
  });

  describe('formatPostalCode', () => {
    it('formats a 6-character postal code with a space', () => {
      expect(StringUtils.formatPostalCode('v2n1a1')).toBe('V2N 1A1');
    });

    it('returns the original value when length is not 6', () => {
      expect(StringUtils.formatPostalCode('V2N1')).toBe('V2N1');
    });
  });

  describe('getDisplayName', () => {
    it('combines first and last name', () => {
      expect(StringUtils.getDisplayName('John', 'Doe')).toBe('John Doe');
    });

    it('returns "Unknown" when both names are missing', () => {
      expect(StringUtils.getDisplayName()).toBe('Unknown');
    });

    it('returns only the available name when one is missing', () => {
      expect(StringUtils.getDisplayName('John')).toBe('John');
      expect(StringUtils.getDisplayName(undefined, 'Doe')).toBe('Doe');
    });
  });

  describe('formatVehicleIdentifier', () => {
    it('joins year, make and model, skipping missing parts', () => {
      expect(
        StringUtils.formatVehicleIdentifier('Toyota', 'Corolla', 2020)
      ).toBe('2020 Toyota Corolla');
      expect(StringUtils.formatVehicleIdentifier('Toyota')).toBe('Toyota');
    });
  });

  describe('truncate', () => {
    it('leaves short strings untouched', () => {
      expect(StringUtils.truncate('short', 10)).toBe('short');
    });

    it('truncates long strings with an ellipsis', () => {
      expect(StringUtils.truncate('abcdefghij', 8)).toBe('abcde...');
    });
  });
});
