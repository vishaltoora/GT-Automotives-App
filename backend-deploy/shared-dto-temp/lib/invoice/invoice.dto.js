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
exports.UpdateInvoiceItemEnhancedDto = exports.CreateInvoiceItemEnhancedDto = exports.CreateInvoiceEnhancedDto = exports.CreateCustomerDtoForInvoice = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const enums_dto_1 = require("../common/enums.dto");
// CreateCustomerDto for inline customer creation (defined first to avoid circular dependency)
class CreateCustomerDtoForInvoice {
    firstName;
    lastName;
    businessName;
    address;
    phone;
    email;
}
exports.CreateCustomerDtoForInvoice = CreateCustomerDtoForInvoice;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCustomerDtoForInvoice.prototype, "firstName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCustomerDtoForInvoice.prototype, "lastName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCustomerDtoForInvoice.prototype, "businessName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCustomerDtoForInvoice.prototype, "address", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCustomerDtoForInvoice.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateCustomerDtoForInvoice.prototype, "email", void 0);
// Enhanced Invoice DTOs with proper validation
class CreateInvoiceEnhancedDto {
    customerId;
    customerData;
    vehicleId;
    items;
    taxRate;
    gstRate;
    pstRate;
    paymentMethod;
    notes;
}
exports.CreateInvoiceEnhancedDto = CreateInvoiceEnhancedDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInvoiceEnhancedDto.prototype, "customerId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CreateCustomerDtoForInvoice),
    __metadata("design:type", CreateCustomerDtoForInvoice)
], CreateInvoiceEnhancedDto.prototype, "customerData", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInvoiceEnhancedDto.prototype, "vehicleId", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreateInvoiceItemEnhancedDto),
    __metadata("design:type", Array)
], CreateInvoiceEnhancedDto.prototype, "items", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateInvoiceEnhancedDto.prototype, "taxRate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateInvoiceEnhancedDto.prototype, "gstRate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateInvoiceEnhancedDto.prototype, "pstRate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(enums_dto_1.PaymentMethod),
    __metadata("design:type", String)
], CreateInvoiceEnhancedDto.prototype, "paymentMethod", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInvoiceEnhancedDto.prototype, "notes", void 0);
// Enhanced Invoice Item DTOs with proper validation
class CreateInvoiceItemEnhancedDto {
    tireId;
    itemType;
    description;
    quantity;
    unitPrice;
}
exports.CreateInvoiceItemEnhancedDto = CreateInvoiceItemEnhancedDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInvoiceItemEnhancedDto.prototype, "tireId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(enums_dto_1.InvoiceItemType),
    __metadata("design:type", String)
], CreateInvoiceItemEnhancedDto.prototype, "itemType", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInvoiceItemEnhancedDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateInvoiceItemEnhancedDto.prototype, "quantity", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateInvoiceItemEnhancedDto.prototype, "unitPrice", void 0);
// Enhanced Update DTOs with proper validation
class UpdateInvoiceItemEnhancedDto {
    itemType;
    description;
    quantity;
    unitPrice;
}
exports.UpdateInvoiceItemEnhancedDto = UpdateInvoiceItemEnhancedDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(enums_dto_1.InvoiceItemType),
    __metadata("design:type", String)
], UpdateInvoiceItemEnhancedDto.prototype, "itemType", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateInvoiceItemEnhancedDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], UpdateInvoiceItemEnhancedDto.prototype, "quantity", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], UpdateInvoiceItemEnhancedDto.prototype, "unitPrice", void 0);
