"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VehicleResponseDto = exports.UpdateVehicleDto = exports.CreateVehicleDto = void 0;
const tslib_1 = require("tslib");
const decorators_1 = require("./decorators");
class CreateVehicleDto {
}
exports.CreateVehicleDto = CreateVehicleDto;
tslib_1.__decorate([
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateVehicleDto.prototype, "make", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateVehicleDto.prototype, "model", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], CreateVehicleDto.prototype, "year", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateVehicleDto.prototype, "vin", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateVehicleDto.prototype, "licensePlate", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateVehicleDto.prototype, "color", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], CreateVehicleDto.prototype, "mileage", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateVehicleDto.prototype, "customerId", void 0);
class UpdateVehicleDto {
}
exports.UpdateVehicleDto = UpdateVehicleDto;
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], UpdateVehicleDto.prototype, "make", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], UpdateVehicleDto.prototype, "model", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], UpdateVehicleDto.prototype, "year", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], UpdateVehicleDto.prototype, "vin", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], UpdateVehicleDto.prototype, "licensePlate", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], UpdateVehicleDto.prototype, "color", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], UpdateVehicleDto.prototype, "mileage", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], UpdateVehicleDto.prototype, "customerId", void 0);
class VehicleResponseDto {
}
exports.VehicleResponseDto = VehicleResponseDto;
tslib_1.__decorate([
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], VehicleResponseDto.prototype, "id", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], VehicleResponseDto.prototype, "make", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], VehicleResponseDto.prototype, "model", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], VehicleResponseDto.prototype, "year", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], VehicleResponseDto.prototype, "vin", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], VehicleResponseDto.prototype, "licensePlate", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], VehicleResponseDto.prototype, "color", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], VehicleResponseDto.prototype, "customerId", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    tslib_1.__metadata("design:type", Object)
], VehicleResponseDto.prototype, "customer", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], VehicleResponseDto.prototype, "createdAt", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], VehicleResponseDto.prototype, "updatedAt", void 0);
