import { IsString, IsNumber, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { PaymentMethod, PaymentStatus } from '@prisma/client';

export class CreatePaymentDto {
  @IsString()
  jobId!: string;

  @IsString()
  employeeId!: string;

  @IsNumber()
  amount!: number;

  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsString()
  paidBy!: string;
}

export class UpdatePaymentDto {
  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @IsOptional()
  @IsDateString()
  paidAt?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsString()
  paidBy?: string;
}

export class PaymentResponseDto {
  id!: string;
  jobId!: string;
  employeeId!: string;
  amount!: number;
  paymentMethod!: PaymentMethod;
  status!: PaymentStatus;
  paidAt?: Date;
  paidBy?: string;
  notes?: string;
  reference?: string;
  createdAt!: Date;
  updatedAt!: Date;
  job?: {
    id: string;
    jobNumber: string;
    title: string;
    status: string;
  };
  employee?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
  };
}

export class PaymentSummaryDto {
  totalPayments!: number;
  pendingPayments!: number;
  paidPayments!: number;
  totalAmount!: number;
  pendingAmount!: number;
  paidAmount!: number;
}

export class ProcessPaymentDto {
  @IsString()
  jobId!: string;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsString()
  paidBy!: string;
}