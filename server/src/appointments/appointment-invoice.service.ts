import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '@gt-automotive/database';
import { InvoiceRepository } from '../invoices/repositories/invoice.repository';
import { Invoice, InvoiceItemType, Appointment } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { calculateTaxes } from '../config/tax.config';

/**
 * Service type labels for invoice descriptions
 * Matches frontend SERVICE_TYPE_LABELS from AppointmentCard.tsx
 */
const SERVICE_TYPE_LABELS: Record<string, string> = {
  TIRE_CHANGE: 'Tire Mount Balance',
  TIRE_ROTATION: 'Tire Rotation',
  TIRE_REPAIR: 'Tire Repair',
  TIRE_SWAP: 'Tire Swap',
  TIRE_BALANCE: 'Tire Balance',
  OIL_CHANGE: 'Oil Change',
  BRAKE_SERVICE: 'Brake Service',
  MECHANICAL_WORK: 'Mechanical Work',
  ENGINE_DIAGNOSTIC: 'Engine Diagnostic',
  OTHER: 'Other Service',
};

interface CreateInvoiceFromAppointmentParams {
  appointmentId: string;
  serviceAmount: number; // Total pre-tax amount (service + product if any)
  tipAmount?: number; // Optional tip amount (not subject to tax)
  productSaleAmount?: number; // Portion of serviceAmount that is product sale
  productSaleItems?: string[]; // Product types sold (TIRES, OIL, FILTER)
  squarePaymentId?: string; // Optional: link to Square payment
  userId: string; // User creating the invoice
  paymentMethod?: 'CREDIT_CARD' | 'DEBIT_CARD' | 'E_TRANSFER' | 'CASH'; // Payment method
  status?: 'PAID' | 'PENDING'; // Invoice status
}

const PRODUCT_LABELS: Record<string, string> = {
  TIRES: 'Tires',
  OIL: 'Oil',
  FILTER: 'Filter',
};

@Injectable()
export class AppointmentInvoiceService {
  private readonly logger = new Logger(AppointmentInvoiceService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly invoiceRepository: InvoiceRepository,
  ) {}

  /**
   * Create an invoice from a completed appointment
   * Automatically calculates GST (5%) and PST (7%) from the service amount
   */
  async createInvoiceFromAppointment(
    params: CreateInvoiceFromAppointmentParams,
  ): Promise<Invoice> {
    const {
      appointmentId,
      serviceAmount,
      tipAmount = 0,
      productSaleAmount = 0,
      productSaleItems = [],
      squarePaymentId,
      userId,
      paymentMethod = 'CREDIT_CARD',
      status = 'PAID',
    } = params;

    // Validate service amount
    if (serviceAmount <= 0) {
      throw new BadRequestException('Service amount must be greater than 0');
    }

    // 1. Get appointment with full details
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        customer: true,
        vehicle: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException(`Appointment ${appointmentId} not found`);
    }

    // 2. Check if invoice already exists for this appointment
    const existingInvoice = await this.prisma.invoice.findFirst({
      where: { appointmentId },
    });

    if (existingInvoice) {
      this.logger.warn(
        `Invoice already exists for appointment ${appointmentId}: ${existingInvoice.invoiceNumber}`,
      );
      throw new BadRequestException(
        `Invoice ${existingInvoice.invoiceNumber} already exists for this appointment`,
      );
    }

    // 3. Calculate taxes (GST 5% + PST 7%) - tip is NOT taxed
    const taxes = calculateTaxes(serviceAmount);
    const tip = tipAmount || 0;
    const totalWithTip = taxes.totalAmount + tip;

    // 4. Get service description from appointment type
    const serviceDescription = this.getServiceDescription(appointment);

    // 5. Get default company (GT Automotives)
    const defaultCompany = await this.prisma.company.findFirst({
      orderBy: { createdAt: 'asc' }, // Get the first/default company
    });

    if (!defaultCompany) {
      throw new BadRequestException('No company found in system');
    }

    // 6. Generate invoice number
    const invoiceNumber = await this.invoiceRepository.generateInvoiceNumber();

    this.logger.log(
      `Creating invoice for appointment ${appointmentId}: ${serviceDescription} - $${totalWithTip}${tip > 0 ? ` (includes $${tip} tip)` : ''}`,
    );

    // 7. Build invoice items array. If a product sale is included, split it
    // into a separate line item so the invoice clearly itemizes service vs product.
    const productAmount = Math.max(0, Number(productSaleAmount) || 0);
    const serviceLineAmount = Math.max(0, serviceAmount - productAmount);

    const invoiceItems: Array<{
      itemType: InvoiceItemType;
      description: string;
      quantity: number;
      unitPrice: Decimal;
      total: Decimal;
    }> = [];

    if (serviceLineAmount > 0) {
      invoiceItems.push({
        itemType: InvoiceItemType.SERVICE,
        description: serviceDescription,
        quantity: 1,
        unitPrice: new Decimal(serviceLineAmount),
        total: new Decimal(serviceLineAmount),
      });
    }

    if (productAmount > 0) {
      const productLabel =
        productSaleItems && productSaleItems.length > 0
          ? productSaleItems
              .map((p) => PRODUCT_LABELS[p] || p)
              .join(', ')
          : 'Product Sale';
      // Use TIRE itemType when only tires, otherwise PART for the generic case.
      const onlyTires =
        productSaleItems &&
        productSaleItems.length > 0 &&
        productSaleItems.every((p) => p === 'TIRES');
      invoiceItems.push({
        itemType: onlyTires ? InvoiceItemType.TIRE : InvoiceItemType.PART,
        description: productLabel,
        quantity: 1,
        unitPrice: new Decimal(productAmount),
        total: new Decimal(productAmount),
      });
    }

    // Tips are intentionally NOT added to the invoice — they're tracked on
    // the appointment payment breakdown and used only for payroll payout.

    // 8. Create invoice
    const invoice = await this.invoiceRepository.createWithItems(
      {
        invoiceNumber,
        customer: { connect: { id: appointment.customerId } },
        vehicle: appointment.vehicleId
          ? { connect: { id: appointment.vehicleId } }
          : undefined,
        company: { connect: { id: defaultCompany.id } },
        appointment: { connect: { id: appointmentId } }, // Link to appointment
        subtotal: new Decimal(taxes.subtotal),
        gstRate: new Decimal(taxes.gstRate),
        gstAmount: new Decimal(taxes.gstAmount),
        pstRate: new Decimal(taxes.pstRate),
        pstAmount: new Decimal(taxes.pstAmount),
        taxRate: new Decimal(taxes.gstRate + taxes.pstRate),
        taxAmount: new Decimal(taxes.gstAmount + taxes.pstAmount),
        total: new Decimal(taxes.totalAmount), // Tips excluded from invoice
        status, // Use provided status (PAID for Square, PENDING for E-Transfer)
        paymentMethod, // Use provided payment method
        createdBy: userId,
        paidAt: status === 'PAID' ? new Date() : undefined,
      },
      invoiceItems,
    );

    this.logger.log(
      `Invoice ${invoiceNumber} created successfully for appointment ${appointmentId} (status: ${status}, method: ${paymentMethod})${squarePaymentId ? ` (linked to Square payment ${squarePaymentId})` : ''}`,
    );

    return invoice;
  }

  /**
   * Get formatted service description from appointment
   */
  private getServiceDescription(appointment: Appointment): string {
    const serviceLabel =
      SERVICE_TYPE_LABELS[appointment.serviceType] ||
      appointment.serviceType.replace(/_/g, ' ');

    // Include appointment type if mobile service
    if (appointment.appointmentType === 'MOBILE_SERVICE') {
      return `${serviceLabel} (Mobile Service)`;
    }

    return serviceLabel;
  }

  /**
   * Get invoice for an appointment (if exists)
   */
  async getInvoiceForAppointment(appointmentId: string): Promise<Invoice | null> {
    return this.prisma.invoice.findFirst({
      where: { appointmentId },
      include: {
        customer: true,
        vehicle: true,
        items: true,
        company: true,
      },
    });
  }

  /**
   * Check if appointment already has an invoice
   */
  async hasInvoice(appointmentId: string): Promise<boolean> {
    const count = await this.prisma.invoice.count({
      where: { appointmentId },
    });
    return count > 0;
  }
}
