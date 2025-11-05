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
  return new Date(
    now.toLocaleString('en-US', { timeZone: BUSINESS_TIMEZONE })
  );
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
  const inputDate = typeof date === 'string' ? new Date(date) : date;
  // Convert to business timezone
  const pstDate = new Date(
    inputDate.toLocaleString('en-US', { timeZone: BUSINESS_TIMEZONE })
  );
  const year = pstDate.getFullYear();
  const month = String(pstDate.getMonth() + 1).padStart(2, '0');
  const day = String(pstDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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
