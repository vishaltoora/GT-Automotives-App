import { IsNumber, IsString, IsOptional, IsEnum } from 'class-validator';

export enum AdjustmentType {
  ADD = 'add',
  REMOVE = 'remove',
  SET = 'set',
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
