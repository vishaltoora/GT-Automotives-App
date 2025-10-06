/**
 * Phone number formatting utilities
 * Formats phone numbers for display while keeping backend data clean
 */

/**
 * Formats a phone number for display with dashes (e.g., 250-555-1234)
 * @param phone - Raw phone number (digits only or with existing formatting)
 * @returns Formatted phone number with dashes, or empty string if invalid
 */
export function formatPhoneForDisplay(phone: string | null | undefined): string {
  if (!phone) return '';

  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');

  // Handle different length phone numbers
  if (digits.length === 10) {
    // Format as XXX-XXX-XXXX
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  } else if (digits.length === 11 && digits[0] === '1') {
    // Format as 1-XXX-XXX-XXXX
    return `${digits.slice(0, 1)}-${digits.slice(1, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`;
  }

  // Return original if not a standard format
  return phone;
}

/**
 * Strips all formatting from a phone number to get digits only
 * @param phone - Phone number with or without formatting
 * @returns Phone number with digits only, or empty string if invalid
 */
export function stripPhoneFormatting(phone: string | null | undefined): string {
  if (!phone) return '';
  return phone.replace(/\D/g, '');
}

/**
 * Formats phone number as user types (for input fields)
 * Automatically adds dashes as user types
 * @param value - Current input value
 * @returns Formatted value for display in input
 */
export function formatPhoneOnChange(value: string): string {
  // Remove all non-digit characters
  const digits = value.replace(/\D/g, '');

  // Limit to 10 digits for standard North American format
  const limitedDigits = digits.slice(0, 10);

  // Apply formatting as user types
  if (limitedDigits.length <= 3) {
    return limitedDigits;
  } else if (limitedDigits.length <= 6) {
    return `${limitedDigits.slice(0, 3)}-${limitedDigits.slice(3)}`;
  } else {
    return `${limitedDigits.slice(0, 3)}-${limitedDigits.slice(3, 6)}-${limitedDigits.slice(6)}`;
  }
}
