"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TireImageResponseDto = exports.TireSearchResultDto = exports.TireSearchDto = exports.InventoryReportDto = exports.TireImageDto = exports.TireSearchResultResponseDto = exports.TireSearchParamsDto = exports.TireFiltersDto = exports.StockAdjustmentDto = exports.TireResponseDto = exports.UpdateTireDto = exports.CreateTireDto = exports.AdjustmentType = exports.TireCondition = exports.TireType = void 0;
const tslib_1 = require("tslib");
const decorators_1 = require("./decorators");
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
var AdjustmentType;
(function (AdjustmentType) {
    AdjustmentType["ADD"] = "add";
    AdjustmentType["REMOVE"] = "remove";
    AdjustmentType["SET"] = "set";
})(AdjustmentType || (exports.AdjustmentType = AdjustmentType = {}));
class CreateTireDto {
}
exports.CreateTireDto = CreateTireDto;
tslib_1.__decorate([
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateTireDto.prototype, "brand", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateTireDto.prototype, "size", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsEnum)(TireType),
    tslib_1.__metadata("design:type", String)
], CreateTireDto.prototype, "type", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsEnum)(TireCondition),
    tslib_1.__metadata("design:type", String)
], CreateTireDto.prototype, "condition", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsNumber)(),
    (0, decorators_1.Min)(0),
    tslib_1.__metadata("design:type", Number)
], CreateTireDto.prototype, "price", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsNumber)(),
    (0, decorators_1.Min)(0),
    tslib_1.__metadata("design:type", Number)
], CreateTireDto.prototype, "cost", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsNumber)(),
    (0, decorators_1.Min)(0),
    tslib_1.__metadata("design:type", Number)
], CreateTireDto.prototype, "quantity", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateTireDto.prototype, "description", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateTireDto.prototype, "imageUrl", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsNumber)(),
    (0, decorators_1.Min)(0),
    tslib_1.__metadata("design:type", Number)
], CreateTireDto.prototype, "minStock", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateTireDto.prototype, "location", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateTireDto.prototype, "notes", void 0);
class UpdateTireDto {
}
exports.UpdateTireDto = UpdateTireDto;
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], UpdateTireDto.prototype, "brand", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], UpdateTireDto.prototype, "size", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsEnum)(TireType),
    tslib_1.__metadata("design:type", String)
], UpdateTireDto.prototype, "type", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsEnum)(TireCondition),
    tslib_1.__metadata("design:type", String)
], UpdateTireDto.prototype, "condition", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsNumber)(),
    (0, decorators_1.Min)(0),
    tslib_1.__metadata("design:type", Number)
], UpdateTireDto.prototype, "price", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsNumber)(),
    (0, decorators_1.Min)(0),
    tslib_1.__metadata("design:type", Number)
], UpdateTireDto.prototype, "cost", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsNumber)(),
    (0, decorators_1.Min)(0),
    tslib_1.__metadata("design:type", Number)
], UpdateTireDto.prototype, "quantity", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], UpdateTireDto.prototype, "description", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], UpdateTireDto.prototype, "imageUrl", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsNumber)(),
    (0, decorators_1.Min)(0),
    tslib_1.__metadata("design:type", Number)
], UpdateTireDto.prototype, "minStock", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], UpdateTireDto.prototype, "location", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], UpdateTireDto.prototype, "notes", void 0);
class TireResponseDto {
}
exports.TireResponseDto = TireResponseDto;
tslib_1.__decorate([
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], TireResponseDto.prototype, "id", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], TireResponseDto.prototype, "brand", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], TireResponseDto.prototype, "size", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsEnum)(TireType),
    tslib_1.__metadata("design:type", String)
], TireResponseDto.prototype, "type", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsEnum)(TireCondition),
    tslib_1.__metadata("design:type", String)
], TireResponseDto.prototype, "condition", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsNumber)(),
    (0, decorators_1.Min)(0),
    tslib_1.__metadata("design:type", Number)
], TireResponseDto.prototype, "price", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsNumber)(),
    (0, decorators_1.Min)(0),
    tslib_1.__metadata("design:type", Number)
], TireResponseDto.prototype, "cost", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsNumber)(),
    (0, decorators_1.Min)(0),
    tslib_1.__metadata("design:type", Number)
], TireResponseDto.prototype, "quantity", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], TireResponseDto.prototype, "description", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], TireResponseDto.prototype, "imageUrl", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsBoolean)(),
    tslib_1.__metadata("design:type", Boolean)
], TireResponseDto.prototype, "inStock", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], TireResponseDto.prototype, "createdAt", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], TireResponseDto.prototype, "updatedAt", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], TireResponseDto.prototype, "createdBy", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsNumber)(),
    (0, decorators_1.Min)(0),
    tslib_1.__metadata("design:type", Number)
], TireResponseDto.prototype, "minStock", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], TireResponseDto.prototype, "location", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], TireResponseDto.prototype, "notes", void 0);
class StockAdjustmentDto {
}
exports.StockAdjustmentDto = StockAdjustmentDto;
tslib_1.__decorate([
    (0, decorators_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], StockAdjustmentDto.prototype, "quantity", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsEnum)(AdjustmentType),
    tslib_1.__metadata("design:type", String)
], StockAdjustmentDto.prototype, "type", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], StockAdjustmentDto.prototype, "reason", void 0);
class TireFiltersDto {
}
exports.TireFiltersDto = TireFiltersDto;
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], TireFiltersDto.prototype, "brand", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], TireFiltersDto.prototype, "size", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsEnum)(TireType),
    tslib_1.__metadata("design:type", String)
], TireFiltersDto.prototype, "type", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsEnum)(TireCondition),
    tslib_1.__metadata("design:type", String)
], TireFiltersDto.prototype, "condition", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsNumber)(),
    (0, decorators_1.Min)(0),
    tslib_1.__metadata("design:type", Number)
], TireFiltersDto.prototype, "minPrice", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsNumber)(),
    (0, decorators_1.Min)(0),
    tslib_1.__metadata("design:type", Number)
], TireFiltersDto.prototype, "maxPrice", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsBoolean)(),
    tslib_1.__metadata("design:type", Boolean)
], TireFiltersDto.prototype, "inStock", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsBoolean)(),
    tslib_1.__metadata("design:type", Boolean)
], TireFiltersDto.prototype, "lowStock", void 0);
class TireSearchParamsDto {
}
exports.TireSearchParamsDto = TireSearchParamsDto;
exports.TireSearchDto = TireSearchParamsDto;
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], TireSearchParamsDto.prototype, "search", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], TireSearchParamsDto.prototype, "brand", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], TireSearchParamsDto.prototype, "size", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsEnum)(TireType),
    tslib_1.__metadata("design:type", String)
], TireSearchParamsDto.prototype, "type", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsEnum)(TireCondition),
    tslib_1.__metadata("design:type", String)
], TireSearchParamsDto.prototype, "condition", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsNumber)(),
    (0, decorators_1.Min)(0),
    tslib_1.__metadata("design:type", Number)
], TireSearchParamsDto.prototype, "minPrice", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsNumber)(),
    (0, decorators_1.Min)(0),
    tslib_1.__metadata("design:type", Number)
], TireSearchParamsDto.prototype, "maxPrice", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsBoolean)(),
    tslib_1.__metadata("design:type", Boolean)
], TireSearchParamsDto.prototype, "inStock", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsBoolean)(),
    tslib_1.__metadata("design:type", Boolean)
], TireSearchParamsDto.prototype, "lowStock", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], TireSearchParamsDto.prototype, "sortBy", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], TireSearchParamsDto.prototype, "sortOrder", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsNumber)(),
    (0, decorators_1.Min)(1),
    (0, decorators_1.Type)(() => Number),
    tslib_1.__metadata("design:type", Number)
], TireSearchParamsDto.prototype, "page", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsNumber)(),
    (0, decorators_1.Min)(1),
    (0, decorators_1.Type)(() => Number),
    tslib_1.__metadata("design:type", Number)
], TireSearchParamsDto.prototype, "limit", void 0);
class TireSearchResultResponseDto {
}
exports.TireSearchResultResponseDto = TireSearchResultResponseDto;
exports.TireSearchResultDto = TireSearchResultResponseDto;
tslib_1.__decorate([
    (0, decorators_1.IsArray)(),
    (0, decorators_1.ValidateNested)({ each: true }),
    (0, decorators_1.Type)(() => TireResponseDto),
    tslib_1.__metadata("design:type", Array)
], TireSearchResultResponseDto.prototype, "items", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], TireSearchResultResponseDto.prototype, "total", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], TireSearchResultResponseDto.prototype, "page", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], TireSearchResultResponseDto.prototype, "limit", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], TireSearchResultResponseDto.prototype, "totalPages", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsBoolean)(),
    tslib_1.__metadata("design:type", Boolean)
], TireSearchResultResponseDto.prototype, "hasMore", void 0);
class TireImageDto {
}
exports.TireImageDto = TireImageDto;
exports.TireImageResponseDto = TireImageDto;
tslib_1.__decorate([
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], TireImageDto.prototype, "id", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], TireImageDto.prototype, "url", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsOptional)(),
    (0, decorators_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], TireImageDto.prototype, "alt", void 0);
class InventoryReportDto {
}
exports.InventoryReportDto = InventoryReportDto;
tslib_1.__decorate([
    (0, decorators_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], InventoryReportDto.prototype, "totalValue", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], InventoryReportDto.prototype, "totalCost", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], InventoryReportDto.prototype, "totalItems", void 0);
tslib_1.__decorate([
    (0, decorators_1.IsArray)(),
    tslib_1.__metadata("design:type", Array)
], InventoryReportDto.prototype, "lowStockItems", void 0);
