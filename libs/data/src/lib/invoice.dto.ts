import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { InvoiceItemType, InvoiceStatus, PaymentMethod } from './prisma-enums';

export { InvoiceItemType, InvoiceStatus, PaymentMethod };

export class InvoiceItemDto {
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

  @IsEnum(InvoiceItemType)
  itemType!: InvoiceItemType;

  @IsString()
  description!: string;

  @IsNumber()
  quantity!: number;

  @IsNumber()
  @ValidateIf((o: any) => o.itemType !== 'DISCOUNT' && o.itemType !== 'DISCOUNT_PERCENTAGE')
  @IsPositive({ message: 'Unit price must be positive for non-discount items' })
  unitPrice!: number; // Can be negative for DISCOUNT items

  @IsOptional()
  @IsString()
  discountType?: 'amount' | 'percentage';

  @IsOptional()
  @IsNumber()
  discountValue?: number;

  @IsOptional()
  @IsNumber()
  discountAmount?: number;

  @IsOptional()
  @IsNumber()
  total?: number;
}

export class CreateInvoiceDto {
  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  customerData?: any;

  @IsOptional()
  @IsString()
  vehicleId?: string;

  @IsString()
  companyId!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items!: InvoiceItemDto[];

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

  @IsEnum(InvoiceStatus)
  status!: InvoiceStatus;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  invoiceDate?: string;
}

export class UpdateInvoiceDto {
  @IsOptional()
  @IsString()
  vehicleId?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items?: InvoiceItemDto[];

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
  @IsEnum(InvoiceStatus)
  status?: InvoiceStatus;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  paidAt?: string;

  @IsOptional()
  @IsString()
  invoiceDate?: string;

  @IsOptional()
  @IsString()
  companyId?: string;
}

export interface InvoiceCompanyDto {
  id: string;
  name: string;
  registrationNumber: string;
  businessType?: string;
  address?: string;
  phone?: string;
  email?: string;
  isDefault: boolean;
}

export interface InvoiceCustomerDto {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  name?: string | null;
  businessName?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
}

export interface InvoiceVehicleDto {
  id: string;
  year?: number | null;
  make?: string | null;
  model?: string | null;
  vin?: string | null;
  licensePlate?: string | null;
  mileage?: number | null;
}

export class InvoiceResponseDto {
  @IsString()
  id!: string;

  @IsString()
  invoiceNumber!: string;

  @IsString()
  customerId!: string;

  @IsOptional()
  customer?: InvoiceCustomerDto;

  @IsOptional()
  @IsString()
  vehicleId?: string;

  @IsOptional()
  vehicle?: InvoiceVehicleDto;

  @IsOptional()
  @IsString()
  repairOrderId?: string;

  @IsOptional()
  repairOrder?: { id: string; roNumber: string; status: string };

  @IsString()
  companyId!: string;

  @IsOptional()
  company?: InvoiceCompanyDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items!: InvoiceItemDto[];

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

  @IsEnum(InvoiceStatus)
  status!: InvoiceStatus;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsString()
  createdBy!: string;

  @IsString()
  createdAt!: string;

  @IsString()
  updatedAt!: string;

  @IsOptional()
  @IsString()
  paidAt?: string;

  @IsOptional()
  @IsString()
  invoiceDate?: string;
}
