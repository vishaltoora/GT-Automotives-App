import { ConfigService } from '@nestjs/config';
export interface UploadResult {
    blobName: string;
    blobUrl: string;
    containerName: string;
    size: number;
}
export interface FileValidationResult {
    valid: boolean;
    error?: string;
}
export declare class AzureBlobService {
    private configService;
    private readonly logger;
    private blobServiceClient;
    private accountName;
    private accountKey;
    private isConfigured;
    private readonly ALLOWED_MIME_TYPES;
    private readonly MAX_FILE_SIZE;
    constructor(configService: ConfigService);
    /**
     * Validate file before upload
     */
    validateFile(file: any | Buffer, mimeType?: string): FileValidationResult;
    /**
     * Generate blob name with date-based folder structure
     * Format: YYYY/MM/filename-timestamp.ext
     */
    private generateBlobName;
    /**
     * Upload invoice image to Azure Blob Storage
     */
    uploadInvoiceImage(file: any | Buffer, originalFileName: string, invoiceType: 'purchase' | 'expense', mimeType?: string): Promise<UploadResult>;
    /**
     * Generate SAS URL with temporary read access (default: 1 hour)
     */
    generateSasUrl(containerName: string, blobName: string, expiryMinutes?: number): Promise<string>;
    /**
     * Delete invoice image from Azure Blob Storage
     */
    deleteInvoiceImage(containerName: string, blobName: string): Promise<boolean>;
    /**
     * Get blob metadata (size, content type, etc.)
     */
    getBlobMetadata(containerName: string, blobName: string): Promise<any>;
    /**
     * List all blobs in a container (for admin/debugging)
     */
    listBlobs(containerName: string): Promise<string[]>;
    /**
     * Extract blob name from full URL
     */
    extractBlobNameFromUrl(blobUrl: string): string | null;
    /**
     * Extract container name from full URL
     */
    extractContainerNameFromUrl(blobUrl: string): string | null;
}
//# sourceMappingURL=azure-blob.service.d.ts.map