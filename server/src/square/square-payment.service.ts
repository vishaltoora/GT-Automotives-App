import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, Environment, ApiError } from 'square';
import { SquarePaymentRepository } from './repositories/square-payment.repository';
import { PrismaService } from '@gt-automotive/database';
import {
  CreateSquarePaymentDto,
  RefundSquarePaymentDto,
  SquarePaymentResponseDto,
  CreateAppointmentCheckoutDto,
  AppointmentCheckoutResponseDto,
} from '../common/dto/square-payment.dto';
import { SquarePaymentStatus } from '@prisma/client';
import { randomUUID } from 'crypto';
import { calculateTaxes } from '../config/tax.config';
import { AppointmentInvoiceService } from '../appointments/appointment-invoice.service';

@Injectable()
export class SquarePaymentService {
  private readonly logger = new Logger(SquarePaymentService.name);
  private readonly squareClient: Client;
  private readonly locationId: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly squarePaymentRepository: SquarePaymentRepository,
    private readonly prisma: PrismaService,
    private readonly appointmentInvoiceService: AppointmentInvoiceService,
  ) {
    const environment =
      this.configService.get<string>('SQUARE_ENVIRONMENT') === 'production'
        ? Environment.Production
        : Environment.Sandbox;

    const accessToken = this.configService.get<string>('SQUARE_ACCESS_TOKEN');

    if (!accessToken) {
      throw new Error(
        'SQUARE_ACCESS_TOKEN is not configured. Please set it in your environment variables.',
      );
    }

    this.squareClient = new Client({
      environment,
      accessToken,
    });

    this.locationId =
      this.configService.get<string>('SQUARE_LOCATION_ID') || '';

    if (!this.locationId) {
      throw new Error(
        'SQUARE_LOCATION_ID is not configured. Please set it in your environment variables.',
      );
    }

    this.logger.log(
      `Square Payment Service initialized (${environment === Environment.Production ? 'Production' : 'Sandbox'})`,
    );
  }

  /**
   * Create a payment for an invoice using Square
   */
  async createPayment(
    createPaymentDto: CreateSquarePaymentDto,
  ): Promise<SquarePaymentResponseDto> {
    const { invoiceId, sourceId, amount, currency = 'CAD', note } = createPaymentDto;

    try {
      // Verify invoice exists and get details
      const invoice = await this.prisma.invoice.findUnique({
        where: { id: invoiceId },
      });
      if (!invoice) {
        throw new BadRequestException(`Invoice ${invoiceId} not found`);
      }

      // Check if invoice is already paid
      if (invoice.status === 'PAID') {
        throw new BadRequestException(`Invoice ${invoiceId} is already paid`);
      }

      // Create idempotency key for Square (prevents duplicate charges)
      const idempotencyKey = randomUUID();

      // Convert amount to cents (Square requires amounts in smallest currency unit)
      const amountMoney = {
        amount: BigInt(Math.round(amount * 100)),
        currency: currency as any, // Square Currency type
      };

      this.logger.log(
        `Creating Square payment for invoice ${invoiceId}: ${amount} ${currency}`,
      );

      // Create payment with Square
      const response: any = await this.squareClient.paymentsApi.createPayment({
        sourceId,
        idempotencyKey,
        amountMoney,
        locationId: this.locationId,
        note: note || `Payment for Invoice ${invoice.invoiceNumber}`,
        referenceId: invoiceId, // Link to our invoice
      });

      if (!response || !response.result || !response.result.payment) {
        throw new InternalServerErrorException(
          'Square payment creation failed - no payment object returned',
        );
      }

      const payment = response.result.payment;

      // Extract card details (PCI compliant - only last 4 digits)
      const cardDetails = payment.cardDetails;
      const cardBrand = cardDetails?.card?.cardBrand || undefined;
      const last4 = cardDetails?.card?.last4 || undefined;
      const expMonth = cardDetails?.card?.expMonth
        ? parseInt(cardDetails.card.expMonth)
        : undefined;
      const expYear = cardDetails?.card?.expYear
        ? parseInt(cardDetails.card.expYear)
        : undefined;

      // Calculate processing fee (Square's fee)
      const processingFee = payment.processingFee?.[0]?.amountMoney?.amount
        ? Number(payment.processingFee[0].amountMoney.amount) / 100
        : undefined;

      // Calculate net amount (amount - processing fee)
      const netAmount = processingFee ? amount - processingFee : amount;

      // Map Square status to our enum
      const status = this.mapSquareStatus(payment.status || 'PENDING');

      // Save payment record to database
      const squarePayment = await this.squarePaymentRepository.create({
        squarePaymentId: payment.id!,
        squareOrderId: payment.orderId,
        locationId: payment.locationId!,
        invoice: {
          connect: { id: invoiceId },
        },
        amount,
        currency,
        status,
        cardBrand,
        last4,
        expMonth,
        expYear,
        receiptUrl: payment.receiptUrl,
        receiptNumber: payment.receiptNumber,
        processingFee,
        netAmount,
        processedAt: payment.createdAt ? new Date(payment.createdAt) : new Date(),
        metadata: payment as any,
      });

      // Update invoice status to PAID if payment completed
      if (status === SquarePaymentStatus.COMPLETED) {
        await this.prisma.invoice.update({
          where: { id: invoiceId },
          data: {
            status: 'PAID',
            paidAt: new Date(),
          },
        });

        this.logger.log(
          `Invoice ${invoice.invoiceNumber} marked as PAID (Square Payment ID: ${payment.id})`,
        );
      }

      return new SquarePaymentResponseDto({
        id: squarePayment.id,
        squarePaymentId: squarePayment.squarePaymentId,
        squareOrderId: squarePayment.squareOrderId ?? undefined,
        invoiceId: squarePayment.invoiceId ?? undefined,
        amount: Number(squarePayment.amount),
        currency: squarePayment.currency,
        status: squarePayment.status,
        cardBrand: squarePayment.cardBrand || undefined,
        last4: squarePayment.last4 || undefined,
        receiptUrl: squarePayment.receiptUrl || undefined,
        receiptNumber: squarePayment.receiptNumber || undefined,
        createdAt: squarePayment.createdAt,
        processedAt: squarePayment.processedAt || undefined,
      });
    } catch (error: any) {
      this.logger.error(`Failed to create Square payment: ${error.message}`, error.stack);

      // Handle Square API errors
      if (error instanceof ApiError) {
        const errorDetails = error.errors?.[0];
        const errorCode = errorDetails?.code || 'UNKNOWN_ERROR';
        const errorMessage =
          errorDetails?.detail || 'Square payment processing failed';

        // Save failed payment record
        await this.squarePaymentRepository.create({
          squarePaymentId: `failed-${randomUUID()}`,
          locationId: this.locationId,
          invoice: {
            connect: { id: invoiceId },
          },
          amount,
          currency: currency || 'CAD',
          status: SquarePaymentStatus.FAILED,
          errorCode,
          errorMessage,
        });

        throw new BadRequestException(
          `Payment failed: ${errorMessage} (${errorCode})`,
        );
      }

      throw error;
    }
  }

  /**
   * Create Square payment for appointment (using embedded form - same as invoice flow)
   * This uses the Square Payments API (not Payment Links API) for card-present tokenization
   */
  async createAppointmentPayment(
    appointmentId: string,
    sourceId: string,
    serviceAmount: number,
    tipAmount?: number,
  ): Promise<SquarePaymentResponseDto> {
    try {
      // 1. Verify appointment exists and is IN_PROGRESS
      const appointment = await this.prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: {
          customer: true,
          vehicle: true,
          employees: {
            include: {
              employee: true,
            },
          },
        },
      });

      if (!appointment) {
        throw new NotFoundException(`Appointment ${appointmentId} not found`);
      }

      if (appointment.status !== 'IN_PROGRESS') {
        throw new BadRequestException(
          `Appointment must be IN_PROGRESS to process payment. Current status: ${appointment.status}`,
        );
      }

      // 2. Calculate taxes (GST 5% + PST 7%) - tip is not taxed
      const taxes = calculateTaxes(serviceAmount);
      const tip = tipAmount || 0;
      const totalWithTip = taxes.totalAmount + tip;

      // 3. Get service description
      const serviceLabel =
        {
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
        }[appointment.serviceType] ||
        appointment.serviceType.replace(/_/g, ' ');

      const description =
        appointment.appointmentType === 'MOBILE_SERVICE'
          ? `${serviceLabel} (Mobile Service)`
          : serviceLabel;

      // 4. Create idempotency key
      const idempotencyKey = randomUUID();

      // 5. Convert amount to cents (Square requires amounts in smallest currency unit)
      // Total includes tip (if any)
      const amountMoney = {
        amount: BigInt(Math.round(totalWithTip * 100)),
        currency: 'CAD' as any,
      };

      this.logger.log(
        `Creating Square payment for appointment ${appointmentId}: ${description} - $${totalWithTip}${tip > 0 ? ` (includes $${tip} tip)` : ''}`,
      );

      // 6. Create payment with Square
      const response: any = await this.squareClient.paymentsApi.createPayment({
        sourceId,
        idempotencyKey,
        amountMoney,
        locationId: this.locationId,
        note: `${description} - ${appointment.customer.firstName} ${appointment.customer.lastName}`,
        referenceId: `APT-${appointmentId}`,
      });

      if (!response || !response.result || !response.result.payment) {
        throw new InternalServerErrorException(
          'Square payment creation failed - no payment object returned',
        );
      }

      const payment = response.result.payment;

      // 7. Extract card details (PCI compliant - only last 4 digits)
      const cardDetails = payment.cardDetails;
      const cardBrand = cardDetails?.card?.cardBrand || undefined;
      const last4 = cardDetails?.card?.last4 || undefined;
      const expMonth = cardDetails?.card?.expMonth
        ? parseInt(cardDetails.card.expMonth)
        : undefined;
      const expYear = cardDetails?.card?.expYear
        ? parseInt(cardDetails.card.expYear)
        : undefined;

      // 8. Calculate processing fee
      const processingFee = payment.processingFee?.[0]?.amountMoney?.amount
        ? Number(payment.processingFee[0].amountMoney.amount) / 100
        : undefined;
      const netAmount = processingFee ? totalWithTip - processingFee : totalWithTip;

      // 9. Map Square status
      const status = this.mapSquareStatus(payment.status || 'PENDING');

      this.logger.log(
        `Square payment status: ${payment.status} -> Mapped to: ${status}`,
      );

      // 10. CRITICAL: Only proceed with invoice creation if payment succeeded
      // For card payments via Web Payments SDK, APPROVED means the payment succeeded
      if (status !== SquarePaymentStatus.COMPLETED && status !== SquarePaymentStatus.APPROVED) {
        this.logger.error(
          `Square payment failed with status: ${status}. Will NOT create invoice or complete appointment.`,
        );
        throw new BadRequestException(
          `Payment failed with status: ${status}. Please try again or use a different payment method.`,
        );
      }

      // 11. Create invoice for this appointment (only after payment succeeded)
      const invoice = await this.appointmentInvoiceService.createInvoiceFromAppointment({
        appointmentId,
        serviceAmount: taxes.subtotal, // Pass subtotal, service will calculate taxes
        tipAmount: tip > 0 ? tip : undefined, // Pass tip amount if present
        squarePaymentId: payment.id!,
        userId: appointment.bookedBy || 'SYSTEM', // Use bookedBy as creator, fallback to SYSTEM
      });

      // 12. Save payment record linked to invoice
      // Note: Invoice already has appointmentId, so we don't need to link SquarePayment to appointment directly
      const squarePayment = await this.squarePaymentRepository.create({
        squarePaymentId: payment.id!,
        squareOrderId: payment.orderId,
        locationId: payment.locationId!,
        invoice: {
          connect: { id: invoice.id },
        },
        amount: totalWithTip, // Total including tip
        currency: 'CAD',
        status,
        cardBrand,
        last4,
        expMonth,
        expYear,
        receiptUrl: payment.receiptUrl,
        receiptNumber: payment.receiptNumber,
        processingFee,
        netAmount,
        errorMessage: undefined, // Success case - no error
        errorCode: undefined, // Success case - no error
        processedAt: payment.createdAt ? new Date(payment.createdAt) : new Date(),
        metadata: {
          ...payment,
          serviceAmount: taxes.subtotal,
          gstAmount: taxes.gstAmount,
          pstAmount: taxes.pstAmount,
          tipAmount: tip > 0 ? tip : undefined,
        } as any,
      });

      // 13. Update appointment status to COMPLETED (payment already verified above)
      // Invoice is already created as PAID by appointmentInvoiceService
      // IMPORTANT: Set paymentDate, paymentAmount, and paymentBreakdown for EOD summary
      await this.prisma.appointment.update({
        where: { id: appointmentId },
        data: {
          status: 'COMPLETED',
          paymentDate: new Date(), // Set payment date for EOD summary
          paymentAmount: totalWithTip, // Total amount including taxes and tip
          paymentBreakdown: [
            {
              id: this.generatePaymentEntryId(),
              method: 'CREDIT_CARD',
              amount: totalWithTip, // Total including tip
            },
          ], // Consistent with manual payment format
        },
      });

      this.logger.log(
        `Appointment ${appointmentId} marked as COMPLETED with payment $${totalWithTip}${tip > 0 ? ` (includes $${tip} tip)` : ''} and invoice ${invoice.invoiceNumber} marked as PAID (payment status: ${status})`,
      );

      return new SquarePaymentResponseDto({
        id: squarePayment.id,
        squarePaymentId: squarePayment.squarePaymentId,
        squareOrderId: squarePayment.squareOrderId ?? undefined,
        invoiceId: squarePayment.invoiceId ?? undefined,
        amount: Number(squarePayment.amount),
        currency: squarePayment.currency,
        status: squarePayment.status,
        cardBrand: squarePayment.cardBrand || undefined,
        last4: squarePayment.last4 || undefined,
        receiptUrl: squarePayment.receiptUrl || undefined,
        receiptNumber: squarePayment.receiptNumber || undefined,
        createdAt: squarePayment.createdAt,
        processedAt: squarePayment.processedAt || undefined,
      });
    } catch (error: any) {
      this.logger.error(
        `Failed to create appointment payment: ${error.message}`,
      );
      this.logger.error(
        `Full error details: ${JSON.stringify(error, null, 2)}`,
      );

      if (error instanceof ApiError) {
        const errorDetails = error.errors?.[0];
        const errorCode = errorDetails?.code || 'UNKNOWN_ERROR';
        const errorMessage =
          errorDetails?.detail || 'Square payment processing failed';

        throw new BadRequestException(
          `Payment failed: ${errorMessage} (${errorCode})`,
        );
      }

      throw error;
    }
  }

  /**
   * Refund a Square payment (full or partial)
   */
  async refundPayment(
    refundDto: RefundSquarePaymentDto,
  ): Promise<SquarePaymentResponseDto> {
    const { squarePaymentId, amount, reason } = refundDto;

    try {
      // Find the payment record
      const payment =
        await this.squarePaymentRepository.findBySquarePaymentId(
          squarePaymentId,
        );

      if (!payment) {
        throw new BadRequestException(
          `Square payment ${squarePaymentId} not found`,
        );
      }

      // Verify payment is refundable
      if (
        payment.status !== SquarePaymentStatus.COMPLETED &&
        payment.status !== SquarePaymentStatus.APPROVED
      ) {
        throw new BadRequestException(
          `Payment cannot be refunded (status: ${payment.status})`,
        );
      }

      // Create idempotency key for refund
      const idempotencyKey = randomUUID();

      // Convert amount to cents
      const amountMoney = {
        amount: BigInt(Math.round(amount * 100)),
        currency: payment.currency as any, // Square Currency type
      };

      this.logger.log(
        `Creating Square refund for payment ${squarePaymentId}: ${amount} ${payment.currency}`,
      );

      // Create refund with Square
      const response: any = await this.squareClient.refundsApi.refundPayment({
        idempotencyKey,
        amountMoney,
        paymentId: squarePaymentId,
        reason: reason || 'Customer refund request',
      });

      if (!response.result || !response.result.refund) {
        throw new InternalServerErrorException(
          'Square refund creation failed - no refund object returned',
        );
      }

      // Calculate total refunded amount
      const previousRefund = Number(payment.refundedAmount || 0);
      const totalRefunded = previousRefund + amount;
      const isFullRefund = totalRefunded >= Number(payment.amount);

      // Update payment record
      const updatedPayment = await this.squarePaymentRepository.update(
        payment.id,
        {
          refundedAmount: totalRefunded,
          refundedAt: new Date(),
          status: isFullRefund
            ? SquarePaymentStatus.REFUNDED
            : SquarePaymentStatus.PARTIAL_REFUND,
        },
      );

      // Update invoice status if fully refunded
      if (isFullRefund && payment.invoiceId) {
        const invoiceToRefund = await this.prisma.invoice.findUnique({
          where: { id: payment.invoiceId },
        });

        await this.prisma.invoice.update({
          where: { id: payment.invoiceId },
          data: {
            status: 'CANCELLED',
          },
        });

        this.logger.log(
          `Invoice ${invoiceToRefund?.invoiceNumber} marked as CANCELLED (Full refund)`,
        );
      }

      return new SquarePaymentResponseDto({
        id: updatedPayment.id,
        squarePaymentId: updatedPayment.squarePaymentId,
        squareOrderId: updatedPayment.squareOrderId || undefined,
        invoiceId: updatedPayment.invoiceId ?? undefined,
        amount: Number(updatedPayment.amount),
        currency: updatedPayment.currency,
        status: updatedPayment.status,
        cardBrand: updatedPayment.cardBrand || undefined,
        last4: updatedPayment.last4 || undefined,
        receiptUrl: updatedPayment.receiptUrl || undefined,
        receiptNumber: updatedPayment.receiptNumber || undefined,
        createdAt: updatedPayment.createdAt,
        processedAt: updatedPayment.processedAt || undefined,
      });
    } catch (error: any) {
      this.logger.error(`Failed to refund Square payment: ${error.message}`, error.stack);

      // Handle Square API errors
      if (error instanceof ApiError) {
        const errorDetails = error.errors?.[0];
        const errorMessage =
          errorDetails?.detail || 'Square refund processing failed';

        throw new BadRequestException(`Refund failed: ${errorMessage}`);
      }

      throw error;
    }
  }

  /**
   * Get payment details by Square payment ID
   */
  async getPayment(squarePaymentId: string): Promise<SquarePaymentResponseDto> {
    const payment =
      await this.squarePaymentRepository.findBySquarePaymentId(
        squarePaymentId,
      );

    if (!payment) {
      throw new BadRequestException(
        `Square payment ${squarePaymentId} not found`,
      );
    }

    return new SquarePaymentResponseDto({
      id: payment.id,
      squarePaymentId: payment.squarePaymentId,
      squareOrderId: payment.squareOrderId || undefined,
      invoiceId: payment.invoiceId ?? undefined,
      amount: Number(payment.amount),
      currency: payment.currency,
      status: payment.status,
      cardBrand: payment.cardBrand || undefined,
      last4: payment.last4 || undefined,
      receiptUrl: payment.receiptUrl || undefined,
      receiptNumber: payment.receiptNumber || undefined,
      errorCode: payment.errorCode || undefined,
      errorMessage: payment.errorMessage || undefined,
      createdAt: payment.createdAt,
      processedAt: payment.processedAt || undefined,
    });
  }

  /**
   * Get all payments for an invoice
   */
  async getInvoicePayments(
    invoiceId: string,
  ): Promise<SquarePaymentResponseDto[]> {
    const payments = await this.squarePaymentRepository.findByInvoiceId(
      invoiceId,
    );

    return payments.map(
      (payment) =>
        new SquarePaymentResponseDto({
          id: payment.id,
          squarePaymentId: payment.squarePaymentId,
          squareOrderId: payment.squareOrderId || undefined,
          invoiceId: payment.invoiceId ?? undefined,
          amount: Number(payment.amount),
          currency: payment.currency,
          status: payment.status,
          cardBrand: payment.cardBrand || undefined,
          last4: payment.last4 || undefined,
          receiptUrl: payment.receiptUrl || undefined,
          receiptNumber: payment.receiptNumber || undefined,
          errorCode: payment.errorCode || undefined,
          errorMessage: payment.errorMessage || undefined,
          createdAt: payment.createdAt,
          processedAt: payment.processedAt || undefined,
        }),
    );
  }

  /**
   * Create a Terminal checkout for in-person payment (Card Reader Device)
   * Lower processing fee: 2.6% + $0.10 vs 2.9% + $0.30 online
   */
  async createTerminalCheckout(
    invoiceId: string,
    amount: number,
    deviceId: string,
    currency = 'CAD',
  ): Promise<{ checkoutId: string; status: string }> {
    try {
      // Verify invoice exists
      const invoice = await this.prisma.invoice.findUnique({
        where: { id: invoiceId },
      });
      if (!invoice) {
        throw new BadRequestException(`Invoice ${invoiceId} not found`);
      }

      if (invoice.status === 'PAID') {
        throw new BadRequestException(`Invoice ${invoiceId} is already paid`);
      }

      // Convert amount to cents
      const amountMoney = {
        amount: BigInt(Math.round(amount * 100)),
        currency: currency as any,
      };

      this.logger.log(
        `Creating Terminal checkout for invoice ${invoiceId}: ${amount} ${currency} on device ${deviceId}`,
      );

      // Create Terminal checkout
      const response: any = await this.squareClient.terminalApi.createTerminalCheckout({
        idempotencyKey: randomUUID(),
        checkout: {
          amountMoney,
          deviceOptions: {
            deviceId,
          },
          referenceId: invoiceId,
          note: `Payment for Invoice ${invoice.invoiceNumber}`,
        },
      });

      const checkout = response.result.checkout;

      return {
        checkoutId: checkout.id,
        status: checkout.status,
      };
    } catch (error: any) {
      this.logger.error(
        `Failed to create Terminal checkout: ${error.message}`,
        error.stack,
      );

      if (error instanceof ApiError) {
        const errorDetails = error.errors?.[0];
        const errorMessage =
          errorDetails?.detail || 'Terminal checkout creation failed';
        throw new BadRequestException(`Terminal checkout failed: ${errorMessage}`);
      }

      throw error;
    }
  }

  /**
   * Get Terminal checkout status
   */
  async getTerminalCheckout(checkoutId: string): Promise<any> {
    try {
      const response: any = await this.squareClient.terminalApi.getTerminalCheckout(
        checkoutId,
      );
      return response.result.checkout;
    } catch (error: any) {
      this.logger.error(
        `Failed to get Terminal checkout: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Failed to get Terminal checkout status');
    }
  }

  /**
   * Cancel a Terminal checkout
   */
  async cancelTerminalCheckout(checkoutId: string): Promise<void> {
    try {
      await this.squareClient.terminalApi.cancelTerminalCheckout(checkoutId);
      this.logger.log(`Terminal checkout ${checkoutId} cancelled`);
    } catch (error: any) {
      this.logger.error(
        `Failed to cancel Terminal checkout: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Failed to cancel Terminal checkout');
    }
  }

  /**
   * List available Terminal devices at the location
   */
  async listTerminalDevices(): Promise<any[]> {
    try {
      const response: any = await this.squareClient.devicesApi.listDeviceCodes(
        this.locationId,
      );

      return response.result.deviceCodes || [];
    } catch (error: any) {
      this.logger.error(
        `Failed to list Terminal devices: ${error.message}`,
        error.stack,
      );
      return [];
    }
  }

  /**
   * Create Square Checkout Link for appointment payment
   * This generates a hosted payment page where customers can pay online
   */
  async createAppointmentCheckout(
    dto: CreateAppointmentCheckoutDto,
  ): Promise<AppointmentCheckoutResponseDto> {
    const { appointmentId, serviceAmount } = dto;

    try {
      // 1. Validate appointment exists and is IN_PROGRESS
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

      if (appointment.status !== 'IN_PROGRESS') {
        throw new BadRequestException(
          `Appointment must be IN_PROGRESS to create payment. Current status: ${appointment.status}`,
        );
      }

      // 2. Calculate taxes (GST 5% + PST 7%)
      const taxes = calculateTaxes(serviceAmount);

      // 3. Get service description
      const serviceLabel =
        {
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
        }[appointment.serviceType] ||
        appointment.serviceType.replace(/_/g, ' ');

      const description =
        appointment.appointmentType === 'MOBILE_SERVICE'
          ? `${serviceLabel} (Mobile Service)`
          : serviceLabel;

      this.logger.log(
        `Creating Square checkout for appointment ${appointmentId}: ${description} - $${taxes.totalAmount}`,
      );

      // 4. Create Square Checkout (Payment Link)
      const idempotencyKey = randomUUID();
      const referenceId = `APT-${appointmentId}`; // Reference to track this payment

      const response: any = await this.squareClient.checkoutApi.createPaymentLink({
        idempotencyKey,
        order: {
          locationId: this.locationId,
          referenceId,
          lineItems: [
            {
              name: description,
              quantity: '1',
              basePriceMoney: {
                // Total amount including taxes (Square wants total, not subtotal)
                amount: BigInt(Math.round(taxes.totalAmount * 100)), // Convert to cents
                currency: 'CAD',
              },
              note: `Subtotal: $${taxes.subtotal.toFixed(2)} | GST (5%): $${taxes.gstAmount.toFixed(2)} | PST (7%): $${taxes.pstAmount.toFixed(2)}`,
            },
          ],
        },
        checkoutOptions: {
          // Redirect URL after successful payment (optional)
          redirectUrl: this.configService.get<string>('FRONTEND_URL')
            ? `${this.configService.get<string>('FRONTEND_URL')}/appointments/payment-success?appointmentId=${appointmentId}`
            : undefined,
          askForShippingAddress: false,
          acceptedPaymentMethods: {
            applePay: true,
            googlePay: true,
            cashAppPay: false,
            afterpayClearpay: false,
          },
        },
        prePopulatedData: {
          buyerEmail: appointment.customer.email || undefined,
          // Square requires E.164 format (+1XXXXXXXXXX for North America)
          // Only include phone if it exists and can be formatted properly
          buyerPhoneNumber: appointment.customer.phone
            ? this.formatPhoneForSquare(appointment.customer.phone)
            : undefined,
        },
      });

      const paymentLink = response.result.paymentLink;

      if (!paymentLink || !paymentLink.url) {
        throw new InternalServerErrorException(
          'Failed to create Square checkout - no URL returned',
        );
      }

      // 5. Store pending payment record with appointmentId
      // Note: We don't have squarePaymentId yet (that comes via webhook)
      // So we store with checkoutId as temporary identifier
      const tempPaymentId = `checkout-${paymentLink.id}`;

      // We'll create a placeholder Square payment record
      // invoiceId will be set by webhook when payment is completed and invoice is created
      await this.squarePaymentRepository.create({
        squarePaymentId: tempPaymentId,
        locationId: this.locationId,
        appointment: { connect: { id: appointmentId } }, // Link to appointment using Prisma relation
        // invoiceId is NOT set here - will be set by webhook after invoice creation
        amount: taxes.totalAmount,
        currency: 'CAD',
        status: SquarePaymentStatus.PENDING,
        note: `Square Checkout for ${description}`,
        metadata: {
          checkoutId: paymentLink.id,
          checkoutUrl: paymentLink.url,
          serviceAmount: taxes.subtotal,
          gstAmount: taxes.gstAmount,
          pstAmount: taxes.pstAmount,
          totalAmount: taxes.totalAmount,
        } as any,
      });

      this.logger.log(
        `Square checkout created: ${paymentLink.id} for appointment ${appointmentId}`,
      );

      // 6. Calculate expiration (Square checkout links expire after 24 hours by default)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      return new AppointmentCheckoutResponseDto({
        checkoutUrl: paymentLink.url,
        checkoutId: paymentLink.id,
        appointmentId,
        serviceAmount: taxes.subtotal,
        gstAmount: taxes.gstAmount,
        pstAmount: taxes.pstAmount,
        totalAmount: taxes.totalAmount,
        expiresAt,
      });
    } catch (error: any) {
      this.logger.error(
        `Failed to create appointment checkout: ${error.message}`,
        error.stack,
      );

      if (error instanceof ApiError) {
        const errorDetails = error.errors?.[0];
        const errorMessage =
          errorDetails?.detail || 'Square checkout creation failed';
        throw new BadRequestException(`Checkout failed: ${errorMessage}`);
      }

      throw error;
    }
  }

  /**
   * Format phone number for Square API (E.164 format)
   * Square requires: +[country code][number] e.g., +12366015757
   */
  private formatPhoneForSquare(phone: string): string | undefined {
    if (!phone) return undefined;

    // Remove all non-digit characters
    const digitsOnly = phone.replace(/\D/g, '');

    // If it's already 11 digits starting with 1 (North America), format it
    if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
      return `+${digitsOnly}`;
    }

    // If it's 10 digits, assume North America and add +1
    if (digitsOnly.length === 10) {
      return `+1${digitsOnly}`;
    }

    // If it doesn't match expected formats, don't include it
    // (Square will reject invalid phone numbers)
    this.logger.warn(
      `Phone number ${phone} does not match expected format (10-11 digits). Omitting from Square checkout.`,
    );
    return undefined;
  }

  /**
   * Map Square payment status to our enum
   */
  private mapSquareStatus(squareStatus: string): SquarePaymentStatus {
    const statusMap: Record<string, SquarePaymentStatus> = {
      PENDING: SquarePaymentStatus.PENDING,
      APPROVED: SquarePaymentStatus.APPROVED,
      COMPLETED: SquarePaymentStatus.COMPLETED,
      CANCELED: SquarePaymentStatus.CANCELED,
      FAILED: SquarePaymentStatus.FAILED,
    };

    return statusMap[squareStatus] || SquarePaymentStatus.PENDING;
  }

  /**
   * Generate a unique ID for payment entry (matches frontend format)
   */
  private generatePaymentEntryId(): string {
    return randomUUID();
  }
}
