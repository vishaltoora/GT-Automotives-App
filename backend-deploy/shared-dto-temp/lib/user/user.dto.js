"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserResponseDto = exports.UpdateUserDto = exports.CreateUserDto = void 0;
// Re-export user DTOs from auth module for backward compatibility
var auth_user_dto_1 = require("../auth/auth-user.dto");
Object.defineProperty(exports, "CreateUserDto", { enumerable: true, get: function () { return auth_user_dto_1.AuthCreateUserDto; } });
Object.defineProperty(exports, "UpdateUserDto", { enumerable: true, get: function () { return auth_user_dto_1.AuthUpdateUserDto; } });
Object.defineProperty(exports, "UserResponseDto", { enumerable: true, get: function () { return auth_user_dto_1.AuthUserResponseDto; } });
