import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PurchaseExpenseInvoiceRepository } from './purchase-expense-invoice.repository';
import { AzureBlobService } from '../common/services/azure-blob.service';
import {
  CreatePurchaseExpenseInvoiceDto,
  UpdatePurchaseExpenseInvoiceDto,
  PurchaseExpenseInvoiceFilterDto,
  PurchaseExpenseInvoiceResponseDto,
} from '../common/dto/purchase-expense-invoice.dto';

@Injectable()
export class PurchaseExpenseInvoicesService {
  constructor(
    private purchaseExpenseInvoiceRepository: PurchaseExpenseInvoiceRepository,
    private azureBlobService: AzureBlobService,
  ) {}

  async create(
    createDto: CreatePurchaseExpenseInvoiceDto,
    userId: string,
  ): Promise<PurchaseExpenseInvoiceResponseDto> {
    const invoice = await this.purchaseExpenseInvoiceRepository.create(
      createDto,
      userId,
    );
    return this.mapToResponse(invoice);
  }

  async findAll(filterDto: PurchaseExpenseInvoiceFilterDto): Promise<{
    data: PurchaseExpenseInvoiceResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = filterDto.page || 1;
    const limit = filterDto.limit || 20;
    const skip = (page - 1) * limit;

    const filters: any = {};
    if (filterDto.type) filters.type = filterDto.type;
    if (filterDto.vendorId) filters.vendorId = filterDto.vendorId;
    if (filterDto.category) filters.category = filterDto.category;
    if (filterDto.startDate) filters.startDate = new Date(filterDto.startDate);
    if (filterDto.endDate) filters.endDate = new Date(filterDto.endDate);

    const [invoices, total] = await Promise.all([
      this.purchaseExpenseInvoiceRepository.findAll(skip, limit, filters),
      this.purchaseExpenseInvoiceRepository.count(filters),
    ]);

    return {
      data: invoices.map((inv) => this.mapToResponse(inv)),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<PurchaseExpenseInvoiceResponseDto> {
    const invoice = await this.purchaseExpenseInvoiceRepository.findById(id);

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    return this.mapToResponse(invoice);
  }

  async update(
    id: string,
    updateDto: UpdatePurchaseExpenseInvoiceDto,
  ): Promise<PurchaseExpenseInvoiceResponseDto> {
    const existing = await this.purchaseExpenseInvoiceRepository.findById(id);

    if (!existing) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    const invoice = await this.purchaseExpenseInvoiceRepository.update(
      id,
      updateDto,
    );

    return this.mapToResponse(invoice);
  }

  async remove(id: string): Promise<PurchaseExpenseInvoiceResponseDto> {
    const existing = await this.purchaseExpenseInvoiceRepository.findById(id);

    if (!existing) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    // Delete associated image from Azure Blob Storage if exists
    if (existing.imageUrl) {
      try {
        const containerName = this.azureBlobService.extractContainerNameFromUrl(existing.imageUrl);
        const blobName = this.azureBlobService.extractBlobNameFromUrl(existing.imageUrl);
        if (containerName && blobName) {
          await this.azureBlobService.deleteInvoiceImage(containerName, blobName);
        }
      } catch (error) {
        console.error('Failed to delete blob:', error);
        // Continue with deletion even if blob deletion fails
      }
    }

    const deleted = await this.purchaseExpenseInvoiceRepository.delete(id);

    return this.mapToResponse(deleted);
  }

  async uploadImage(
    id: string,
    buffer: Buffer,
    originalName: string,
    mimeType: string,
  ): Promise<PurchaseExpenseInvoiceResponseDto> {
    const existing = await this.purchaseExpenseInvoiceRepository.findById(id);

    if (!existing) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    // Delete existing image if present
    if (existing.imageUrl) {
      try {
        const containerName = this.azureBlobService.extractContainerNameFromUrl(existing.imageUrl);
        const blobName = this.azureBlobService.extractBlobNameFromUrl(existing.imageUrl);
        if (containerName && blobName) {
          await this.azureBlobService.deleteInvoiceImage(containerName, blobName);
        }
      } catch (error) {
        console.error('Failed to delete existing blob:', error);
      }
    }

    // Upload new image - determine invoice type based on existing type
    const invoiceType = existing.type === 'PURCHASE' ? 'purchase' : 'expense';
    const uploadResult = await this.azureBlobService.uploadInvoiceImage(
      buffer,
      originalName,
      invoiceType,
      mimeType,
    );
    const imageUrl = uploadResult.blobUrl;

    const invoice = await this.purchaseExpenseInvoiceRepository.updateImageInfo(
      id,
      imageUrl,
      originalName,
      buffer.length,
    );

    return this.mapToResponse(invoice);
  }

  async deleteImage(id: string): Promise<PurchaseExpenseInvoiceResponseDto> {
    const existing = await this.purchaseExpenseInvoiceRepository.findById(id);

    if (!existing) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    if (!existing.imageUrl) {
      throw new BadRequestException('Invoice has no image to delete');
    }

    try {
      const containerName = this.azureBlobService.extractContainerNameFromUrl(existing.imageUrl);
      const blobName = this.azureBlobService.extractBlobNameFromUrl(existing.imageUrl);
      if (containerName && blobName) {
        await this.azureBlobService.deleteInvoiceImage(containerName, blobName);
      }
    } catch (error) {
      console.error('Failed to delete blob:', error);
    }

    const invoice = await this.purchaseExpenseInvoiceRepository.updateImageInfo(
      id,
      null,
      null,
      null,
    );

    return this.mapToResponse(invoice);
  }

  async getImageUrl(id: string): Promise<string> {
    const invoice = await this.purchaseExpenseInvoiceRepository.findById(id);

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    if (!invoice.imageUrl) {
      throw new NotFoundException('Invoice has no image');
    }

    // Generate SAS URL for secure access
    const containerName = this.azureBlobService.extractContainerNameFromUrl(invoice.imageUrl);
    const blobName = this.azureBlobService.extractBlobNameFromUrl(invoice.imageUrl);
    if (!containerName || !blobName) {
      throw new BadRequestException('Invalid image URL format');
    }
    return this.azureBlobService.generateSasUrl(containerName, blobName);
  }

  private mapToResponse(invoice: any): PurchaseExpenseInvoiceResponseDto {
    return {
      id: invoice.id,
      type: invoice.type,
      vendorId: invoice.vendorId,
      vendorName: invoice.vendorName,
      description: invoice.description,
      invoiceDate: invoice.invoiceDate,
      amount: Number(invoice.amount) || 0,
      gstRate: Number(invoice.gstRate) || 5,
      gstAmount: invoice.gstAmount ? Number(invoice.gstAmount) : null,
      pstRate: Number(invoice.pstRate) || 7,
      pstAmount: invoice.pstAmount ? Number(invoice.pstAmount) : null,
      hstRate: Number(invoice.hstRate) || 0,
      hstAmount: invoice.hstAmount ? Number(invoice.hstAmount) : null,
      taxAmount: invoice.taxAmount ? Number(invoice.taxAmount) : null,
      totalAmount: Number(invoice.totalAmount),
      category: invoice.category,
      notes: invoice.notes,
      imageUrl: invoice.imageUrl,
      imageName: invoice.imageName,
      imageSize: invoice.imageSize,
      createdBy: invoice.createdBy,
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt,
      vendor: invoice.vendor,
    };
  }
}
