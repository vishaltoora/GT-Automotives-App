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
  @ValidateIf(
    (o: any) =>
      o.itemType !== 'DISCOUNT' && o.itemType !== 'DISCOUNT_PERCENTAGE'
  )
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

/**
 * A service or part the customer was offered and declined. Deliberately not an
 * InvoiceItem: declined work is never billed and never enters any total, so it
 * carries a description only — no quantity or price that could read as a charge.
 */
export class InvoiceDeclinedItemDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  description!: string;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;
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
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceDeclinedItemDto)
  declinedItems?: InvoiceDeclinedItemDto[];

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

  /**
   * When present, replaces the invoice's declined-item list wholesale. Omit the
   * field to leave the existing list untouched; pass [] to clear it.
   */
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceDeclinedItemDto)
  declinedItems?: InvoiceDeclinedItemDto[];

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

/**
 * Payload for capturing a customer signature on an invoice. The image arrives as
 * a PNG data URL straight off the signature pad canvas; the server strips the
 * prefix and stores the bytes in Azure Blob.
 */
export class CaptureInvoiceSignatureDto {
  @IsString()
  imageDataUrl!: string;

  @IsOptional()
  @IsString()
  signedByName?: string;
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
  /** Business-authored terms & conditions printed at the foot of the invoice. */
  termsAndConditions?: string | null;
}

export interface InvoiceCustomerDto {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  name?: string | null;
  businessName?: string | null;
  email?: string | null;
  additionalEmails?: string[] | null;
  pstExempt?: boolean | null;
  pstNumber?: string | null;
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

  @IsOptional()
  @IsNumber()
  amountPaid?: number;

  @IsEnum(InvoiceStatus)
  status!: InvoiceStatus;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceDeclinedItemDto)
  declinedItems?: InvoiceDeclinedItemDto[];

  /**
   * Signature fields are null when the invoice is unsigned — the templates then
   * print a blank ruled line. `signatureUrl` is re-signed as a short-lived Azure
   * SAS URL on read, because the storage account forbids public blob access.
   */
  @IsOptional()
  @IsString()
  signatureUrl?: string | null;

  @IsOptional()
  @IsString()
  signatureSignedByName?: string | null;

  @IsOptional()
  @IsString()
  signatureSignedAt?: string | null;

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
