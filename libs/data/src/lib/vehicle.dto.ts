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

export class UpdateVehicleDto implements Partial<CreateVehicleDto> {
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

// Legacy type aliases for backward compatibility
export type VehicleDto = VehicleResponseDto;