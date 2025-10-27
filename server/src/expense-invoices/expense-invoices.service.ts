import { Injectable, NotFoundException } from '@nestjs/common';
import { ExpenseInvoiceRepository } from './expense-invoice.repository';
import { AzureBlobService } from '../common/services/azure-blob.service';
import {
  CreateExpenseInvoiceDto,
  UpdateExpenseInvoiceDto,
  ExpenseInvoiceResponseDto,
  ExpenseInvoiceFilterDto,
} from '../common/dto/expense-invoice.dto';

@Injectable()
export class ExpenseInvoicesService {
  constructor(
    private expenseInvoiceRepository: ExpenseInvoiceRepository,
    private azureBlobService: AzureBlobService,
  ) {}

  async create(createDto: CreateExpenseInvoiceDto): Promise<ExpenseInvoiceResponseDto> {
    const invoice = await this.expenseInvoiceRepository.create(createDto);
    return this.mapToResponse(invoice);
  }

  async findAll(filterDto: ExpenseInvoiceFilterDto): Promise<{
    data: ExpenseInvoiceResponseDto[];
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
    if (filterDto.status) filters.status = filterDto.status;
    if (filterDto.isRecurring !== undefined) filters.isRecurring = filterDto.isRecurring === true;
    if (filterDto.startDate) filters.startDate = new Date(filterDto.startDate);
    if (filterDto.endDate) filters.endDate = new Date(filterDto.endDate);

    const [invoices, total] = await Promise.all([
      this.expenseInvoiceRepository.findAll(skip, limit, filters),
      this.expenseInvoiceRepository.count(filters),
    ]);

    return {
      data: invoices.map(inv => this.mapToResponse(inv)),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<ExpenseInvoiceResponseDto> {
    const invoice = await this.expenseInvoiceRepository.findById(id);
    if (!invoice) {
      throw new NotFoundException(`Expense invoice with ID ${id} not found`);
    }
    return this.mapToResponse(invoice);
  }

  async update(id: string, updateDto: UpdateExpenseInvoiceDto): Promise<ExpenseInvoiceResponseDto> {
    const invoice = await this.expenseInvoiceRepository.findById(id);
    if (!invoice) {
      throw new NotFoundException(`Expense invoice with ID ${id} not found`);
    }

    const updated = await this.expenseInvoiceRepository.update(id, updateDto);
    return this.mapToResponse(updated);
  }

  async uploadImage(
    id: string,
    file: Buffer,
    originalFileName: string,
    mimeType?: string,
  ): Promise<ExpenseInvoiceResponseDto> {
    const invoice = await this.expenseInvoiceRepository.findById(id);
    if (!invoice) {
      throw new NotFoundException(`Expense invoice with ID ${id} not found`);
    }

    // Delete old image if exists
    if (invoice.imageUrl && invoice.imageName) {
      await this.azureBlobService.deleteInvoiceImage('expense-invoices', invoice.imageName);
    }

    // Upload new image
    const uploadResult = await this.azureBlobService.uploadInvoiceImage(
      file,
      originalFileName,
      'expense',
      mimeType,
    );

    // Update invoice with image info
    const updated = await this.expenseInvoiceRepository.updateImageInfo(
      id,
      uploadResult.blobUrl,
      uploadResult.blobName,
      uploadResult.size,
    );

    return this.mapToResponse(updated);
  }

  async deleteImage(id: string): Promise<ExpenseInvoiceResponseDto> {
    const invoice = await this.expenseInvoiceRepository.findById(id);
    if (!invoice) {
      throw new NotFoundException(`Expense invoice with ID ${id} not found`);
    }

    if (invoice.imageUrl && invoice.imageName) {
      await this.azureBlobService.deleteInvoiceImage('expense-invoices', invoice.imageName);
    }

    const updated = await this.expenseInvoiceRepository.updateImageInfo(id, '', '', 0);
    return this.mapToResponse(updated);
  }

  async getImageUrl(id: string): Promise<string> {
    const invoice = await this.expenseInvoiceRepository.findById(id);
    if (!invoice) {
      throw new NotFoundException(`Expense invoice with ID ${id} not found`);
    }

    if (!invoice.imageUrl || !invoice.imageName) {
      throw new NotFoundException(`No image found for expense invoice ${id}`);
    }

    // Check if it's a mock URL (development/seeded data)
    const isMockUrl = invoice.imageUrl.includes('localhost') || invoice.imageUrl.includes('/uploads/mock/');
    const isProduction = process.env.NODE_ENV === 'production';

    // In production, if we have mock URLs, throw a helpful error
    if (isProduction && isMockUrl) {
      throw new NotFoundException(
        `This is test/seeded data. The PDF file was not uploaded to Azure Blob Storage. Please re-upload the document or delete this test invoice.`
      );
    }

    // In development, return mock URL as-is
    if (isMockUrl) {
      return invoice.imageUrl;
    }

    // Generate SAS URL for Azure Blob Storage (expires in 1 hour)
    const sasUrl = await this.azureBlobService.generateSasUrl(
      'expense-invoices',
      invoice.imageName,
      60
    );

    return sasUrl;
  }

  async remove(id: string): Promise<ExpenseInvoiceResponseDto> {
    const invoice = await this.expenseInvoiceRepository.findById(id);
    if (!invoice) {
      throw new NotFoundException(`Expense invoice with ID ${id} not found`);
    }

    // Delete image if exists
    if (invoice.imageUrl && invoice.imageName) {
      await this.azureBlobService.deleteInvoiceImage('expense-invoices', invoice.imageName);
    }

    const deleted = await this.expenseInvoiceRepository.delete(id);
    return this.mapToResponse(deleted);
  }

  private mapToResponse(invoice: any): ExpenseInvoiceResponseDto {
    return {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      vendorId: invoice.vendorId,
      vendorName: invoice.vendorName,
      description: invoice.description,
      invoiceDate: invoice.invoiceDate,
      amount: Number(invoice.amount),
      taxAmount: invoice.taxAmount ? Number(invoice.taxAmount) : undefined,
      totalAmount: Number(invoice.totalAmount),
      category: invoice.category,
      status: invoice.status,
      paymentDate: invoice.paymentDate,
      paymentMethod: invoice.paymentMethod,
      isRecurring: invoice.isRecurring,
      recurringPeriod: invoice.recurringPeriod,
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
