import { IsOptional, IsEnum, IsString, IsDateString } from 'class-validator';
// Local enum definitions to avoid Prisma client dependency issues
export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentMethod {
  CASH = 'CASH',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  CHECK = 'CHECK',
  E_TRANSFER = 'E_TRANSFER',
}

export class UpdateInvoiceDto {
  @IsOptional()
  @IsEnum(InvoiceStatus)
  status?: InvoiceStatus;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsDateString()
  paidAt?: string;
}