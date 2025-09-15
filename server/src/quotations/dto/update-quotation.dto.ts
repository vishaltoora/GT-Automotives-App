import { IsString, IsOptional, IsEnum, IsDateString, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateQuoteItemDto, QuotationStatus } from './create-quotation.dto';

export class UpdateQuoteDto {
  @IsOptional()
  @IsString()
  customerName?: string;

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

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuoteItemDto)
  items?: CreateQuoteItemDto[];

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