import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import {
  InspectionItemStatus,
  InspectionOverallStatus,
  InspectionStatus,
  InspectionType,
  PaymentMethod,
} from './prisma-enums';

export {
  InspectionItemStatus,
  InspectionOverallStatus,
  InspectionStatus,
  InspectionType,
};

export class CreateInspectionDto {
  @IsString()
  templateId!: string;

  @IsString()
  customerId!: string;

  @IsOptional()
  @IsString()
  vehicleId?: string;

  @IsOptional()
  @IsString()
  appointmentId?: string;

  @IsOptional()
  @IsString()
  invoiceId?: string;

  @IsOptional()
  @IsString()
  repairOrderId?: string;

  @IsOptional()
  @IsString()
  roNumber?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  mileage?: number;
}

export class UpdateInspectionDto {
  @IsOptional()
  @IsEnum(InspectionStatus)
  status?: InspectionStatus;

  @IsOptional()
  @IsEnum(InspectionOverallStatus)
  overallStatus?: InspectionOverallStatus;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  mileage?: number;

  @IsOptional()
  @IsString()
  technicianNotes?: string;

  @IsOptional()
  @IsString()
  customerNotes?: string;
}

export class UpdateInspectionResultDto {
  @IsOptional()
  @IsEnum(InspectionItemStatus)
  status?: InspectionItemStatus | null;

  @IsOptional()
  @IsString()
  value?: string | null;

  @IsOptional()
  @IsString()
  notes?: string | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  selectedOptions?: string[];
}

export class InspectionTemplateQueryDto {
  @IsOptional()
  @IsEnum(InspectionType)
  type?: InspectionType;
}

// Admin-managed inspection fee catalog (priced inspection line items).
export class CreateInspectionFeeItemDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(InspectionType)
  type?: InspectionType;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  @Min(0)
  price!: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateInspectionFeeItemDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(InspectionType)
  type?: InspectionType;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  @Min(0)
  price?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class InspectionFeeItemDto {
  id!: string;
  name!: string;
  description?: string | null;
  type?: InspectionType | null;
  price!: number;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}

// Generate an invoice from a completed inspection (fee + any linked RO work).
export class GenerateInspectionInvoiceDto {
  @IsString()
  @IsNotEmpty()
  feeItemId!: string;

  @IsString()
  @IsNotEmpty()
  companyId!: string;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;
}
