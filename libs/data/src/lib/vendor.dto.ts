import { PartialType } from './utils/mapped-types';
import { IsBoolean, IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateVendorDto {
  @IsString()
  @MaxLength(100)
  name!: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  contactPerson?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  address?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  taxId?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  paymentTerms?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateVendorDto extends PartialType(CreateVendorDto) {}

export class VendorResponseDto {
  id!: string;
  name!: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  paymentTerms?: string;
  isActive!: boolean;
  notes?: string;
  createdAt!: Date | string;
  updatedAt!: Date | string;
  _count?: {
    purchaseInvoices: number;
    expenseInvoices: number;
  };
}

export class VendorSearchDto {
  @IsString()
  @IsOptional()
  query?: string;

  @IsString()
  @IsOptional()
  limit?: string;
}

export interface VendorListResponse {
  data: VendorResponseDto[];
  total: number;
  page: number;
  limit: number;
}

export type VendorDto = VendorResponseDto;
