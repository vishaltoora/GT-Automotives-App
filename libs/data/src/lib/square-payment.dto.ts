import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { SquarePaymentStatus } from './prisma-enums';

export { SquarePaymentStatus };

export class CreateSquarePaymentDto {
  @IsString()
  invoiceId!: string;

  @IsString()
  sourceId!: string;

  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  amount!: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  @IsOptional()
  note?: string;
}

export class RefundSquarePaymentDto {
  @IsString()
  squarePaymentId!: string;

  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  amount!: number;

  @IsString()
  @IsOptional()
  reason?: string;
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
  @Type(() => Number)
  serviceAmount!: number;
}

export class CreateAppointmentPaymentDto {
  @IsString()
  appointmentId!: string;

  @IsString()
  sourceId!: string;

  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  serviceAmount!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  tipAmount?: number;
}

export class AppointmentCheckoutResponseDto {
  checkoutUrl!: string;
  checkoutId!: string;
  appointmentId!: string;
  serviceAmount!: number;
  gstAmount!: number;
  pstAmount!: number;
  totalAmount!: number;
  expiresAt!: Date;

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
