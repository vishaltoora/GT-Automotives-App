import { 
  IsString, 
  IsNumber, 
  IsOptional, 
  IsUUID, 
  IsDateString,
  Min,
  IsPositive
} from 'class-validator';
import { Type } from 'class-transformer';

// Simple Invoice DTOs without circular references
export class InvoiceDto {
  @IsUUID()
  id!: string;

  @IsString()
  invoiceNumber!: string;

  @IsUUID()
  customerId!: string;

  @IsUUID()
  @IsOptional()
  vehicleId?: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  subtotal!: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  taxRate!: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  taxAmount!: number;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  total!: number;

  @IsString()
  status!: string;

  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsUUID()
  createdBy!: string;

  @IsDateString()
  createdAt!: Date;

  @IsDateString()
  updatedAt!: Date;

  @IsDateString()
  @IsOptional()
  paidAt?: Date;
}

export class CreateInvoiceDto {
  @IsUUID()
  customerId!: string;

  @IsUUID()
  @IsOptional()
  vehicleId?: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  taxRate!: number;

  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsUUID()
  createdBy!: string;
}

export class UpdateInvoiceDto {
  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsDateString()
  @IsOptional()
  paidAt?: Date;
}

// Invoice Item DTOs
export class InvoiceItemDto {
  @IsUUID()
  id!: string;

  @IsUUID()
  invoiceId!: string;

  @IsUUID()
  @IsOptional()
  tireId?: string;

  @IsString()
  itemType!: string;

  @IsString()
  description!: string;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  quantity!: number;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  unitPrice!: number;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  total!: number;

  @IsDateString()
  createdAt!: Date;

  @IsDateString()
  updatedAt!: Date;
}

export class CreateInvoiceItemDto {
  @IsUUID()
  @IsOptional()
  tireId?: string;

  @IsString()
  itemType!: string;

  @IsString()
  description!: string;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  quantity!: number;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  unitPrice!: number;
}

export class UpdateInvoiceItemDto {
  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  quantity?: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  unitPrice?: number;
}