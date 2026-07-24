/**
 * Business Timezone Configuration
 * GT Automotives operates in Pacific Time (PST/PDT)
 *
 * This configuration ensures all date/time operations are handled
 * correctly for the business timezone, regardless of server timezone.
 *
 * PST (Pacific Standard Time): UTC-8 (November - March)
 * PDT (Pacific Daylight Time): UTC-7 (March - November)
 */

export const BUSINESS_TIMEZONE = 'America/Vancouver';

/**
 * PostgreSQL timezone string for use in AT TIME ZONE queries
 * This handles PST/PDT transitions automatically
 */
export const POSTGRES_TIMEZONE = 'America/Vancouver';

/**
 * Get current date in business timezone (PST/PDT)
 * Returns date string in YYYY-MM-DD format
 */
export function getCurrentBusinessDate(): string {
  const now = new Date();
  // Convert to business timezone
  const pstDate = new Date(
    now.toLocaleString('en-US', { timeZone: BUSINESS_TIMEZONE })
  );
  const year = pstDate.getFullYear();
  const month = String(pstDate.getMonth() + 1).padStart(2, '0');
  const day = String(pstDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get current date/time in business timezone
 * Returns a Date object representing current time in PST/PDT
 */
export function getCurrentBusinessDateTime(): Date {
  const now = new Date();
  // Convert to business timezone
  return new Date(now.toLocaleString('en-US', { timeZone: BUSINESS_TIMEZONE }));
}

/**
 * Convert a date to business timezone midnight (start of day)
 * Useful for storing dates without time component
 */
export function toBusinessDateMidnight(date: Date | string): Date {
  const inputDate = typeof date === 'string' ? new Date(date) : date;
  // Get the date in business timezone
  const pstDate = new Date(
    inputDate.toLocaleString('en-US', { timeZone: BUSINESS_TIMEZONE })
  );
  // Set to midnight in business timezone
  pstDate.setHours(0, 0, 0, 0);
  return pstDate;
}

/**
 * Extract date part from a Date in business timezone
 * Returns YYYY-MM-DD string
 */
export function extractBusinessDate(date: Date | string): string {
  // If input is already a YYYY-MM-DD string, treat it as a date in business timezone
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    // Already in YYYY-MM-DD format - return as-is since it represents a business date
    return date;
  }

  const inputDate = typeof date === 'string' ? new Date(date) : date;

  // CRITICAL FIX: If date is at midnight UTC (00:00:00), it represents a calendar date
  // stored with Date.UTC(). Extract UTC components directly without timezone conversion.
  const hours = inputDate.getUTCHours();
  const minutes = inputDate.getUTCMinutes();
  const seconds = inputDate.getUTCSeconds();
  const milliseconds = inputDate.getUTCMilliseconds();

  if (hours === 0 && minutes === 0 && seconds === 0 && milliseconds === 0) {
    // Date stored at midnight UTC - extract UTC date components directly
    const year = inputDate.getUTCFullYear();
    const month = String(inputDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(inputDate.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // For non-midnight dates (actual timestamps), convert to business timezone
  const pstDate = new Date(
    inputDate.toLocaleString('en-US', { timeZone: BUSINESS_TIMEZONE })
  );
  const year = pstDate.getFullYear();
  const month = String(pstDate.getMonth() + 1).padStart(2, '0');
  const day = String(pstDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Normalize a value to a business *calendar date* stored at midnight UTC.
 *
 * Use this for date-only fields such as an invoice date, where the app treats
 * the value as "the business day" rather than an exact instant. Storing it at
 * midnight UTC (via Date.UTC) keeps it identical across dev (PST) and production
 * (UTC) servers, lets extractBusinessDate() read it back correctly, and makes
 * UTC-based display (`toLocaleDateString('en-US', { timeZone: 'UTC' })`) show the
 * intended day regardless of browser timezone.
 *
 * @param value YYYY-MM-DD string, an ISO timestamp/Date, or omitted (uses the
 *              current business date). ISO timestamps are first collapsed to the
 *              business-timezone calendar day before being pinned to midnight UTC.
 */
export function toBusinessCalendarDate(value?: Date | string): Date {
  const dateStr = value ? extractBusinessDate(value) : getCurrentBusinessDate();
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
}

/**
 * Shift a business date (YYYY-MM-DD) by a number of days and return YYYY-MM-DD.
 * Pure calendar arithmetic (done in UTC), so it is unaffected by DST.
 */
export function shiftBusinessDate(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const shifted = new Date(Date.UTC(year, month - 1, day + days));
  const y = shifted.getUTCFullYear();
  const m = String(shifted.getUTCMonth() + 1).padStart(2, '0');
  const d = String(shifted.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Minutes the business timezone is offset from UTC on a given calendar day.
 * Negative for Pacific time (UTC-8 PST / UTC-7 PDT). Sampled at noon UTC so the
 * result is never taken at a DST transition boundary.
 */
function businessTimezoneOffsetMinutes(
  year: number,
  month: number,
  day: number
): number {
  const reference = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: BUSINESS_TIMEZONE,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(reference);
  const get = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value);
  // Hour can come back as "24" for midnight in some environments.
  const hour = get('hour') % 24;
  const asUtc = Date.UTC(
    get('year'),
    get('month') - 1,
    get('day'),
    hour,
    get('minute'),
    get('second')
  );
  return (asUtc - reference.getTime()) / 60000;
}

/**
 * UTC start/end instants that bound a business-timezone calendar day.
 *
 * Use this for Prisma range filters on real timestamp columns (createdAt,
 * openedAt, paidAt) so a record created late in the day — e.g. after 5 PM PST,
 * which is already the next day in UTC — is still counted on the correct
 * business day. `start` is inclusive, `end` is exclusive.
 *
 * @param dateStr business date in YYYY-MM-DD format
 */
export function businessDayUtcRange(dateStr: string): {
  start: Date;
  end: Date;
} {
  const [year, month, day] = dateStr.split('-').map(Number);
  const offsetMinutes = businessTimezoneOffsetMinutes(year, month, day);
  const start = new Date(
    Date.UTC(year, month - 1, day, 0, 0, 0, 0) - offsetMinutes * 60000
  );
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start, end };
}

/**
 * Format PostgreSQL AT TIME ZONE clause for date comparison
 * Use this in raw SQL queries to ensure dates are compared in business timezone
 *
 * Example:
 * DATE(column AT TIME ZONE 'UTC' AT TIME ZONE 'America/Vancouver') = DATE('2025-11-05')
 */
export function pgTimezoneClause(columnName: string): string {
  return `${columnName} AT TIME ZONE 'UTC' AT TIME ZONE '${POSTGRES_TIMEZONE}'`;
}

/**
 * Get PostgreSQL date comparison for business timezone
 * Returns SQL fragment for comparing dates in business timezone
 *
 * @param columnName - The column to compare (e.g., 'a."paymentDate"')
 * @param dateString - The date to compare against (YYYY-MM-DD format)
 * @returns SQL fragment like: DATE(column AT TIME ZONE 'UTC' AT TIME ZONE 'America/Vancouver') = DATE('2025-11-05')
 */
export function pgDateEquals(columnName: string, dateString: string): string {
  return `DATE(${pgTimezoneClause(columnName)}) = DATE('${dateString}')`;
}
