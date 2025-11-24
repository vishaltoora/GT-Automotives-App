import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, Environment, ApiError } from 'square';
import { SquarePaymentRepository } from './repositories/square-payment.repository';
import { PrismaService } from '@gt-automotive/database';
import {
  CreateSquarePaymentDto,
  RefundSquarePaymentDto,
  SquarePaymentResponseDto,
} from '../common/dto/square-payment.dto';
import { SquarePaymentStatus } from '@prisma/client';
import { randomUUID } from 'crypto';

@Injectable()
export class SquarePaymentService {
  private readonly logger = new Logger(SquarePaymentService.name);
  private readonly squareClient: Client;
  private readonly locationId: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly squarePaymentRepository: SquarePaymentRepository,
    private readonly prisma: PrismaService,
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
        squareOrderId: squarePayment.squareOrderId || undefined,
        invoiceId: squarePayment.invoiceId,
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
      if (isFullRefund) {
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
        invoiceId: updatedPayment.invoiceId,
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
      invoiceId: payment.invoiceId,
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
          invoiceId: payment.invoiceId,
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
}
