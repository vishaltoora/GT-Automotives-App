import { Injectable, NotFoundException, ForbiddenException, BadRequestException, ConflictException } from '@nestjs/common';
import { InvoiceRepository } from './repositories/invoice.repository';
import { CreateInvoiceDto } from '../common/dto/invoice.dto';
import { UpdateInvoiceDto } from '../common/dto/invoice.dto';
import { CreateServiceDto, UpdateServiceDto } from '../common/dto/service.dto';
import { Invoice, InvoiceStatus, PaymentMethod, InvoiceItemType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { AuditRepository } from '../audit/repositories/audit.repository';
import { CustomerRepository } from '../customers/repositories/customer.repository';
import { ServiceRepository } from './repositories/service.repository';
import { PdfService } from '../pdf/pdf.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class InvoicesService {
  constructor(
    private readonly invoiceRepository: InvoiceRepository,
    private readonly auditRepository: AuditRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly serviceRepository: ServiceRepository,
    private readonly pdfService: PdfService,
    private readonly emailService: EmailService,
  ) {}

  async create(createInvoiceDto: CreateInvoiceDto, userId: string): Promise<Invoice> {
    let customerId = createInvoiceDto.customerId;

    // Create customer ONLY if customerData is provided AND no customerId exists
    // This prevents creating duplicate customers when an existing customer is selected
    if (!customerId && createInvoiceDto.customerData) {
      const { firstName, lastName, businessName, address, phone, email } = createInvoiceDto.customerData;

      try {
        // Create customer directly without user relationship
        const customerData: any = {
          firstName,
          lastName,
          email: email || '', // Empty string instead of generated email
          phone: phone || null,
          address: address || null,
          businessName: businessName || null,
        };

        const newCustomer = await this.customerRepository.create(customerData);
        customerId = newCustomer.id;
      } catch (error) {
        throw new BadRequestException(`Failed to create customer: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Validate that we have a customerId
    if (!customerId) {
      throw new BadRequestException('Either customerId or customerData must be provided');
    }

    // Calculate totals - handle discount items specially
    let subtotal = 0;
    const items = createInvoiceDto.items.map(item => {
      // For DISCOUNT items, the total should be negative
      // For DISCOUNT_PERCENTAGE items, calculate percentage of other items
      let total = item.quantity * item.unitPrice;

      if (item.itemType === 'DISCOUNT') {
        // DISCOUNT items should be negative
        total = -Math.abs(total);
      } else if (item.itemType === 'DISCOUNT_PERCENTAGE') {
        // DISCOUNT_PERCENTAGE: unitPrice is the percentage value
        // Calculate percentage of non-discount items
        const otherItemsSubtotal = createInvoiceDto.items
          .filter(i => i.itemType !== 'DISCOUNT' && i.itemType !== 'DISCOUNT_PERCENTAGE')
          .reduce((sum, i) => sum + (i.quantity * i.unitPrice), 0);
        total = -(otherItemsSubtotal * item.unitPrice) / 100;
      }

      subtotal += total;
      return {
        ...item,
        itemType: item.itemType as InvoiceItemType,
        total: new Decimal(total),
        unitPrice: new Decimal(item.unitPrice),
      };
    });

    // Handle tax calculations - support both combined and separate rates
    let taxRate: number;
    let gstRate: number | undefined;
    let pstRate: number | undefined;
    let gstAmount: number | undefined;
    let pstAmount: number | undefined;

    if (createInvoiceDto.gstRate !== undefined || createInvoiceDto.pstRate !== undefined) {
      // Use separate GST/PST rates
      gstRate = createInvoiceDto.gstRate ?? 0;
      pstRate = createInvoiceDto.pstRate ?? 0;
      gstAmount = subtotal * gstRate;
      pstAmount = subtotal * pstRate;
      taxRate = gstRate + pstRate;
    } else {
      // Use combined tax rate (backward compatibility)
      taxRate = createInvoiceDto.taxRate ?? 0.0825;
    }

    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;


    // Generate invoice number
    const invoiceNumber = await this.invoiceRepository.generateInvoiceNumber();

    // Create invoice with items
    const invoice = await this.invoiceRepository.createWithItems(
      {
        invoiceNumber,
        customer: { connect: { id: customerId } },
        vehicle: createInvoiceDto.vehicleId ? { connect: { id: createInvoiceDto.vehicleId } } : undefined,
        company: { connect: { id: createInvoiceDto.companyId } },
        subtotal: new Decimal(subtotal),
        taxRate: new Decimal(taxRate),
        taxAmount: new Decimal(taxAmount),
        ...(gstRate !== undefined && { gstRate: new Decimal(gstRate) }),
        ...(gstAmount !== undefined && { gstAmount: new Decimal(gstAmount) }),
        ...(pstRate !== undefined && { pstRate: new Decimal(pstRate) }),
        ...(pstAmount !== undefined && { pstAmount: new Decimal(pstAmount) }),
        total: new Decimal(total),
        status: createInvoiceDto.paymentMethod ? 'PAID' : 'PENDING',
        paymentMethod: createInvoiceDto.paymentMethod,
        notes: createInvoiceDto.notes,
        createdBy: userId,
        paidAt: createInvoiceDto.paymentMethod ? new Date() : undefined,
        invoiceDate: createInvoiceDto.invoiceDate ? new Date(createInvoiceDto.invoiceDate) : new Date(),
      },
      items
    );

    // Log the creation
    await this.auditRepository.create({
      userId,
      action: 'CREATE_INVOICE',
      entityType: 'invoice',
      entityId: invoice.id,
      details: invoice as any,
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
        customer: true,
        vehicle: true,
        company: true,
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

    // Admins can update any invoice (including paid/cancelled)
    // Log will track changes for audit purposes
    const oldValue = { ...invoice };

    // Prepare update data
    const updateData: any = {};

    // Handle items if provided
    let items: any[] | undefined;
    if (updateInvoiceDto.items) {
      items = updateInvoiceDto.items.map(item => ({
        ...item,
        itemType: item.itemType as InvoiceItemType,
        total: new Decimal(item.total || item.quantity * item.unitPrice),
        unitPrice: new Decimal(item.unitPrice),
      }));

      // Recalculate totals based on new items - handle discount items specially
      let subtotal = 0;
      items.forEach(item => {
        let total = item.quantity * Number(item.unitPrice);

        if (item.itemType === 'DISCOUNT') {
          // DISCOUNT items should be negative
          total = -Math.abs(total);
        } else if (item.itemType === 'DISCOUNT_PERCENTAGE') {
          // DISCOUNT_PERCENTAGE: unitPrice is the percentage value
          // Calculate percentage of non-discount items
          const otherItemsSubtotal = (items || [])
            .filter((i: any) => i.itemType !== 'DISCOUNT' && i.itemType !== 'DISCOUNT_PERCENTAGE')
            .reduce((sum: number, i: any) => sum + (i.quantity * Number(i.unitPrice)), 0);
          total = -(otherItemsSubtotal * Number(item.unitPrice)) / 100;
        }

        subtotal += total;
      });

      // Use provided rates or keep existing ones
      const gstRate = updateInvoiceDto.gstRate !== undefined ? updateInvoiceDto.gstRate : Number(invoice.gstRate || 0);
      const pstRate = updateInvoiceDto.pstRate !== undefined ? updateInvoiceDto.pstRate : Number(invoice.pstRate || 0);
      const taxRate = gstRate + pstRate;
      const gstAmount = subtotal * gstRate;
      const pstAmount = subtotal * pstRate;
      const taxAmount = subtotal * taxRate;
      const total = subtotal + taxAmount;

      updateData.subtotal = new Decimal(subtotal);
      updateData.taxRate = new Decimal(taxRate);
      updateData.taxAmount = new Decimal(taxAmount);
      updateData.gstRate = new Decimal(gstRate);
      updateData.gstAmount = new Decimal(gstAmount);
      updateData.pstRate = new Decimal(pstRate);
      updateData.pstAmount = new Decimal(pstAmount);
      updateData.total = new Decimal(total);
    } else {
      // If no items provided, update tax rates if provided
      if (updateInvoiceDto.gstRate !== undefined) {
        updateData.gstRate = new Decimal(updateInvoiceDto.gstRate);
      }
      if (updateInvoiceDto.pstRate !== undefined) {
        updateData.pstRate = new Decimal(updateInvoiceDto.pstRate);
      }
      if (updateInvoiceDto.subtotal !== undefined) {
        updateData.subtotal = new Decimal(updateInvoiceDto.subtotal);
      }
      if (updateInvoiceDto.taxAmount !== undefined) {
        updateData.taxAmount = new Decimal(updateInvoiceDto.taxAmount);
      }
      if (updateInvoiceDto.total !== undefined) {
        updateData.total = new Decimal(updateInvoiceDto.total);
      }
    }

    // Add other fields
    if (updateInvoiceDto.status) {
      updateData.status = updateInvoiceDto.status;
    }
    if (updateInvoiceDto.paymentMethod) {
      updateData.paymentMethod = updateInvoiceDto.paymentMethod;
    }
    if (updateInvoiceDto.notes !== undefined) {
      updateData.notes = updateInvoiceDto.notes;
    }
    if (updateInvoiceDto.vehicleId !== undefined) {
      updateData.vehicle = updateInvoiceDto.vehicleId ? { connect: { id: updateInvoiceDto.vehicleId } } : { disconnect: true };
    }
    if (updateInvoiceDto.paidAt) {
      updateData.paidAt = new Date(updateInvoiceDto.paidAt);
    }
    if (updateInvoiceDto.invoiceDate) {
      updateData.invoiceDate = new Date(updateInvoiceDto.invoiceDate);
    }

    // Use updateWithItems if items are provided, otherwise use regular update
    const updated = items
      ? await this.invoiceRepository.updateWithItems(id, updateData, items)
      : await this.invoiceRepository.update(id, updateData);

    // Log the update
    await this.auditRepository.create({
      userId,
      action: 'UPDATE_INVOICE',
      entityType: 'invoice',
      entityId: id,
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

    // Admins can delete any invoice (including paid)
    // Audit log will track the deletion for accountability
    // Actually delete the invoice and its items
    await this.invoiceRepository.delete(id);

    // Log the deletion
    await this.auditRepository.create({
      userId,
      action: 'DELETE_INVOICE',
      entityType: 'invoice',
      entityId: id,
      oldValue: invoice as any,
    });
  }

  async searchInvoices(searchParams: {
    customerName?: string;
    invoiceNumber?: string;
    startDate?: string;
    endDate?: string;
    status?: InvoiceStatus;
    companyId?: string;
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
      entityType: 'invoice',
      entityId: id,
      newValue: { paymentMethod, paidAt: new Date() } as any,
    });

    return updated;
  }

  // Service methods
  async getAllServices() {
    return this.serviceRepository.findAll();
  }

  async createService(createServiceDto: CreateServiceDto) {
    // Check if service with same name already exists
    const existing = await this.serviceRepository.findByName(createServiceDto.name);
    if (existing) {
      throw new ConflictException(`Service with name "${createServiceDto.name}" already exists`);
    }
    return this.serviceRepository.create(createServiceDto);
  }

  async updateService(id: string, updateServiceDto: UpdateServiceDto) {
    // Check if service exists
    const service = await this.serviceRepository.findById(id);
    if (!service) {
      throw new NotFoundException(`Service with ID "${id}" not found`);
    }

    // If name is being updated, check for conflicts
    if (updateServiceDto.name) {
      const existing = await this.serviceRepository.findByName(updateServiceDto.name);
      if (existing && existing.id !== id) {
        throw new ConflictException(`Service with name "${updateServiceDto.name}" already exists`);
      }
    }

    return this.serviceRepository.update(id, updateServiceDto);
  }

  async deleteService(id: string) {
    // Check if service exists
    const service = await this.serviceRepository.findById(id);
    if (!service) {
      throw new NotFoundException(`Service with ID "${id}" not found`);
    }
    return this.serviceRepository.delete(id);
  }

  async sendInvoiceEmail(invoiceId: string, userId: string) {
    // Get invoice with all relations including customer
    const invoice = await this.invoiceRepository.findWithDetails(invoiceId);
    if (!invoice) {
      throw new NotFoundException(`Invoice with ID "${invoiceId}" not found`);
    }

    // Get customer separately to ensure proper typing
    const customer = await this.customerRepository.findById(invoice.customerId);

    // Check if customer has email
    if (!customer?.email) {
      throw new BadRequestException('Customer does not have an email address');
    }

    try {
      // Generate PDF
      const pdfBase64 = await this.pdfService.generateInvoicePdf(invoice);

      // Send email
      const emailResult = await this.emailService.sendInvoiceEmail(
        customer.email,
        invoice.invoiceNumber,
        pdfBase64,
      );

      // Check if email was sent successfully
      if (!emailResult.success) {
        throw new Error('Email service returned failure status');
      }

      // Log audit trail
      await this.auditRepository.create({
        userId,
        action: 'SEND_INVOICE_EMAIL',
        entityType: 'Invoice',
        entityId: invoiceId,
        details: {
          email: customer.email,
          invoiceNumber: invoice.invoiceNumber,
          messageId: emailResult.messageId
        },
      });

      return { success: true, message: 'Invoice email sent successfully' };
    } catch (error) {
      throw new BadRequestException(
        `Failed to send invoice email: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}