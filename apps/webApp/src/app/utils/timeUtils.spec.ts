import {
  getCurrentTimeRounded,
  isToday,
  generateTimeOptions,
} from './timeUtils';

describe('timeUtils', () => {
  describe('getCurrentTimeRounded', () => {
    it('returns an HH:mm string', () => {
      expect(getCurrentTimeRounded()).toMatch(/^\d{2}:\d{2}$/);
    });

    it('rounds minutes up to a 15-minute interval (or :00 on rollover)', () => {
      const [, mins] = getCurrentTimeRounded().split(':').map(Number);
      // Math.ceil to next 15 yields 15/30/45, or 60 which rolls hour and gives :00
      expect([0, 15, 30, 45]).toContain(mins);
    });
  });

  describe('isToday', () => {
    it('is true for now', () => {
      expect(isToday(new Date())).toBe(true);
    });

    it('is false for a clearly different date', () => {
      expect(isToday(new Date(2000, 0, 1))).toBe(false);
    });

    it('is true for today at a different time of day', () => {
      const today = new Date();
      const sameDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        3,
        15
      );
      expect(isToday(sameDay)).toBe(true);
    });
  });

  describe('generateTimeOptions', () => {
    const options = generateTimeOptions();

    it('starts at 07:00 AM', () => {
      expect(options[0]).toEqual({ value: '07:00', label: '7:00 AM' });
    });

    it('ends at 11:00 PM', () => {
      expect(options[options.length - 1]).toEqual({
        value: '23:00',
        label: '11:00 PM',
      });
    });

    it('produces 65 slots (7:00 through 23:00 at 15-min intervals)', () => {
      // 16 full hours (7..22) * 4 = 64, plus 23:00 = 65
      expect(options).toHaveLength(65);
    });

    it('formats noon correctly', () => {
      expect(options).toContainEqual({ value: '12:00', label: '12:00 PM' });
    });

    it('formats afternoon hours in 12-hour PM', () => {
      expect(options).toContainEqual({ value: '14:30', label: '2:30 PM' });
    });

    it('uses zero-padded 24-hour values and 15-min steps', () => {
      expect(options).toContainEqual({ value: '09:15', label: '9:15 AM' });
      expect(options).toContainEqual({ value: '09:45', label: '9:45 AM' });
    });

    it('does not include any time past 23:00', () => {
      expect(options.find((o) => o.value === '23:15')).toBeUndefined();
    });
  });
});
