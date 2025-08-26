import { IsString, IsOptional, IsNotEmpty, IsEmail, ValidateIf } from 'class-validator';

export class CreateCustomerDto {
  @ValidateIf((o) => o.email !== '' && o.email != null)
  @IsEmail({}, { message: 'Please enter a valid email address' })
  email?: string;

  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;

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