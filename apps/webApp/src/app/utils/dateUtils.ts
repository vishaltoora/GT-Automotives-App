/**
 * Date Utility Functions for GT Automotives
 *
 * CRITICAL TIMEZONE RULES:
 * 1. Always use these utilities instead of direct Date manipulation
 * 2. Never use toISOString() for date extraction - it converts to UTC
 * 3. Never use new Date(dateString) for DatePicker - it uses local midnight
 * 4. Always send YYYY-MM-DD strings to API, never Date objects
 *
 * Business Timezone: America/Vancouver (PST/PDT)
 */

/**
 * Extract YYYY-MM-DD string from Date object WITHOUT timezone conversion
 *
 * USE THIS instead of: date.toISOString().split('T')[0]
 *
 * Why: toISOString() converts to UTC, causing -1 day shift after 5 PM PST
 *
 * @example
 * // At 11:30 PM PST on Nov 18
 * const date = new Date(2025, 10, 18, 23, 30);
 * extractDateString(date); // Returns "2025-11-18" ✅
 * date.toISOString().split('T')[0]; // Returns "2025-11-19" ❌ (UTC conversion!)
 *
 * @param date - Date object from DatePicker or Date constructor
 * @returns Date string in YYYY-MM-DD format
 */
export function extractDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse YYYY-MM-DD string to Date object for DatePicker WITHOUT timezone conversion
 *
 * USE THIS instead of: new Date(dateString)
 *
 * Why: new Date("2025-11-18") treats it as midnight UTC, not local time
 *
 * @example
 * parseDateString("2025-11-18"); // Creates Date(2025, 10, 18) in local timezone ✅
 * new Date("2025-11-18"); // Creates Date at midnight UTC (may show wrong day) ❌
 *
 * @param dateStr - Date string in YYYY-MM-DD format
 * @returns Date object representing midnight local time on that date
 */
export function parseDateString(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Format YYYY-MM-DD string for user-friendly display
 *
 * USE THIS instead of: date.toLocaleDateString()
 *
 * Why: Avoids creating Date objects which can cause timezone shifts
 *
 * @example
 * formatDisplayDate("2025-11-18"); // "Monday, November 18, 2025"
 * formatShortDate("2025-11-18"); // "Nov 18, 2025"
 *
 * @param dateStr - Date string in YYYY-MM-DD format
 * @param format - "long" (default) or "short"
 * @returns Formatted date string
 */
export function formatDisplayDate(dateStr: string, format: 'long' | 'short' = 'long'): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  if (format === 'short') {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Get today's date in YYYY-MM-DD format
 *
 * USE THIS instead of: new Date().toISOString().split('T')[0]
 *
 * @example
 * getTodayString(); // "2025-11-18"
 *
 * @returns Today's date in YYYY-MM-DD format
 */
export function getTodayString(): string {
  const now = new Date();
  return extractDateString(now);
}

/**
 * Get tomorrow's date in YYYY-MM-DD format
 *
 * @example
 * getTomorrowString(); // "2025-11-19"
 *
 * @returns Tomorrow's date in YYYY-MM-DD format
 */
export function getTomorrowString(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return extractDateString(tomorrow);
}

/**
 * Add days to a date string
 *
 * @example
 * addDays("2025-11-18", 5); // "2025-11-23"
 * addDays("2025-11-18", -2); // "2025-11-16"
 *
 * @param dateStr - Date string in YYYY-MM-DD format
 * @param days - Number of days to add (positive or negative)
 * @returns New date string in YYYY-MM-DD format
 */
export function addDays(dateStr: string, days: number): string {
  const date = parseDateString(dateStr);
  date.setDate(date.getDate() + days);
  return extractDateString(date);
}

/**
 * Compare two date strings
 *
 * @example
 * compareDates("2025-11-18", "2025-11-20"); // -1 (first is earlier)
 * compareDates("2025-11-20", "2025-11-18"); // 1 (first is later)
 * compareDates("2025-11-18", "2025-11-18"); // 0 (equal)
 *
 * @param date1 - First date string in YYYY-MM-DD format
 * @param date2 - Second date string in YYYY-MM-DD format
 * @returns -1 if date1 < date2, 0 if equal, 1 if date1 > date2
 */
export function compareDates(date1: string, date2: string): number {
  if (date1 < date2) return -1;
  if (date1 > date2) return 1;
  return 0;
}

/**
 * Check if a date string is today
 *
 * @example
 * isToday("2025-11-18"); // true (if today is Nov 18)
 *
 * @param dateStr - Date string in YYYY-MM-DD format
 * @returns true if date is today
 */
export function isToday(dateStr: string): boolean {
  return dateStr === getTodayString();
}

/**
 * Check if a date string is in the past
 *
 * @example
 * isPast("2025-11-17"); // true (if today is Nov 18)
 *
 * @param dateStr - Date string in YYYY-MM-DD format
 * @returns true if date is before today
 */
export function isPast(dateStr: string): boolean {
  return dateStr < getTodayString();
}

/**
 * Check if a date string is in the future
 *
 * @example
 * isFuture("2025-11-19"); // true (if today is Nov 18)
 *
 * @param dateStr - Date string in YYYY-MM-DD format
 * @returns true if date is after today
 */
export function isFuture(dateStr: string): boolean {
  return dateStr > getTodayString();
}

/**
 * Get the day of week for a date string
 *
 * @example
 * getDayOfWeek("2025-11-18"); // "Monday"
 *
 * @param dateStr - Date string in YYYY-MM-DD format
 * @returns Day of week name
 */
export function getDayOfWeek(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', { weekday: 'long' });
}

/**
 * Format a date range
 *
 * @example
 * formatDateRange("2025-11-18", "2025-11-20"); // "Nov 18, 2025 - Nov 20, 2025"
 *
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format
 * @returns Formatted date range string
 */
export function formatDateRange(startDate: string, endDate: string): string {
  return `${formatDisplayDate(startDate, 'short')} - ${formatDisplayDate(endDate, 'short')}`;
}

/**
 * Validate YYYY-MM-DD date string format
 *
 * @example
 * isValidDateString("2025-11-18"); // true
 * isValidDateString("11/18/2025"); // false
 * isValidDateString("2025-13-01"); // false (invalid month)
 *
 * @param dateStr - String to validate
 * @returns true if valid YYYY-MM-DD format
 */
export function isValidDateString(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return false;
  }

  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  // Check if the date components match (catches invalid dates like 2025-02-30)
  return date.getFullYear() === year
    && date.getMonth() === month - 1
    && date.getDate() === day;
}
