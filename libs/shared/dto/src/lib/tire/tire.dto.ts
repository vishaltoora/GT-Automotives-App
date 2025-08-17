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
} from 'class-validator';
import { Exclude } from 'class-transformer';
import { TireType, TireCondition } from '@gt-automotive/shared-interfaces';

export class CreateTireDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  brand: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  model: string;

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
  @MaxLength(100)
  model?: string;

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

export class TireSearchDto {
  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  model?: string;

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
  @Max(99999)
  maxPrice?: number;

  @IsOptional()
  @IsBoolean()
  inStock?: boolean;

  @IsOptional()
  @IsBoolean()
  lowStock?: boolean;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(['brand', 'model', 'size', 'price', 'quantity', 'updatedAt'])
  sortBy?: 'brand' | 'model' | 'size' | 'price' | 'quantity' | 'updatedAt';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';

  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;
}

export class TireResponseDto {
  id: string;
  brand: string;
  model: string;
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