import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { QuotationStatus } from './prisma-enums';

export { QuotationStatus };

export enum QuotationItemType {
  TIRE = 'TIRE',
  SERVICE = 'SERVICE',
  PART = 'PART',
  OTHER = 'OTHER',
  LEVY = 'LEVY',
  DISCOUNT = 'DISCOUNT',
  DISCOUNT_PERCENTAGE = 'DISCOUNT_PERCENTAGE'
}

export class QuotationItemDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsString()
  tireId?: string;

  @IsOptional()
  @IsString()
  tireName?: string;

  @IsOptional()
  tire?: unknown;

  @IsOptional()
  @IsString()
  serviceId?: string;

  @IsEnum(QuotationItemType)
  itemType!: QuotationItemType;

  @IsString()
  description!: string;

  @IsNumber()
  @Type(() => Number)
  quantity!: number;

  @IsNumber()
  @Type(() => Number)
  unitPrice!: number;

  @IsOptional()
  @IsString()
  discountType?: 'amount' | 'percentage';

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  discountValue?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  discountAmount?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  total?: number;
}

export class CreateQuoteDto {
  @IsString()
  customerName!: string;

  @IsOptional()
  @IsString()
  businessName?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  vehicleMake?: string;

  @IsOptional()
  @IsString()
  vehicleModel?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  vehicleYear?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuotationItemDto)
  items!: QuotationItemDto[];

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  gstRate?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  pstRate?: number;

  @IsOptional()
  @IsEnum(QuotationStatus)
  status?: QuotationStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  validUntil?: string;
}

export class UpdateQuoteDto {
  @IsOptional()
  @IsString()
  customerName?: string;

  @IsOptional()
  @IsString()
  businessName?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  vehicleMake?: string;

  @IsOptional()
  @IsString()
  vehicleModel?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  vehicleYear?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuotationItemDto)
  items?: QuotationItemDto[];

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  subtotal?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  taxRate?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  taxAmount?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  gstRate?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  gstAmount?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  pstRate?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  pstAmount?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  total?: number;

  @IsOptional()
  @IsEnum(QuotationStatus)
  status?: QuotationStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  validUntil?: string;

  @IsOptional()
  @IsString()
  convertedToInvoiceId?: string;
}

export class QuotationResponseDto {
  @IsString()
  id!: string;

  @IsString()
  quotationNumber!: string;

  @IsString()
  customerName!: string;

  @IsOptional()
  @IsString()
  businessName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  vehicleMake?: string;

  @IsOptional()
  @IsString()
  vehicleModel?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  vehicleYear?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuotationItemDto)
  items!: QuotationItemDto[];

  @IsNumber()
  @Type(() => Number)
  subtotal!: number;

  @IsNumber()
  @Type(() => Number)
  taxRate!: number;

  @IsNumber()
  @Type(() => Number)
  taxAmount!: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  gstRate?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  gstAmount?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  pstRate?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  pstAmount?: number;

  @IsNumber()
  @Type(() => Number)
  total!: number;

  @IsEnum(QuotationStatus)
  status!: QuotationStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  validUntil?: string;

  @IsOptional()
  @IsString()
  convertedToInvoiceId?: string;

  @IsString()
  createdBy!: string;

  @IsString()
  createdAt!: string;

  @IsString()
  updatedAt!: string;
}
