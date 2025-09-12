import { 
  IsString, 
  IsEmail, 
  IsOptional, 
  IsBoolean, 
  IsArray, 
  ValidateNested,
  IsNumber,
  IsObject,
  IsEnum
} from 'class-validator';
import { Type } from 'class-transformer';
import { RoleName } from '../common/enums.dto';

// Enhanced Auth DTOs based on interfaces
export class AuthUserDto {
  @IsString()
  id!: string;

  @IsString()
  clerkId!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsEnum(RoleName)
  role!: RoleName;

  @ValidateNested({ each: true })
  @Type(() => PermissionReferenceDto)
  @IsArray()
  permissions!: PermissionReferenceDto[];
}

export class UserContextDto {
  @ValidateNested()
  @Type(() => AuthUserDto)
  user?: AuthUserDto;

  @IsBoolean()
  loading!: boolean;

  @IsString()
  @IsOptional()
  error?: string;
}

export class LoginRequestDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}

export class RegisterRequestDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;

  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsString()
  phone!: string;
}

export class AuthResponseDto {
  @ValidateNested()
  @Type(() => AuthUserDto)
  user!: AuthUserDto;

  @IsString()
  @IsOptional()
  accessToken?: string;

  @IsString()
  @IsOptional()
  refreshToken?: string;
}

export class ClerkUserDto {
  @IsString()
  id!: string;

  @ValidateNested({ each: true })
  @Type(() => EmailAddressDto)
  @IsArray()
  emailAddresses!: EmailAddressDto[];

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsObject()
  @IsOptional()
  publicMetadata?: Record<string, any>;

  @IsObject()
  @IsOptional()
  privateMetadata?: Record<string, any>;

  @IsObject()
  @IsOptional()
  unsafeMetadata?: Record<string, any>;

  @IsString()
  createdAt!: string;

  @IsString()
  updatedAt!: string;
}

// Legacy Interface DTOs for backward compatibility
export class IUserDto {
  @IsString()
  id!: string;

  @IsEmail()
  email!: string;

  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @ValidateNested()
  @Type(() => IRoleDto)
  role!: IRoleDto;

  @IsBoolean()
  isActive!: boolean;

  createdAt!: Date;
  updatedAt!: Date;
}

export class IRoleDto {
  @IsNumber()
  id!: number;

  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @ValidateNested({ each: true })
  @Type(() => IPermissionDto)
  @IsArray()
  @IsOptional()
  permissions?: IPermissionDto[];
}

export class IPermissionDto {
  @IsNumber()
  id!: number;

  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  resource!: string;

  @IsString()
  action!: string;
}

export class IAuthContextDto {
  @ValidateNested()
  @Type(() => IUserDto)
  user?: IUserDto;

  @IsBoolean()
  isAuthenticated!: boolean;

  @IsBoolean()
  isLoading!: boolean;

  @IsString()
  role?: string;
}

export class ILoginRequestDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}

export class ILoginResponseDto {
  @IsString()
  access_token!: string;

  @ValidateNested()
  @Type(() => LoginUserDto)
  user!: LoginUserDto;
}

export class IRegisterRequestDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;

  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsString()
  @IsOptional()
  phone?: string;
}

export class IRegisterResponseDto {
  @IsString()
  access_token!: string;

  @ValidateNested()
  @Type(() => LoginUserDto)
  user!: LoginUserDto;
}

export class ITokenPayloadDto {
  @IsString()
  sub!: string;

  @IsEmail()
  email!: string;

  @IsString()
  role!: string;

  @IsNumber()
  @IsOptional()
  iat?: number;

  @IsNumber()
  @IsOptional()
  exp?: number;
}

// Support DTOs
export class PermissionReferenceDto {
  @IsString()
  resource!: string;

  @IsString()
  action!: string;
}

export class EmailAddressDto {
  @IsString()
  id!: string;

  @IsEmail()
  emailAddress!: string;
}

export class LoginUserDto {
  @IsString()
  id!: string;

  @IsEmail()
  email!: string;

  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsString()
  role!: string;
}