export declare class FileUtils {
    /**
     * Supported MIME types for GT Automotive file uploads
     */
    static getSupportedMimeTypes(): string[];
    /**
     * File upload size limit (10 MB for automotive documents)
     */
    static fileUploadLimitInBytes(): number;
    /**
     * Check if file type is supported
     */
    static isSupportedFileType(mimeType: string): boolean;
    /**
     * Get file extension from filename
     */
    static getFileExtension(filename: string): string;
    /**
     * Validate file size
     */
    static isValidFileSize(fileSizeInBytes: number): boolean;
    /**
     * Format file size for display
     */
    static formatFileSize(bytes: number): string;
    /**
     * Generate safe filename (remove special characters)
     */
    static sanitizeFilename(filename: string): string;
    /**
     * Check if file is an image
     */
    static isImageFile(mimeType: string): boolean;
    /**
     * Check if file is a PDF
     */
    static isPdfFile(mimeType: string): boolean;
    /**
     * Check if file is a spreadsheet
     */
    static isSpreadsheetFile(mimeType: string): boolean;
    /**
     * Get file category for organization
     */
    static getFileCategory(mimeType: string): string;
    /**
     * Generate unique filename with timestamp
     */
    static generateUniqueFilename(originalFilename: string): string;
}
//# sourceMappingURL=file-utils.d.ts.map