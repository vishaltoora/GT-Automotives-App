import { IsString, IsOptional, IsNotEmpty, IsInt, Min, Max } from 'class-validator';

export class CreateVehicleDto {
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @IsString()
  @IsNotEmpty()
  make: string;

  @IsString()
  @IsNotEmpty()
  model: string;

  @IsInt()
  @Min(1900)
  @Max(new Date().getFullYear() + 1)
  year: number;

  @IsString()
  @IsOptional()
  vin?: string;

  @IsString()
  @IsOptional()
  licensePlate?: string;

  @IsInt()
  @IsOptional()
  @Min(0)
  mileage?: number;
}