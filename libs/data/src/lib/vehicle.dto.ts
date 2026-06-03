import { OmitType, PartialType } from './utils/mapped-types';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateVehicleDto {
  @IsString()
  make!: string;

  @IsString()
  model!: string;

  @IsNumber()
  @Type(() => Number)
  year!: number;

  @IsOptional()
  @IsString()
  vin?: string;

  @IsOptional()
  @IsString()
  licensePlate?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  mileage?: number;

  @IsString()
  customerId!: string;
}

export class UpdateVehicleDto extends PartialType(
  OmitType(CreateVehicleDto, ['vin', 'licensePlate'] as const)
) {
  @IsOptional()
  @IsString()
  vin?: string | null;

  @IsOptional()
  @IsString()
  licensePlate?: string | null;
}

export interface VehicleCustomerDto {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  businessName?: string | null;
}

export interface VehicleCountDto {
  invoices: number;
  appointments: number;
}

export interface VehicleStatsDto {
  serviceCount: number;
  totalSpent: number;
  lastServiceDate: string | Date | null;
  nextAppointment: {
    scheduledDate: string | Date;
    scheduledTime?: string | null;
    serviceType?: string | null;
  } | null;
}

export class VehicleResponseDto {
  @IsString()
  id!: string;

  @IsString()
  make!: string;

  @IsString()
  model!: string;

  @IsNumber()
  @Type(() => Number)
  year!: number;

  @IsOptional()
  @IsString()
  vin?: string;

  @IsOptional()
  @IsString()
  licensePlate?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  mileage?: number;

  @IsString()
  customerId!: string;

  @IsString()
  createdAt!: string;

  @IsString()
  updatedAt!: string;

  @IsOptional()
  customer?: VehicleCustomerDto;

  @IsOptional()
  _count?: VehicleCountDto;

  @IsOptional()
  stats?: VehicleStatsDto;
}

export class DecodeVinResponseDto {
  @IsString()
  vin!: string;

  @IsOptional()
  @IsString()
  make?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  year?: number;

  @IsOptional()
  @IsString()
  trim?: string;

  @IsOptional()
  @IsString()
  bodyClass?: string;

  @IsOptional()
  @IsString()
  vehicleType?: string;

  @IsOptional()
  @IsString()
  engine?: string;

  @IsOptional()
  @IsString()
  fuelType?: string;

  warnings!: string[];

  @IsString()
  rawProvider!: 'NHTSA_VPIC';
}

// Legacy type aliases for backward compatibility
export type VehicleDto = VehicleResponseDto;
