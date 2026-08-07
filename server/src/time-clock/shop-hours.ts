/**
 * The window the employee time clock is open for.
 *
 * Two problems this solves. A clock-in at 3 AM — a phone in a pocket, or worse
 * — used to be accepted without question. And an employee who left without
 * clocking out kept accruing hours overnight, sometimes for days, until someone
 * noticed and had to reconstruct the shift from memory.
 *
 * The rules here govern the employee-facing clock only. Admins record genuine
 * overtime by adding or editing an entry, which is audited; restricting that
 * would leave late work with nowhere to go.
 */

import {
  businessDayInstantAt,
  businessTimeOfDay,
  extractBusinessDate,
  shiftBusinessDate,
} from '../config/timezone.config';

/** Shop hours as configured, in business-timezone wall-clock time. */
export interface ShopHours {
  enabled: boolean;
  /** HH:mm the clock opens, inclusive. */
  opensAt: string;
  /** HH:mm the clock closes, exclusive — 20:00 means 19:59 is the last minute. */
  closesAt: string;
}

export const DEFAULT_SHOP_HOURS: ShopHours = {
  enabled: true,
  opensAt: '08:00',
  closesAt: '20:00',
};

const TIME_OF_DAY = /^([01]\d|2[0-3]):([0-5]\d)$/;

/** Minutes since midnight, or null if the value is not a valid HH:mm. */
export function toMinutes(timeOfDay: string): number | null {
  const match = TIME_OF_DAY.exec(timeOfDay ?? '');
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

/**
 * Read shop hours off a company record, falling back to the defaults for
 * anything missing or malformed.
 *
 * A garbled time must not lock the whole shop out of the clock, so an
 * unparseable value falls back rather than throwing.
 */
export function resolveShopHours(
  company?: {
    timeClockWindowEnabled?: boolean | null;
    timeClockOpensAt?: string | null;
    timeClockClosesAt?: string | null;
  } | null
): ShopHours {
  const opensAt = company?.timeClockOpensAt ?? '';
  const closesAt = company?.timeClockClosesAt ?? '';
  return {
    enabled: company?.timeClockWindowEnabled ?? DEFAULT_SHOP_HOURS.enabled,
    opensAt: toMinutes(opensAt) === null ? DEFAULT_SHOP_HOURS.opensAt : opensAt,
    closesAt:
      toMinutes(closesAt) === null ? DEFAULT_SHOP_HOURS.closesAt : closesAt,
  };
}

/** A time as it should read to a person: "8:00 AM", "8:00 PM". */
export function formatTimeOfDay(timeOfDay: string): string {
  const minutes = toMinutes(timeOfDay);
  if (minutes === null) return timeOfDay;
  const hour24 = Math.floor(minutes / 60);
  const minute = minutes % 60;
  const suffix = hour24 < 12 ? 'AM' : 'PM';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${hour12}:${String(minute).padStart(2, '0')} ${suffix}`;
}

/** Whether the clock is open at a given instant. */
export function isWithinShopHours(
  hours: ShopHours,
  instant: Date = new Date()
): boolean {
  if (!hours.enabled) return true;

  const now = toMinutes(businessTimeOfDay(instant));
  const opens = toMinutes(hours.opensAt);
  const closes = toMinutes(hours.closesAt);
  if (now === null || opens === null || closes === null) return true;

  // Closing before opening would mean a window spanning midnight, which no
  // configuration in this business wants and which would silently invert the
  // check. Treated as misconfigured: leave the clock open rather than lock
  // everyone out.
  if (closes <= opens) return true;

  return now >= opens && now < closes;
}

/**
 * Why a clock-in was refused, phrased for the person holding the phone.
 *
 * "Not allowed" on its own leaves an employee standing in the bay with no idea
 * what to do next, so both branches say what happens instead.
 */
export function shopHoursRefusal(
  hours: ShopHours,
  instant: Date = new Date()
): string {
  const now = toMinutes(businessTimeOfDay(instant));
  const opens = toMinutes(hours.opensAt);

  if (now !== null && opens !== null && now < opens) {
    return `The time clock opens at ${formatTimeOfDay(
      hours.opensAt
    )}. Ask an admin to add your hours if you started earlier.`;
  }

  return `The time clock closed at ${formatTimeOfDay(
    hours.closesAt
  )}. Ask an admin to add your hours.`;
}

/**
 * The instant an open shift should be closed at: closing time on the business
 * day it was started.
 *
 * Using the shift's own day rather than today's matters for an entry left open
 * across midnight — it is closed at the closing time it ran past, not at
 * tonight's.
 *
 * A shift that began *after* closing time is the case to be careful with. Only
 * an admin can create one, because the window blocks employees, and the whole
 * point of that exemption is to record work that genuinely ran late. Closing it
 * at its own day's closing time would land before it started; stamping it at
 * the clock-in instead would zero it out within five minutes of the admin
 * making it, destroying the escape hatch rather than backstopping it. So it is
 * bounded at the *next* closing time — late work still gets clocked out if
 * nobody remembers to, just not before it happened.
 */
export function closingInstantFor(clockInAt: Date, hours: ShopHours): Date {
  const businessDate = extractBusinessDate(clockInAt);
  const closing = businessDayInstantAt(businessDate, hours.closesAt);
  if (closing > clockInAt) return closing;
  return businessDayInstantAt(
    shiftBusinessDate(businessDate, 1),
    hours.closesAt
  );
}
