import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsEnum,
  ValidateNested,
  IsPositive,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod, TireType, TireCondition, CommissionStatus } from '@prisma/client';

// ============================================
// Tire Sale Item DTOs
// ============================================

export class TireSaleItemDto {
  @IsString()
  tireId!: string;

  @IsNumber()
  @IsPositive()
  @Min(1)
  quantity!: number;

  @IsNumber()
  @IsPositive()
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

// ============================================
// Customer Data DTO (for inline customer creation)
// ============================================

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

// ============================================
// Create Tire Sale DTO
// ============================================

export class CreateTireSaleDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TireSaleItemDto)
  items!: TireSaleItemDto[];

  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  // For existing customer (required for non-cash payments)
  @IsOptional()
  @IsString()
  customerId?: string;

  // For creating new customer inline (non-cash only)
  @IsOptional()
  @ValidateNested()
  @Type(() => CustomerDataDto)
  customerData?: CustomerDataDto;

  // Salesperson who made the sale (optional, defaults to current user)
  @IsOptional()
  @IsString()
  soldById?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

// ============================================
// Update Tire Sale DTO (Admin only - change salesperson)
// ============================================

export class UpdateTireSaleDto {
  // Change salesperson
  @IsOptional()
  @IsString()
  soldById?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

// ============================================
// Tire Sale Response DTO
// ============================================

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

// ============================================
// Tire Sale Filters DTO
// ============================================

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

// ============================================
// Commission Report DTOs
// ============================================

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

// ============================================
// Monthly Stats DTO (for tiered commission calculation)
// ============================================

export class MonthlyTireSalesStatsDto {
  employeeId!: string;
  month!: string; // YYYY-MM format
  totalTiresSold!: number;
  currentCommissionRate!: number; // $3, $4, or $5
}
