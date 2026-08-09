import {
  closingInstantFor,
  DEFAULT_SHOP_HOURS,
  formatTimeOfDay,
  isWithinShopHours,
  resolveShopHours,
  shopHoursRefusal,
  toMinutes,
} from './shop-hours';

/**
 * The whole point of this module is that the shop's day is Pacific and the
 * production server's is UTC, so every case here is expressed as a real instant
 * and checked against what the clock on the shop wall would say.
 */

/** A UTC instant, written the way the server actually sees one. */
const utc = (iso: string) => new Date(iso);

const HOURS = DEFAULT_SHOP_HOURS;

describe('toMinutes', () => {
  it('reads a wall-clock time', () => {
    expect(toMinutes('08:00')).toBe(480);
    expect(toMinutes('20:00')).toBe(1200);
    expect(toMinutes('00:00')).toBe(0);
    expect(toMinutes('23:59')).toBe(1439);
  });

  it('rejects anything that is not HH:mm', () => {
    expect(toMinutes('8:00')).toBeNull();
    expect(toMinutes('24:00')).toBeNull();
    expect(toMinutes('08:60')).toBeNull();
    expect(toMinutes('')).toBeNull();
    expect(toMinutes('lunchtime')).toBeNull();
  });
});

describe('formatTimeOfDay', () => {
  it('reads back the way the shop would say it', () => {
    expect(formatTimeOfDay('08:00')).toBe('8:00 AM');
    expect(formatTimeOfDay('20:00')).toBe('8:00 PM');
    expect(formatTimeOfDay('12:00')).toBe('12:00 PM');
    expect(formatTimeOfDay('00:30')).toBe('12:30 AM');
  });
});

describe('resolveShopHours', () => {
  it('uses what the shop configured', () => {
    expect(
      resolveShopHours({
        timeClockWindowEnabled: true,
        timeClockOpensAt: '07:00',
        timeClockClosesAt: '21:00',
      })
    ).toEqual({ enabled: true, opensAt: '07:00', closesAt: '21:00' });
  });

  it('falls back when there is no company configured', () => {
    expect(resolveShopHours(null)).toEqual(DEFAULT_SHOP_HOURS);
  });

  // A garbled time must not lock the whole shop out of the clock.
  it('falls back on a malformed time rather than refusing everyone', () => {
    expect(
      resolveShopHours({
        timeClockWindowEnabled: true,
        timeClockOpensAt: 'eight',
        timeClockClosesAt: '',
      })
    ).toEqual(DEFAULT_SHOP_HOURS);
  });

  it('carries the off switch through', () => {
    expect(resolveShopHours({ timeClockWindowEnabled: false }).enabled).toBe(
      false
    );
  });
});

describe('isWithinShopHours', () => {
  // PST is UTC-8, so 8 AM Pacific is 16:00 UTC and 8 PM Pacific is 04:00 UTC
  // the following day.
  describe('in winter (PST, UTC-8)', () => {
    it('is shut just before opening', () => {
      // 07:59 Pacific
      expect(isWithinShopHours(HOURS, utc('2026-01-15T15:59:00Z'))).toBe(false);
    });

    it('opens on the hour', () => {
      // 08:00 Pacific
      expect(isWithinShopHours(HOURS, utc('2026-01-15T16:00:00Z'))).toBe(true);
    });

    it('is open through the day', () => {
      // 13:00 Pacific
      expect(isWithinShopHours(HOURS, utc('2026-01-15T21:00:00Z'))).toBe(true);
    });

    it('is open for the last minute before closing', () => {
      // 19:59 Pacific
      expect(isWithinShopHours(HOURS, utc('2026-01-16T03:59:00Z'))).toBe(true);
    });

    it('shuts on the closing hour', () => {
      // 20:00 Pacific — and note this instant is already the next day in UTC,
      // which is exactly the trap this module exists to avoid.
      expect(isWithinShopHours(HOURS, utc('2026-01-16T04:00:00Z'))).toBe(false);
    });

    it('is shut overnight', () => {
      // 03:00 Pacific
      expect(isWithinShopHours(HOURS, utc('2026-01-16T11:00:00Z'))).toBe(false);
    });
  });

  // PDT is UTC-7, so the same wall-clock times sit an hour earlier in UTC.
  describe('in summer (PDT, UTC-7)', () => {
    it('is shut just before opening', () => {
      expect(isWithinShopHours(HOURS, utc('2026-07-15T14:59:00Z'))).toBe(false);
    });

    it('opens on the hour', () => {
      expect(isWithinShopHours(HOURS, utc('2026-07-15T15:00:00Z'))).toBe(true);
    });

    it('shuts on the closing hour', () => {
      expect(isWithinShopHours(HOURS, utc('2026-07-16T03:00:00Z'))).toBe(false);
    });
  });

  describe('across the daylight saving changeovers', () => {
    // Clocks go forward at 2 AM local on 8 March 2026.
    it('holds 8 AM local on the spring-forward day', () => {
      expect(isWithinShopHours(HOURS, utc('2026-03-08T14:59:00Z'))).toBe(false);
      expect(isWithinShopHours(HOURS, utc('2026-03-08T15:00:00Z'))).toBe(true);
    });

    it('holds 8 PM local on the spring-forward day', () => {
      expect(isWithinShopHours(HOURS, utc('2026-03-09T02:59:00Z'))).toBe(true);
      expect(isWithinShopHours(HOURS, utc('2026-03-09T03:00:00Z'))).toBe(false);
    });

    // Clocks go back at 2 AM local on 1 November 2026.
    it('holds 8 AM local on the fall-back day', () => {
      expect(isWithinShopHours(HOURS, utc('2026-11-01T15:59:00Z'))).toBe(false);
      expect(isWithinShopHours(HOURS, utc('2026-11-01T16:00:00Z'))).toBe(true);
    });

    it('holds 8 PM local on the fall-back day', () => {
      expect(isWithinShopHours(HOURS, utc('2026-11-02T03:59:00Z'))).toBe(true);
      expect(isWithinShopHours(HOURS, utc('2026-11-02T04:00:00Z'))).toBe(false);
    });
  });

  it('is always open when the window is switched off', () => {
    const off = { ...HOURS, enabled: false };
    expect(isWithinShopHours(off, utc('2026-01-16T11:00:00Z'))).toBe(true);
  });

  // Closing before opening would invert the comparison and shut the clock all
  // day. Misconfiguration should not cost the shop a day's time tracking.
  it('stays open when the window is configured backwards', () => {
    const backwards = { ...HOURS, opensAt: '20:00', closesAt: '08:00' };
    expect(isWithinShopHours(backwards, utc('2026-01-15T21:00:00Z'))).toBe(
      true
    );
  });

  it('respects a window the shop widened', () => {
    const extended = { ...HOURS, opensAt: '07:00', closesAt: '21:00' };
    // 07:30 Pacific — inside the wider window, outside the default one.
    expect(isWithinShopHours(extended, utc('2026-01-15T15:30:00Z'))).toBe(true);
    expect(isWithinShopHours(HOURS, utc('2026-01-15T15:30:00Z'))).toBe(false);
  });
});

describe('shopHoursRefusal', () => {
  it('says when the clock opens if someone is early', () => {
    expect(shopHoursRefusal(HOURS, utc('2026-01-15T15:30:00Z'))).toContain(
      'opens at 8:00 AM'
    );
  });

  it('says when it closed if someone is late', () => {
    expect(shopHoursRefusal(HOURS, utc('2026-01-16T05:00:00Z'))).toContain(
      'closed at 8:00 PM'
    );
  });

  // Standing in the bay with "not allowed" and no next step is the failure mode
  // this is written against.
  it('always names a way forward', () => {
    expect(shopHoursRefusal(HOURS, utc('2026-01-15T15:30:00Z'))).toContain(
      'admin'
    );
    expect(shopHoursRefusal(HOURS, utc('2026-01-16T05:00:00Z'))).toContain(
      'admin'
    );
  });
});

describe('closingInstantFor', () => {
  it('closes a winter shift at 8 PM Pacific', () => {
    // Clocked in 09:00 Pacific on 15 January.
    const closing = closingInstantFor(utc('2026-01-15T17:00:00Z'), HOURS);
    expect(closing.toISOString()).toBe('2026-01-16T04:00:00.000Z');
  });

  it('closes a summer shift at 8 PM Pacific', () => {
    const closing = closingInstantFor(utc('2026-07-15T16:00:00Z'), HOURS);
    expect(closing.toISOString()).toBe('2026-07-16T03:00:00.000Z');
  });

  it('closes at the shift own day, not today', () => {
    // A shift from three days ago is closed at the closing time it ran past.
    const closing = closingInstantFor(utc('2026-01-12T17:00:00Z'), HOURS);
    expect(closing.toISOString()).toBe('2026-01-13T04:00:00.000Z');
  });

  it('uses a widened closing time', () => {
    const closing = closingInstantFor(utc('2026-01-15T17:00:00Z'), {
      ...HOURS,
      closesAt: '21:00',
    });
    expect(closing.toISOString()).toBe('2026-01-16T05:00:00.000Z');
  });

  /**
   * Only an admin can start a shift after closing time — the window blocks
   * employees — and that exemption exists precisely to record late work. The
   * backstop must not eat it.
   */
  describe('a shift that began after closing time', () => {
    const lateClockIn = utc('2026-01-16T06:00:00Z'); // 22:00 Pacific, 15 Jan

    it('is not collapsed to zero minutes', () => {
      expect(closingInstantFor(lateClockIn, HOURS)).not.toEqual(lateClockIn);
    });

    it('is bounded at the next closing time instead', () => {
      // 20:00 Pacific on 16 January — the first closing time after it started.
      expect(closingInstantFor(lateClockIn, HOURS).toISOString()).toBe(
        '2026-01-17T04:00:00.000Z'
      );
    });

    it('still lands after the clock-in', () => {
      expect(closingInstantFor(lateClockIn, HOURS).getTime()).toBeGreaterThan(
        lateClockIn.getTime()
      );
    });
  });
});
