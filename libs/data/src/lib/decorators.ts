// Frontend-compatible decorators for compilation compatibility
// These provide proper PropertyDecorator types for TypeScript

// Simple decorator factory
const createDecorator = () => {
  return (..._args: any[]): PropertyDecorator => {
    return (_target: any, _propertyKey: string | symbol) => {
      // No-op for frontend/build compatibility
    };
  };
};

// Export all decorators using the factory
export const IsString = createDecorator();
export const IsNumber = createDecorator();
export const IsEnum = createDecorator();
export const IsOptional = createDecorator();
export const Min = createDecorator();
export const IsEmail = createDecorator();
export const IsArray = createDecorator();
export const ValidateNested = createDecorator();
export const IsBoolean = createDecorator();
export const IsDate = createDecorator();
export const ValidateIf = createDecorator();
export const IsPositive = createDecorator();
export const Type = createDecorator();

// Mapped type functions
export const PartialType = <T>(classRef: T): T => classRef;
export const OmitType = <T, K extends keyof T>(classRef: new (...args: any[]) => T, _keys: readonly K[]): new (...args: any[]) => Omit<T, K> => {
  return classRef as any;
};

// TypeScript interface for validation options
export interface ValidationOptions {
  message?: string | ((args: any) => string);
  groups?: string[];
  always?: boolean;
  each?: boolean;
  context?: object;
}