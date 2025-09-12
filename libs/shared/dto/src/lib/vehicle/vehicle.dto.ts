import { IsString, IsNumber, IsOptional, IsUUID, Min, Max, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

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
}

export class VehicleDto {
  @IsUUID()
  id!: string;

  @IsUUID()
  customerId!: string;

  @IsString()
  make!: string;

  @IsString()
  model!: string;

  @IsNumber()
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
  @Type(() => Number)
  mileage?: number;

  @IsDateString()
  createdAt!: Date;
  
  @IsDateString()
  updatedAt!: Date;
}