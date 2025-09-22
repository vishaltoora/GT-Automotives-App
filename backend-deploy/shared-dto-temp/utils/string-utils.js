"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StringUtils = void 0;
class StringUtils {
    /**
     * Remove all whitespace from a string
     */
    static removeWhitespace(str) {
        return str.replace(/\s+/g, '');
    }
    /**
     * Replace multiple consecutive spaces with a single space
     */
    static replaceMultipleSpacesWithSingle(str) {
        return str.replace(/ +(?= )/g, '');
    }
    /**
     * Get phone mask format for different countries (automotive context)
     */
    static phoneMask(country = 'Canada') {
        switch (country) {
            case 'United States':
            case 'Canada':
                return '(999) 999-9999';
            case 'United Kingdom':
                return '999-999-9999';
            default:
                return '(999) 999-9999';
        }
    }
    /**
     * Format phone number for Canadian/US automotive businesses
     */
    static formatPhoneNumber(phone) {
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 10) {
            return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
        }
        if (cleaned.length === 11 && cleaned.startsWith('1')) {
            return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
        }
        return phone; // Return original if can't format
    }
    /**
     * Capitalize first letter of each word
     */
    static titleCase(str) {
        return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    }
    /**
     * Extract initials from full name
     */
    static getInitials(fullName) {
        return fullName
            .split(' ')
            .map(name => name.charAt(0).toUpperCase())
            .join('');
    }
    /**
     * Generate vehicle identifier (make + model + year)
     */
    static formatVehicleIdentifier(make, model, year) {
        const parts = [year === null || year === void 0 ? void 0 : year.toString(), make, model].filter(Boolean);
        return parts.join(' ');
    }
    /**
     * Truncate string with ellipsis
     */
    static truncate(str, maxLength) {
        if (str.length <= maxLength)
            return str;
        return str.slice(0, maxLength - 3) + '...';
    }
    /**
     * Remove special characters for safe URLs/IDs
     */
    static slugify(str) {
        return str
            .toLowerCase()
            .replace(/[^\w ]+/g, '')
            .replace(/ +/g, '-');
    }
    /**
     * Format currency for Canadian automotive context
     */
    static formatCurrency(amount) {
        return new Intl.NumberFormat('en-CA', {
            style: 'currency',
            currency: 'CAD'
        }).format(amount);
    }
    /**
     * Validate and format postal code (Canadian format)
     */
    static formatPostalCode(postalCode) {
        const cleaned = postalCode.replace(/\s/g, '').toUpperCase();
        if (cleaned.length === 6) {
            return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
        }
        return postalCode; // Return original if can't format
    }
    /**
     * Generate display name from first and last name
     */
    static getDisplayName(firstName, lastName) {
        if (!firstName && !lastName)
            return 'Unknown';
        if (!lastName)
            return firstName || 'Unknown';
        if (!firstName)
            return lastName;
        return `${firstName} ${lastName}`;
    }
}
exports.StringUtils = StringUtils;
