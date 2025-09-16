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
exports.TireImageDto = exports.InventoryReportDto = exports.TireSearchResultDto = exports.TireFiltersDto = exports.TireDto = exports.TireResponseDto = exports.TireSearchDto = exports.StockAdjustmentWithIdDto = exports.StockAdjustmentDto = exports.UpdateTireDto = exports.CreateTireDto = exports.TireCondition = exports.TireType = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
// Local enum definitions to avoid Prisma client dependency issues
var TireType;
(function (TireType) {
    TireType["ALL_SEASON"] = "ALL_SEASON";
    TireType["SUMMER"] = "SUMMER";
    TireType["WINTER"] = "WINTER";
    TireType["PERFORMANCE"] = "PERFORMANCE";
    TireType["OFF_ROAD"] = "OFF_ROAD";
})(TireType || (exports.TireType = TireType = {}));
var TireCondition;
(function (TireCondition) {
    TireCondition["NEW"] = "NEW";
    TireCondition["USED_EXCELLENT"] = "USED_EXCELLENT";
    TireCondition["USED_GOOD"] = "USED_GOOD";
    TireCondition["USED_FAIR"] = "USED_FAIR";
})(TireCondition || (exports.TireCondition = TireCondition = {}));
class CreateTireDto {
    brand;
    size;
    type;
    condition;
    quantity;
    price;
    cost;
    location;
    minStock;
    imageUrl;
    notes;
}
exports.CreateTireDto = CreateTireDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateTireDto.prototype, "brand", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], CreateTireDto.prototype, "size", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(TireType),
    __metadata("design:type", String)
], CreateTireDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(TireCondition),
    __metadata("design:type", String)
], CreateTireDto.prototype, "condition", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateTireDto.prototype, "quantity", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    (0, class_validator_1.Max)(99999),
    __metadata("design:type", Number)
], CreateTireDto.prototype, "price", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    (0, class_validator_1.Max)(99999),
    __metadata("design:type", Number)
], CreateTireDto.prototype, "cost", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateTireDto.prototype, "location", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateTireDto.prototype, "minStock", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], CreateTireDto.prototype, "imageUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], CreateTireDto.prototype, "notes", void 0);
class UpdateTireDto {
    brand;
    size;
    type;
    condition;
    quantity;
    price;
    cost;
    location;
    minStock;
    imageUrl;
    notes;
}
exports.UpdateTireDto = UpdateTireDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], UpdateTireDto.prototype, "brand", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], UpdateTireDto.prototype, "size", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(TireType),
    __metadata("design:type", String)
], UpdateTireDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(TireCondition),
    __metadata("design:type", String)
], UpdateTireDto.prototype, "condition", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateTireDto.prototype, "quantity", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    (0, class_validator_1.Max)(99999),
    __metadata("design:type", Number)
], UpdateTireDto.prototype, "price", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    (0, class_validator_1.Max)(99999),
    __metadata("design:type", Number)
], UpdateTireDto.prototype, "cost", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], UpdateTireDto.prototype, "location", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateTireDto.prototype, "minStock", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], UpdateTireDto.prototype, "imageUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], UpdateTireDto.prototype, "notes", void 0);
class StockAdjustmentDto {
    quantity;
    type;
    reason;
}
exports.StockAdjustmentDto = StockAdjustmentDto;
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], StockAdjustmentDto.prototype, "quantity", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['add', 'remove', 'set']),
    __metadata("design:type", String)
], StockAdjustmentDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], StockAdjustmentDto.prototype, "reason", void 0);
// Alternative DTO for different stock adjustment patterns
class StockAdjustmentWithIdDto {
    tireId;
    quantityChange;
    reason;
    notes;
}
exports.StockAdjustmentWithIdDto = StockAdjustmentWithIdDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StockAdjustmentWithIdDto.prototype, "tireId", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], StockAdjustmentWithIdDto.prototype, "quantityChange", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], StockAdjustmentWithIdDto.prototype, "reason", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], StockAdjustmentWithIdDto.prototype, "notes", void 0);
class TireSearchDto {
    brand;
    size;
    type;
    condition;
    minPrice;
    maxPrice;
    inStock;
    lowStock;
    search;
    sortBy;
    sortOrder;
    page;
    limit;
}
exports.TireSearchDto = TireSearchDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TireSearchDto.prototype, "brand", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TireSearchDto.prototype, "size", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(TireType),
    __metadata("design:type", String)
], TireSearchDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(TireCondition),
    __metadata("design:type", String)
], TireSearchDto.prototype, "condition", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], TireSearchDto.prototype, "minPrice", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Max)(99999),
    __metadata("design:type", Number)
], TireSearchDto.prototype, "maxPrice", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Boolean),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], TireSearchDto.prototype, "inStock", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Boolean),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], TireSearchDto.prototype, "lowStock", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TireSearchDto.prototype, "search", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['brand', 'size', 'price', 'quantity', 'updatedAt']),
    __metadata("design:type", String)
], TireSearchDto.prototype, "sortBy", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['asc', 'desc']),
    __metadata("design:type", String)
], TireSearchDto.prototype, "sortOrder", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], TireSearchDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], TireSearchDto.prototype, "limit", void 0);
class TireResponseDto {
    id;
    brand;
    size;
    type;
    condition;
    quantity;
    price;
    cost; // Only included for admin
    location;
    minStock;
    imageUrl;
    notes;
    isLowStock;
    createdAt;
    updatedAt;
    constructor(partial) {
        Object.assign(this, partial);
    }
}
exports.TireResponseDto = TireResponseDto;
__decorate([
    (0, class_transformer_1.Exclude)({ toPlainOnly: true }),
    __metadata("design:type", Number)
], TireResponseDto.prototype, "cost", void 0);
// Simple DTO for basic tire data (used in some legacy contexts)
class TireDto {
    id;
    brand;
    size;
    type;
    condition;
    price;
    cost;
    quantity;
    location;
    minStock;
    imageUrl;
    createdAt;
    updatedAt;
}
exports.TireDto = TireDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TireDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TireDto.prototype, "brand", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TireDto.prototype, "size", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(TireType),
    __metadata("design:type", String)
], TireDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(TireCondition),
    __metadata("design:type", String)
], TireDto.prototype, "condition", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], TireDto.prototype, "price", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], TireDto.prototype, "cost", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], TireDto.prototype, "quantity", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TireDto.prototype, "location", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], TireDto.prototype, "minStock", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TireDto.prototype, "imageUrl", void 0);
// Filter DTO that matches the legacy interface
class TireFiltersDto {
    brand;
    size;
    type;
    condition;
    minPrice;
    maxPrice;
    location;
    inStock;
    lowStock;
}
exports.TireFiltersDto = TireFiltersDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TireFiltersDto.prototype, "brand", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TireFiltersDto.prototype, "size", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(TireType),
    __metadata("design:type", String)
], TireFiltersDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(TireCondition),
    __metadata("design:type", String)
], TireFiltersDto.prototype, "condition", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], TireFiltersDto.prototype, "minPrice", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], TireFiltersDto.prototype, "maxPrice", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TireFiltersDto.prototype, "location", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Boolean),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], TireFiltersDto.prototype, "inStock", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Boolean),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], TireFiltersDto.prototype, "lowStock", void 0);
class TireSearchResultDto {
    items;
    total;
    page;
    limit;
    hasMore;
}
exports.TireSearchResultDto = TireSearchResultDto;
class InventoryReportDto {
    totalValue;
    totalCost;
    totalItems;
    lowStockItems;
    byBrand;
    byType;
}
exports.InventoryReportDto = InventoryReportDto;
// Additional DTOs to match legacy interface requirements
class TireImageDto {
    id;
    tireId;
    url;
    filename;
    alt;
    createdAt;
}
exports.TireImageDto = TireImageDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TireImageDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TireImageDto.prototype, "tireId", void 0);
__decorate([
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], TireImageDto.prototype, "url", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], TireImageDto.prototype, "filename", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], TireImageDto.prototype, "alt", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", Date)
], TireImageDto.prototype, "createdAt", void 0);
