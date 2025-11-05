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
export declare const BUSINESS_TIMEZONE = "America/Vancouver";
/**
 * PostgreSQL timezone string for use in AT TIME ZONE queries
 * This handles PST/PDT transitions automatically
 */
export declare const POSTGRES_TIMEZONE = "America/Vancouver";
/**
 * Get current date in business timezone (PST/PDT)
 * Returns date string in YYYY-MM-DD format
 */
export declare function getCurrentBusinessDate(): string;
/**
 * Get current date/time in business timezone
 * Returns a Date object representing current time in PST/PDT
 */
export declare function getCurrentBusinessDateTime(): Date;
/**
 * Convert a date to business timezone midnight (start of day)
 * Useful for storing dates without time component
 */
export declare function toBusinessDateMidnight(date: Date | string): Date;
/**
 * Extract date part from a Date in business timezone
 * Returns YYYY-MM-DD string
 */
export declare function extractBusinessDate(date: Date | string): string;
/**
 * Format PostgreSQL AT TIME ZONE clause for date comparison
 * Use this in raw SQL queries to ensure dates are compared in business timezone
 *
 * Example:
 * DATE(column AT TIME ZONE 'UTC' AT TIME ZONE 'America/Vancouver') = DATE('2025-11-05')
 */
export declare function pgTimezoneClause(columnName: string): string;
/**
 * Get PostgreSQL date comparison for business timezone
 * Returns SQL fragment for comparing dates in business timezone
 *
 * @param columnName - The column to compare (e.g., 'a."paymentDate"')
 * @param dateString - The date to compare against (YYYY-MM-DD format)
 * @returns SQL fragment like: DATE(column AT TIME ZONE 'UTC' AT TIME ZONE 'America/Vancouver') = DATE('2025-11-05')
 */
export declare function pgDateEquals(columnName: string, dateString: string): string;
//# sourceMappingURL=timezone.config.d.ts.map