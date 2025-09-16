"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginResponseDto = exports.LoginDto = void 0;
class LoginDto {
    email;
    password;
}
exports.LoginDto = LoginDto;
class LoginResponseDto {
    accessToken;
    refreshToken;
    user;
}
exports.LoginResponseDto = LoginResponseDto;
