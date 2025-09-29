import { IsString, IsNumber, IsOptional, IsArray, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { QuotationStatus } from '@prisma/client';

export enum QuotationItemType {
  TIRE = 'TIRE',
  SERVICE = 'SERVICE',
  PART = 'PART',
  OTHER = 'OTHER'
}

export class QuotationItemDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsString()
  tireId?: string;

  @IsEnum(QuotationItemType)
  itemType!: QuotationItemType;

  @IsString()
  description!: string;

  @IsNumber()
  quantity!: number;

  @IsNumber()
  unitPrice!: number;

  @IsOptional()
  @IsNumber()
  total?: number;
}

export class CreateQuoteDto {
  // Customer information (sent directly from frontend)
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
  vehicleId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuotationItemDto)
  items!: QuotationItemDto[];

  @IsOptional()
  @IsNumber()
  gstRate?: number;

  @IsOptional()
  @IsNumber()
  pstRate?: number;

  @IsEnum(QuotationStatus)
  status!: QuotationStatus;

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
  vehicleId?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuotationItemDto)
  items?: QuotationItemDto[];

  @IsOptional()
  @IsNumber()
  subtotal?: number;

  @IsOptional()
  @IsNumber()
  taxRate?: number;

  @IsOptional()
  @IsNumber()
  taxAmount?: number;

  @IsOptional()
  @IsNumber()
  gstRate?: number;

  @IsOptional()
  @IsNumber()
  gstAmount?: number;

  @IsOptional()
  @IsNumber()
  pstRate?: number;

  @IsOptional()
  @IsNumber()
  pstAmount?: number;

  @IsOptional()
  @IsNumber()
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
}

export class QuotationResponseDto {
  @IsString()
  id!: string;

  @IsString()
  quoteNumber!: string;

  @IsString()
  customerId!: string;

  @IsOptional()
  customer?: any;

  @IsOptional()
  @IsString()
  vehicleId?: string;

  @IsOptional()
  vehicle?: any;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuotationItemDto)
  items!: QuotationItemDto[];

  @IsNumber()
  subtotal!: number;

  @IsNumber()
  taxRate!: number;

  @IsNumber()
  taxAmount!: number;

  @IsOptional()
  @IsNumber()
  gstRate?: number;

  @IsOptional()
  @IsNumber()
  gstAmount?: number;

  @IsOptional()
  @IsNumber()
  pstRate?: number;

  @IsOptional()
  @IsNumber()
  pstAmount?: number;

  @IsNumber()
  total!: number;

  @IsEnum(QuotationStatus)
  status!: QuotationStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  validUntil?: string;

  @IsString()
  createdBy!: string;

  @IsString()
  createdAt!: string;

  @IsString()
  updatedAt!: string;
}