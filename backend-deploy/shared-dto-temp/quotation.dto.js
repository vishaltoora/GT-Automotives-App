"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuotationResponseDto = exports.UpdateQuoteDto = exports.CreateQuoteDto = exports.QuotationItemDto = exports.QuotationItemType = exports.QuotationStatus = void 0;
const tslib_1 = require("tslib");
const decorators_1 = require("./decorators");
var QuotationStatus;
(function (QuotationStatus) {
    QuotationStatus["DRAFT"] = "DRAFT";
    QuotationStatus["SENT"] = "SENT";
    QuotationStatus["ACCEPTED"] = "ACCEPTED";
    QuotationStatus["REJECTED"] = "REJECTED";
    QuotationStatus["EXPIRED"] = "EXPIRED";
})(QuotationStatus || (exports.QuotationStatus = QuotationStatus = {}));
var QuotationItemType;
(function (QuotationItemType) {
    QuotationItemType["TIRE"] = "TIRE";
    QuotationItemType["SERVICE"] = "SERVICE";
    QuotationItemType["PART"] = "PART";
    QuotationItemType["OTHER"] = "OTHER";
})(QuotationItemType || (exports.QuotationItemType = QuotationItemType = {}));
class QuotationItemDto {
}
exports.QuotationItemDto = QuotationItemDto;
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], QuotationItemDto.prototype, "id", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], QuotationItemDto.prototype, "tireId", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsEnum)(QuotationItemType),
    tslib_1.__metadata("design:type", String)
], QuotationItemDto.prototype, "itemType", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], QuotationItemDto.prototype, "description", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], QuotationItemDto.prototype, "quantity", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], QuotationItemDto.prototype, "unitPrice", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], QuotationItemDto.prototype, "total", void 0);
class CreateQuoteDto {
}
exports.CreateQuoteDto = CreateQuoteDto;
tslib_1.__decorate([
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateQuoteDto.prototype, "customerId", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateQuoteDto.prototype, "vehicleId", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsArray)(),
    (0, decorators_1.ValidateNested)({ each: true }),
    (0, decorators_1.Type)(() => QuotationItemDto),
    tslib_1.__metadata("design:type", Array)
], CreateQuoteDto.prototype, "items", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], CreateQuoteDto.prototype, "subtotal", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], CreateQuoteDto.prototype, "taxRate", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], CreateQuoteDto.prototype, "taxAmount", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], CreateQuoteDto.prototype, "gstRate", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], CreateQuoteDto.prototype, "gstAmount", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], CreateQuoteDto.prototype, "pstRate", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], CreateQuoteDto.prototype, "pstAmount", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], CreateQuoteDto.prototype, "total", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsEnum)(QuotationStatus),
    tslib_1.__metadata("design:type", String)
], CreateQuoteDto.prototype, "status", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateQuoteDto.prototype, "notes", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateQuoteDto.prototype, "validUntil", void 0);
class UpdateQuoteDto extends (0, decorators_1.OmitType)(CreateQuoteDto, ['customerId']) {
}
exports.UpdateQuoteDto = UpdateQuoteDto;
class QuotationResponseDto {
}
exports.QuotationResponseDto = QuotationResponseDto;
tslib_1.__decorate([
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], QuotationResponseDto.prototype, "id", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], QuotationResponseDto.prototype, "quoteNumber", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], QuotationResponseDto.prototype, "customerId", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    tslib_1.__metadata("design:type", Object)
], QuotationResponseDto.prototype, "customer", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], QuotationResponseDto.prototype, "vehicleId", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    tslib_1.__metadata("design:type", Object)
], QuotationResponseDto.prototype, "vehicle", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsArray)(),
    (0, decorators_1.ValidateNested)({ each: true }),
    (0, decorators_1.Type)(() => QuotationItemDto),
    tslib_1.__metadata("design:type", Array)
], QuotationResponseDto.prototype, "items", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], QuotationResponseDto.prototype, "subtotal", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], QuotationResponseDto.prototype, "taxRate", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], QuotationResponseDto.prototype, "taxAmount", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], QuotationResponseDto.prototype, "gstRate", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], QuotationResponseDto.prototype, "gstAmount", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], QuotationResponseDto.prototype, "pstRate", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], QuotationResponseDto.prototype, "pstAmount", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], QuotationResponseDto.prototype, "total", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsEnum)(QuotationStatus),
    tslib_1.__metadata("design:type", String)
], QuotationResponseDto.prototype, "status", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], QuotationResponseDto.prototype, "notes", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], QuotationResponseDto.prototype, "validUntil", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], QuotationResponseDto.prototype, "createdBy", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], QuotationResponseDto.prototype, "createdAt", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], QuotationResponseDto.prototype, "updatedAt", void 0);
