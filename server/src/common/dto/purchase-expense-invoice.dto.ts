import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsDateString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PurchaseExpenseType, PurchaseExpenseCategory } from '@prisma/client';

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
  amount!: number;  // Subtotal (before tax)

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  gstRate!: number;  // GST percentage (default 5%)

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  gstAmount?: number;  // GST amount

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  pstRate!: number;  // PST percentage (default 7%)

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  pstAmount?: number;  // PST amount

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  hstRate!: number;  // HST percentage (default 0%)

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  hstAmount?: number;  // HST amount

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  taxAmount?: number;  // Total tax

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
  amount?: number;  // Subtotal (before tax)

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
  search?: string;  // Search by vendor name

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
  amount: number;            // Subtotal (before tax)
  gstRate: number;           // GST percentage
  gstAmount: number | null;  // GST amount
  pstRate: number;           // PST percentage
  pstAmount: number | null;  // PST amount
  hstRate: number;           // HST percentage
  hstAmount: number | null;  // HST amount
  taxAmount: number | null;  // Total tax
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
