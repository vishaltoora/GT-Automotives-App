"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignRoleDto = exports.AuthUserContextDto = void 0;
class AuthUserContextDto {
    id;
    email;
    firstName;
    lastName;
    role;
    permissions;
}
exports.AuthUserContextDto = AuthUserContextDto;
class AssignRoleDto {
    userId;
    role;
}
exports.AssignRoleDto = AssignRoleDto;
