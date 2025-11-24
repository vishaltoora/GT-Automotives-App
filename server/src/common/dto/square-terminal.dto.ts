import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateTerminalCheckoutDto {
  @IsString()
  invoiceId!: string;

  @IsNumber()
  @Min(0.01)
  amount!: number;

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
