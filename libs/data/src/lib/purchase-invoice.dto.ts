import { PaymentMethod } from './invoice.dto';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';
import { PurchaseCategory, PurchaseInvoiceStatus } from './prisma-enums';

export { PurchaseCategory, PurchaseInvoiceStatus };

export class CreatePurchaseInvoiceDto {
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

  @IsEnum(PurchaseCategory)
  category!: PurchaseCategory;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  createdBy!: string;
}

export class UpdatePurchaseInvoiceDto {
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

  @IsEnum(PurchaseCategory)
  @IsOptional()
  category?: PurchaseCategory;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class PurchaseInvoiceDto {
  id!: string;
  invoiceNumber?: string;
  vendorId?: string;
  vendorName!: string;
  description!: string;
  invoiceDate!: string;
  dueDate?: string;
  amount!: number;
  taxAmount?: number;
  totalAmount!: number;
  category!: PurchaseCategory;
  status!: PurchaseInvoiceStatus;
  paymentDate?: string;
  paymentMethod?: PaymentMethod;
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

export class PurchaseInvoiceResponseDto extends PurchaseInvoiceDto {}

export class PurchaseInvoiceFilterDto {
  @IsString()
  @IsOptional()
  vendorId?: string;

  @IsEnum(PurchaseCategory)
  @IsOptional()
  category?: PurchaseCategory;

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

export interface PurchaseInvoiceListResponse {
  data: PurchaseInvoiceDto[];
  total: number;
  page: number;
  limit: number;
}
