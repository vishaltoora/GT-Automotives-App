import { 
  IsString, 
  IsNumber, 
  IsOptional, 
  IsUUID, 
  IsDateString,
  ValidateNested,
  IsArray,
  Min,
  IsPositive
} from 'class-validator';
import { Type } from 'class-transformer';

// Invoice DTOs
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

  @ValidateNested()
  @Type(() => InvoiceDto)
  @IsOptional()
  invoice?: InvoiceDto;

  @IsUUID()
  @IsOptional()
  tireId?: string;

  @ValidateNested()
  @Type(() => TireReferenceDto)
  @IsOptional()
  tire?: TireReferenceDto;

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

// Reference DTOs to avoid circular dependencies
export class CustomerReferenceDto {
  @IsUUID()
  id!: string;

  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;
}

export class VehicleReferenceDto {
  @IsUUID()
  id!: string;

  @IsString()
  make!: string;

  @IsString()
  model!: string;

  @IsNumber()
  @Type(() => Number)
  year!: number;

  @IsString()
  @IsOptional()
  licensePlate?: string;
}

export class TireReferenceDto {
  @IsUUID()
  id!: string;

  @IsString()
  brand!: string;

  @IsString()
  size!: string;

  @IsString()
  type!: string;

  @IsString()
  condition!: string;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  price!: number;
}