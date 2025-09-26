export class FileUtils {
  /**
   * Supported MIME types for GT Automotive file uploads
   */
  static getSupportedMimeTypes(): string[] {
    return [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
  }

  /**
   * File upload size limit (10 MB for automotive documents)
   */
  static fileUploadLimitInBytes(): number {
    return 10000000; // 10 MB
  }

  /**
   * Check if file type is supported
   */
  static isSupportedFileType(mimeType: string): boolean {
    return this.getSupportedMimeTypes().includes(mimeType);
  }

  /**
   * Get file extension from filename
   */
  static getFileExtension(filename: string): string {
    return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
  }

  /**
   * Validate file size
   */
  static isValidFileSize(fileSizeInBytes: number): boolean {
    return fileSizeInBytes <= this.fileUploadLimitInBytes();
  }

  /**
   * Format file size for display
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = 2;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  /**
   * Generate safe filename (remove special characters)
   */
  static sanitizeFilename(filename: string): string {
    return filename.replace(/[^a-z0-9.-]/gi, '_').toLowerCase();
  }

  /**
   * Check if file is an image
   */
  static isImageFile(mimeType: string): boolean {
    return mimeType.startsWith('image/');
  }

  /**
   * Check if file is a PDF
   */
  static isPdfFile(mimeType: string): boolean {
    return mimeType === 'application/pdf';
  }

  /**
   * Check if file is a spreadsheet
   */
  static isSpreadsheetFile(mimeType: string): boolean {
    return [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ].includes(mimeType);
  }

  /**
   * Get file category for organization
   */
  static getFileCategory(mimeType: string): string {
    if (this.isImageFile(mimeType)) return 'image';
    if (this.isPdfFile(mimeType)) return 'document';
    if (this.isSpreadsheetFile(mimeType)) return 'spreadsheet';
    return 'other';
  }

  /**
   * Generate unique filename with timestamp
   */
  static generateUniqueFilename(originalFilename: string): string {
    const timestamp = Date.now();
    const extension = this.getFileExtension(originalFilename);
    const nameWithoutExt = originalFilename.replace(`.${extension}`, '');
    const sanitizedName = this.sanitizeFilename(nameWithoutExt);

    return `${sanitizedName}_${timestamp}.${extension}`;
  }
}