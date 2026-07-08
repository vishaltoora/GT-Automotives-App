import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateTerminalCheckoutDto {
  @IsString()
  invoiceId!: string;

  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  amount!: number;

  @IsString()
  deviceId!: string;

  @IsString()
  @IsOptional()
  currency?: string;
}

// Pay several invoices with one in-person card-reader tap. The combined
// remaining balance is charged once; each invoice is settled on completion.
export class CreateBulkTerminalCheckoutDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  invoiceIds!: string[];

  @IsString()
  deviceId!: string;

  @IsString()
  @IsOptional()
  currency?: string;
}

export class TerminalCheckoutResponseDto {
  checkoutId!: string;
  status!: string;
  deviceId!: string;
  amount!: number;
  invoiceId!: string;
  createdAt!: Date;

  constructor(partial: Partial<TerminalCheckoutResponseDto>) {
    Object.assign(this, partial);
  }
}

export class TerminalDeviceDto {
  id!: string;
  name!: string;
  code!: string;
  status!: string;
  deviceType!: string;

  constructor(partial: Partial<TerminalDeviceDto>) {
    Object.assign(this, partial);
  }
}

// Generate a Terminal API device code to pair a Square reader. The returned
// `code` is entered on the physical Terminal to complete pairing.
export class CreateTerminalDeviceCodeDto {
  @IsString()
  @IsOptional()
  name?: string;
}

export class TerminalDeviceCodeResponseDto {
  id!: string;
  code!: string;
  status!: string;
  name?: string;

  constructor(partial: Partial<TerminalDeviceCodeResponseDto>) {
    Object.assign(this, partial);
  }
}
