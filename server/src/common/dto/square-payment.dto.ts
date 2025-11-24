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
