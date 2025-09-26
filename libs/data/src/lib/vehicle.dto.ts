import { IsString, IsOptional, IsNumber } from './decorators';

export class CreateVehicleDto {
  @IsString()
  make!: string;

  @IsString()
  model!: string;

  @IsNumber()
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
  mileage?: number;

  @IsString()
  customerId!: string;
}

export class UpdateVehicleDto {
  @IsOptional()
  @IsString()
  make?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsNumber()
  year?: number;

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
  mileage?: number;

  @IsOptional()
  @IsString()
  customerId?: string;
}

export class VehicleResponseDto {
  @IsString()
  id!: string;

  @IsString()
  make!: string;

  @IsString()
  model!: string;

  @IsNumber()
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

  @IsString()
  customerId!: string;

  @IsOptional()
  customer?: any;

  @IsString()
  createdAt!: string;

  @IsString()
  updatedAt!: string;
}