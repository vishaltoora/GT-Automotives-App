// Conditional exports for server (Node.js) and browser (Vite) environments

// No-op decorator for browser environments
const noopDecorator = () => (target: any, propertyKey?: string | symbol) => {};

// Try to load validation libraries, fallback to no-ops if they fail (browser environment)
let validationDecorators: any = {};
let transformerDecorators: any = {};
let mappedTypes: any = {};

try {
  // This will work in Node.js but fail in browser/Vite build
  validationDecorators = require('class-validator');
  transformerDecorators = require('class-transformer');
  mappedTypes = require('@nestjs/mapped-types');
} catch (error) {
  // Browser environment - use no-ops
  validationDecorators = {
    IsString: noopDecorator,
    IsNumber: noopDecorator,
    IsEnum: noopDecorator,
    IsOptional: noopDecorator,
    Min: noopDecorator,
    IsEmail: noopDecorator,
    IsArray: noopDecorator,
    ValidateNested: noopDecorator,
    IsBoolean: noopDecorator,
    IsDate: noopDecorator,
    ValidateIf: noopDecorator,
    IsPositive: noopDecorator,
  };
  transformerDecorators = {
    Type: noopDecorator,
  };
  mappedTypes = {
    PartialType: <T>(classRef: T) => classRef,
    OmitType: <T, K extends keyof T>(classRef: T, keys: K[]) => classRef,
  };
}

// Export decorators
export const IsString = validationDecorators.IsString;
export const IsNumber = validationDecorators.IsNumber;
export const IsEnum = validationDecorators.IsEnum;
export const IsOptional = validationDecorators.IsOptional;
export const Min = validationDecorators.Min;
export const IsEmail = validationDecorators.IsEmail;
export const IsArray = validationDecorators.IsArray;
export const ValidateNested = validationDecorators.ValidateNested;
export const IsBoolean = validationDecorators.IsBoolean;
export const IsDate = validationDecorators.IsDate;
export const ValidateIf = validationDecorators.ValidateIf;
export const IsPositive = validationDecorators.IsPositive;

export const Type = transformerDecorators.Type;

export const PartialType = mappedTypes.PartialType;
export const OmitType = mappedTypes.OmitType;

// TypeScript types for validation options (no-op in browser)
export interface ValidationOptions {
  message?: string | ((args: any) => string);
  groups?: string[];
  always?: boolean;
  each?: boolean;
  context?: object;
}