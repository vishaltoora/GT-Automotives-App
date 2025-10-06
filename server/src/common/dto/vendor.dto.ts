import { IsString, IsEmail, IsOptional, IsBoolean, MaxLength } from 'class-validator';

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

export class UpdateVendorDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

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
  createdAt!: Date;
  updatedAt!: Date;
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
