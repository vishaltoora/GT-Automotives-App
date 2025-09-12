import { 
  IsString, 
  IsEmail, 
  IsOptional, 
  IsUUID, 
  IsDateString,
  ValidateNested,
  IsArray,
  IsNumber,
  Min
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCustomerDto {
  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  businessName?: string;
}

export class UpdateCustomerDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  businessName?: string;
}

export class CustomerDto {
  @IsUUID()
  id!: string;

  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  businessName?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  vehicleCount?: number;

  @IsDateString()
  createdAt!: Date;

  @IsDateString()
  updatedAt!: Date;
}

// Additional simple reference DTOs
export class CustomerReferenceDto {
  @IsUUID()
  id!: string;

  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;
}