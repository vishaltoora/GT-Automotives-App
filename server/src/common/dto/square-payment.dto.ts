import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { SquarePaymentStatus } from '@prisma/client';

export class CreateSquarePaymentDto {
  @IsString()
  invoiceId!: string;

  @IsString()
  sourceId!: string; // Card token from Square Web Payments SDK

  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsString()
  @IsOptional()
  currency?: string; // Defaults to CAD

  @IsString()
  @IsOptional()
  note?: string; // Optional payment note
}

export class RefundSquarePaymentDto {
  @IsString()
  squarePaymentId!: string;

  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsString()
  @IsOptional()
  reason?: string; // Refund reason
}

export class SquarePaymentResponseDto {
  id!: string;
  squarePaymentId!: string;
  squareOrderId?: string;
  invoiceId!: string;
  amount!: number;
  currency!: string;
  status!: SquarePaymentStatus;
  cardBrand?: string;
  last4?: string;
  receiptUrl?: string;
  receiptNumber?: string;
  errorCode?: string;
  errorMessage?: string;
  createdAt!: Date;
  processedAt?: Date;

  constructor(partial: Partial<SquarePaymentResponseDto>) {
    Object.assign(this, partial);
  }
}

export class CreateAppointmentCheckoutDto {
  @IsString()
  appointmentId!: string;

  @IsNumber()
  @Min(0.01)
  serviceAmount!: number; // Base amount before taxes (GST + PST will be calculated)
}

export class CreateAppointmentPaymentDto {
  @IsString()
  appointmentId!: string;

  @IsString()
  sourceId!: string; // Square card token from Web Payments SDK

  @IsNumber()
  @Min(0.01)
  serviceAmount!: number; // Base amount before taxes (GST + PST will be calculated)

  @IsOptional()
  @IsNumber()
  @Min(0)
  tipAmount?: number; // Optional tip amount (not subject to tax)
}

export class AppointmentCheckoutResponseDto {
  checkoutUrl!: string; // Square hosted payment page URL
  checkoutId!: string; // Square checkout ID for tracking
  appointmentId!: string;
  serviceAmount!: number; // Base amount
  gstAmount!: number; // Calculated GST (5%)
  pstAmount!: number; // Calculated PST (7%)
  totalAmount!: number; // Total with taxes
  expiresAt!: Date; // Checkout link expiration

  constructor(partial: Partial<AppointmentCheckoutResponseDto>) {
    Object.assign(this, partial);
  }
}

export class SquareWebhookDto {
  @IsString()
  merchantId!: string;

  @IsString()
  type!: string;

  @IsString()
  eventId!: string;

  @IsString()
  createdAt!: string;

  data: any;
}
