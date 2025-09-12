import { IsString, IsNumber, IsEnum, IsOptional, IsPositive, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { TireType, TireCondition } from '@prisma/client';

export class TireDto {
  @IsString()
  id!: string;

  @IsString()
  brand!: string;

  @IsString()
  size!: string;

  @IsEnum(TireType)
  type!: TireType;

  @IsEnum(TireCondition)
  condition!: TireCondition;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  price!: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  cost?: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  quantity!: number;

  @IsString()
  @IsOptional()
  location?: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  minStock!: number;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export class CreateTireDto {
  @IsString()
  brand!: string;

  @IsString()
  size!: string;

  @IsEnum(TireType)
  type!: TireType;

  @IsEnum(TireCondition)
  condition!: TireCondition;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  price!: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  cost?: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  quantity!: number;

  @IsString()
  @IsOptional()
  location?: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  minStock!: number;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateTireDto {
  @IsString()
  @IsOptional()
  brand?: string;

  @IsString()
  @IsOptional()
  size?: string;

  @IsEnum(TireType)
  @IsOptional()
  type?: TireType;

  @IsEnum(TireCondition)
  @IsOptional()
  condition?: TireCondition;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  price?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  cost?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  quantity?: number;

  @IsString()
  @IsOptional()
  location?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  minStock?: number;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class TireFiltersDto {
  @IsString()
  @IsOptional()
  brand?: string;

  @IsString()
  @IsOptional()
  size?: string;

  @IsEnum(TireType)
  @IsOptional()
  type?: TireType;

  @IsEnum(TireCondition)
  @IsOptional()
  condition?: TireCondition;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  minPrice?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  maxPrice?: number;

  @IsString()
  @IsOptional()
  location?: string;
}

export class TireSearchDto extends TireFiltersDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  limit?: number;

  @IsString()
  @IsOptional()
  sortBy?: string;

  @IsString()
  @IsOptional()
  sortOrder?: 'asc' | 'desc';
}

export class TireSearchResultDto {
  items!: TireDto[];
  total!: number;
  page!: number;
  limit!: number;
  hasMore!: boolean;
}