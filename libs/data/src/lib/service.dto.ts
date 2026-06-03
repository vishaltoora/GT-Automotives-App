import { IsString, IsOptional, IsNumber, IsNotEmpty, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

// Data lib DTO with validation decorators (identical to server-side)
export class CreateServiceDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  @IsPositive()
  unitPrice!: number;
}

export class UpdateServiceDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  @IsOptional()
  @IsPositive()
  unitPrice?: number;
}

// Response DTO
export class ServiceDto {
  id!: string;
  name!: string;
  description?: string;
  unitPrice!: number;
  createdAt!: Date;
  updatedAt!: Date;
}
