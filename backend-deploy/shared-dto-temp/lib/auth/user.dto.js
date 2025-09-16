"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserResponseDto = exports.UpdateUserDto = exports.CreateUserDto = void 0;
// This file is deprecated - use DTOs from @gt-automotive/shared-dto/user instead
// Re-export legacy DTOs for backward compatibility
var auth_user_dto_1 = require("./auth-user.dto");
Object.defineProperty(exports, "CreateUserDto", { enumerable: true, get: function () { return auth_user_dto_1.AuthCreateUserDto; } });
Object.defineProperty(exports, "UpdateUserDto", { enumerable: true, get: function () { return auth_user_dto_1.AuthUpdateUserDto; } });
Object.defineProperty(exports, "UserResponseDto", { enumerable: true, get: function () { return auth_user_dto_1.AuthUserResponseDto; } });
