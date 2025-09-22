"use strict";
// Dynamic decorators that work in both server and browser environments
// Uses real validation decorators on server, no-op decorators in browser
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsString = IsString;
exports.IsNumber = IsNumber;
exports.IsEnum = IsEnum;
exports.IsOptional = IsOptional;
exports.Min = Min;
exports.IsEmail = IsEmail;
exports.IsArray = IsArray;
exports.ValidateNested = ValidateNested;
exports.IsBoolean = IsBoolean;
exports.IsDate = IsDate;
exports.ValidateIf = ValidateIf;
exports.IsPositive = IsPositive;
exports.Type = Type;
exports.PartialType = PartialType;
exports.OmitType = OmitType;
// No-op decorator factory for browser environment
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const noOpDecorator = () => (_target, _propertyKey) => {
    // This is intentionally empty for browser compatibility
};
// Detect if we're running in a browser environment
const isBrowserEnvironment = () => {
    return typeof window !== 'undefined';
};
// Create dynamic decorators that only import class-validator in server environment
const createValidationDecorator = (decoratorName, ...args) => {
    return (options) => {
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
            }
            else {
                // Fallback to no-op if decorator not found
                return noOpDecorator();
            }
        }
        catch (error) {
            // Fallback to no-op if class-validator is not available
            return noOpDecorator();
        }
    };
};
// Export dynamic validation decorators
function IsString(options) {
    return createValidationDecorator('IsString')(options);
}
function IsNumber(options) {
    return createValidationDecorator('IsNumber')(options);
}
function IsEnum(enumType, options) {
    return createValidationDecorator('IsEnum', enumType)(options);
}
function IsOptional(options) {
    return createValidationDecorator('IsOptional')(options);
}
function Min(value, options) {
    return createValidationDecorator('Min', value)(options);
}
function IsEmail(options) {
    return createValidationDecorator('IsEmail')(options);
}
function IsArray(options) {
    return createValidationDecorator('IsArray')(options);
}
function ValidateNested(options) {
    return createValidationDecorator('ValidateNested')(options);
}
function IsBoolean(options) {
    return createValidationDecorator('IsBoolean')(options);
}
function IsDate(options) {
    return createValidationDecorator('IsDate')(options);
}
function ValidateIf(condition, options) {
    return createValidationDecorator('ValidateIf', condition)(options);
}
function IsPositive(options) {
    return createValidationDecorator('IsPositive')(options);
}
// Class-transformer Type decorator
function Type(typeFunction) {
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
        }
        else {
            // Fallback to no-op if decorator not found
            return noOpDecorator();
        }
    }
    catch (error) {
        // Fallback to no-op if class-transformer is not available
        return noOpDecorator();
    }
}
// Add NestJS mapped-types support
function PartialType(classRef) {
    // If we're in a browser, return a basic partial type
    if (isBrowserEnvironment()) {
        return class extends classRef {
        };
    }
    // If we're on server, try to use real NestJS mapped-types
    try {
        const requireFunc = eval('require');
        const mappedTypesModule = requireFunc('@nestjs/mapped-types');
        const partialType = mappedTypesModule.PartialType;
        if (partialType && typeof partialType === 'function') {
            return partialType(classRef);
        }
        else {
            // Fallback to basic implementation
            return class extends classRef {
            };
        }
    }
    catch (error) {
        // Fallback to basic implementation if @nestjs/mapped-types is not available
        return class extends classRef {
        };
    }
}
function OmitType(classRef, keys) {
    // If we're in a browser, return a basic implementation
    if (isBrowserEnvironment()) {
        return class extends classRef {
        };
    }
    // If we're on server, try to use real NestJS mapped-types
    try {
        const requireFunc = eval('require');
        const mappedTypesModule = requireFunc('@nestjs/mapped-types');
        const omitType = mappedTypesModule.OmitType;
        if (omitType && typeof omitType === 'function') {
            return omitType(classRef, keys);
        }
        else {
            // Fallback to basic implementation
            return class extends classRef {
            };
        }
    }
    catch (error) {
        // Fallback to basic implementation if @nestjs/mapped-types is not available
        return class extends classRef {
        };
    }
}
