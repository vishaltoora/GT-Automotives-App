/**
 * Utility functions for time formatting
 */
/**
 * Convert 24-hour time format (HH:mm) to 12-hour format with AM/PM
 * @param time24 Time string in 24-hour format (e.g., "14:30", "09:00")
 * @returns Time string in 12-hour format (e.g., "2:30 PM", "9:00 AM")
 */
export declare function format12Hour(time24: string): string;
/**
 * Convert 12-hour time format with AM/PM to 24-hour format (HH:mm)
 * @param time12 Time string in 12-hour format (e.g., "2:30 PM", "9:00 AM")
 * @returns Time string in 24-hour format (e.g., "14:30", "09:00")
 */
export declare function format24Hour(time12: string): string;
/**
 * Format a time range in 12-hour format
 * @param startTime Start time in 24-hour format
 * @param endTime End time in 24-hour format
 * @returns Formatted time range (e.g., "9:00 AM - 5:00 PM")
 */
export declare function formatTimeRange(startTime: string, endTime: string): string;
/**
 * Format a date without timezone conversion issues
 * Parses ISO date strings (YYYY-MM-DD) directly without timezone shifts
 * @param dateValue Date object or ISO date string
 * @returns Formatted date string (e.g., "10/17/2025")
 */
export declare function formatDateLocal(dateValue: Date | string): string;
//# sourceMappingURL=timeFormat.d.ts.map