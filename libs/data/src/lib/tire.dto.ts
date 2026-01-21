import { IsString, IsNumber, IsEnum, IsOptional, Min } from './decorators';

export enum TireType {
  ALL_SEASON = 'ALL_SEASON',
  SUMMER = 'SUMMER',
  WINTER = 'WINTER',
  PERFORMANCE = 'PERFORMANCE',
  OFF_ROAD = 'OFF_ROAD',
}

export enum TireCondition {
  NEW = 'NEW',
  USED_EXCELLENT = 'USED_EXCELLENT',
  USED_GOOD = 'USED_GOOD',
  USED_FAIR = 'USED_FAIR',
}

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

  @IsNumber()
  @Min(0)
  cost!: number;

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

export class UpdateTireDto implements Partial<CreateTireDto> {
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

export interface TireResponseDto {
  id: string;
  name?: string;
  sku?: string;
  brand: string;
  size: string;
  type: TireType;
  condition: TireCondition;
  price: number;
  cost?: number;
  quantity: number;
  description?: string;
  imageUrl?: string;
  brandImageUrl?: string;
  inStock: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  minStock?: number;
  location?: string;
  notes?: string;
}

export interface StockAdjustmentDto {
  quantity: number;
  type: AdjustmentType;
  reason?: string;
}

export interface TireFiltersDto {
  brand?: string;
  size?: string;
  type?: TireType;
  condition?: TireCondition;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  lowStock?: boolean;
}

export interface TireSearchParamsDto {
  search?: string;
  brand?: string;
  size?: string;
  type?: TireType;
  condition?: TireCondition;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  lowStock?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface TireSearchResultResponseDto {
  items: TireResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

export interface TireImageDto {
  id: string;
  url: string;
  alt?: string;
}

export interface InventoryReportDto {
  totalValue: number;
  totalCost: number;
  totalItems: number;
  lowStockItems: TireResponseDto[];
}

// Export with original names for consistency
export type { TireSearchParamsDto as TireSearchDto };
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