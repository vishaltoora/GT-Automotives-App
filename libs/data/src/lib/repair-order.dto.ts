import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  ROMediaType,
  ROServiceApproval,
  ROServiceStatus,
  ROServiceType,
  ROStatus,
} from './prisma-enums';

export {
  ROMediaType,
  ROServiceApproval,
  ROServiceStatus,
  ROServiceType,
  ROStatus,
};

// ---- ROService DTOs ----

export class CreateROServiceDto {
  @IsString()
  description!: string;

  @IsOptional()
  @IsEnum(ROServiceType)
  type?: ROServiceType;

  @IsOptional()
  quantity?: number;

  @IsOptional()
  unitPrice?: number;

  @IsOptional()
  @IsString()
  technicianNotes?: string;

  @IsOptional()
  @IsBoolean()
  isQuotation?: boolean;
}

export class UpdateROServiceDto {
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(ROServiceType)
  type?: ROServiceType;

  @IsOptional()
  quantity?: number;

  @IsOptional()
  unitPrice?: number;

  @IsOptional()
  @IsString()
  technicianNotes?: string;

  @IsOptional()
  @IsEnum(ROServiceStatus)
  status?: ROServiceStatus;

  @IsOptional()
  @IsEnum(ROServiceApproval)
  customerApproval?: ROServiceApproval;

  @IsOptional()
  @IsBoolean()
  isQuotation?: boolean;
}

// ---- RepairOrder DTOs ----

export class CreateRepairOrderDto {
  @IsString()
  appointmentId!: string;

  @IsString()
  customerId!: string;

  @IsOptional()
  @IsString()
  vehicleId?: string;

  @IsOptional()
  @IsString()
  customerConcern?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  mileageIn?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  employeeIds?: string[];
}

export class UpdateRepairOrderDto {
  @IsOptional()
  @IsEnum(ROStatus)
  status?: ROStatus;

  @IsOptional()
  @IsString()
  vehicleId?: string;

  @IsOptional()
  @IsBoolean()
  noVehicle?: boolean;

  @IsOptional()
  @IsString()
  customerConcern?: string;

  @IsOptional()
  @IsString()
  technicianNotes?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  mileageIn?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  mileageOut?: number;

  @IsOptional()
  estimatedCost?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  employeeIds?: string[];
}

export class ROQueryDto {
  @IsOptional()
  @IsEnum(ROStatus)
  status?: ROStatus;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsString()
  vehicleId?: string;

  @IsOptional()
  @IsString()
  employeeId?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsString()
  search?: string;
}

export class UpdateROMediaDto {
  @IsOptional()
  @IsString()
  caption?: string;

  @IsOptional()
  @IsEnum(ROMediaType)
  mediaType?: ROMediaType;
}
