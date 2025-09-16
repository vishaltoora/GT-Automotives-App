"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ITokenPayloadDto = exports.IRegisterResponseDto = exports.IRegisterRequestDto = exports.ILoginResponseDto = exports.ILoginRequestDto = exports.IAuthContextDto = exports.LoginUserDto = exports.EmailAddressDto = exports.PermissionReferenceDto = exports.IUserDto = exports.IRoleDto = exports.IPermissionDto = exports.ClerkUserDto = exports.AuthResponseDto = exports.RegisterRequestDto = exports.LoginRequestDto = exports.UserContextDto = exports.AuthUserDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const enums_dto_1 = require("../common/enums.dto");
// Enhanced Auth DTOs based on interfaces
class AuthUserDto {
    id;
    clerkId;
    email;
    firstName;
    lastName;
    role;
    permissions;
}
exports.AuthUserDto = AuthUserDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AuthUserDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AuthUserDto.prototype, "clerkId", void 0);
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], AuthUserDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AuthUserDto.prototype, "firstName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AuthUserDto.prototype, "lastName", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(enums_dto_1.RoleName),
    __metadata("design:type", String)
], AuthUserDto.prototype, "role", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => PermissionReferenceDto),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], AuthUserDto.prototype, "permissions", void 0);
class UserContextDto {
    user;
    loading;
    error;
}
exports.UserContextDto = UserContextDto;
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => AuthUserDto),
    __metadata("design:type", AuthUserDto)
], UserContextDto.prototype, "user", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UserContextDto.prototype, "loading", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UserContextDto.prototype, "error", void 0);
class LoginRequestDto {
    email;
    password;
}
exports.LoginRequestDto = LoginRequestDto;
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], LoginRequestDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoginRequestDto.prototype, "password", void 0);
class RegisterRequestDto {
    email;
    password;
    firstName;
    lastName;
    phone;
}
exports.RegisterRequestDto = RegisterRequestDto;
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], RegisterRequestDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterRequestDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterRequestDto.prototype, "firstName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterRequestDto.prototype, "lastName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterRequestDto.prototype, "phone", void 0);
class AuthResponseDto {
    user;
    accessToken;
    refreshToken;
}
exports.AuthResponseDto = AuthResponseDto;
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => AuthUserDto),
    __metadata("design:type", AuthUserDto)
], AuthResponseDto.prototype, "user", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AuthResponseDto.prototype, "accessToken", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AuthResponseDto.prototype, "refreshToken", void 0);
class ClerkUserDto {
    id;
    emailAddresses;
    firstName;
    lastName;
    publicMetadata;
    privateMetadata;
    unsafeMetadata;
    createdAt;
    updatedAt;
}
exports.ClerkUserDto = ClerkUserDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ClerkUserDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => EmailAddressDto),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], ClerkUserDto.prototype, "emailAddresses", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ClerkUserDto.prototype, "firstName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ClerkUserDto.prototype, "lastName", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], ClerkUserDto.prototype, "publicMetadata", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], ClerkUserDto.prototype, "privateMetadata", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], ClerkUserDto.prototype, "unsafeMetadata", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ClerkUserDto.prototype, "createdAt", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ClerkUserDto.prototype, "updatedAt", void 0);
// Legacy Interface DTOs for backward compatibility
// Define classes in dependency order to avoid circular references
class IPermissionDto {
    id;
    name;
    description;
    resource;
    action;
}
exports.IPermissionDto = IPermissionDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], IPermissionDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IPermissionDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], IPermissionDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IPermissionDto.prototype, "resource", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IPermissionDto.prototype, "action", void 0);
class IRoleDto {
    id;
    name;
    description;
    permissions;
}
exports.IRoleDto = IRoleDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], IRoleDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IRoleDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], IRoleDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => IPermissionDto),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], IRoleDto.prototype, "permissions", void 0);
class IUserDto {
    id;
    email;
    firstName;
    lastName;
    phone;
    role;
    isActive;
    createdAt;
    updatedAt;
}
exports.IUserDto = IUserDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IUserDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], IUserDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IUserDto.prototype, "firstName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IUserDto.prototype, "lastName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], IUserDto.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => IRoleDto),
    __metadata("design:type", IRoleDto)
], IUserDto.prototype, "role", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], IUserDto.prototype, "isActive", void 0);
// Support DTOs - defined first to avoid circular dependencies
class PermissionReferenceDto {
    resource;
    action;
}
exports.PermissionReferenceDto = PermissionReferenceDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PermissionReferenceDto.prototype, "resource", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PermissionReferenceDto.prototype, "action", void 0);
class EmailAddressDto {
    id;
    emailAddress;
}
exports.EmailAddressDto = EmailAddressDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EmailAddressDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], EmailAddressDto.prototype, "emailAddress", void 0);
class LoginUserDto {
    id;
    email;
    firstName;
    lastName;
    role;
}
exports.LoginUserDto = LoginUserDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoginUserDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], LoginUserDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoginUserDto.prototype, "firstName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoginUserDto.prototype, "lastName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoginUserDto.prototype, "role", void 0);
class IAuthContextDto {
    user;
    isAuthenticated;
    isLoading;
    role;
}
exports.IAuthContextDto = IAuthContextDto;
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => IUserDto),
    __metadata("design:type", IUserDto)
], IAuthContextDto.prototype, "user", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], IAuthContextDto.prototype, "isAuthenticated", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], IAuthContextDto.prototype, "isLoading", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IAuthContextDto.prototype, "role", void 0);
class ILoginRequestDto {
    email;
    password;
}
exports.ILoginRequestDto = ILoginRequestDto;
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], ILoginRequestDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ILoginRequestDto.prototype, "password", void 0);
class ILoginResponseDto {
    access_token;
    user;
}
exports.ILoginResponseDto = ILoginResponseDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ILoginResponseDto.prototype, "access_token", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => LoginUserDto),
    __metadata("design:type", LoginUserDto)
], ILoginResponseDto.prototype, "user", void 0);
class IRegisterRequestDto {
    email;
    password;
    firstName;
    lastName;
    phone;
}
exports.IRegisterRequestDto = IRegisterRequestDto;
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], IRegisterRequestDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IRegisterRequestDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IRegisterRequestDto.prototype, "firstName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IRegisterRequestDto.prototype, "lastName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], IRegisterRequestDto.prototype, "phone", void 0);
class IRegisterResponseDto {
    access_token;
    user;
}
exports.IRegisterResponseDto = IRegisterResponseDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IRegisterResponseDto.prototype, "access_token", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => LoginUserDto),
    __metadata("design:type", LoginUserDto)
], IRegisterResponseDto.prototype, "user", void 0);
class ITokenPayloadDto {
    sub;
    email;
    role;
    iat;
    exp;
}
exports.ITokenPayloadDto = ITokenPayloadDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ITokenPayloadDto.prototype, "sub", void 0);
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], ITokenPayloadDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ITokenPayloadDto.prototype, "role", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], ITokenPayloadDto.prototype, "iat", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], ITokenPayloadDto.prototype, "exp", void 0);
