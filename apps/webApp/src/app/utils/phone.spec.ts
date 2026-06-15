import {
  formatPhoneForDisplay,
  stripPhoneFormatting,
  formatPhoneOnChange,
} from './phone';

describe('phone utils', () => {
  describe('formatPhoneForDisplay', () => {
    it('formats a 10-digit number with dashes', () => {
      expect(formatPhoneForDisplay('2505551234')).toBe('250-555-1234');
    });

    it('formats an 11-digit number starting with 1', () => {
      expect(formatPhoneForDisplay('12505551234')).toBe('1-250-555-1234');
    });

    it('returns an empty string for null/undefined/empty', () => {
      expect(formatPhoneForDisplay(null)).toBe('');
      expect(formatPhoneForDisplay(undefined)).toBe('');
      expect(formatPhoneForDisplay('')).toBe('');
    });

    it('returns the original value for non-standard lengths', () => {
      expect(formatPhoneForDisplay('12345')).toBe('12345');
    });
  });

  describe('stripPhoneFormatting', () => {
    it('removes all non-digit characters', () => {
      expect(stripPhoneFormatting('(250) 555-1234')).toBe('2505551234');
    });

    it('returns an empty string for null/undefined', () => {
      expect(stripPhoneFormatting(null)).toBe('');
      expect(stripPhoneFormatting(undefined)).toBe('');
    });
  });

  describe('formatPhoneOnChange', () => {
    it('does not add dashes before 4 digits', () => {
      expect(formatPhoneOnChange('250')).toBe('250');
    });

    it('adds the first dash after 3 digits', () => {
      expect(formatPhoneOnChange('250555')).toBe('250-555');
    });

    it('adds both dashes for a full number', () => {
      expect(formatPhoneOnChange('2505551234')).toBe('250-555-1234');
    });

    it('limits input to 10 digits', () => {
      expect(formatPhoneOnChange('25055512349999')).toBe('250-555-1234');
    });

    it('ignores non-digit characters as they are typed', () => {
      expect(formatPhoneOnChange('(250) 555')).toBe('250-555');
    });
  });
});
