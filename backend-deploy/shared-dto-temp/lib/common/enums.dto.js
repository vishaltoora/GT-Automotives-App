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
exports.PERMISSIONS = exports.RolePermissionsConfigDto = exports.PermissionDefinitionDto = exports.Action = exports.Resource = exports.RoleName = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
// Core Role Enums
var RoleName;
(function (RoleName) {
    RoleName["CUSTOMER"] = "CUSTOMER";
    RoleName["STAFF"] = "STAFF";
    RoleName["ADMIN"] = "ADMIN";
})(RoleName || (exports.RoleName = RoleName = {}));
var Resource;
(function (Resource) {
    Resource["USERS"] = "users";
    Resource["CUSTOMERS"] = "customers";
    Resource["VEHICLES"] = "vehicles";
    Resource["TIRES"] = "tires";
    Resource["INVOICES"] = "invoices";
    Resource["APPOINTMENTS"] = "appointments";
    Resource["REPORTS"] = "reports";
    Resource["SETTINGS"] = "settings";
})(Resource || (exports.Resource = Resource = {}));
var Action;
(function (Action) {
    Action["CREATE"] = "create";
    Action["READ"] = "read";
    Action["UPDATE"] = "update";
    Action["DELETE"] = "delete";
    Action["EXPORT"] = "export";
    Action["APPROVE"] = "approve";
})(Action || (exports.Action = Action = {}));
// Permission Definition DTO
class PermissionDefinitionDto {
    resource;
    action;
}
exports.PermissionDefinitionDto = PermissionDefinitionDto;
__decorate([
    (0, class_validator_1.IsEnum)(Resource),
    __metadata("design:type", String)
], PermissionDefinitionDto.prototype, "resource", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(Action),
    __metadata("design:type", String)
], PermissionDefinitionDto.prototype, "action", void 0);
// Role Permissions Configuration DTO
class RolePermissionsConfigDto {
    role;
    permissions;
}
exports.RolePermissionsConfigDto = RolePermissionsConfigDto;
__decorate([
    (0, class_validator_1.IsEnum)(RoleName),
    __metadata("design:type", String)
], RolePermissionsConfigDto.prototype, "role", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => PermissionDefinitionDto),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], RolePermissionsConfigDto.prototype, "permissions", void 0);
// Permissions Configuration
exports.PERMISSIONS = {
    // Customer permissions - limited to own data
    [RoleName.CUSTOMER]: [
        { resource: Resource.CUSTOMERS, action: Action.READ }, // Own data only
        { resource: Resource.VEHICLES, action: Action.READ }, // Own vehicles
        { resource: Resource.VEHICLES, action: Action.CREATE },
        { resource: Resource.VEHICLES, action: Action.UPDATE },
        { resource: Resource.INVOICES, action: Action.READ }, // Own invoices
        { resource: Resource.APPOINTMENTS, action: Action.CREATE },
        { resource: Resource.APPOINTMENTS, action: Action.READ },
        { resource: Resource.APPOINTMENTS, action: Action.UPDATE }, // Own appointments
    ],
    // Staff permissions - operational access
    [RoleName.STAFF]: [
        // All customer permissions
        { resource: Resource.CUSTOMERS, action: Action.READ }, // Own data only
        { resource: Resource.VEHICLES, action: Action.READ }, // Own vehicles
        { resource: Resource.VEHICLES, action: Action.CREATE },
        { resource: Resource.VEHICLES, action: Action.UPDATE },
        { resource: Resource.INVOICES, action: Action.READ }, // Own invoices
        { resource: Resource.APPOINTMENTS, action: Action.CREATE },
        { resource: Resource.APPOINTMENTS, action: Action.READ },
        { resource: Resource.APPOINTMENTS, action: Action.UPDATE },
        // Additional staff permissions
        { resource: Resource.CUSTOMERS, action: Action.CREATE },
        { resource: Resource.CUSTOMERS, action: Action.UPDATE },
        { resource: Resource.VEHICLES, action: Action.DELETE },
        { resource: Resource.TIRES, action: Action.READ },
        { resource: Resource.TIRES, action: Action.UPDATE }, // Inventory only
        { resource: Resource.INVOICES, action: Action.CREATE },
        { resource: Resource.INVOICES, action: Action.UPDATE },
        { resource: Resource.APPOINTMENTS, action: Action.DELETE },
    ],
    // Admin permissions - full access plus management
    [RoleName.ADMIN]: [
        // All staff permissions
        { resource: Resource.CUSTOMERS, action: Action.READ },
        { resource: Resource.CUSTOMERS, action: Action.CREATE },
        { resource: Resource.CUSTOMERS, action: Action.UPDATE },
        { resource: Resource.VEHICLES, action: Action.READ },
        { resource: Resource.VEHICLES, action: Action.CREATE },
        { resource: Resource.VEHICLES, action: Action.UPDATE },
        { resource: Resource.VEHICLES, action: Action.DELETE },
        { resource: Resource.TIRES, action: Action.READ },
        { resource: Resource.TIRES, action: Action.UPDATE },
        { resource: Resource.INVOICES, action: Action.CREATE },
        { resource: Resource.INVOICES, action: Action.READ },
        { resource: Resource.INVOICES, action: Action.UPDATE },
        { resource: Resource.APPOINTMENTS, action: Action.CREATE },
        { resource: Resource.APPOINTMENTS, action: Action.READ },
        { resource: Resource.APPOINTMENTS, action: Action.UPDATE },
        { resource: Resource.APPOINTMENTS, action: Action.DELETE },
        // Admin-only permissions
        { resource: Resource.USERS, action: Action.CREATE },
        { resource: Resource.USERS, action: Action.READ },
        { resource: Resource.USERS, action: Action.UPDATE },
        { resource: Resource.USERS, action: Action.DELETE },
        { resource: Resource.CUSTOMERS, action: Action.DELETE },
        { resource: Resource.TIRES, action: Action.CREATE },
        { resource: Resource.TIRES, action: Action.DELETE },
        { resource: Resource.INVOICES, action: Action.DELETE },
        { resource: Resource.INVOICES, action: Action.APPROVE },
        { resource: Resource.REPORTS, action: Action.READ },
        { resource: Resource.REPORTS, action: Action.EXPORT },
        { resource: Resource.SETTINGS, action: Action.READ },
        { resource: Resource.SETTINGS, action: Action.UPDATE },
    ],
};
