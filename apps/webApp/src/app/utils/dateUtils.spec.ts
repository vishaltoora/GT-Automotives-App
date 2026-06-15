import {
  extractDateString,
  parseDateString,
  formatDisplayDate,
  getTodayString,
  getTomorrowString,
  addDays,
  compareDates,
  isToday,
  isPast,
  isFuture,
  getDayOfWeek,
  formatDateRange,
  isValidDateString,
} from './dateUtils';

describe('dateUtils', () => {
  describe('extractDateString', () => {
    it('extracts YYYY-MM-DD from a Date in local time without UTC shift', () => {
      // Nov 18 2025, 23:30 local time
      const date = new Date(2025, 10, 18, 23, 30);
      expect(extractDateString(date)).toBe('2025-11-18');
    });

    it('zero-pads month and day', () => {
      const date = new Date(2025, 0, 5); // Jan 5
      expect(extractDateString(date)).toBe('2025-01-05');
    });
  });

  describe('parseDateString', () => {
    it('parses into a local-midnight Date with correct components', () => {
      const date = parseDateString('2025-11-18');
      expect(date.getFullYear()).toBe(2025);
      expect(date.getMonth()).toBe(10); // 0-indexed November
      expect(date.getDate()).toBe(18);
    });

    it('round-trips with extractDateString', () => {
      expect(extractDateString(parseDateString('2025-02-09'))).toBe(
        '2025-02-09'
      );
    });
  });

  describe('formatDisplayDate', () => {
    it('formats long by default', () => {
      expect(formatDisplayDate('2025-11-18')).toBe(
        'Tuesday, November 18, 2025'
      );
    });

    it('formats long when explicitly requested', () => {
      expect(formatDisplayDate('2025-11-18', 'long')).toBe(
        'Tuesday, November 18, 2025'
      );
    });

    it('formats short', () => {
      expect(formatDisplayDate('2025-11-18', 'short')).toBe('Nov 18, 2025');
    });
  });

  describe('getTodayString', () => {
    it('matches extractDateString of new Date()', () => {
      expect(getTodayString()).toBe(extractDateString(new Date()));
    });

    it('returns a valid YYYY-MM-DD string', () => {
      expect(getTodayString()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('getTomorrowString', () => {
    it('is exactly one day after today', () => {
      expect(getTomorrowString()).toBe(addDays(getTodayString(), 1));
    });

    it('returns a valid YYYY-MM-DD string', () => {
      expect(getTomorrowString()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('addDays', () => {
    it('adds positive days', () => {
      expect(addDays('2025-11-18', 5)).toBe('2025-11-23');
    });

    it('subtracts with negative days', () => {
      expect(addDays('2025-11-18', -2)).toBe('2025-11-16');
    });

    it('returns the same date for 0', () => {
      expect(addDays('2025-11-18', 0)).toBe('2025-11-18');
    });

    it('rolls over month boundaries', () => {
      expect(addDays('2025-11-30', 1)).toBe('2025-12-01');
    });

    it('rolls over year boundaries', () => {
      expect(addDays('2025-12-31', 1)).toBe('2026-01-01');
    });

    it('handles leap year', () => {
      expect(addDays('2024-02-28', 1)).toBe('2024-02-29');
    });
  });

  describe('compareDates', () => {
    it('returns -1 when first is earlier', () => {
      expect(compareDates('2025-11-18', '2025-11-20')).toBe(-1);
    });

    it('returns 1 when first is later', () => {
      expect(compareDates('2025-11-20', '2025-11-18')).toBe(1);
    });

    it('returns 0 when equal', () => {
      expect(compareDates('2025-11-18', '2025-11-18')).toBe(0);
    });
  });

  describe('isToday', () => {
    it('is true for getTodayString()', () => {
      expect(isToday(getTodayString())).toBe(true);
    });

    it('is false for a past date', () => {
      expect(isToday(addDays(getTodayString(), -1))).toBe(false);
    });
  });

  describe('isPast', () => {
    it('is true for yesterday', () => {
      expect(isPast(addDays(getTodayString(), -1))).toBe(true);
    });

    it('is false for today', () => {
      expect(isPast(getTodayString())).toBe(false);
    });

    it('is false for tomorrow', () => {
      expect(isPast(addDays(getTodayString(), 1))).toBe(false);
    });
  });

  describe('isFuture', () => {
    it('is true for tomorrow', () => {
      expect(isFuture(addDays(getTodayString(), 1))).toBe(true);
    });

    it('is false for today', () => {
      expect(isFuture(getTodayString())).toBe(false);
    });

    it('is false for yesterday', () => {
      expect(isFuture(addDays(getTodayString(), -1))).toBe(false);
    });
  });

  describe('getDayOfWeek', () => {
    it('returns the weekday name', () => {
      expect(getDayOfWeek('2025-11-18')).toBe('Tuesday');
    });

    it('returns the weekday name for a Sunday', () => {
      expect(getDayOfWeek('2025-11-16')).toBe('Sunday');
    });
  });

  describe('formatDateRange', () => {
    it('formats a range using short dates', () => {
      expect(formatDateRange('2025-11-18', '2025-11-20')).toBe(
        'Nov 18, 2025 - Nov 20, 2025'
      );
    });
  });

  describe('isValidDateString', () => {
    it('accepts a valid date', () => {
      expect(isValidDateString('2025-11-18')).toBe(true);
    });

    it('rejects wrong format', () => {
      expect(isValidDateString('11/18/2025')).toBe(false);
    });

    it('rejects invalid month', () => {
      expect(isValidDateString('2025-13-01')).toBe(false);
    });

    it('rejects invalid day (Feb 30)', () => {
      expect(isValidDateString('2025-02-30')).toBe(false);
    });

    it('accepts a leap day in a leap year', () => {
      expect(isValidDateString('2024-02-29')).toBe(true);
    });

    it('rejects a leap day in a non-leap year', () => {
      expect(isValidDateString('2025-02-29')).toBe(false);
    });

    it('rejects empty string', () => {
      expect(isValidDateString('')).toBe(false);
    });
  });
});
