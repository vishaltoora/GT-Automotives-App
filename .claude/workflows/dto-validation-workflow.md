# DTO Validation Workflow

## Overview
Comprehensive workflow for creating, validating, and maintaining DTOs with class-validator decorators, ensuring consistent validation patterns and type safety across the application.

## Workflow Stages

### Stage 1: DTO Creation and Structure Validation
```bash
# 1. Create DTO with proper domain organization
/dto create product --domain inventory

# 2. Validate DTO structure immediately
/dto validate ProductDto --strict

# 3. Check TypeScript compilation
yarn nx build @gt-automotive/shared-dto

# 4. Verify exports and imports
/dto verify-exports --domain inventory
```

### Stage 2: Validation Decorator Application
```bash
# Apply comprehensive validation decorators
/dto apply-validation ProductDto --preset comprehensive

# Validate decorator usage
/dto validate-decorators ProductDto

# Test validation rules
/dto test-validation ProductDto --sample-data
```

### Stage 3: Integration Testing
```bash
# Test DTO in backend services
/dto test-backend-integration ProductDto

# Test DTO in frontend forms
/dto test-frontend-integration ProductDto

# Validate API contract compatibility
/dto test-api-contract ProductDto
```

### Stage 4: Performance and Security Validation
```bash
# Performance benchmarks
/dto benchmark ProductDto

# Security validation
/dto security-scan ProductDto

# Memory usage analysis
/dto analyze-memory ProductDto
```

## Validation Patterns by Data Type

### String Validation
```typescript
export class UserDto {
  // Basic string with length constraints
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @Matches(/^[a-zA-Z\s]+$/)
  firstName!: string;

  // Email validation
  @IsEmail()
  @MaxLength(255)
  email!: string;

  // Phone validation with pattern
  @IsString()
  @IsOptional()
  @Matches(/^\+?[\d\s-()]+$/)
  phone?: string;

  // URL validation
  @IsUrl()
  @IsOptional()
  @MaxLength(500)
  website?: string;
}
```

### Number Validation
```typescript
export class ProductDto {
  // Price with precision and range
  @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  @Min(0)
  @Max(999999.99)
  price!: number;

  // Integer with range
  @IsInt()
  @Type(() => Number)
  @Min(1)
  @Max(10000)
  quantity!: number;

  // Percentage
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @Max(100)
  discountPercent!: number;
}
```

### Enum Validation
```typescript
export class VehicleDto {
  // Prisma enum validation
  @IsEnum(VehicleType)
  type!: VehicleType;

  // Multiple enum fields
  @IsEnum(VehicleStatus)
  status!: VehicleStatus;

  @IsEnum(VehicleFuelType)
  fuelType!: VehicleFuelType;
}
```

### Date Validation
```typescript
export class AppointmentDto {
  // ISO date string
  @IsDateString()
  @Type(() => String)
  scheduledDate!: string;

  // Date range validation
  @IsDate()
  @Type(() => Date)
  @MinDate(new Date())
  appointmentTime!: Date;

  // Optional date
  @IsDateString()
  @IsOptional()
  completedDate?: string;
}
```

### Array Validation
```typescript
export class OrderDto {
  // Array of primitive types
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  tags!: string[];

  // Array of nested objects
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  @ArrayMinSize(1)
  items!: OrderItemDto[];
}
```

### Object Validation
```typescript
export class InvoiceDto {
  // Nested object validation
  @ValidateNested()
  @Type(() => CustomerDto)
  customer!: CustomerDto;

  // Optional nested object
  @ValidateNested()
  @Type(() => AddressDto)
  @IsOptional()
  shippingAddress?: AddressDto;
}
```

## Custom Validation Decorators

### Business Rule Validation
```typescript
// Custom validator for business logic
import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

@ValidatorConstraint({ name: 'isFutureDate', async: false })
export class IsFutureDateConstraint implements ValidatorConstraintInterface {
  validate(date: string, args: ValidationArguments) {
    return new Date(date) > new Date();
  }

  defaultMessage(args: ValidationArguments) {
    return 'Date must be in the future';
  }
}

// Usage in DTO
export class AppointmentDto {
  @IsDateString()
  @Validate(IsFutureDateConstraint)
  scheduledDate!: string;
}
```

### Complex Business Validation
```typescript
@ValidatorConstraint({ name: 'isValidTireSize', async: false })
export class IsValidTireSizeConstraint implements ValidatorConstraintInterface {
  validate(size: string, args: ValidationArguments) {
    // Validate tire size pattern: 225/60R16
    const pattern = /^\d{3}\/\d{2}R\d{2}$/;
    return pattern.test(size);
  }

  defaultMessage(args: ValidationArguments) {
    return 'Tire size must be in format: 225/60R16';
  }
}

export class TireDto {
  @IsString()
  @Validate(IsValidTireSizeConstraint)
  size!: string;
}
```

## Validation Error Handling

### Error Message Customization
```typescript
export class UserRegistrationDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email!: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, { 
    message: 'Password must contain uppercase, lowercase, and number' 
  })
  password!: string;
}
```

### Conditional Validation
```typescript
export class ContactDto {
  @IsOptional()
  @ValidateIf(o => !o.phone)
  @IsEmail()
  email?: string;

  @IsOptional()
  @ValidateIf(o => !o.email)
  @IsString()
  phone?: string;
}
```

## Performance Optimization

### Validation Groups
```typescript
export class UserDto {
  @IsUUID()
  id!: string;

  @IsEmail({}, { groups: ['create', 'update'] })
  email!: string;

  @IsString({ groups: ['create'] })
  @MinLength(8, { groups: ['create'] })
  password!: string;

  @IsOptional({ groups: ['update'] })
  @IsString({ groups: ['update'] })
  currentPassword?: string;
}

// Usage with validation groups
await validate(userDto, { groups: ['create'] });
```

### Skip Missing Properties
```typescript
// Skip validation of undefined properties
const validationOptions: ValidatorOptions = {
  skipMissingProperties: true,
  whitelist: true,
  forbidNonWhitelisted: true
};

await validate(dto, validationOptions);
```

## Testing Validation Rules

### Unit Tests for DTOs
```typescript
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

describe('UserDto', () => {
  it('should validate valid user data', async () => {
    const userData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '+1-234-567-8900'
    };

    const userDto = plainToClass(UserDto, userData);
    const errors = await validate(userDto);
    
    expect(errors).toHaveLength(0);
  });

  it('should reject invalid email', async () => {
    const userData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'invalid-email',
      phone: '+1-234-567-8900'
    };

    const userDto = plainToClass(UserDto, userData);
    const errors = await validate(userDto);
    
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('email');
  });
});
```

### Integration Tests
```typescript
describe('UserController', () => {
  it('should validate request DTO', async () => {
    const invalidUserData = {
      firstName: '', // Invalid: too short
      email: 'invalid-email', // Invalid: not email format
    };

    const response = await request(app)
      .post('/api/users')
      .send(invalidUserData)
      .expect(400);

    expect(response.body.errors).toContain('firstName must be longer than 2 characters');
    expect(response.body.errors).toContain('email must be an email');
  });
});
```

## Validation Middleware Integration

### NestJS Validation Pipe
```typescript
// Global validation pipe configuration
import { ValidationPipe } from '@nestjs/common';

app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true, // Strip non-whitelisted properties
    forbidNonWhitelisted: true, // Throw error for non-whitelisted properties
    transform: true, // Transform payloads to be objects typed according to their DTO classes
    disableErrorMessages: process.env.NODE_ENV === 'production', // Disable detailed error messages in production
    validationError: {
      target: false, // Don't expose target object in validation errors
      value: false, // Don't expose value in validation errors
    },
  }),
);
```

### Express Validation Middleware
```typescript
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

export function validateDto<T>(dtoClass: new () => T) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const dto = plainToClass(dtoClass, req.body);
    const errors = await validate(dto);

    if (errors.length > 0) {
      const errorMessages = errors.map(error => 
        Object.values(error.constraints || {}).join(', ')
      );
      
      return res.status(400).json({
        message: 'Validation failed',
        errors: errorMessages,
      });
    }

    req.body = dto;
    next();
  };
}
```

## Documentation and Maintenance

### DTO Documentation Standards
```typescript
/**
 * User Data Transfer Object
 * 
 * Used for user registration, updates, and API responses.
 * Includes comprehensive validation for all user fields.
 * 
 * @example
 * ```typescript
 * const user = new UserDto();
 * user.firstName = 'John';
 * user.lastName = 'Doe';
 * user.email = 'john@example.com';
 * ```
 */
export class UserDto {
  /**
   * User's first name
   * Must be 2-50 characters, letters and spaces only
   */
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @Matches(/^[a-zA-Z\s]+$/)
  firstName!: string;

  /**
   * User's email address
   * Must be valid email format, max 255 characters
   */
  @IsEmail()
  @MaxLength(255)
  email!: string;
}
```

### Validation Rule Maintenance
```bash
# Regular maintenance tasks
/dto audit-validation-rules --comprehensive
/dto check-deprecated-decorators
/dto performance-review --threshold 100ms
/dto security-audit --level strict
```

## Monitoring and Observability

### Validation Metrics
```typescript
// Custom validation decorator with metrics
import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsValidWithMetrics(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isValidWithMetrics',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          // Record validation metrics
          recordValidationMetric(args.property, 'success');
          return true; // Your validation logic here
        },
      },
    });
  };
}
```

### Error Tracking
```typescript
import * as Sentry from '@sentry/node';

export class ValidationErrorHandler {
  static handleValidationErrors(errors: ValidationError[]) {
    const errorContext = {
      validationErrors: errors.map(error => ({
        property: error.property,
        constraints: error.constraints,
        value: error.value,
      })),
    };

    Sentry.captureException(new Error('DTO Validation Failed'), {
      extra: errorContext,
    });
  }
}
```

This comprehensive validation workflow ensures robust, maintainable, and performant DTO validation throughout the application lifecycle.