/**
 * Time utility functions for appointment scheduling
 */

/**
 * Get current time rounded to next 15-minute interval
 */
export const getCurrentTimeRounded = (): string => {
  const now = new Date();
  const minutes = now.getMinutes();
  const roundedMinutes = Math.ceil(minutes / 15) * 15;
  now.setMinutes(roundedMinutes);
  now.setSeconds(0);
  const hours = String(now.getHours()).padStart(2, '0');
  const mins = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${mins}`;
};

/**
 * Check if selected date is today
 */
export const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

/**
 * Generate time slots in 15-minute intervals (7:00 AM to 11:00 PM)
 */
export const generateTimeOptions = (): Array<{ value: string; label: string }> => {
  const options: { value: string; label: string }[] = [];
  const startHour = 7; // 7 AM
  const endHour = 23; // 11 PM

  for (let hour = startHour; hour <= endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      if (hour === endHour && minute > 0) break; // Stop at 11:00 PM

      const timeValue = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

      // Format for display (12-hour format)
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayMinute = String(minute).padStart(2, '0');
      const label = `${displayHour}:${displayMinute} ${period}`;

      options.push({ value: timeValue, label });
    }
  }

  return options;
};
