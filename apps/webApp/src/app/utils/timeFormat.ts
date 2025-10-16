/**
 * Utility functions for time formatting
 */

/**
 * Convert 24-hour time format (HH:mm) to 12-hour format with AM/PM
 * @param time24 Time string in 24-hour format (e.g., "14:30", "09:00")
 * @returns Time string in 12-hour format (e.g., "2:30 PM", "9:00 AM")
 */
export function format12Hour(time24: string): string {
  if (!time24) return '';

  const [hoursStr, minutesStr] = time24.split(':');
  const hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);

  if (isNaN(hours) || isNaN(minutes)) {
    return time24; // Return original if invalid
  }

  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12; // Convert 0 to 12 for midnight

  return `${hours12}:${minutesStr} ${period}`;
}

/**
 * Convert 12-hour time format with AM/PM to 24-hour format (HH:mm)
 * @param time12 Time string in 12-hour format (e.g., "2:30 PM", "9:00 AM")
 * @returns Time string in 24-hour format (e.g., "14:30", "09:00")
 */
export function format24Hour(time12: string): string {
  if (!time12) return '';

  const match = time12.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) {
    return time12; // Return original if invalid format
  }

  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const period = match[3].toUpperCase();

  if (period === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0;
  }

  return `${hours.toString().padStart(2, '0')}:${minutes}`;
}

/**
 * Format a time range in 12-hour format
 * @param startTime Start time in 24-hour format
 * @param endTime End time in 24-hour format
 * @returns Formatted time range (e.g., "9:00 AM - 5:00 PM")
 */
export function formatTimeRange(startTime: string, endTime: string): string {
  return `${format12Hour(startTime)} - ${format12Hour(endTime)}`;
}

/**
 * Format a date without timezone conversion issues
 * Parses ISO date strings (YYYY-MM-DD) directly without timezone shifts
 * @param dateValue Date object or ISO date string
 * @returns Formatted date string (e.g., "10/17/2025")
 */
export function formatDateLocal(dateValue: Date | string): string {
  if (!dateValue) return '';

  let dateStr: string;

  // If it's already a Date object, get ISO string
  if (dateValue instanceof Date) {
    dateStr = dateValue.toISOString().split('T')[0];
  } else {
    // If it's a string, extract just the date portion
    dateStr = dateValue.split('T')[0];
  }

  // Parse the date components directly to avoid timezone issues
  const [year, month, day] = dateStr.split('-').map(Number);

  // Create a date object using local timezone
  const localDate = new Date(year, month - 1, day);

  return localDate.toLocaleDateString();
}
