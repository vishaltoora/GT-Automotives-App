"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerResponseDto = exports.UpdateCustomerDto = exports.CreateCustomerDto = void 0;
const tslib_1 = require("tslib");
const decorators_1 = require("./decorators");
class CreateCustomerDto {
}
exports.CreateCustomerDto = CreateCustomerDto;
tslib_1.__decorate([
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateCustomerDto.prototype, "firstName", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateCustomerDto.prototype, "lastName", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsEmail)(),
    tslib_1.__metadata("design:type", String)
], CreateCustomerDto.prototype, "email", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateCustomerDto.prototype, "phone", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateCustomerDto.prototype, "address", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateCustomerDto.prototype, "businessName", void 0);
class UpdateCustomerDto {
}
exports.UpdateCustomerDto = UpdateCustomerDto;
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], UpdateCustomerDto.prototype, "firstName", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], UpdateCustomerDto.prototype, "lastName", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsEmail)(),
    tslib_1.__metadata("design:type", String)
], UpdateCustomerDto.prototype, "email", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], UpdateCustomerDto.prototype, "phone", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], UpdateCustomerDto.prototype, "address", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], UpdateCustomerDto.prototype, "businessName", void 0);
class CustomerResponseDto {
}
exports.CustomerResponseDto = CustomerResponseDto;
tslib_1.__decorate([
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CustomerResponseDto.prototype, "id", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CustomerResponseDto.prototype, "firstName", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CustomerResponseDto.prototype, "lastName", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsEmail)(),
    tslib_1.__metadata("design:type", String)
], CustomerResponseDto.prototype, "email", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CustomerResponseDto.prototype, "phone", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CustomerResponseDto.prototype, "address", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CustomerResponseDto.prototype, "businessName", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CustomerResponseDto.prototype, "createdAt", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CustomerResponseDto.prototype, "updatedAt", void 0);
