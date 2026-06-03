import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { PurchaseExpenseCategory, PurchaseExpenseType } from './prisma-enums';

export { PurchaseExpenseCategory, PurchaseExpenseType };

export class CreatePurchaseExpenseInvoiceDto {
  @IsEnum(PurchaseExpenseType)
  type!: PurchaseExpenseType;

  @IsOptional()
  @IsString()
  vendorId?: string;

  @IsString()
  vendorName!: string;

  @IsString()
  description!: string;

  @IsDateString()
  invoiceDate!: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  amount!: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  gstRate!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  gstAmount?: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  pstRate!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  pstAmount?: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  hstRate!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  hstAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  taxAmount?: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  totalAmount!: number;

  @IsEnum(PurchaseExpenseCategory)
  category!: PurchaseExpenseCategory;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdatePurchaseExpenseInvoiceDto {
  @IsOptional()
  @IsEnum(PurchaseExpenseType)
  type?: PurchaseExpenseType;

  @IsOptional()
  @IsString()
  vendorId?: string;

  @IsOptional()
  @IsString()
  vendorName?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  invoiceDate?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  amount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  gstRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  gstAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  pstRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  pstAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  hstRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  hstAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  taxAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  totalAmount?: number;

  @IsOptional()
  @IsEnum(PurchaseExpenseCategory)
  category?: PurchaseExpenseCategory;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class PurchaseExpenseInvoiceFilterDto {
  @IsOptional()
  @IsEnum(PurchaseExpenseType)
  type?: PurchaseExpenseType;

  @IsOptional()
  @IsString()
  vendorId?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(PurchaseExpenseCategory)
  category?: PurchaseExpenseCategory;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;
}

export interface PurchaseExpenseInvoiceResponseDto {
  id: string;
  type: PurchaseExpenseType;
  vendorId: string | null;
  vendorName: string;
  description: string;
  invoiceDate: Date;
  amount: number;
  gstRate: number;
  gstAmount: number | null;
  pstRate: number;
  pstAmount: number | null;
  hstRate: number;
  hstAmount: number | null;
  taxAmount: number | null;
  totalAmount: number;
  category: PurchaseExpenseCategory;
  notes: string | null;
  imageUrl: string | null;
  imageName: string | null;
  imageSize: number | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  vendor?: {
    id: string;
    name: string;
  } | null;
}
