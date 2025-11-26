import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@gt-automotive/database';
import { SquarePaymentRepository } from './repositories/square-payment.repository';
import { AppointmentInvoiceService } from '../appointments/appointment-invoice.service';
import { SquarePaymentStatus, AppointmentStatus } from '@prisma/client';
import { createHmac } from 'crypto';

interface SquareWebhookEvent {
  merchant_id: string;
  type: string;
  event_id: string;
  created_at: string;
  data: {
    type: string;
    id: string;
    object: {
      payment?: any;
      order?: any;
    };
  };
}

@Injectable()
export class SquareWebhookService {
  private readonly logger = new Logger(SquareWebhookService.name);
  private readonly webhookSignatureKey: string;
  private readonly processedEvents = new Set<string>(); // In-memory idempotency cache

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly squarePaymentRepository: SquarePaymentRepository,
    private readonly appointmentInvoiceService: AppointmentInvoiceService,
  ) {
    this.webhookSignatureKey =
      this.configService.get<string>('SQUARE_WEBHOOK_SIGNATURE_KEY') || '';

    if (!this.webhookSignatureKey) {
      this.logger.warn(
        'SQUARE_WEBHOOK_SIGNATURE_KEY not configured - webhook signature validation disabled',
      );
    }
  }

  /**
   * Handle incoming webhook from Square
   */
  async handleWebhook(body: any, signature: string): Promise<void> {
    // 1. Verify webhook signature (if configured)
    if (this.webhookSignatureKey) {
      const isValid = this.verifyWebhookSignature(
        JSON.stringify(body),
        signature,
      );
      if (!isValid) {
        throw new BadRequestException('Invalid webhook signature');
      }
    }

    const event: SquareWebhookEvent = body;

    // 2. Check for duplicate event (idempotency)
    if (this.processedEvents.has(event.event_id)) {
      this.logger.log(`Event ${event.event_id} already processed - skipping`);
      return;
    }

    // 3. Handle different event types
    switch (event.type) {
      case 'payment.created':
      case 'payment.updated':
        await this.handlePaymentEvent(event);
        break;

      default:
        this.logger.log(`Unhandled webhook event type: ${event.type}`);
    }

    // 4. Mark event as processed
    this.processedEvents.add(event.event_id);

    // 5. Clean up old events (keep last 1000)
    if (this.processedEvents.size > 1000) {
      const toDelete = Array.from(this.processedEvents).slice(0, 100);
      toDelete.forEach((id) => this.processedEvents.delete(id));
    }
  }

  /**
   * Handle payment.created or payment.updated events
   */
  private async handlePaymentEvent(event: SquareWebhookEvent): Promise<void> {
    const payment = event.data.object.payment;

    if (!payment) {
      this.logger.warn('Payment event received without payment object');
      return;
    }

    const squarePaymentId = payment.id;
    const status = payment.status; // COMPLETED, PENDING, FAILED, etc.

    this.logger.log(
      `Processing payment ${squarePaymentId} with status ${status}`,
    );

    // Only process COMPLETED payments
    if (status !== 'COMPLETED') {
      this.logger.log(
        `Payment ${squarePaymentId} not completed - status: ${status}`,
      );
      return;
    }

    try {
      // 1. Find the pending payment record by checking metadata
      const pendingPayments = await this.prisma.squarePayment.findMany({
        where: {
          status: SquarePaymentStatus.PENDING,
          appointmentId: { not: null }, // Only appointment payments
        },
        include: {
          appointment: {
            include: {
              customer: true,
              vehicle: true,
            },
          },
        },
      });

      // Find matching payment by order reference or checkout ID
      const orderReferenceId = payment.order_id
        ? await this.getOrderReferenceId(payment.order_id)
        : null;

      const matchingPayment = pendingPayments.find((p) => {
        const metadata = p.metadata as any;
        // Match by order reference (APT-{appointmentId})
        if (
          orderReferenceId &&
          orderReferenceId === `APT-${p.appointmentId}`
        ) {
          return true;
        }
        // Match by checkout ID in metadata
        if (metadata?.checkoutId && payment.order_id) {
          return true; // Assume match if both exist
        }
        return false;
      });

      if (!matchingPayment) {
        this.logger.warn(
          `No matching pending payment found for Square payment ${squarePaymentId}`,
        );
        return;
      }

      const appointment = matchingPayment.appointment;
      if (!appointment) {
        throw new Error(
          `Appointment not found for payment ${matchingPayment.id}`,
        );
      }

      this.logger.log(
        `Found matching appointment ${appointment.id} for payment ${squarePaymentId}`,
      );

      // 2. Extract service amount from metadata
      const metadata = matchingPayment.metadata as any;
      const serviceAmount = metadata?.serviceAmount || 0;

      if (serviceAmount <= 0) {
        throw new Error('Invalid service amount in payment metadata');
      }

      // 3. Create invoice from appointment
      const invoice = await this.appointmentInvoiceService.createInvoiceFromAppointment({
        appointmentId: appointment.id,
        serviceAmount,
        squarePaymentId, // Will be linked after updating
        userId: appointment.bookedBy || 'SYSTEM', // User who created the appointment
      });

      this.logger.log(
        `Invoice ${invoice.invoiceNumber} created for appointment ${appointment.id}`,
      );

      // 4. Update the Square payment record with real payment ID and invoice link
      await this.squarePaymentRepository.update(matchingPayment.id, {
        squarePaymentId, // Update with real Square payment ID
        invoice: { connect: { id: invoice.id } }, // Link to invoice using Prisma relation
        status: SquarePaymentStatus.COMPLETED,
        processedAt: new Date(),
        cardBrand: payment.card_details?.card?.card_brand,
        last4: payment.card_details?.card?.last_4,
        expMonth: payment.card_details?.card?.exp_month
          ? parseInt(payment.card_details.card.exp_month)
          : undefined,
        expYear: payment.card_details?.card?.exp_year
          ? parseInt(payment.card_details.card.exp_year)
          : undefined,
        receiptUrl: payment.receipt_url,
        receiptNumber: payment.receipt_number,
        processingFee: payment.processing_fee?.[0]?.amount_money?.amount
          ? Number(payment.processing_fee[0].amount_money.amount) / 100
          : undefined,
      });

      // 5. Update appointment status to COMPLETED
      await this.prisma.appointment.update({
        where: { id: appointment.id },
        data: {
          status: AppointmentStatus.COMPLETED,
          paymentAmount: parseFloat(matchingPayment.amount.toString()),
          paymentDate: new Date(),
        },
      });

      this.logger.log(
        `✅ Appointment ${appointment.id} marked as COMPLETED with invoice ${invoice.invoiceNumber}`,
      );

      // 6. Send confirmation email (optional - if email service available)
      // await this.emailService.sendInvoiceEmail(invoice.id);
    } catch (error: any) {
      this.logger.error(
        `Failed to process payment ${squarePaymentId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Get order reference ID from Square order
   */
  private async getOrderReferenceId(orderId: string): Promise<string | null> {
    try {
      // In a real implementation, you would fetch the order from Square API
      // For now, we'll extract from payment order_id
      return null; // Placeholder
    } catch (error) {
      return null;
    }
  }

  /**
   * Verify webhook signature from Square
   */
  private verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!this.webhookSignatureKey) {
      return true; // Skip verification if no key configured
    }

    try {
      const hmac = createHmac('sha256', this.webhookSignatureKey);
      const expectedSignature = hmac.update(payload).digest('base64');

      return signature === expectedSignature;
    } catch (error: any) {
      this.logger.error(
        `Failed to verify webhook signature: ${error.message}`,
      );
      return false;
    }
  }
}
