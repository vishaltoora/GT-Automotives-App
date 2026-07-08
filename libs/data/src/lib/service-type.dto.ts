import { PartialType } from './utils/mapped-types';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateServiceTypeDto {
  // Optional stable code stored on appointments (e.g. "TIRE_CHANGE").
  // When omitted the backend derives one from the name.
  @IsString()
  @IsOptional()
  @MaxLength(50)
  code?: string;

  @IsString()
  @MaxLength(100)
  name!: string;

  @IsInt()
  @Min(15)
  @Max(480)
  @Type(() => Number)
  duration!: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  sortOrder?: number;
}

export class UpdateServiceTypeDto extends PartialType(CreateServiceTypeDto) {}

export class ServiceTypeResponseDto {
  id!: string;
  code!: string;
  name!: string;
  duration!: number;
  isActive!: boolean;
  sortOrder!: number;
  createdAt!: Date | string;
  updatedAt!: Date | string;
}
