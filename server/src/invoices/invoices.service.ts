import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InvoiceRepository } from './repositories/invoice.repository';
import {
  CreateInvoiceDto,
  CreateServiceDto,
  UpdateInvoiceDto,
  UpdateServiceDto,
} from '@gt-automotive/data';
import {
  Invoice,
  InvoiceStatus,
  PaymentMethod,
  InvoiceItemType,
} from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { AuditRepository } from '../audit/repositories/audit.repository';
import { CustomerRepository } from '../customers/repositories/customer.repository';
import { ServiceRepository } from './repositories/service.repository';
import { PdfService } from '../pdf/pdf.service';
import { EmailService } from '../email/email.service';
import { CarfaxService } from '../carfax/carfax.service';

@Injectable()
export class InvoicesService {
  constructor(
    private readonly invoiceRepository: InvoiceRepository,
    private readonly auditRepository: AuditRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly serviceRepository: ServiceRepository,
    private readonly pdfService: PdfService,
    private readonly emailService: EmailService,
    private readonly carfaxService: CarfaxService
  ) {}

  async create(
    createInvoiceDto: CreateInvoiceDto,
    userId: string
  ): Promise<Invoice> {
    let customerId = createInvoiceDto.customerId;

    // Create customer ONLY if customerData is provided AND no customerId exists
    // This prevents creating duplicate customers when an existing customer is selected
    if (!customerId && createInvoiceDto.customerData) {
      const { firstName, lastName, businessName, address, phone, email } =
        createInvoiceDto.customerData;

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
        throw new BadRequestException(
          `Failed to create customer: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }
    }

    // Validate that we have a customerId
    if (!customerId) {
      throw new BadRequestException(
        'Either customerId or customerData must be provided'
      );
    }

    // Calculate totals - handle discount items specially
    // TIPS are included in subtotal but NOT taxed
    let subtotal = 0;
    let taxableSubtotal = 0;
    const items = createInvoiceDto.items.map((item) => {
      // For DISCOUNT items, the total should be negative
      // For DISCOUNT_PERCENTAGE items, calculate percentage of other items
      let total = item.quantity * item.unitPrice;

      if (item.itemType === 'DISCOUNT') {
        // DISCOUNT items should be negative
        total = -Math.abs(total);
      } else if (item.itemType === 'DISCOUNT_PERCENTAGE') {
        // DISCOUNT_PERCENTAGE: unitPrice is the percentage value
        // Calculate percentage of non-discount items (excluding TIPS)
        const otherItemsSubtotal = createInvoiceDto.items
          .filter(
            (i) =>
              i.itemType !== 'DISCOUNT' &&
              i.itemType !== 'DISCOUNT_PERCENTAGE' &&
              i.itemType !== 'TIPS'
          )
          .reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
        total = -(otherItemsSubtotal * item.unitPrice) / 100;
      }

      subtotal += total;
      // TIPS are not taxable
      if (item.itemType !== 'TIPS') {
        taxableSubtotal += total;
      }
      const { tire: _tire, ...itemFields } = item;
      return {
        ...itemFields,
        itemType: item.itemType as InvoiceItemType,
        total: new Decimal(total),
        unitPrice: new Decimal(item.unitPrice),
      };
    });

    // Handle tax calculations - support both combined and separate rates
    // Apply taxes only to taxable subtotal (excludes TIPS)
    let taxRate: number;
    let gstRate: number | undefined;
    let pstRate: number | undefined;
    let gstAmount: number | undefined;
    let pstAmount: number | undefined;

    if (
      createInvoiceDto.gstRate !== undefined ||
      createInvoiceDto.pstRate !== undefined
    ) {
      // Use separate GST/PST rates
      gstRate = createInvoiceDto.gstRate ?? 0;
      pstRate = createInvoiceDto.pstRate ?? 0;
      gstAmount = taxableSubtotal * gstRate;
      pstAmount = taxableSubtotal * pstRate;
      taxRate = gstRate + pstRate;
    } else {
      // Use combined tax rate (backward compatibility)
      taxRate = createInvoiceDto.taxRate ?? 0.0825;
    }

    // PST-exempt customers are charged 0% PST regardless of what the client sent.
    // This server-side gate is authoritative.
    const customerForTax = await this.customerRepository.findById(customerId);
    if (customerForTax?.pstExempt) {
      pstRate = 0;
      pstAmount = 0;
      taxRate = gstRate ?? 0;
    }

    let taxAmount = taxableSubtotal * taxRate;

    // CASH_NO_TAX is an untaxed cash sale: zero out GST/PST so the recorded
    // total matches the cash actually collected. (Agreed behavior — GA-30.)
    if (createInvoiceDto.paymentMethod === 'CASH_NO_TAX') {
      gstRate = 0;
      pstRate = 0;
      gstAmount = 0;
      pstAmount = 0;
      taxRate = 0;
      taxAmount = 0;
    }

    const total = subtotal + taxAmount;

    // An invoice created with a payment method is collected in full up front.
    const paidInFull = !!createInvoiceDto.paymentMethod;

    // Generate invoice number
    const invoiceNumber = await this.invoiceRepository.generateInvoiceNumber();

    // Create invoice with items
    const invoice = await this.invoiceRepository.createWithItems(
      {
        invoiceNumber,
        customer: { connect: { id: customerId } },
        vehicle: createInvoiceDto.vehicleId
          ? { connect: { id: createInvoiceDto.vehicleId } }
          : undefined,
        company: { connect: { id: createInvoiceDto.companyId } },
        subtotal: new Decimal(subtotal),
        taxRate: new Decimal(taxRate),
        taxAmount: new Decimal(taxAmount),
        ...(gstRate !== undefined && { gstRate: new Decimal(gstRate) }),
        ...(gstAmount !== undefined && { gstAmount: new Decimal(gstAmount) }),
        ...(pstRate !== undefined && { pstRate: new Decimal(pstRate) }),
        ...(pstAmount !== undefined && { pstAmount: new Decimal(pstAmount) }),
        total: new Decimal(total),
        amountPaid: new Decimal(paidInFull ? total : 0),
        status: paidInFull ? 'PAID' : 'PENDING',
        paymentMethod: createInvoiceDto.paymentMethod,
        notes: createInvoiceDto.notes,
        createdBy: userId,
        paidAt: paidInFull ? new Date() : undefined,
        invoiceDate: createInvoiceDto.invoiceDate
          ? new Date(createInvoiceDto.invoiceDate)
          : new Date(),
      },
      items
    );

    // Record the up-front payment in the ledger so it appears in the Day
    // Summary (which reads InvoicePayment rows, not invoice status).
    if (paidInFull) {
      await this.invoiceRepository.createPayment({
        invoiceId: invoice.id,
        amount: total,
        paymentMethod: createInvoiceDto.paymentMethod as PaymentMethod,
        paidAt: new Date(),
        createdBy: userId,
      });
    }

    // Log the creation
    await this.auditRepository.create({
      userId,
      action: 'CREATE_INVOICE',
      entityType: 'invoice',
      entityId: invoice.id,
      details: invoice as any,
    });

    // Report to CARFAX if the invoice was created already paid (non-blocking).
    if (invoice.status === 'PAID') {
      void this.carfaxService.reportInvoice(invoice.id).catch(() => undefined);
    }

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

  async update(
    id: string,
    updateInvoiceDto: UpdateInvoiceDto,
    userId: string
  ): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findById(id);

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    // Admins can update any invoice (including paid/cancelled)
    // Log will track changes for audit purposes
    const oldValue = { ...invoice };

    // PST-exempt customers are always charged 0% PST (authoritative server-side gate)
    const customerForTax = await this.customerRepository.findById(
      invoice.customerId
    );
    const pstExempt = !!customerForTax?.pstExempt;

    // Prepare update data
    const updateData: any = {};

    // Handle items if provided
    let items: any[] | undefined;
    if (updateInvoiceDto.items) {
      items = updateInvoiceDto.items.map(({ tire: _tire, ...itemFields }) => ({
        ...itemFields,
        itemType: itemFields.itemType as InvoiceItemType,
        total: new Decimal(
          itemFields.total || itemFields.quantity * itemFields.unitPrice
        ),
        unitPrice: new Decimal(itemFields.unitPrice),
      }));

      // Recalculate totals based on new items - handle discount items specially
      let subtotal = 0;
      items.forEach((item) => {
        let total = item.quantity * Number(item.unitPrice);

        if (item.itemType === 'DISCOUNT') {
          // DISCOUNT items should be negative
          total = -Math.abs(total);
        } else if (item.itemType === 'DISCOUNT_PERCENTAGE') {
          // DISCOUNT_PERCENTAGE: unitPrice is the percentage value
          // Calculate percentage of non-discount items
          const otherItemsSubtotal = (items || [])
            .filter(
              (i: any) =>
                i.itemType !== 'DISCOUNT' &&
                i.itemType !== 'DISCOUNT_PERCENTAGE'
            )
            .reduce(
              (sum: number, i: any) => sum + i.quantity * Number(i.unitPrice),
              0
            );
          total = -(otherItemsSubtotal * Number(item.unitPrice)) / 100;
        }

        subtotal += total;
      });

      // Use provided rates or keep existing ones
      const gstRate =
        updateInvoiceDto.gstRate !== undefined
          ? updateInvoiceDto.gstRate
          : Number(invoice.gstRate || 0);
      // PST-exempt customers are forced to 0% PST
      const pstRate = pstExempt
        ? 0
        : updateInvoiceDto.pstRate !== undefined
        ? updateInvoiceDto.pstRate
        : Number(invoice.pstRate || 0);
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
      if (pstExempt) {
        // PST-exempt customers never carry PST
        updateData.pstRate = new Decimal(0);
        updateData.pstAmount = new Decimal(0);
      } else if (updateInvoiceDto.pstRate !== undefined) {
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
      updateData.vehicle = updateInvoiceDto.vehicleId
        ? { connect: { id: updateInvoiceDto.vehicleId } }
        : { disconnect: true };
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

  async searchInvoices(
    searchParams: {
      customerName?: string;
      invoiceNumber?: string;
      startDate?: string;
      endDate?: string;
      status?: InvoiceStatus;
      companyId?: string;
    },
    user: any
  ): Promise<Invoice[]> {
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
      return invoices.filter((inv) => inv.customerId === user.customerId);
    }

    return invoices;
  }

  async getDailyCashReport(date: string, user: any): Promise<any> {
    // Only staff and admin can view cash reports
    if (user.role === 'CUSTOMER') {
      throw new ForbiddenException(
        'You do not have permission to view cash reports'
      );
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

  /**
   * Record a payment against an invoice. Supports partial and split payments:
   * each call appends an InvoicePayment row, recomputes `amountPaid`, and moves
   * the invoice through PENDING -> PARTIALLY_PAID -> PAID. When `amount` is
   * omitted the full remaining balance is paid (the old "mark as paid").
   */
  async recordPayment(
    id: string,
    payment: {
      amount?: number;
      paymentMethod: PaymentMethod;
      notes?: string;
      reference?: string;
    },
    userId: string
  ): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findById(id);

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    if (invoice.status === 'CANCELLED' || invoice.status === 'REFUNDED') {
      throw new BadRequestException(
        `Cannot record a payment on a ${invoice.status.toLowerCase()} invoice`
      );
    }

    const currentPaid = Number(invoice.amountPaid ?? 0);
    let total = Number(invoice.total);
    const hasTax = Number(invoice.taxAmount ?? 0) > 0;

    // CASH_NO_TAX strips GST/PST off the invoice, but only before any money has
    // been collected — an invoice can't be half taxed and half not. (GA-30.)
    const stripTax = payment.paymentMethod === 'CASH_NO_TAX' && hasTax;
    if (stripTax) {
      if (currentPaid > 0) {
        throw new BadRequestException(
          'Cash (no GST/PST) cannot be applied to an invoice that already has tax and a recorded payment'
        );
      }
      total = Number(invoice.subtotal);
    }

    const remaining = Math.max(0, total - currentPaid);
    if (remaining <= 0.005) {
      throw new BadRequestException('Invoice is already paid in full');
    }

    const payAmount = payment.amount ?? remaining;
    if (payAmount <= 0) {
      throw new BadRequestException('Payment amount must be greater than zero');
    }
    if (payAmount > remaining + 0.005) {
      throw new BadRequestException(
        `Payment of ${payAmount} exceeds the remaining balance of ${remaining.toFixed(
          2
        )}`
      );
    }

    const newPaid = currentPaid + payAmount;
    const fullyPaid = newPaid + 0.005 >= total;
    const now = new Date();

    const invoiceUpdate: any = {
      amountPaid: new Decimal(newPaid),
      status: fullyPaid ? 'PAID' : 'PARTIALLY_PAID',
      paymentMethod: payment.paymentMethod,
      paidAt: fullyPaid ? now : null,
    };
    if (stripTax) {
      invoiceUpdate.gstRate = new Decimal(0);
      invoiceUpdate.gstAmount = new Decimal(0);
      invoiceUpdate.pstRate = new Decimal(0);
      invoiceUpdate.pstAmount = new Decimal(0);
      invoiceUpdate.taxRate = new Decimal(0);
      invoiceUpdate.taxAmount = new Decimal(0);
      invoiceUpdate.total = new Decimal(total);
    }

    const updated = await this.invoiceRepository.addPayment(
      id,
      {
        invoiceId: id,
        amount: payAmount,
        paymentMethod: payment.paymentMethod,
        paidAt: now,
        createdBy: userId,
        notes: payment.notes,
        reference: payment.reference,
      },
      invoiceUpdate
    );

    // Paying a combined parent in full settles its consolidated children.
    if (fullyPaid) {
      await this.invoiceRepository.settleConsolidatedChildren(
        id,
        payment.paymentMethod,
        now
      );
    }

    await this.auditRepository.create({
      userId,
      action: 'RECORD_INVOICE_PAYMENT',
      entityType: 'invoice',
      entityId: id,
      newValue: {
        amount: payAmount,
        paymentMethod: payment.paymentMethod,
        amountPaid: newPaid,
        status: invoiceUpdate.status,
      } as any,
    });

    // Report the fully-paid service to CARFAX (non-blocking).
    if (fullyPaid) {
      void this.carfaxService.reportInvoice(id).catch(() => undefined);
    }

    return updated;
  }

  /**
   * Backward-compatible "mark as paid": records a single payment for the full
   * remaining balance.
   */
  async markAsPaid(
    id: string,
    paymentMethod: PaymentMethod,
    userId: string
  ): Promise<Invoice> {
    return this.recordPayment(id, { paymentMethod }, userId);
  }

  /**
   * Day Summary invoice money: InvoicePayment rows collected on `date`,
   * deduped against appointment payments so money isn't counted twice.
   */
  async getDaySummaryInvoices(date: string, user: any): Promise<any> {
    if (user.role === 'CUSTOMER') {
      throw new ForbiddenException(
        'You do not have permission to view the day summary'
      );
    }
    return this.invoiceRepository.getDaySummaryInvoicePayments(date);
  }

  /**
   * Pending-invoice outstanding balance for the Day Summary: today's pending
   * and the cumulative total owed, grouped by customer.
   */
  async getOutstandingInvoices(date: string, user: any): Promise<any> {
    if (user.role === 'CUSTOMER') {
      throw new ForbiddenException(
        'You do not have permission to view outstanding invoices'
      );
    }
    return this.invoiceRepository.getPendingInvoiceOutstanding(date);
  }

  /**
   * Roll a customer's open (PENDING / PARTIALLY_PAID) invoices into one
   * combined invoice. Each line item is a source invoice's remaining balance;
   * no extra tax is applied since the source totals are already taxed. Sources
   * are linked to the parent and drop out of the outstanding lists. (GA-33.)
   */
  async combineInvoices(customerId: string, userId: string): Promise<Invoice> {
    const sources = await this.invoiceRepository.findCombinableForCustomer(
      customerId
    );

    if (sources.length < 2) {
      throw new BadRequestException(
        'A combined invoice needs at least two open invoices for this customer'
      );
    }

    const lineItems = sources.map((inv) => {
      const remaining = Number(inv.total) - Number(inv.amountPaid ?? 0);
      const dateLabel = new Date(inv.invoiceDate).toISOString().split('T')[0];
      return {
        itemType: 'OTHER' as InvoiceItemType,
        description: `Invoice ${inv.invoiceNumber} (${dateLabel})`,
        quantity: 1,
        unitPrice: new Decimal(remaining),
        total: new Decimal(remaining),
      };
    });

    const total = lineItems.reduce((sum, i) => sum + Number(i.total), 0);
    const invoiceNumber = await this.invoiceRepository.generateInvoiceNumber();

    const combined = await this.invoiceRepository.createWithItems(
      {
        invoiceNumber,
        customer: { connect: { id: customerId } },
        company: { connect: { id: sources[0].companyId } },
        subtotal: new Decimal(total),
        taxRate: new Decimal(0),
        taxAmount: new Decimal(0),
        gstRate: new Decimal(0),
        gstAmount: new Decimal(0),
        pstRate: new Decimal(0),
        pstAmount: new Decimal(0),
        total: new Decimal(total),
        amountPaid: new Decimal(0),
        status: 'PENDING',
        notes: `Combined invoice for ${sources.length} invoices: ${sources
          .map((s) => s.invoiceNumber)
          .join(', ')}`,
        createdBy: userId,
      },
      lineItems
    );

    await this.invoiceRepository.linkConsolidatedChildren(
      combined.id,
      sources.map((s) => s.id)
    );

    await this.auditRepository.create({
      userId,
      action: 'COMBINE_INVOICES',
      entityType: 'invoice',
      entityId: combined.id,
      newValue: {
        sourceInvoiceIds: sources.map((s) => s.id),
        sourceInvoiceNumbers: sources.map((s) => s.invoiceNumber),
        total,
      } as any,
    });

    return this.invoiceRepository.findWithDetails(
      combined.id
    ) as Promise<Invoice>;
  }

  // Service methods
  async getAllServices() {
    return this.serviceRepository.findAll();
  }

  async createService(createServiceDto: CreateServiceDto) {
    // Check if service with same name already exists
    const existing = await this.serviceRepository.findByName(
      createServiceDto.name
    );
    if (existing) {
      throw new ConflictException(
        `Service with name "${createServiceDto.name}" already exists`
      );
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
      const existing = await this.serviceRepository.findByName(
        updateServiceDto.name
      );
      if (existing && existing.id !== id) {
        throw new ConflictException(
          `Service with name "${updateServiceDto.name}" already exists`
        );
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

  async sendInvoiceEmail(
    invoiceId: string,
    userId: string,
    emails?: string[],
    saveToCustomer?: boolean
  ) {
    // Get invoice with all relations including customer
    const invoice = await this.invoiceRepository.findWithDetails(invoiceId);
    if (!invoice) {
      throw new NotFoundException(`Invoice with ID "${invoiceId}" not found`);
    }

    // Get customer separately to ensure proper typing
    const customer = await this.customerRepository.findById(invoice.customerId);

    // Clean + de-duplicate the provided recipients
    const providedEmails = Array.from(
      new Set((emails ?? []).map((e) => e.trim()).filter((e) => e !== ''))
    );

    // Use the explicitly selected recipients, falling back to the customer's primary email
    const recipients =
      providedEmails.length > 0
        ? providedEmails
        : customer?.email
        ? [customer.email]
        : [];

    // Check if we have at least one email to send to
    if (recipients.length === 0) {
      throw new BadRequestException(
        'No email address provided and customer does not have an email address'
      );
    }

    // If saveToCustomer is true and customer exists, persist any new emails back to the customer
    if (saveToCustomer && customer) {
      const knownEmails = [
        customer.email,
        ...(customer.additionalEmails ?? []),
      ].filter((e): e is string => !!e);
      let primary = customer.email ?? undefined;
      const additional = [...(customer.additionalEmails ?? [])];

      for (const email of recipients) {
        if (knownEmails.includes(email)) continue;
        if (!primary) {
          primary = email;
        } else {
          additional.push(email);
        }
        knownEmails.push(email);
      }

      const dedupedAdditional = Array.from(new Set(additional)).filter(
        (e) => e !== primary
      );

      if (
        primary !== (customer.email ?? undefined) ||
        dedupedAdditional.length !== (customer.additionalEmails ?? []).length
      ) {
        await this.customerRepository.update(customer.id, {
          email: primary,
          additionalEmails: dedupedAdditional,
        });
      }
    }

    try {
      // Generate PDF
      const pdfBase64 = await this.pdfService.generateInvoicePdf(invoice);

      // Send email to all recipients
      const emailResult = await this.emailService.sendInvoiceEmail(
        recipients,
        invoice.invoiceNumber,
        pdfBase64
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
          emails: recipients,
          invoiceNumber: invoice.invoiceNumber,
          messageId: emailResult.messageId,
          emailsSavedToCustomer: !!saveToCustomer,
        },
      });

      return {
        success: true,
        message: 'Invoice email sent successfully',
        emailUsed: recipients.join(', '),
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to send invoice email: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }
}
