export declare class StringUtils {
    /**
     * Remove all whitespace from a string
     */
    static removeWhitespace(str: string): string;
    /**
     * Replace multiple consecutive spaces with a single space
     */
    static replaceMultipleSpacesWithSingle(str: string): string;
    /**
     * Get phone mask format for different countries (automotive context)
     */
    static phoneMask(country?: string): string;
    /**
     * Format phone number for Canadian/US automotive businesses
     */
    static formatPhoneNumber(phone: string): string;
    /**
     * Capitalize first letter of each word
     */
    static titleCase(str: string): string;
    /**
     * Extract initials from full name
     */
    static getInitials(fullName: string): string;
    /**
     * Generate vehicle identifier (make + model + year)
     */
    static formatVehicleIdentifier(make?: string, model?: string, year?: number): string;
    /**
     * Truncate string with ellipsis
     */
    static truncate(str: string, maxLength: number): string;
    /**
     * Remove special characters for safe URLs/IDs
     */
    static slugify(str: string): string;
    /**
     * Format currency for Canadian automotive context
     */
    static formatCurrency(amount: number): string;
    /**
     * Validate and format postal code (Canadian format)
     */
    static formatPostalCode(postalCode: string): string;
    /**
     * Generate display name from first and last name
     */
    static getDisplayName(firstName?: string, lastName?: string): string;
}
//# sourceMappingURL=string-utils.d.ts.map