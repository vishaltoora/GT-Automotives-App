"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceResponseDto = exports.UpdateInvoiceDto = exports.CreateInvoiceDto = exports.InvoiceItemDto = exports.InvoiceItemType = exports.PaymentMethod = exports.InvoiceStatus = void 0;
const tslib_1 = require("tslib");
const decorators_1 = require("./decorators");
var InvoiceStatus;
(function (InvoiceStatus) {
    InvoiceStatus["DRAFT"] = "DRAFT";
    InvoiceStatus["PENDING"] = "PENDING";
    InvoiceStatus["PAID"] = "PAID";
    InvoiceStatus["CANCELLED"] = "CANCELLED";
    InvoiceStatus["REFUNDED"] = "REFUNDED";
})(InvoiceStatus || (exports.InvoiceStatus = InvoiceStatus = {}));
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["CASH"] = "CASH";
    PaymentMethod["CREDIT_CARD"] = "CREDIT_CARD";
    PaymentMethod["DEBIT_CARD"] = "DEBIT_CARD";
    PaymentMethod["CHECK"] = "CHECK";
    PaymentMethod["E_TRANSFER"] = "E_TRANSFER";
    PaymentMethod["FINANCING"] = "FINANCING";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
var InvoiceItemType;
(function (InvoiceItemType) {
    InvoiceItemType["TIRE"] = "TIRE";
    InvoiceItemType["SERVICE"] = "SERVICE";
    InvoiceItemType["PART"] = "PART";
    InvoiceItemType["OTHER"] = "OTHER";
    InvoiceItemType["DISCOUNT"] = "DISCOUNT";
    InvoiceItemType["DISCOUNT_PERCENTAGE"] = "DISCOUNT_PERCENTAGE";
})(InvoiceItemType || (exports.InvoiceItemType = InvoiceItemType = {}));
class InvoiceItemDto {
}
exports.InvoiceItemDto = InvoiceItemDto;
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], InvoiceItemDto.prototype, "id", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], InvoiceItemDto.prototype, "tireId", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsEnum)(InvoiceItemType),
    tslib_1.__metadata("design:type", String)
], InvoiceItemDto.prototype, "itemType", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], InvoiceItemDto.prototype, "description", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], InvoiceItemDto.prototype, "quantity", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsNumber)(),
    (0, decorators_1.ValidateIf)((o) => o.itemType !== 'DISCOUNT' && o.itemType !== 'DISCOUNT_PERCENTAGE'),
    (0, decorators_1.IsPositive)({ message: 'Unit price must be positive for non-discount items' }),
    tslib_1.__metadata("design:type", Number)
], InvoiceItemDto.prototype, "unitPrice", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], InvoiceItemDto.prototype, "discountType", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], InvoiceItemDto.prototype, "discountValue", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], InvoiceItemDto.prototype, "discountAmount", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], InvoiceItemDto.prototype, "total", void 0);
class CreateInvoiceDto {
}
exports.CreateInvoiceDto = CreateInvoiceDto;
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateInvoiceDto.prototype, "customerId", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    tslib_1.__metadata("design:type", Object)
], CreateInvoiceDto.prototype, "customerData", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateInvoiceDto.prototype, "vehicleId", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsArray)(),
    (0, decorators_1.ValidateNested)({ each: true }),
    (0, decorators_1.Type)(() => InvoiceItemDto),
    tslib_1.__metadata("design:type", Array)
], CreateInvoiceDto.prototype, "items", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], CreateInvoiceDto.prototype, "subtotal", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], CreateInvoiceDto.prototype, "taxRate", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], CreateInvoiceDto.prototype, "taxAmount", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], CreateInvoiceDto.prototype, "gstRate", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], CreateInvoiceDto.prototype, "gstAmount", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], CreateInvoiceDto.prototype, "pstRate", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], CreateInvoiceDto.prototype, "pstAmount", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], CreateInvoiceDto.prototype, "total", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsEnum)(InvoiceStatus),
    tslib_1.__metadata("design:type", String)
], CreateInvoiceDto.prototype, "status", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsEnum)(PaymentMethod),
    tslib_1.__metadata("design:type", String)
], CreateInvoiceDto.prototype, "paymentMethod", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateInvoiceDto.prototype, "notes", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateInvoiceDto.prototype, "invoiceDate", void 0);
class UpdateInvoiceDto {
}
exports.UpdateInvoiceDto = UpdateInvoiceDto;
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], UpdateInvoiceDto.prototype, "vehicleId", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsArray)(),
    (0, decorators_1.ValidateNested)({ each: true }),
    (0, decorators_1.Type)(() => InvoiceItemDto),
    tslib_1.__metadata("design:type", Array)
], UpdateInvoiceDto.prototype, "items", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], UpdateInvoiceDto.prototype, "subtotal", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], UpdateInvoiceDto.prototype, "taxRate", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], UpdateInvoiceDto.prototype, "taxAmount", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], UpdateInvoiceDto.prototype, "gstRate", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], UpdateInvoiceDto.prototype, "gstAmount", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], UpdateInvoiceDto.prototype, "pstRate", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], UpdateInvoiceDto.prototype, "pstAmount", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], UpdateInvoiceDto.prototype, "total", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsEnum)(InvoiceStatus),
    tslib_1.__metadata("design:type", String)
], UpdateInvoiceDto.prototype, "status", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsEnum)(PaymentMethod),
    tslib_1.__metadata("design:type", String)
], UpdateInvoiceDto.prototype, "paymentMethod", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], UpdateInvoiceDto.prototype, "notes", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], UpdateInvoiceDto.prototype, "paidAt", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], UpdateInvoiceDto.prototype, "invoiceDate", void 0);
class InvoiceResponseDto {
}
exports.InvoiceResponseDto = InvoiceResponseDto;
tslib_1.__decorate([
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], InvoiceResponseDto.prototype, "id", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], InvoiceResponseDto.prototype, "invoiceNumber", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], InvoiceResponseDto.prototype, "customerId", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    tslib_1.__metadata("design:type", Object)
], InvoiceResponseDto.prototype, "customer", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], InvoiceResponseDto.prototype, "vehicleId", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    tslib_1.__metadata("design:type", Object)
], InvoiceResponseDto.prototype, "vehicle", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsArray)(),
    (0, decorators_1.ValidateNested)({ each: true }),
    (0, decorators_1.Type)(() => InvoiceItemDto),
    tslib_1.__metadata("design:type", Array)
], InvoiceResponseDto.prototype, "items", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], InvoiceResponseDto.prototype, "subtotal", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], InvoiceResponseDto.prototype, "taxRate", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], InvoiceResponseDto.prototype, "taxAmount", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], InvoiceResponseDto.prototype, "gstRate", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], InvoiceResponseDto.prototype, "gstAmount", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], InvoiceResponseDto.prototype, "pstRate", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], InvoiceResponseDto.prototype, "pstAmount", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], InvoiceResponseDto.prototype, "total", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsEnum)(InvoiceStatus),
    tslib_1.__metadata("design:type", String)
], InvoiceResponseDto.prototype, "status", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsEnum)(PaymentMethod),
    tslib_1.__metadata("design:type", String)
], InvoiceResponseDto.prototype, "paymentMethod", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], InvoiceResponseDto.prototype, "notes", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], InvoiceResponseDto.prototype, "createdBy", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], InvoiceResponseDto.prototype, "createdAt", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], InvoiceResponseDto.prototype, "updatedAt", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], InvoiceResponseDto.prototype, "paidAt", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], InvoiceResponseDto.prototype, "invoiceDate", void 0);
