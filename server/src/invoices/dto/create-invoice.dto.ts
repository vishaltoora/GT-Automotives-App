import { IsString, IsOptional, IsNumber, IsArray, ValidateNested, IsEnum, Min, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod, InvoiceItemType } from '@prisma/client';

export class CreateInvoiceItemDto {
  @IsOptional()
  @IsUUID()
  tireId?: string;

  @IsEnum(InvoiceItemType)
  itemType: InvoiceItemType;

  @IsString()
  description: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  unitPrice: number;
}

export class CreateInvoiceDto {
  @IsUUID()
  customerId: string;

  @IsOptional()
  @IsUUID()
  vehicleId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceItemDto)
  items: CreateInvoiceItemDto[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  taxRate?: number;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @IsOptional()
  @IsString()
  notes?: string;
}