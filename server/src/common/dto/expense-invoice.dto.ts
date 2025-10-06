import { IsString, IsOptional, IsEnum, IsDateString, IsNumber, IsBoolean, MaxLength } from 'class-validator';
import { ExpenseCategory, PurchaseInvoiceStatus, PaymentMethod, RecurringPeriod } from '@prisma/client';

export class CreateExpenseInvoiceDto {
  @IsString()
  @IsOptional()
  @MaxLength(50)
  invoiceNumber?: string;

  @IsString()
  @IsOptional()
  vendorId?: string;

  @IsString()
  @MaxLength(100)
  vendorName!: string;

  @IsString()
  @MaxLength(500)
  description!: string;

  @IsDateString()
  invoiceDate!: string;

  @IsNumber()
  amount!: number;

  @IsNumber()
  @IsOptional()
  taxAmount?: number;

  @IsNumber()
  totalAmount!: number;

  @IsEnum(ExpenseCategory)
  category!: ExpenseCategory;

  @IsEnum(PurchaseInvoiceStatus)
  @IsOptional()
  status?: PurchaseInvoiceStatus;

  @IsDateString()
  @IsOptional()
  paymentDate?: string;

  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod;

  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean;

  @IsEnum(RecurringPeriod)
  @IsOptional()
  recurringPeriod?: RecurringPeriod;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  createdBy!: string;
}

export class UpdateExpenseInvoiceDto {
  @IsString()
  @IsOptional()
  @MaxLength(50)
  invoiceNumber?: string;

  @IsString()
  @IsOptional()
  vendorId?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  vendorName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsDateString()
  @IsOptional()
  invoiceDate?: string;

  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsNumber()
  @IsOptional()
  taxAmount?: number;

  @IsNumber()
  @IsOptional()
  totalAmount?: number;

  @IsEnum(ExpenseCategory)
  @IsOptional()
  category?: ExpenseCategory;

  @IsEnum(PurchaseInvoiceStatus)
  @IsOptional()
  status?: PurchaseInvoiceStatus;

  @IsDateString()
  @IsOptional()
  paymentDate?: string;

  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod;

  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean;

  @IsEnum(RecurringPeriod)
  @IsOptional()
  recurringPeriod?: RecurringPeriod;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class ExpenseInvoiceResponseDto {
  id!: string;
  invoiceNumber?: string;
  vendorId?: string;
  vendorName!: string;
  description!: string;
  invoiceDate!: Date;
  amount!: number;
  taxAmount?: number;
  totalAmount!: number;
  category!: ExpenseCategory;
  status!: PurchaseInvoiceStatus;
  paymentDate?: Date;
  paymentMethod?: PaymentMethod;
  isRecurring!: boolean;
  recurringPeriod?: RecurringPeriod;
  notes?: string;
  imageUrl?: string;
  imageName?: string;
  imageSize?: number;
  createdBy!: string;
  createdAt!: Date;
  updatedAt!: Date;
  vendor?: {
    id: string;
    name: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
  };
}

export class ExpenseInvoiceFilterDto {
  @IsString()
  @IsOptional()
  vendorId?: string;

  @IsEnum(ExpenseCategory)
  @IsOptional()
  category?: ExpenseCategory;

  @IsEnum(PurchaseInvoiceStatus)
  @IsOptional()
  status?: PurchaseInvoiceStatus;

  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  page?: string;

  @IsString()
  @IsOptional()
  limit?: string;
}
