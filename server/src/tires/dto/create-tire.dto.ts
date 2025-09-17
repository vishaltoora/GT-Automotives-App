import { IsString, IsNumber, IsEnum, IsOptional, Min } from 'class-validator';

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
}