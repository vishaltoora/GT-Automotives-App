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
  @IsNumber()
  mileage?: number;

  @IsOptional()
  @IsString()
  customerId?: string;
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
  vin?: string | null;

  @IsOptional()
  @IsString()
  licensePlate?: string | null;

  @IsOptional()
  @IsNumber()
  mileage?: number;
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
  @IsNumber()
  mileage?: number;

  @IsString()
  customerId!: string;

  @IsString()
  createdAt!: string;

  @IsString()
  updatedAt!: string;

  @IsOptional()
  customer?: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    businessName?: string;
  };

  @IsOptional()
  _count?: {
    invoices: number;
    appointments: number;
  };

  @IsOptional()
  stats?: {
    serviceCount: number;
    totalSpent: number;
    lastServiceDate: Date | null;
    nextAppointment: any | null;
  };
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
