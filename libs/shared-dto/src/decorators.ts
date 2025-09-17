// Conditional decorator helper for browser compatibility
const isBrowser = typeof globalThis !== 'undefined' && typeof (globalThis as any).window !== 'undefined';

// Re-export class-validator decorators conditionally
export function IsString() {
  if (isBrowser) {
    return function (target: any, propertyKey: string) {
      // No-op decorator for browser
    };
  }
  const { IsString: IsStringOriginal } = require('class-validator');
  return IsStringOriginal();
}

export function IsNumber() {
  if (isBrowser) {
    return function (target: any, propertyKey: string) {};
  }
  const { IsNumber: IsNumberOriginal } = require('class-validator');
  return IsNumberOriginal();
}

export function IsEnum(enumType: any) {
  if (isBrowser) {
    return function (target: any, propertyKey: string) {};
  }
  const { IsEnum: IsEnumOriginal } = require('class-validator');
  return IsEnumOriginal(enumType);
}

export function IsOptional() {
  if (isBrowser) {
    return function (target: any, propertyKey: string) {};
  }
  const { IsOptional: IsOptionalOriginal } = require('class-validator');
  return IsOptionalOriginal();
}

export function Min(value: number) {
  if (isBrowser) {
    return function (target: any, propertyKey: string) {};
  }
  const { Min: MinOriginal } = require('class-validator');
  return MinOriginal(value);
}

export function IsEmail() {
  if (isBrowser) {
    return function (target: any, propertyKey: string) {};
  }
  const { IsEmail: IsEmailOriginal } = require('class-validator');
  return IsEmailOriginal();
}

export function IsArray() {
  if (isBrowser) {
    return function (target: any, propertyKey: string) {};
  }
  const { IsArray: IsArrayOriginal } = require('class-validator');
  return IsArrayOriginal();
}

export function ValidateNested(options?: any) {
  if (isBrowser) {
    return function (target: any, propertyKey: string) {};
  }
  const { ValidateNested: ValidateNestedOriginal } = require('class-validator');
  return ValidateNestedOriginal(options);
}

export function IsBoolean() {
  if (isBrowser) {
    return function (target: any, propertyKey: string) {};
  }
  const { IsBoolean: IsBooleanOriginal } = require('class-validator');
  return IsBooleanOriginal();
}

export function Type(typeFunction: () => any) {
  if (isBrowser) {
    return function (target: any, propertyKey: string) {};
  }
  const { Type: TypeOriginal } = require('class-transformer');
  return TypeOriginal(typeFunction);
}