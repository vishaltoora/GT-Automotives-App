import { IsString, IsOptional, IsNumber, IsNotEmpty, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

// Server-side DTO with validation decorators
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

export class UpdateServiceDto implements Partial<CreateServiceDto> {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  @IsPositive()
  @IsOptional()
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
