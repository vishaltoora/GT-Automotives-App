import { RoleName } from '../common/enums.dto';
export declare class AuthUserDto {
    id: string;
    clerkId: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: RoleName;
    permissions: PermissionReferenceDto[];
}
export declare class UserContextDto {
    user?: AuthUserDto;
    loading: boolean;
    error?: string;
}
export declare class LoginRequestDto {
    email: string;
    password: string;
}
export declare class RegisterRequestDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
}
export declare class AuthResponseDto {
    user: AuthUserDto;
    accessToken?: string;
    refreshToken?: string;
}
export declare class ClerkUserDto {
    id: string;
    emailAddresses: EmailAddressDto[];
    firstName?: string;
    lastName?: string;
    publicMetadata?: Record<string, any>;
    privateMetadata?: Record<string, any>;
    unsafeMetadata?: Record<string, any>;
    createdAt: string;
    updatedAt: string;
}
export declare class IPermissionDto {
    id: number;
    name: string;
    description?: string;
    resource: string;
    action: string;
}
export declare class IRoleDto {
    id: number;
    name: string;
    description?: string;
    permissions?: IPermissionDto[];
}
export declare class IUserDto {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: IRoleDto;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare class PermissionReferenceDto {
    resource: string;
    action: string;
}
export declare class EmailAddressDto {
    id: string;
    emailAddress: string;
}
export declare class LoginUserDto {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
}
export declare class IAuthContextDto {
    user?: IUserDto;
    isAuthenticated: boolean;
    isLoading: boolean;
    role?: string;
}
export declare class ILoginRequestDto {
    email: string;
    password: string;
}
export declare class ILoginResponseDto {
    access_token: string;
    user: LoginUserDto;
}
export declare class IRegisterRequestDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
}
export declare class IRegisterResponseDto {
    access_token: string;
    user: LoginUserDto;
}
export declare class ITokenPayloadDto {
    sub: string;
    email: string;
    role: string;
    iat?: number;
    exp?: number;
}
