import {
  IsString,
  IsNumber,
  IsOptional,
  IsUUID,
  IsDateString,
  ValidateNested,
  IsArray,
  Min,
  IsPositive,
  IsEnum,
  IsEmail
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod, InvoiceItemType } from '../common/enums.dto';

// CreateCustomerDto for inline customer creation (defined first to avoid circular dependency)
export class CreateCustomerDtoForInvoice {
  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

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
  @IsEmail()
  email?: string;
}

// Enhanced Invoice DTOs with proper validation

export class CreateInvoiceEnhancedDto {
  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateCustomerDtoForInvoice)
  customerData?: CreateCustomerDtoForInvoice;

  @IsOptional()
  @IsString()
  vehicleId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceItemEnhancedDto)
  items!: CreateInvoiceItemEnhancedDto[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  taxRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  gstRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  pstRate?: number;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @IsOptional()
  @IsString()
  notes?: string;
}

// Enhanced Invoice Item DTOs with proper validation

export class CreateInvoiceItemEnhancedDto {
  @IsOptional()
  @IsString()
  tireId?: string;

  @IsEnum(InvoiceItemType)
  itemType!: InvoiceItemType;

  @IsString()
  description!: string;

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  quantity!: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  unitPrice!: number;
}

// Enhanced Update DTOs with proper validation
export class UpdateInvoiceItemEnhancedDto {
  @IsOptional()
  @IsEnum(InvoiceItemType)
  itemType?: InvoiceItemType;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  quantity?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  unitPrice?: number;
}

