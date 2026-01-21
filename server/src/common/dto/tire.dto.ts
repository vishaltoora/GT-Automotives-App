import { IsString, IsNumber, IsEnum, IsOptional, Min, IsBoolean, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { TireType, TireCondition } from '@prisma/client';

export enum AdjustmentType {
  ADD = 'add',
  REMOVE = 'remove',
  SET = 'set',
}

export class CreateTireDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsString()
  brand!: string;

  @IsString()
  size!: string;

  @IsEnum(TireType)
  type!: TireType;

  @IsEnum(TireCondition)
  condition!: TireCondition;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  cost?: number;

  @IsNumber()
  @Min(0)
  quantity!: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minStock?: number;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateTireDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  size?: string;

  @IsOptional()
  @IsEnum(TireType)
  type?: TireType;

  @IsOptional()
  @IsEnum(TireCondition)
  condition?: TireCondition;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  cost?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minStock?: number;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class TireResponseDto {
  @IsString()
  id!: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsString()
  brand!: string;

  @IsString()
  size!: string;

  @IsEnum(TireType)
  type!: TireType;

  @IsEnum(TireCondition)
  condition!: TireCondition;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  cost?: number;

  @IsNumber()
  @Min(0)
  quantity!: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  brandImageUrl?: string;

  @IsBoolean()
  inStock!: boolean;

  @IsString()
  createdAt!: string;

  @IsString()
  updatedAt!: string;

  @IsString()
  createdBy!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minStock?: number;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class StockAdjustmentDto {
  @IsNumber()
  quantity!: number;

  @IsEnum(AdjustmentType)
  type!: AdjustmentType;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class TireFiltersDto {
  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  size?: string;

  @IsOptional()
  @IsEnum(TireType)
  type?: TireType;

  @IsOptional()
  @IsEnum(TireCondition)
  condition?: TireCondition;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @IsBoolean()
  inStock?: boolean;

  @IsOptional()
  @IsBoolean()
  lowStock?: boolean;
}

export class TireSearchParamsDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  size?: string;

  @IsOptional()
  @IsEnum(TireType)
  type?: TireType;

  @IsOptional()
  @IsEnum(TireCondition)
  condition?: TireCondition;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @IsBoolean()
  inStock?: boolean;

  @IsOptional()
  @IsBoolean()
  lowStock?: boolean;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  limit?: number;
}

// Alias for TireSearchParamsDto to maintain compatibility
export class TireSearchDto extends TireSearchParamsDto {}

// Basic tire DTO for search results
export class TireDto {
  @IsString()
  id!: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsString()
  brand!: string;

  @IsString()
  size!: string;

  @IsEnum(TireType)
  type!: TireType;

  @IsEnum(TireCondition)
  condition!: TireCondition;

  @IsNumber()
  price!: number;

  @IsOptional()
  @IsNumber()
  cost?: number;

  @IsNumber()
  quantity!: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  brandImageUrl?: string;

  @IsBoolean()
  inStock!: boolean;

  @IsString()
  createdAt!: string;

  @IsString()
  updatedAt!: string;

  @IsString()
  createdBy!: string;

  @IsOptional()
  @IsNumber()
  minStock?: number;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

// Search result wrapper
export class TireSearchResultDto {
  @IsArray()
  items!: TireDto[];

  @IsNumber()
  total!: number;

  @IsNumber()
  page!: number;

  @IsNumber()
  limit!: number;

  @IsNumber()
  totalPages!: number;

  @IsBoolean()
  hasMore!: boolean;
}

// Inventory report DTO
export class InventoryReportDto {
  @IsNumber()
  totalValue!: number;

  @IsNumber()
  totalCost!: number;

  @IsNumber()
  totalItems!: number;

  @IsArray()
  lowStockItems!: any[]; // This would be Tire[] but we don't want circular deps

  @IsOptional()
  byBrand?: Record<string, number>;

  @IsOptional()
  byType?: Record<string, number>;
}