"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OptionalString = OptionalString;
exports.RequiredString = RequiredString;
exports.OptionalNumber = OptionalNumber;
exports.RequiredNumber = RequiredNumber;
exports.PositiveNumber = PositiveNumber;
exports.OptionalPositiveNumber = OptionalPositiveNumber;
exports.OptionalBoolean = OptionalBoolean;
exports.RequiredBoolean = RequiredBoolean;
exports.OptionalDate = OptionalDate;
exports.RequiredDate = RequiredDate;
exports.OptionalEmail = OptionalEmail;
exports.RequiredEmail = RequiredEmail;
exports.StringEnum = StringEnum;
exports.OptionalStringEnum = OptionalStringEnum;
exports.StringArray = StringArray;
exports.OptionalStringArray = OptionalStringArray;
exports.NestedObject = NestedObject;
exports.OptionalNestedObject = OptionalNestedObject;
exports.NestedArray = NestedArray;
exports.OptionalNestedArray = OptionalNestedArray;
exports.VehicleYear = VehicleYear;
exports.OptionalVehicleYear = OptionalVehicleYear;
exports.Price = Price;
exports.OptionalPrice = OptionalPrice;
exports.Quantity = Quantity;
exports.OptionalQuantity = OptionalQuantity;
const common_1 = require("@nestjs/common");
const decorators_1 = require("../decorators");
const decorators_2 = require("../decorators");
/**
 * Combines common validation decorators for GT Automotive DTOs
 * These decorators work across both browser and server environments
 */
function OptionalString() {
    return (0, common_1.applyDecorators)((0, decorators_2.IsString)(), (0, decorators_2.IsOptional)());
}
function RequiredString() {
    return (0, common_1.applyDecorators)((0, decorators_2.IsString)());
}
function OptionalNumber() {
    return (0, common_1.applyDecorators)((0, decorators_2.IsNumber)(), (0, decorators_1.Type)(() => Number), (0, decorators_2.IsOptional)());
}
function RequiredNumber() {
    return (0, common_1.applyDecorators)((0, decorators_2.IsNumber)(), (0, decorators_1.Type)(() => Number));
}
function PositiveNumber() {
    return (0, common_1.applyDecorators)((0, decorators_2.IsNumber)(), (0, decorators_2.Min)(0), (0, decorators_1.Type)(() => Number));
}
function OptionalPositiveNumber() {
    return (0, common_1.applyDecorators)((0, decorators_2.IsNumber)(), (0, decorators_2.Min)(0), (0, decorators_1.Type)(() => Number), (0, decorators_2.IsOptional)());
}
function OptionalBoolean() {
    return (0, common_1.applyDecorators)((0, decorators_2.IsBoolean)(), (0, decorators_2.IsOptional)());
}
function RequiredBoolean() {
    return (0, common_1.applyDecorators)((0, decorators_2.IsBoolean)());
}
function OptionalDate() {
    return (0, common_1.applyDecorators)((0, decorators_2.IsDate)(), (0, decorators_1.Type)(() => Date), (0, decorators_2.IsOptional)());
}
function RequiredDate() {
    return (0, common_1.applyDecorators)((0, decorators_2.IsDate)(), (0, decorators_1.Type)(() => Date));
}
function OptionalEmail() {
    return (0, common_1.applyDecorators)((0, decorators_2.IsEmail)(), (0, decorators_2.IsOptional)());
}
function RequiredEmail() {
    return (0, common_1.applyDecorators)((0, decorators_2.IsEmail)());
}
function StringEnum(enumObject) {
    return (0, common_1.applyDecorators)((0, decorators_2.IsString)(), (0, decorators_2.IsEnum)(enumObject));
}
function OptionalStringEnum(enumObject) {
    return (0, common_1.applyDecorators)((0, decorators_2.IsString)(), (0, decorators_2.IsEnum)(enumObject), (0, decorators_2.IsOptional)());
}
function StringArray() {
    return (0, common_1.applyDecorators)((0, decorators_2.IsArray)(), (0, decorators_2.IsString)({ each: true }));
}
function OptionalStringArray() {
    return (0, common_1.applyDecorators)((0, decorators_2.IsArray)(), (0, decorators_2.IsString)({ each: true }), (0, decorators_2.IsOptional)());
}
function NestedObject(typeFunction) {
    return (0, common_1.applyDecorators)((0, decorators_1.Type)(typeFunction), (0, decorators_2.ValidateNested)());
}
function OptionalNestedObject(typeFunction) {
    return (0, common_1.applyDecorators)((0, decorators_1.Type)(typeFunction), (0, decorators_2.ValidateNested)(), (0, decorators_2.IsOptional)());
}
function NestedArray(typeFunction) {
    return (0, common_1.applyDecorators)((0, decorators_1.Type)(typeFunction), (0, decorators_2.IsArray)(), (0, decorators_2.ValidateNested)({ each: true }));
}
function OptionalNestedArray(typeFunction) {
    return (0, common_1.applyDecorators)((0, decorators_1.Type)(typeFunction), (0, decorators_2.IsArray)(), (0, decorators_2.ValidateNested)({ each: true }), (0, decorators_2.IsOptional)());
}
/**
 * Automotive-specific decorators
 */
function VehicleYear() {
    return (0, common_1.applyDecorators)((0, decorators_2.IsNumber)(), (0, decorators_2.Min)(1900), (0, decorators_1.Type)(() => Number));
}
function OptionalVehicleYear() {
    return (0, common_1.applyDecorators)((0, decorators_2.IsNumber)(), (0, decorators_2.Min)(1900), (0, decorators_1.Type)(() => Number), (0, decorators_2.IsOptional)());
}
function Price() {
    return (0, common_1.applyDecorators)((0, decorators_2.IsNumber)(), (0, decorators_2.Min)(0), (0, decorators_1.Type)(() => Number));
}
function OptionalPrice() {
    return (0, common_1.applyDecorators)((0, decorators_2.IsNumber)(), (0, decorators_2.Min)(0), (0, decorators_1.Type)(() => Number), (0, decorators_2.IsOptional)());
}
function Quantity() {
    return (0, common_1.applyDecorators)((0, decorators_2.IsNumber)(), (0, decorators_2.Min)(0), (0, decorators_1.Type)(() => Number));
}
function OptionalQuantity() {
    return (0, common_1.applyDecorators)((0, decorators_2.IsNumber)(), (0, decorators_2.Min)(0), (0, decorators_1.Type)(() => Number), (0, decorators_2.IsOptional)());
}
