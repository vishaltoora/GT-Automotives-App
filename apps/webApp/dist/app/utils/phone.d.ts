/**
 * Phone number formatting utilities
 * Formats phone numbers for display while keeping backend data clean
 */
/**
 * Formats a phone number for display with dashes (e.g., 250-555-1234)
 * @param phone - Raw phone number (digits only or with existing formatting)
 * @returns Formatted phone number with dashes, or empty string if invalid
 */
export declare function formatPhoneForDisplay(phone: string | null | undefined): string;
/**
 * Strips all formatting from a phone number to get digits only
 * @param phone - Phone number with or without formatting
 * @returns Phone number with digits only, or empty string if invalid
 */
export declare function stripPhoneFormatting(phone: string | null | undefined): string;
/**
 * Formats phone number as user types (for input fields)
 * Automatically adds dashes as user types
 * @param value - Current input value
 * @returns Formatted value for display in input
 */
export declare function formatPhoneOnChange(value: string): string;
//# sourceMappingURL=phone.d.ts.map