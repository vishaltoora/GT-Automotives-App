import {
  toBusinessCalendarDate,
  businessDayUtcRange,
  shiftBusinessDate,
  extractBusinessDate,
} from './timezone.config';

describe('timezone.config', () => {
  describe('toBusinessCalendarDate', () => {
    it('pins a YYYY-MM-DD string to midnight UTC', () => {
      expect(toBusinessCalendarDate('2026-07-23').toISOString()).toBe(
        '2026-07-23T00:00:00.000Z'
      );
    });

    it('collapses an after-5-PM-PST instant to the correct business day', () => {
      // 6 PM PDT on 2026-07-23 is 2026-07-24T01:00:00Z. The naive new Date()
      // fallback would have stored the next UTC day; this must stay July 23.
      const instant = '2026-07-24T01:00:00.000Z';
      expect(toBusinessCalendarDate(instant).toISOString()).toBe(
        '2026-07-23T00:00:00.000Z'
      );
    });

    it('round-trips through extractBusinessDate', () => {
      const stored = toBusinessCalendarDate('2026-07-23');
      expect(extractBusinessDate(stored)).toBe('2026-07-23');
    });
  });

  describe('businessDayUtcRange', () => {
    it('bounds a PDT (UTC-7) day at 07:00 UTC', () => {
      const { start, end } = businessDayUtcRange('2026-07-23');
      expect(start.toISOString()).toBe('2026-07-23T07:00:00.000Z');
      expect(end.toISOString()).toBe('2026-07-24T07:00:00.000Z');
    });

    it('bounds a PST (UTC-8) day at 08:00 UTC', () => {
      const { start, end } = businessDayUtcRange('2026-01-15');
      expect(start.toISOString()).toBe('2026-01-15T08:00:00.000Z');
      expect(end.toISOString()).toBe('2026-01-16T08:00:00.000Z');
    });

    it('includes an instant created after 5 PM PST on that business day', () => {
      // Invoice created 6 PM PDT July 23 (next UTC day) must fall in July 23.
      const createdAt = new Date('2026-07-24T01:00:00.000Z');
      const { start, end } = businessDayUtcRange('2026-07-23');
      expect(createdAt >= start && createdAt < end).toBe(true);
    });
  });

  describe('shiftBusinessDate', () => {
    it('subtracts a day across a month boundary', () => {
      expect(shiftBusinessDate('2026-07-01', -1)).toBe('2026-06-30');
    });

    it('subtracts a day across a year boundary', () => {
      expect(shiftBusinessDate('2026-01-01', -1)).toBe('2025-12-31');
    });

    it('adds a day', () => {
      expect(shiftBusinessDate('2026-07-23', 1)).toBe('2026-07-24');
    });
  });
});
