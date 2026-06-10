import {
  IsString,
  IsOptional,
  IsNumber,
  IsNotEmpty,
  IsEnum,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

// Service type mirrors the Prisma ROServiceType enum.
export enum ServiceCatalogType {
  LABOR = 'LABOR',
  PART = 'PART',
  OTHER = 'OTHER',
}

export class CreateServiceCatalogItemDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsEnum(ServiceCatalogType)
  @IsOptional()
  type?: ServiceCatalogType;

  // Default labour time in hours. Pre-fills the add-service form; adjustable.
  @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  @Min(0)
  @IsOptional()
  labourHours?: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  @Min(0)
  @IsOptional()
  unitPrice?: number;
}

export class UpdateServiceCatalogItemDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  name?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsEnum(ServiceCatalogType)
  @IsOptional()
  type?: ServiceCatalogType;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  @Min(0)
  @IsOptional()
  labourHours?: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  @Min(0)
  @IsOptional()
  unitPrice?: number;
}

// Response DTO
export class ServiceCatalogItemDto {
  id!: string;
  name!: string;
  category?: string;
  type!: ServiceCatalogType;
  labourHours!: number;
  unitPrice!: number;
  createdAt!: Date;
  updatedAt!: Date;
}
