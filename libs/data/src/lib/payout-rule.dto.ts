import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreatePayoutRuleDto {
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  triggerAmount!: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  payoutAmount!: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdatePayoutRuleDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  triggerAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  payoutAmount?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class PayoutRuleResponseDto {
  id!: string;
  triggerAmount!: number;
  payoutAmount!: number;
  description?: string;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}
