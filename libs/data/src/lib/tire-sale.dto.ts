import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { CommissionStatus, PaymentMethod, TireCondition, TireType } from './prisma-enums';

export { CommissionStatus, PaymentMethod, TireCondition, TireType };

export class TireSaleItemDto {
  @IsString()
  tireId!: string;

  @IsNumber()
  @IsPositive()
  @Min(1)
  @Type(() => Number)
  quantity!: number;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  unitPrice!: number;
}

export class TireSaleItemResponseDto {
  id!: string;
  tireId!: string;
  quantity!: number;
  unitPrice!: number;
  total!: number;
  tireBrand!: string;
  tireSize!: string;
  tireType!: TireType;
  tireCondition!: TireCondition;
}

export class CustomerDataDto {
  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  businessName?: string;

  @IsOptional()
  @IsString()
  address?: string;
}

export class CreateTireSaleDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TireSaleItemDto)
  items!: TireSaleItemDto[];

  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CustomerDataDto)
  customerData?: CustomerDataDto;

  @IsOptional()
  @IsString()
  soldById?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateTireSaleDto {
  @IsOptional()
  @IsString()
  soldById?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class TireSaleSellerDto {
  id!: string;
  firstName!: string | null;
  lastName!: string | null;
  email!: string;
}

export class TireSaleCustomerDto {
  id!: string;
  firstName!: string;
  lastName!: string;
  businessName?: string | null;
  phone?: string | null;
}

export class TireSaleInvoiceDto {
  id!: string;
  invoiceNumber!: string;
}

export class TireSaleResponseDto {
  id!: string;
  saleNumber!: string;
  soldBy!: TireSaleSellerDto;
  customer?: TireSaleCustomerDto | null;
  invoice?: TireSaleInvoiceDto | null;
  paymentMethod!: PaymentMethod;
  items!: TireSaleItemResponseDto[];
  subtotal!: number;
  taxAmount!: number;
  total!: number;
  commissionRate?: number | null;
  commissionAmount?: number | null;
  commissionStatus!: CommissionStatus;
  commissionPaidAt?: Date | null;
  notes?: string | null;
  saleDate!: Date;
  createdAt!: Date;
}

export class TireSaleFiltersDto {
  @IsOptional()
  @IsString()
  soldById?: string;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsEnum(CommissionStatus)
  commissionStatus?: CommissionStatus;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number;
}

export class EmployeeCommissionSummaryDto {
  employeeId!: string;
  employeeName!: string;
  totalTiresSold!: number;
  totalSalesAmount!: number;
  commissionRate!: number;
  totalCommission!: number;
  pendingCommission!: number;
  paidCommission!: number;
}

export class CommissionReportDto {
  startDate!: string;
  endDate!: string;
  employees!: EmployeeCommissionSummaryDto[];
  totals!: {
    totalTiresSold: number;
    totalSalesAmount: number;
    totalCommission: number;
    pendingCommission: number;
    paidCommission: number;
  };
}

export class CommissionFiltersDto {
  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsString()
  employeeId?: string;
}

export class MonthlyTireSalesStatsDto {
  employeeId!: string;
  month!: string;
  totalTiresSold!: number;
  currentCommissionRate!: number;
}
