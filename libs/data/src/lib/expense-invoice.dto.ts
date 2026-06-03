import { PaymentMethod } from './invoice.dto';
import { Type } from 'class-transformer';
import { IsBoolean, IsDateString, IsEnum, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';
import { ExpenseCategory, PurchaseInvoiceStatus, RecurringPeriod } from './prisma-enums';

export { ExpenseCategory, PurchaseInvoiceStatus as ExpenseInvoiceStatus, RecurringPeriod };

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
  @Type(() => Number)
  amount!: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  taxAmount?: number;

  @IsNumber()
  @Type(() => Number)
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
  @Type(() => Number)
  amount?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  taxAmount?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
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

export class ExpenseInvoiceDto {
  id!: string;
  invoiceNumber?: string;
  vendorId?: string;
  vendorName!: string;
  description!: string;
  invoiceDate!: string;
  amount!: number;
  taxAmount?: number;
  totalAmount!: number;
  category!: ExpenseCategory;
  status!: PurchaseInvoiceStatus;
  paymentDate?: string;
  paymentMethod?: PaymentMethod;
  isRecurring!: boolean;
  recurringPeriod?: RecurringPeriod;
  notes?: string;
  imageUrl?: string;
  imageName?: string;
  imageSize?: number;
  createdBy!: string;
  createdAt!: string;
  updatedAt!: string;
  vendor?: {
    id: string;
    name: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
  };
}

export class ExpenseInvoiceResponseDto extends ExpenseInvoiceDto {}

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

export interface ExpenseInvoiceListResponse {
  data: ExpenseInvoiceDto[];
  total: number;
  page: number;
  limit: number;
}
