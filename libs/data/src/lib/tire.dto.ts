import { PartialType } from './utils/mapped-types';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { TireCondition, TireType } from './prisma-enums';

export { TireCondition, TireType };

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
  @Type(() => Number)
  price!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  cost?: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
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
  @Type(() => Number)
  minStock?: number;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateTireDto extends PartialType(CreateTireDto) {}

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
  @Type(() => Number)
  price!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  cost?: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
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

  @IsOptional()
  @IsBoolean()
  isLowStock?: boolean;

  @IsString()
  createdAt!: string;

  @IsString()
  updatedAt!: string;

  @IsString()
  createdBy!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
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
  @Type(() => Number)
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
  @Type(() => Number)
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  maxPrice?: number;

  @IsOptional()
  @IsBoolean()
  inStock?: boolean;

  @IsOptional()
  @IsBoolean()
  lowStock?: boolean;
}

export class TireSearchParamsDto extends TireFiltersDto {
  @IsOptional()
  @IsString()
  search?: string;

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

export class TireSearchDto extends TireSearchParamsDto {}

export class TireSearchResultResponseDto {
  @IsArray()
  items!: TireResponseDto[];

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

export interface TireImageDto {
  id: string;
  url: string;
  alt?: string;
}

export class InventoryReportDto {
  @IsNumber()
  totalValue!: number;

  @IsNumber()
  totalCost!: number;

  @IsNumber()
  totalItems!: number;

  @IsArray()
  lowStockItems!: TireResponseDto[];

  @IsOptional()
  byBrand?: Record<string, number>;

  @IsOptional()
  byType?: Record<string, number>;
}

// Export with original names for consistency
export type { TireSearchResultResponseDto as TireSearchResultDto };
export type { TireImageDto as TireImageResponseDto };

// Legacy type aliases for backward compatibility
export type TireDto = TireResponseDto;
export type ITire = TireResponseDto;
export type ITireCreateInput = CreateTireDto;
export type ITireUpdateInput = UpdateTireDto;
export type ITireSearchParams = TireSearchParamsDto;
export type ITireSearchResult = TireSearchResultResponseDto;
export type ITireImage = TireImageDto;
