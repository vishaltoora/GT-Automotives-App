import {
  format12Hour,
  format24Hour,
  formatTimeRange,
  formatDateLocal,
} from './timeFormat';

describe('timeFormat', () => {
  describe('format12Hour', () => {
    it('converts afternoon time to PM', () => {
      expect(format12Hour('14:30')).toBe('2:30 PM');
    });

    it('converts morning time to AM', () => {
      expect(format12Hour('09:00')).toBe('9:00 AM');
    });

    it('converts midnight (00:xx) to 12 AM', () => {
      expect(format12Hour('00:15')).toBe('12:15 AM');
    });

    it('converts noon (12:xx) to 12 PM', () => {
      expect(format12Hour('12:00')).toBe('12:00 PM');
    });

    it('returns empty string for empty input', () => {
      expect(format12Hour('')).toBe('');
    });

    it('returns original string when not parseable', () => {
      expect(format12Hour('not-a-time')).toBe('not-a-time');
    });
  });

  describe('format24Hour', () => {
    it('converts PM time to 24-hour', () => {
      expect(format24Hour('2:30 PM')).toBe('14:30');
    });

    it('converts AM time to 24-hour', () => {
      expect(format24Hour('9:00 AM')).toBe('09:00');
    });

    it('converts 12 AM to 00', () => {
      expect(format24Hour('12:15 AM')).toBe('00:15');
    });

    it('keeps 12 PM as 12', () => {
      expect(format24Hour('12:00 PM')).toBe('12:00');
    });

    it('is case-insensitive on the period', () => {
      expect(format24Hour('2:30 pm')).toBe('14:30');
    });

    it('tolerates extra whitespace before the period', () => {
      expect(format24Hour('9:00  AM')).toBe('09:00');
    });

    it('returns empty string for empty input', () => {
      expect(format24Hour('')).toBe('');
    });

    it('returns original when format is invalid', () => {
      expect(format24Hour('14:30')).toBe('14:30');
    });

    it('round-trips with format12Hour', () => {
      expect(format24Hour(format12Hour('14:30'))).toBe('14:30');
    });
  });

  describe('formatTimeRange', () => {
    it('formats a start-end range in 12-hour format', () => {
      expect(formatTimeRange('09:00', '17:00')).toBe('9:00 AM - 5:00 PM');
    });
  });

  describe('formatDateLocal', () => {
    it('returns empty string for empty input', () => {
      expect(formatDateLocal('')).toBe('');
    });

    it('parses a YYYY-MM-DD string to a locale date string', () => {
      // Build the expected value the same way the function does, to stay locale-agnostic
      const expected = new Date(2025, 9, 17).toLocaleDateString(); // Oct 17 2025
      expect(formatDateLocal('2025-10-17')).toBe(expected);
    });

    it('strips the time portion from an ISO string', () => {
      const expected = new Date(2025, 9, 17).toLocaleDateString();
      expect(formatDateLocal('2025-10-17T14:30:00.000Z')).toBe(expected);
    });

    it('handles a Date object input', () => {
      // For a Date, the function uses toISOString() (UTC). Use a UTC-midnight date
      // so the extracted day is stable regardless of the runner timezone.
      const input = new Date(Date.UTC(2025, 9, 17));
      const isoDay = input.toISOString().split('T')[0]; // "2025-10-17"
      const [y, m, d] = isoDay.split('-').map(Number);
      const expected = new Date(y, m - 1, d).toLocaleDateString();
      expect(formatDateLocal(input)).toBe(expected);
    });
  });
});
