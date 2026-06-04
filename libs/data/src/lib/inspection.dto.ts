import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import {
  InspectionItemStatus,
  InspectionOverallStatus,
  InspectionStatus,
  InspectionType,
} from './prisma-enums';

export { InspectionItemStatus, InspectionOverallStatus, InspectionStatus, InspectionType };

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
