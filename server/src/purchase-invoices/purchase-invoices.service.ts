import { Injectable, NotFoundException } from '@nestjs/common';
import { PurchaseInvoiceRepository } from './purchase-invoice.repository';
import { AzureBlobService } from '../common/services/azure-blob.service';
import {
  CreatePurchaseInvoiceDto,
  UpdatePurchaseInvoiceDto,
  PurchaseInvoiceResponseDto,
  PurchaseInvoiceFilterDto,
} from '../common/dto/purchase-invoice.dto';

@Injectable()
export class PurchaseInvoicesService {
  constructor(
    private purchaseInvoiceRepository: PurchaseInvoiceRepository,
    private azureBlobService: AzureBlobService,
  ) {}

  async create(createDto: CreatePurchaseInvoiceDto): Promise<PurchaseInvoiceResponseDto> {
    const invoice = await this.purchaseInvoiceRepository.create(createDto);
    return this.mapToResponse(invoice);
  }

  async findAll(filterDto: PurchaseInvoiceFilterDto): Promise<{
    data: PurchaseInvoiceResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = filterDto.page ? parseInt(filterDto.page, 10) : 1;
    const limit = filterDto.limit ? parseInt(filterDto.limit, 10) : 100;
    const skip = (page - 1) * limit;

    const filters: any = {};
    if (filterDto.vendorId) filters.vendorId = filterDto.vendorId;
    if (filterDto.category) filters.category = filterDto.category;
    if (filterDto.startDate) filters.startDate = new Date(filterDto.startDate);
    if (filterDto.endDate) filters.endDate = new Date(filterDto.endDate);

    const [invoices, total] = await Promise.all([
      this.purchaseInvoiceRepository.findAll(skip, limit, filters),
      this.purchaseInvoiceRepository.count(filters),
    ]);

    return {
      data: invoices.map(inv => this.mapToResponse(inv)),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<PurchaseInvoiceResponseDto> {
    const invoice = await this.purchaseInvoiceRepository.findById(id);
    if (!invoice) {
      throw new NotFoundException(`Purchase invoice with ID ${id} not found`);
    }
    return this.mapToResponse(invoice);
  }

  async update(id: string, updateDto: UpdatePurchaseInvoiceDto): Promise<PurchaseInvoiceResponseDto> {
    const invoice = await this.purchaseInvoiceRepository.findById(id);
    if (!invoice) {
      throw new NotFoundException(`Purchase invoice with ID ${id} not found`);
    }

    const updated = await this.purchaseInvoiceRepository.update(id, updateDto);
    return this.mapToResponse(updated);
  }

  async uploadImage(
    id: string,
    file: Buffer,
    originalFileName: string,
    mimeType?: string,
  ): Promise<PurchaseInvoiceResponseDto> {
    const invoice = await this.purchaseInvoiceRepository.findById(id);
    if (!invoice) {
      throw new NotFoundException(`Purchase invoice with ID ${id} not found`);
    }

    // Delete old image if exists
    if (invoice.imageUrl && invoice.imageName) {
      await this.azureBlobService.deleteInvoiceImage('purchase-invoices', invoice.imageName);
    }

    // Upload new image
    const uploadResult = await this.azureBlobService.uploadInvoiceImage(
      file,
      originalFileName,
      'purchase',
      mimeType,
    );

    // Update invoice with image info
    const updated = await this.purchaseInvoiceRepository.updateImageInfo(
      id,
      uploadResult.blobUrl,
      uploadResult.blobName,
      uploadResult.size,
    );

    return this.mapToResponse(updated);
  }

  async deleteImage(id: string): Promise<PurchaseInvoiceResponseDto> {
    const invoice = await this.purchaseInvoiceRepository.findById(id);
    if (!invoice) {
      throw new NotFoundException(`Purchase invoice with ID ${id} not found`);
    }

    if (invoice.imageUrl && invoice.imageName) {
      await this.azureBlobService.deleteInvoiceImage('purchase-invoices', invoice.imageName);
    }

    const updated = await this.purchaseInvoiceRepository.updateImageInfo(id, '', '', 0);
    return this.mapToResponse(updated);
  }

  async remove(id: string): Promise<PurchaseInvoiceResponseDto> {
    const invoice = await this.purchaseInvoiceRepository.findById(id);
    if (!invoice) {
      throw new NotFoundException(`Purchase invoice with ID ${id} not found`);
    }

    // Delete image if exists
    if (invoice.imageUrl && invoice.imageName) {
      await this.azureBlobService.deleteInvoiceImage('purchase-invoices', invoice.imageName);
    }

    const deleted = await this.purchaseInvoiceRepository.delete(id);
    return this.mapToResponse(deleted);
  }

  private mapToResponse(invoice: any): PurchaseInvoiceResponseDto {
    return {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      vendorId: invoice.vendorId,
      vendorName: invoice.vendorName,
      description: invoice.description,
      invoiceDate: invoice.invoiceDate,
      dueDate: invoice.dueDate,
      amount: Number(invoice.amount),
      taxAmount: invoice.taxAmount ? Number(invoice.taxAmount) : undefined,
      totalAmount: Number(invoice.totalAmount),
      category: invoice.category,
      status: invoice.status,
      paymentDate: invoice.paymentDate,
      paymentMethod: invoice.paymentMethod,
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
