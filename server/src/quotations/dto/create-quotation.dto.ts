import { IsString, IsOptional, IsNumber, IsArray, ValidateNested, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
// Local enum definitions to avoid Prisma client dependency issues
export enum InvoiceItemType {
  TIRE = 'TIRE',
  SERVICE = 'SERVICE',
  PART = 'PART',
  OTHER = 'OTHER',
}

export enum QuotationStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

export class CreateQuoteItemDto {
  @IsOptional()
  @IsString()
  tireId?: string;

  @IsEnum(InvoiceItemType)
  itemType!: InvoiceItemType;

  @IsString()
  description!: string;

  @IsNumber()
  quantity!: number;

  @IsNumber()
  unitPrice!: number;
}

export class CreateQuoteDto {
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
  vehicleYear?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuoteItemDto)
  items!: CreateQuoteItemDto[];

  @IsOptional()
  @IsNumber()
  gstRate?: number;

  @IsOptional()
  @IsNumber()
  pstRate?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsEnum(QuotationStatus)
  status?: QuotationStatus;

  @IsOptional()
  @IsDateString()
  validUntil?: string;
}