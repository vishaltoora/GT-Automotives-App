import { Injectable, Logger } from '@nestjs/common';
import {
  BlobServiceClient,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
  ContainerClient,
} from '@azure/storage-blob';
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

@Injectable()
export class AzureBlobService {
  private readonly logger = new Logger(AzureBlobService.name);
  private blobServiceClient: BlobServiceClient | null = null;
  private accountName: string | null = null;
  private accountKey: string | null = null;
  private isConfigured = false;

  // Allowed file types for invoice images
  private readonly ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'application/pdf',
  ];

  // Max file size: 10 MB
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024;

  constructor(private configService: ConfigService) {
    const connectionString = this.configService.get<string>(
      'AZURE_STORAGE_CONNECTION_STRING'
    );
    this.accountName = this.configService.get<string>(
      'AZURE_STORAGE_ACCOUNT_NAME'
    );

    if (!connectionString || !this.accountName) {
      this.logger.warn(
        '⚠️  Azure Storage not configured - file upload features will be disabled in development mode'
      );
      return;
    }

    // Extract account key from connection string
    const keyMatch = connectionString.match(/AccountKey=([^;]+)/);
    if (!keyMatch) {
      this.logger.error('Could not extract AccountKey from connection string');
      return;
    }
    this.accountKey = keyMatch[1];

    this.blobServiceClient =
      BlobServiceClient.fromConnectionString(connectionString);
    this.isConfigured = true;
    this.logger.log(
      `Azure Blob Service initialized for account: ${this.accountName}`
    );
  }

  /**
   * Validate file before upload
   */
  validateFile(
    file: Express.Multer.File | Buffer,
    mimeType?: string
  ): FileValidationResult {
    const fileSize =
      file instanceof Buffer ? file.length : file.size;
    const fileMimeType =
      file instanceof Buffer ? mimeType : file.mimetype;

    // Check file size
    if (fileSize > this.MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File size exceeds maximum allowed size of ${this.MAX_FILE_SIZE / 1024 / 1024}MB`,
      };
    }

    // Check file type
    if (fileMimeType && !this.ALLOWED_MIME_TYPES.includes(fileMimeType)) {
      return {
        valid: false,
        error: `File type ${fileMimeType} is not allowed. Allowed types: ${this.ALLOWED_MIME_TYPES.join(', ')}`,
      };
    }

    return { valid: true };
  }

  /**
   * Generate blob name with date-based folder structure
   * Format: YYYY/MM/filename-timestamp.ext
   */
  private generateBlobName(
    originalFileName: string,
    invoiceType: 'purchase' | 'expense'
  ): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const timestamp = now.getTime();

    // Clean filename - remove special characters and spaces
    const cleanFileName = originalFileName
      .replace(/[^a-zA-Z0-9.-]/g, '-')
      .toLowerCase();

    // Extract extension
    const extension = cleanFileName.split('.').pop();
    const nameWithoutExt = cleanFileName.replace(`.${extension}`, '');

    return `${year}/${month}/${invoiceType}-${nameWithoutExt}-${timestamp}.${extension}`;
  }

  /**
   * Upload invoice image to Azure Blob Storage
   */
  async uploadInvoiceImage(
    file: Express.Multer.File | Buffer,
    originalFileName: string,
    invoiceType: 'purchase' | 'expense',
    mimeType?: string
  ): Promise<UploadResult> {
    if (!this.isConfigured) {
      throw new Error('Azure Storage is not configured. File upload is disabled in development mode.');
    }

    try {
      // Validate file
      const validation = this.validateFile(file, mimeType);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Determine container name
      const containerName =
        invoiceType === 'purchase' ? 'purchase-invoices' : 'expense-invoices';

      // Get container client
      const containerClient =
        this.blobServiceClient!.getContainerClient(containerName);

      // Generate blob name
      const blobName = this.generateBlobName(originalFileName, invoiceType);

      // Get block blob client
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      // Upload
      const fileBuffer = file instanceof Buffer ? file : file.buffer;
      const uploadResponse = await blockBlobClient.upload(
        fileBuffer,
        fileBuffer.length,
        {
          blobHTTPHeaders: {
            blobContentType: mimeType || (file as Express.Multer.File).mimetype,
          },
        }
      );

      this.logger.log(
        `Uploaded blob: ${blobName} to container: ${containerName}`
      );

      return {
        blobName,
        blobUrl: blockBlobClient.url,
        containerName,
        size: fileBuffer.length,
      };
    } catch (error) {
      this.logger.error('Error uploading to Azure Blob Storage', error);
      throw error;
    }
  }

  /**
   * Generate SAS URL with temporary read access (default: 1 hour)
   */
  async generateSasUrl(
    containerName: string,
    blobName: string,
    expiryMinutes: number = 60
  ): Promise<string> {
    if (!this.isConfigured) {
      throw new Error('Azure Storage is not configured. SAS URL generation is disabled in development mode.');
    }

    try {
      const containerClient =
        this.blobServiceClient!.getContainerClient(containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      // Create SAS token
      const expiryDate = new Date();
      expiryDate.setMinutes(expiryDate.getMinutes() + expiryMinutes);

      const permissions = new BlobSASPermissions();
      permissions.read = true;

      const sharedKeyCredential = new StorageSharedKeyCredential(
        this.accountName!,
        this.accountKey!
      );

      const sasToken = generateBlobSASQueryParameters(
        {
          containerName,
          blobName,
          permissions,
          expiresOn: expiryDate,
        },
        sharedKeyCredential
      ).toString();

      const sasUrl = `${blockBlobClient.url}?${sasToken}`;

      this.logger.log(
        `Generated SAS URL for ${blobName} (expires in ${expiryMinutes} minutes)`
      );

      return sasUrl;
    } catch (error) {
      this.logger.error('Error generating SAS URL', error);
      throw error;
    }
  }

  /**
   * Delete invoice image from Azure Blob Storage
   */
  async deleteInvoiceImage(
    containerName: string,
    blobName: string
  ): Promise<boolean> {
    if (!this.isConfigured) {
      throw new Error('Azure Storage is not configured. File deletion is disabled in development mode.');
    }

    try {
      const containerClient =
        this.blobServiceClient!.getContainerClient(containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      const deleteResponse = await blockBlobClient.delete();

      this.logger.log(
        `Deleted blob: ${blobName} from container: ${containerName}`
      );

      return true;
    } catch (error) {
      this.logger.error('Error deleting blob from Azure Storage', error);
      throw error;
    }
  }

  /**
   * Get blob metadata (size, content type, etc.)
   */
  async getBlobMetadata(
    containerName: string,
    blobName: string
  ): Promise<any> {
    if (!this.isConfigured) {
      throw new Error('Azure Storage is not configured. Blob metadata retrieval is disabled in development mode.');
    }

    try {
      const containerClient =
        this.blobServiceClient!.getContainerClient(containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      const properties = await blockBlobClient.getProperties();

      return {
        size: properties.contentLength,
        contentType: properties.contentType,
        lastModified: properties.lastModified,
        createdOn: properties.createdOn,
      };
    } catch (error) {
      this.logger.error('Error getting blob metadata', error);
      throw error;
    }
  }

  /**
   * List all blobs in a container (for admin/debugging)
   */
  async listBlobs(containerName: string): Promise<string[]> {
    if (!this.isConfigured) {
      throw new Error('Azure Storage is not configured. Blob listing is disabled in development mode.');
    }

    try {
      const containerClient =
        this.blobServiceClient!.getContainerClient(containerName);
      const blobNames: string[] = [];

      for await (const blob of containerClient.listBlobsFlat()) {
        blobNames.push(blob.name);
      }

      return blobNames;
    } catch (error) {
      this.logger.error('Error listing blobs', error);
      throw error;
    }
  }

  /**
   * Extract blob name from full URL
   */
  extractBlobNameFromUrl(blobUrl: string): string | null {
    try {
      const url = new URL(blobUrl);
      const pathParts = url.pathname.split('/');
      // Remove empty first element and container name
      pathParts.shift(); // Remove empty
      pathParts.shift(); // Remove container name
      return pathParts.join('/');
    } catch (error) {
      this.logger.error('Error extracting blob name from URL', error);
      return null;
    }
  }

  /**
   * Extract container name from full URL
   */
  extractContainerNameFromUrl(blobUrl: string): string | null {
    try {
      const url = new URL(blobUrl);
      const pathParts = url.pathname.split('/');
      // Container name is the first part after the domain
      return pathParts[1] || null;
    } catch (error) {
      this.logger.error('Error extracting container name from URL', error);
      return null;
    }
  }
}
