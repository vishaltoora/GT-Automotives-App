import { IsString, IsOptional, IsEmail, ValidateIf, Matches } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @ValidateIf((o) => o.email !== '' && o.email !== null && o.email !== undefined)
  @IsEmail()
  email?: string;

  @ValidateIf((o) => o.phone !== '' && o.phone !== null && o.phone !== undefined)
  @Matches(/^[\d\s\-\(\)]+$/, { message: 'Phone number can only contain digits, spaces, dashes, and parentheses' })
  @Matches(/\d{10}/, { message: 'Phone number must contain exactly 10 digits' })
  phone?: string;

  @ValidateIf((o) => o.address !== '' && o.address !== null && o.address !== undefined)
  @IsString()
  address?: string;

  @ValidateIf((o) => o.businessName !== '' && o.businessName !== null && o.businessName !== undefined)
  @IsString()
  businessName?: string;
}

export class UpdateCustomerDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @ValidateIf((o) => o.email !== '' && o.email !== null && o.email !== undefined)
  @IsEmail()
  email?: string;

  @ValidateIf((o) => o.phone !== '' && o.phone !== null && o.phone !== undefined)
  @Matches(/^[\d\s\-\(\)]+$/, { message: 'Phone number can only contain digits, spaces, dashes, and parentheses' })
  @Matches(/\d{10}/, { message: 'Phone number must contain exactly 10 digits' })
  phone?: string;

  @ValidateIf((o) => o.address !== '' && o.address !== null && o.address !== undefined)
  @IsString()
  address?: string;

  @ValidateIf((o) => o.businessName !== '' && o.businessName !== null && o.businessName !== undefined)
  @IsString()
  businessName?: string;
}

export class CustomerResponseDto {
  @IsString()
  id!: string;

  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  businessName?: string;

  @IsString()
  createdAt!: string;

  @IsString()
  updatedAt!: string;
}