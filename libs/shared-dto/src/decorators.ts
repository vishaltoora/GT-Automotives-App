// Dynamic decorators that work in both server and browser environments
// Uses real validation decorators on server, no-op decorators in browser

// Define decorator interfaces to match class-validator
interface ValidationOptions {
  message?: string | ((args: any) => string);
  groups?: string[];
  always?: boolean;
  each?: boolean;
}


// No-op decorator factory for browser environment
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const noOpDecorator = () => (_target: unknown, _propertyKey?: string | symbol): void => {
  // This is intentionally empty for browser compatibility
};

// Detect if we're running in a browser environment
const isBrowserEnvironment = () => {
  return typeof window !== 'undefined';
};

// Create dynamic decorators that only import class-validator in server environment
const createValidationDecorator = (decoratorName: string, ...args: any[]) => {
  return (options?: ValidationOptions): PropertyDecorator => {
    // If we're in a browser, use no-op decorator
    if (isBrowserEnvironment()) {
      return noOpDecorator();
    }

    // If we're on server, try to use real class-validator decorator
    try {
      // Use dynamic import with eval to prevent webpack from trying to bundle this
      const requireFunc = eval('require');
      const validatorModule = requireFunc('class-validator');
      const decorator = validatorModule[decoratorName];

      if (decorator && typeof decorator === 'function') {
        return args.length > 0 ? decorator(...args, options) : decorator(options);
      } else {
        // Fallback to no-op if decorator not found
        return noOpDecorator();
      }
    } catch (error) {
      // Fallback to no-op if class-validator is not available
      return noOpDecorator();
    }
  };
};

// Export dynamic validation decorators
export function IsString(options?: ValidationOptions) {
  return createValidationDecorator('IsString')(options);
}

export function IsNumber(options?: ValidationOptions) {
  return createValidationDecorator('IsNumber')(options);
}

export function IsEnum(enumType: any, options?: ValidationOptions) {
  return createValidationDecorator('IsEnum', enumType)(options);
}

export function IsOptional(options?: ValidationOptions) {
  return createValidationDecorator('IsOptional')(options);
}

export function Min(value: number, options?: ValidationOptions) {
  return createValidationDecorator('Min', value)(options);
}

export function IsEmail(options?: ValidationOptions) {
  return createValidationDecorator('IsEmail')(options);
}

export function IsArray(options?: ValidationOptions) {
  return createValidationDecorator('IsArray')(options);
}

export function ValidateNested(options?: ValidationOptions) {
  return createValidationDecorator('ValidateNested')(options);
}

export function IsBoolean(options?: ValidationOptions) {
  return createValidationDecorator('IsBoolean')(options);
}

export function IsDate(options?: ValidationOptions) {
  return createValidationDecorator('IsDate')(options);
}

export function ValidateIf(condition: (object: any) => boolean, options?: ValidationOptions) {
  return createValidationDecorator('ValidateIf', condition)(options);
}

export function IsPositive(options?: ValidationOptions) {
  return createValidationDecorator('IsPositive')(options);
}

// Class-transformer Type decorator
export function Type(typeFunction: () => any): PropertyDecorator {
  // If we're in a browser, use no-op decorator
  if (isBrowserEnvironment()) {
    return noOpDecorator();
  }

  // If we're on server, try to use real class-transformer decorator
  try {
    // Use dynamic import with eval to prevent webpack from trying to bundle this
    const requireFunc = eval('require');
    const transformerModule = requireFunc('class-transformer');
    const decorator = transformerModule.Type;

    if (decorator && typeof decorator === 'function') {
      return decorator(typeFunction);
    } else {
      // Fallback to no-op if decorator not found
      return noOpDecorator();
    }
  } catch (error) {
    // Fallback to no-op if class-transformer is not available
    return noOpDecorator();
  }
}

// Add NestJS mapped-types support
export function PartialType<T>(classRef: new () => T): new () => Partial<T> {
  // If we're in a browser, return a basic partial type
  if (isBrowserEnvironment()) {
    return class extends (classRef as any) {} as any;
  }

  // If we're on server, try to use real NestJS mapped-types
  try {
    const requireFunc = eval('require');
    const mappedTypesModule = requireFunc('@nestjs/mapped-types');
    const partialType = mappedTypesModule.PartialType;

    if (partialType && typeof partialType === 'function') {
      return partialType(classRef);
    } else {
      // Fallback to basic implementation
      return class extends (classRef as any) {} as any;
    }
  } catch (error) {
    // Fallback to basic implementation if @nestjs/mapped-types is not available
    return class extends (classRef as any) {} as any;
  }
}

export function OmitType<T, K extends keyof T>(classRef: new () => T, keys: readonly K[]): new () => Omit<T, K> {
  // If we're in a browser, return a basic implementation
  if (isBrowserEnvironment()) {
    return class extends (classRef as any) {} as any;
  }

  // If we're on server, try to use real NestJS mapped-types
  try {
    const requireFunc = eval('require');
    const mappedTypesModule = requireFunc('@nestjs/mapped-types');
    const omitType = mappedTypesModule.OmitType;

    if (omitType && typeof omitType === 'function') {
      return omitType(classRef, keys);
    } else {
      // Fallback to basic implementation
      return class extends (classRef as any) {} as any;
    }
  } catch (error) {
    // Fallback to basic implementation if @nestjs/mapped-types is not available
    return class extends (classRef as any) {} as any;
  }
}