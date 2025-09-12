import { IsString, IsNumber, IsOptional, IsUUID, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class VehicleDto {
  @IsString()
  id!: string;

  @IsUUID()
  customerId!: string;

  @IsString()
  make!: string;

  @IsString()
  model!: string;

  @IsNumber()
  @Min(1900)
  @Max(new Date().getFullYear() + 1)
  @Type(() => Number)
  year!: number;

  @IsString()
  @IsOptional()
  vin?: string;

  @IsString()
  @IsOptional()
  licensePlate?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  mileage?: number;

  @IsString()
  @IsOptional()
  color?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export class CreateVehicleDto {
  @IsUUID()
  customerId!: string;

  @IsString()
  make!: string;

  @IsString()
  model!: string;

  @IsNumber()
  @Min(1900)
  @Max(new Date().getFullYear() + 1)
  @Type(() => Number)
  year!: number;

  @IsString()
  @IsOptional()
  vin?: string;

  @IsString()
  @IsOptional()
  licensePlate?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  mileage?: number;

  @IsString()
  @IsOptional()
  color?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateVehicleDto {
  @IsString()
  @IsOptional()
  make?: string;

  @IsString()
  @IsOptional()
  model?: string;

  @IsNumber()
  @Min(1900)
  @Max(new Date().getFullYear() + 1)
  @IsOptional()
  @Type(() => Number)
  year?: number;

  @IsString()
  @IsOptional()
  vin?: string;

  @IsString()
  @IsOptional()
  licensePlate?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  mileage?: number;

  @IsString()
  @IsOptional()
  color?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}