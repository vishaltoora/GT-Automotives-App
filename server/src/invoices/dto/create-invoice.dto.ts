import { IsString, IsOptional, IsNumber, IsArray, ValidateNested, IsEnum, Min, IsEmail } from 'class-validator';
import { Type } from 'class-transformer';
// Local enum definitions to avoid Prisma client dependency issues
export enum PaymentMethod {
  CASH = 'CASH',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  CHECK = 'CHECK',
  E_TRANSFER = 'E_TRANSFER',
}

export enum InvoiceItemType {
  TIRE = 'TIRE',
  SERVICE = 'SERVICE',
  PART = 'PART',
  OTHER = 'OTHER',
}

export class CreateInvoiceItemDto {
  @IsOptional()
  @IsString()
  tireId?: string;

  @IsEnum(InvoiceItemType)
  itemType!: InvoiceItemType;

  @IsString()
  description!: string;

  @IsNumber()
  @Min(1)
  quantity!: number;

  @IsNumber()
  @Min(0)
  unitPrice!: number;
}

export class CreateCustomerDto {
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

export class CreateInvoiceDto {
  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateCustomerDto)
  customerData?: CreateCustomerDto;

  @IsOptional()
  @IsString()
  vehicleId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceItemDto)
  items!: CreateInvoiceItemDto[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  taxRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  gstRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  pstRate?: number;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @IsOptional()
  @IsString()
  notes?: string;
}