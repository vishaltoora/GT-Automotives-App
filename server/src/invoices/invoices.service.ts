import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InvoiceRepository } from './repositories/invoice.repository';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { Invoice, InvoiceStatus, Prisma, RoleName } from '@prisma/client';
import { AuditRepository } from '../audit/repositories/audit.repository';
import { CustomerRepository } from '../customers/repositories/customer.repository';
import { RoleRepository } from '../roles/repositories/role.repository';

@Injectable()
export class InvoicesService {
  constructor(
    private readonly invoiceRepository: InvoiceRepository,
    private readonly auditRepository: AuditRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly roleRepository: RoleRepository,
  ) {}

  async create(createInvoiceDto: CreateInvoiceDto, userId: string): Promise<Invoice> {
    console.log('Creating invoice with data:', JSON.stringify(createInvoiceDto, null, 2));
    let customerId = createInvoiceDto.customerId;

    // Create customer ONLY if customerData is provided AND no customerId exists
    // This prevents creating duplicate customers when an existing customer is selected
    if (!customerId && createInvoiceDto.customerData) {
      const { name, businessName, address, phone, email } = createInvoiceDto.customerData;
      
      // Split name into first and last name
      const [firstName, ...lastNameParts] = name.split(' ');
      const lastName = lastNameParts.join(' ') || '';
      
      try {
        // Get customer role
        const customerRole = await this.roleRepository.findByName(RoleName.CUSTOMER);
        if (!customerRole) {
          throw new BadRequestException('Customer role not found');
        }
        
        console.log('Creating customer with role:', customerRole.id);
        
        // Generate a temporary clerk ID for customers created through invoices
        const tempClerkId = `temp_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        
        // Create customer with user
        const customerData = {
          user: {
            create: {
              firstName,
              lastName,
              email: email || `${firstName.toLowerCase()}${lastName.toLowerCase()}@customer.local`,
              clerkId: tempClerkId, // Temporary ID for customers created without Clerk signup
              roleId: customerRole.id,
            }
          },
          businessName,
          phone,
          address,
        };

        console.log('Customer data to create:', JSON.stringify(customerData, null, 2));
        const newCustomer = await this.customerRepository.create(customerData);
        customerId = newCustomer.id;
        console.log('Customer created with ID:', customerId);
      } catch (error) {
        console.error('Error creating customer:', error);
        throw new BadRequestException(`Failed to create customer: ${error.message}`);
      }
    }

    // Validate that we have a customerId
    if (!customerId) {
      throw new BadRequestException('Either customerId or customerData must be provided');
    }

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

    console.log('Calculated tax values:', {
      gstRate,
      pstRate,
      gstAmount,
      pstAmount,
      taxRate,
      taxAmount
    });

    // Generate invoice number
    const invoiceNumber = await this.invoiceRepository.generateInvoiceNumber();

    // Create invoice with items
    const invoice = await this.invoiceRepository.createWithItems(
      {
        invoiceNumber,
        customer: { connect: { id: customerId } },
        vehicle: createInvoiceDto.vehicleId ? { connect: { id: createInvoiceDto.vehicleId } } : undefined,
        subtotal,
        taxRate,
        taxAmount,
        ...(gstRate !== undefined && { gstRate }),
        ...(gstAmount !== undefined && { gstAmount }),
        ...(pstRate !== undefined && { pstRate }),
        ...(pstAmount !== undefined && { pstAmount }),
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