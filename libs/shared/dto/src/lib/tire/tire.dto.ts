import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsPositive,
  Min,
  Max,
  IsUrl,
  MinLength,
  MaxLength,
  IsBoolean,
  IsInt,
  IsDateString,
} from 'class-validator';
import { Exclude, Type } from 'class-transformer';
import { TireType, TireCondition } from '@prisma/client';

export class CreateTireDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  brand: string;

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  size: string;

  @IsEnum(TireType)
  type: TireType;

  @IsEnum(TireCondition)
  condition: TireCondition;

  @IsInt()
  @Min(0)
  quantity: number;

  @IsNumber()
  @IsPositive()
  @Max(99999)
  price: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Max(99999)
  cost?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  location?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minStock?: number;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

export class UpdateTireDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  brand?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  size?: string;

  @IsOptional()
  @IsEnum(TireType)
  type?: TireType;

  @IsOptional()
  @IsEnum(TireCondition)
  condition?: TireCondition;

  @IsOptional()
  @IsInt()
  @Min(0)
  quantity?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Max(99999)
  price?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Max(99999)
  cost?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  location?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minStock?: number;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

export class StockAdjustmentDto {
  @IsInt()
  quantity: number;

  @IsEnum(['add', 'remove', 'set'])
  type: 'add' | 'remove' | 'set';

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  reason: string;
}

// Alternative DTO for different stock adjustment patterns
export class StockAdjustmentWithIdDto {
  @IsString()
  tireId: string;

  @IsInt()
  quantityChange: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  reason?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

export class TireSearchDto {
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
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Max(99999)
  maxPrice?: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  inStock?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  lowStock?: boolean;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(['brand', 'size', 'price', 'quantity', 'updatedAt'])
  sortBy?: 'brand' | 'size' | 'price' | 'quantity' | 'updatedAt';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;
}

export class TireResponseDto {
  id: string;
  brand: string;
  size: string;
  type: TireType;
  condition: TireCondition;
  quantity: number;
  price: number;
  
  @Exclude({ toPlainOnly: true })
  cost?: number; // Only included for admin
  
  location?: string;
  minStock: number;
  imageUrl?: string;
  notes?: string;
  isLowStock?: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<TireResponseDto>) {
    Object.assign(this, partial);
  }
}

// Simple DTO for basic tire data (used in some legacy contexts)
export class TireDto {
  @IsString()
  id: string;

  @IsString()
  brand: string;

  @IsString()
  size: string;

  @IsEnum(TireType)
  type: TireType;

  @IsEnum(TireCondition)
  condition: TireCondition;

  @IsNumber()
  @IsPositive()
  price: number;

  @IsOptional()
  @IsNumber()
  cost?: number;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsOptional()
  @IsString()
  location?: string;

  @IsNumber()
  @Min(0)
  minStock: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  createdAt: Date;
  updatedAt: Date;
}

// Filter DTO that matches the legacy interface
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
  @Type(() => Number)
  @IsNumber()
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPrice?: number;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  inStock?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  lowStock?: boolean;
}

export class TireSearchResultDto {
  items: TireResponseDto[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export class InventoryReportDto {
  totalValue: number;
  totalCost: number;
  totalItems: number;
  lowStockItems: TireResponseDto[];
  byBrand: Record<string, number>;
  byType: Record<TireType, number>;
}

// Additional DTOs to match legacy interface requirements
export class TireImageDto {
  @IsString()
  id!: string;

  @IsString()
  tireId!: string;

  @IsUrl()
  url!: string;

  @IsString()
  @IsOptional()
  filename?: string;

  @IsString()
  @IsOptional()
  alt?: string;

  @IsDateString()
  createdAt!: Date;
}

// Legacy aliases for backward compatibility
export type ITire = TireResponseDto;
export type ITireCreateInput = CreateTireDto;
export type ITireUpdateInput = UpdateTireDto;
export type ITireSearchParams = TireSearchDto;
export type ITireSearchResult = TireSearchResultDto;
export type IStockAdjustment = StockAdjustmentDto;
export type ITireImage = TireImageDto;