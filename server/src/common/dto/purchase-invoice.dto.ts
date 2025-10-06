import { IsString, IsOptional, IsEnum, IsDateString, IsNumber, MaxLength } from 'class-validator';
import { PurchaseCategory, PurchaseInvoiceStatus, PaymentMethod } from '@prisma/client';

export class CreatePurchaseInvoiceDto {
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

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsNumber()
  amount!: number;

  @IsNumber()
  @IsOptional()
  taxAmount?: number;

  @IsNumber()
  totalAmount!: number;

  @IsEnum(PurchaseCategory)
  category!: PurchaseCategory;

  @IsEnum(PurchaseInvoiceStatus)
  @IsOptional()
  status?: PurchaseInvoiceStatus;

  @IsDateString()
  @IsOptional()
  paymentDate?: string;

  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  createdBy!: string;
}

export class UpdatePurchaseInvoiceDto {
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

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsNumber()
  @IsOptional()
  taxAmount?: number;

  @IsNumber()
  @IsOptional()
  totalAmount?: number;

  @IsEnum(PurchaseCategory)
  @IsOptional()
  category?: PurchaseCategory;

  @IsEnum(PurchaseInvoiceStatus)
  @IsOptional()
  status?: PurchaseInvoiceStatus;

  @IsDateString()
  @IsOptional()
  paymentDate?: string;

  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class PurchaseInvoiceResponseDto {
  id!: string;
  invoiceNumber?: string;
  vendorId?: string;
  vendorName!: string;
  description!: string;
  invoiceDate!: Date;
  dueDate?: Date;
  amount!: number;
  taxAmount?: number;
  totalAmount!: number;
  category!: PurchaseCategory;
  status!: PurchaseInvoiceStatus;
  paymentDate?: Date;
  paymentMethod?: PaymentMethod;
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

export class PurchaseInvoiceFilterDto {
  @IsString()
  @IsOptional()
  vendorId?: string;

  @IsEnum(PurchaseCategory)
  @IsOptional()
  category?: PurchaseCategory;

  @IsEnum(PurchaseInvoiceStatus)
  @IsOptional()
  status?: PurchaseInvoiceStatus;

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
