import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InvoiceRepository } from './repositories/invoice.repository';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { Invoice, InvoiceStatus, Prisma } from '@prisma/client';
import { AuditRepository } from '../audit/repositories/audit.repository';

@Injectable()
export class InvoicesService {
  constructor(
    private readonly invoiceRepository: InvoiceRepository,
    private readonly auditRepository: AuditRepository,
  ) {}

  async create(createInvoiceDto: CreateInvoiceDto, userId: string): Promise<Invoice> {
    // Calculate totals
    let subtotal = 0;
    const items = createInvoiceDto.items.map(item => {
      const total = item.quantity * item.unitPrice;
      subtotal += total;
      return {
        ...item,
        total,
      };
    });

    // Default tax rate if not provided (8.25% for Texas)
    const taxRate = createInvoiceDto.taxRate ?? 0.0825;
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;

    // Generate invoice number
    const invoiceNumber = await this.invoiceRepository.generateInvoiceNumber();

    // Create invoice with items
    const invoice = await this.invoiceRepository.createWithItems(
      {
        invoiceNumber,
        customer: { connect: { id: createInvoiceDto.customerId } },
        vehicle: createInvoiceDto.vehicleId ? { connect: { id: createInvoiceDto.vehicleId } } : undefined,
        subtotal,
        taxRate,
        taxAmount,
        total,
        status: createInvoiceDto.paymentMethod ? 'PAID' : 'PENDING',
        paymentMethod: createInvoiceDto.paymentMethod,
        notes: createInvoiceDto.notes,
        createdBy: userId,
        paidAt: createInvoiceDto.paymentMethod ? new Date() : undefined,
      },
      items
    );

    // Log the creation
    await this.auditRepository.create({
      userId,
      action: 'CREATE_INVOICE',
      resource: 'invoice',
      resourceId: invoice.id,
      newValue: invoice as any,
    });

    return invoice;
  }

  async findAll(user: any): Promise<Invoice[]> {
    // If customer, only show their invoices
    if (user.role === 'CUSTOMER') {
      const customerId = user.customerId;
      if (!customerId) {
        return [];
      }
      return this.invoiceRepository.findByCustomer(customerId, true);
    }
    
    // Staff and Admin can see all invoices
    return this.invoiceRepository.findAll({
      include: {
        customer: {
          include: {
            user: true,
          },
        },
        vehicle: true,
        items: {
          include: {
            tire: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, user: any): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findWithDetails(id);
    
    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    // Check if customer can access this invoice
    if (user.role === 'CUSTOMER' && invoice.customerId !== user.customerId) {
      throw new ForbiddenException('You can only view your own invoices');
    }

    return invoice;
  }

  async update(id: string, updateInvoiceDto: UpdateInvoiceDto, userId: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findById(id);
    
    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    // Cannot update paid or cancelled invoices
    if (invoice.status === 'PAID' || invoice.status === 'CANCELLED') {
      throw new BadRequestException(`Cannot update invoice with status ${invoice.status}`);
    }

    const oldValue = { ...invoice };
    
    const updated = await this.invoiceRepository.updateStatus(
      id,
      updateInvoiceDto.status || invoice.status,
      updateInvoiceDto.paidAt ? new Date(updateInvoiceDto.paidAt) : undefined
    );

    // Log the update
    await this.auditRepository.create({
      userId,
      action: 'UPDATE_INVOICE',
      resource: 'invoice',
      resourceId: id,
      oldValue: oldValue as any,
      newValue: updated as any,
    });

    return updated;
  }

  async remove(id: string, userId: string): Promise<void> {
    const invoice = await this.invoiceRepository.findById(id);
    
    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    // Only allow cancellation, not deletion
    if (invoice.status === 'PAID') {
      throw new BadRequestException('Cannot cancel a paid invoice');
    }

    await this.invoiceRepository.updateStatus(id, 'CANCELLED');

    // Log the cancellation
    await this.auditRepository.create({
      userId,
      action: 'CANCEL_INVOICE',
      resource: 'invoice',
      resourceId: id,
      oldValue: invoice as any,
    });
  }

  async searchInvoices(searchParams: {
    customerName?: string;
    invoiceNumber?: string;
    startDate?: string;
    endDate?: string;
    status?: InvoiceStatus;
  }, user: any): Promise<Invoice[]> {
    const params: any = { ...searchParams };
    
    if (searchParams.startDate) {
      params.startDate = new Date(searchParams.startDate);
    }
    
    if (searchParams.endDate) {
      params.endDate = new Date(searchParams.endDate);
    }

    const invoices = await this.invoiceRepository.searchInvoices(params);

    // Filter for customers
    if (user.role === 'CUSTOMER') {
      return invoices.filter(inv => inv.customerId === user.customerId);
    }

    return invoices;
  }

  async getDailyCashReport(date: string, user: any): Promise<any> {
    // Only staff and admin can view cash reports
    if (user.role === 'CUSTOMER') {
      throw new ForbiddenException('You do not have permission to view cash reports');
    }

    const reportDate = new Date(date);
    return this.invoiceRepository.getDailyCashReport(reportDate);
  }

  async getCustomerInvoices(customerId: string, user: any): Promise<Invoice[]> {
    // Customers can only see their own invoices
    if (user.role === 'CUSTOMER' && user.customerId !== customerId) {
      throw new ForbiddenException('You can only view your own invoices');
    }

    return this.invoiceRepository.findByCustomer(customerId, true);
  }

  async markAsPaid(id: string, paymentMethod: PaymentMethod, userId: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findById(id);
    
    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    if (invoice.status === 'PAID') {
      throw new BadRequestException('Invoice is already paid');
    }

    const updated = await this.invoiceRepository.update(id, {
      status: 'PAID',
      paymentMethod,
      paidAt: new Date(),
    });

    // Log the payment
    await this.auditRepository.create({
      userId,
      action: 'MARK_INVOICE_PAID',
      resource: 'invoice',
      resourceId: id,
      newValue: { paymentMethod, paidAt: new Date() } as any,
    });

    return updated;
  }
}