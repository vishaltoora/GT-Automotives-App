import { applyDecorators } from '@nestjs/common';
import { Type } from '../decorators';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested
} from '../decorators';

/**
 * Combines common validation decorators for GT Automotive DTOs
 * These decorators work across both browser and server environments
 */

export function OptionalString() {
  return applyDecorators(IsString() as PropertyDecorator, IsOptional() as PropertyDecorator);
}

export function RequiredString() {
  return applyDecorators(IsString() as PropertyDecorator);
}

export function OptionalNumber() {
  return applyDecorators(
    IsNumber() as PropertyDecorator,
    Type(() => Number) as PropertyDecorator,
    IsOptional() as PropertyDecorator
  );
}

export function RequiredNumber() {
  return applyDecorators(
    IsNumber() as PropertyDecorator,
    Type(() => Number) as PropertyDecorator
  );
}

export function PositiveNumber() {
  return applyDecorators(
    IsNumber() as PropertyDecorator,
    Min(0) as PropertyDecorator,
    Type(() => Number) as PropertyDecorator
  );
}

export function OptionalPositiveNumber() {
  return applyDecorators(
    IsNumber() as PropertyDecorator,
    Min(0) as PropertyDecorator,
    Type(() => Number) as PropertyDecorator,
    IsOptional() as PropertyDecorator
  );
}

export function OptionalBoolean() {
  return applyDecorators(
    IsBoolean() as PropertyDecorator,
    IsOptional() as PropertyDecorator
  );
}

export function RequiredBoolean() {
  return applyDecorators(IsBoolean() as PropertyDecorator);
}

export function OptionalDate() {
  return applyDecorators(
    IsDate() as PropertyDecorator,
    Type(() => Date) as PropertyDecorator,
    IsOptional() as PropertyDecorator
  );
}

export function RequiredDate() {
  return applyDecorators(
    IsDate() as PropertyDecorator,
    Type(() => Date) as PropertyDecorator
  );
}

export function OptionalEmail() {
  return applyDecorators(
    IsEmail() as PropertyDecorator,
    IsOptional() as PropertyDecorator
  );
}

export function RequiredEmail() {
  return applyDecorators(IsEmail() as PropertyDecorator);
}

export function StringEnum(enumObject: object) {
  return applyDecorators(
    IsString() as PropertyDecorator,
    IsEnum(enumObject) as PropertyDecorator
  );
}

export function OptionalStringEnum(enumObject: object) {
  return applyDecorators(
    IsString() as PropertyDecorator,
    IsEnum(enumObject) as PropertyDecorator,
    IsOptional() as PropertyDecorator
  );
}

export function StringArray() {
  return applyDecorators(
    IsArray() as PropertyDecorator,
    IsString({ each: true }) as PropertyDecorator
  );
}

export function OptionalStringArray() {
  return applyDecorators(
    IsArray() as PropertyDecorator,
    IsString({ each: true }) as PropertyDecorator,
    IsOptional() as PropertyDecorator
  );
}

export function NestedObject(typeFunction: () => any) {
  return applyDecorators(
    Type(typeFunction) as PropertyDecorator,
    ValidateNested() as PropertyDecorator
  );
}

export function OptionalNestedObject(typeFunction: () => any) {
  return applyDecorators(
    Type(typeFunction) as PropertyDecorator,
    ValidateNested() as PropertyDecorator,
    IsOptional() as PropertyDecorator
  );
}

export function NestedArray(typeFunction: () => any) {
  return applyDecorators(
    Type(typeFunction) as PropertyDecorator,
    IsArray() as PropertyDecorator,
    ValidateNested({ each: true }) as PropertyDecorator
  );
}

export function OptionalNestedArray(typeFunction: () => any) {
  return applyDecorators(
    Type(typeFunction) as PropertyDecorator,
    IsArray() as PropertyDecorator,
    ValidateNested({ each: true }) as PropertyDecorator,
    IsOptional() as PropertyDecorator
  );
}

/**
 * Automotive-specific decorators
 */

export function VehicleYear() {
  return applyDecorators(
    IsNumber() as PropertyDecorator,
    Min(1900) as PropertyDecorator,
    Type(() => Number) as PropertyDecorator
  );
}

export function OptionalVehicleYear() {
  return applyDecorators(
    IsNumber() as PropertyDecorator,
    Min(1900) as PropertyDecorator,
    Type(() => Number) as PropertyDecorator,
    IsOptional() as PropertyDecorator
  );
}

export function Price() {
  return applyDecorators(
    IsNumber() as PropertyDecorator,
    Min(0) as PropertyDecorator,
    Type(() => Number) as PropertyDecorator
  );
}

export function OptionalPrice() {
  return applyDecorators(
    IsNumber() as PropertyDecorator,
    Min(0) as PropertyDecorator,
    Type(() => Number) as PropertyDecorator,
    IsOptional() as PropertyDecorator
  );
}

export function Quantity() {
  return applyDecorators(
    IsNumber() as PropertyDecorator,
    Min(0) as PropertyDecorator,
    Type(() => Number) as PropertyDecorator
  );
}

export function OptionalQuantity() {
  return applyDecorators(
    IsNumber() as PropertyDecorator,
    Min(0) as PropertyDecorator,
    Type(() => Number) as PropertyDecorator,
    IsOptional() as PropertyDecorator
  );
}