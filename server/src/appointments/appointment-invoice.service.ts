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
  serviceAmount: number; // Base amount before taxes
  squarePaymentId?: string; // Optional: link to Square payment
  userId: string; // User creating the invoice
  paymentMethod?: 'CREDIT_CARD' | 'E_TRANSFER' | 'CASH'; // Payment method
  status?: 'PAID' | 'PENDING'; // Invoice status
}

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

    // 3. Calculate taxes (GST 5% + PST 7%)
    const taxes = calculateTaxes(serviceAmount);

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
      `Creating invoice for appointment ${appointmentId}: ${serviceDescription} - $${taxes.totalAmount}`,
    );

    // 7. Create invoice with single "OTHER" item
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
        total: new Decimal(taxes.totalAmount),
        status, // Use provided status (PAID for Square, PENDING for E-Transfer)
        paymentMethod, // Use provided payment method
        createdBy: userId,
        paidAt: status === 'PAID' ? new Date() : undefined,
      },
      [
        {
          itemType: InvoiceItemType.OTHER,
          description: serviceDescription,
          quantity: 1,
          unitPrice: new Decimal(serviceAmount),
          total: new Decimal(serviceAmount),
        },
      ],
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
