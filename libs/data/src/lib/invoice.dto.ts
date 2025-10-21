import { IsString, IsNumber, IsOptional, IsArray, IsEnum, ValidateNested, Type, ValidateIf, IsPositive } from './decorators';

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

export enum PaymentMethod {
  CASH = 'CASH',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  CHECK = 'CHECK',
  E_TRANSFER = 'E_TRANSFER',
  FINANCING = 'FINANCING'
}

export enum InvoiceItemType {
  TIRE = 'TIRE',
  SERVICE = 'SERVICE',
  PART = 'PART',
  OTHER = 'OTHER',
  LEVY = 'LEVY',
  DISCOUNT = 'DISCOUNT',
  DISCOUNT_PERCENTAGE = 'DISCOUNT_PERCENTAGE'
}

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
}

export class InvoiceResponseDto {
  @IsString()
  id!: string;

  @IsString()
  invoiceNumber!: string;

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