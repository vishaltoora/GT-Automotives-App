# DTO Guidelines - GT Automotive Application

## Overview
Comprehensive guidelines for Data Transfer Objects (DTOs) implementation using class-validator decorators in the GT Automotive application. This document establishes standards for type-safe data transfer between frontend and backend with robust validation.

## Table of Contents
1. [Architecture & Organization](#architecture--organization)
2. [DTO Creation Standards](#dto-creation-standards)
3. [Validation Patterns](#validation-patterns)
4. [Migration from Interfaces](#migration-from-interfaces)
5. [Integration Patterns](#integration-patterns)
6. [Performance Considerations](#performance-considerations)
7. [Testing Strategies](#testing-strategies)
8. [Troubleshooting](#troubleshooting)

## Architecture & Organization

### File Structure
```
libs/shared/dto/src/lib/
├── auth/
│   ├── auth.dto.ts          # Authentication-related DTOs
│   ├── user.dto.ts          # User management DTOs
│   └── index.ts             # Export auth domain DTOs
├── customer/
│   ├── customer.dto.ts      # Customer management DTOs
│   └── index.ts
├── vehicle/
│   ├── vehicle.dto.ts       # Vehicle-related DTOs
│   └── index.ts
├── tire/
│   ├── tire.dto.ts          # Tire inventory DTOs
│   └── index.ts
├── invoice/
│   ├── invoice.dto.ts       # Invoice and billing DTOs
│   └── index.ts
├── quotation/
│   ├── quotation.dto.ts     # Quote management DTOs
│   └── index.ts
└── index.ts                 # Main barrel export
```

### Naming Conventions
- **Base DTO**: `EntityDto` (e.g., `CustomerDto`)
- **Creation**: `CreateEntityDto` (e.g., `CreateCustomerDto`)
- **Update**: `UpdateEntityDto` (e.g., `UpdateCustomerDto`)
- **Response**: `EntityResponseDto` (e.g., `CustomerResponseDto`)
- **Search**: `EntitySearchDto` (e.g., `CustomerSearchDto`)
- **Filters**: `EntityFiltersDto` (e.g., `CustomerFiltersDto`)

### Domain Organization Principles
- Group related DTOs by business domain
- Each domain has its own subdirectory
- Use barrel exports for clean imports
- Avoid circular dependencies between domains
- Keep DTOs focused on single responsibility

## DTO Creation Standards

### Basic DTO Structure
```typescript
import { IsString, IsNumber, IsEnum, IsOptional, IsUUID, IsEmail } from 'class-validator';
import { Type } from 'class-transformer';
import { CustomerType } from '@prisma/client';

export class CustomerDto {
  @IsUUID()
  id!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  firstName!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  lastName!: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @Matches(/^\+?[\d\s-()]+$/)
  phone?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  businessName?: string;

  @IsEnum(CustomerType)
  type!: CustomerType;

  createdAt!: Date;
  updatedAt!: Date;
}
```

### Required Field Patterns
```typescript
export class CreateCustomerDto {
  // Required string with constraints
  @IsString()
  @MinLength(1, { message: 'First name is required' })
  @MaxLength(50, { message: 'First name must be less than 50 characters' })
  firstName!: string;

  // Required enum from Prisma
  @IsEnum(CustomerType, { message: 'Valid customer type is required' })
  type!: CustomerType;

  // Required number with range validation
  @IsNumber()
  @Type(() => Number)
  @Min(0, { message: 'Credit limit must be positive' })
  @Max(100000, { message: 'Credit limit cannot exceed $100,000' })
  creditLimit!: number;
}
```

### Optional Field Patterns
```typescript
export class UpdateCustomerDto {
  // Optional string fields
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  @IsOptional()
  firstName?: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsOptional()
  email?: string;

  // Optional with transformation
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @IsOptional()
  creditLimit?: number;

  // Optional enum
  @IsEnum(CustomerType)
  @IsOptional()
  type?: CustomerType;
}
```

## Validation Patterns

### String Validation
```typescript
export class ContactDto {
  // Basic string validation
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  // Email validation
  @IsEmail()
  @MaxLength(255)
  email!: string;

  // Phone with pattern matching
  @IsString()
  @Matches(/^\+?[\d\s-()]+$/, { message: 'Invalid phone number format' })
  @IsOptional()
  phone?: string;

  // URL validation
  @IsUrl()
  @IsOptional()
  website?: string;

  // Custom pattern validation
  @IsString()
  @Matches(/^[A-Z0-9]{6,20}$/, { message: 'Invalid license plate format' })
  @IsOptional()
  licensePlate?: string;
}
```

### Number Validation
```typescript
export class PriceDto {
  // Currency with precision
  @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  @Min(0)
  @Max(999999.99)
  amount!: number;

  // Integer validation
  @IsInt()
  @Type(() => Number)
  @Min(1)
  @Max(1000)
  quantity!: number;

  // Percentage
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @Max(100)
  taxRate!: number;
}
```

### Enum Validation (Prisma Integration)
```typescript
import { TireType, TireCondition, VehicleStatus } from '@prisma/client';

export class TireDto {
  // Always use Prisma enums as source of truth
  @IsEnum(TireType, { message: 'Invalid tire type' })
  type!: TireType;

  @IsEnum(TireCondition, { message: 'Invalid tire condition' })
  condition!: TireCondition;

  // Multiple enum validation
  @IsEnum(VehicleStatus, { message: 'Invalid vehicle status' })
  @IsOptional()
  vehicleStatus?: VehicleStatus;
}
```

### Date Validation
```typescript
export class AppointmentDto {
  // ISO date string validation
  @IsDateString({}, { message: 'Invalid date format' })
  scheduledDate!: string;

  // Date object with constraints
  @IsDate()
  @Type(() => Date)
  appointmentTime!: Date;

  // Future date validation
  @IsDateString()
  @Validate(IsFutureDateConstraint)
  @IsOptional()
  followUpDate?: string;
}
```

### Array Validation
```typescript
export class OrderDto {
  // String array validation
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  tags!: string[];

  // Nested object array
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  @ArrayMinSize(1, { message: 'Order must have at least one item' })
  items!: OrderItemDto[];

  // Optional array
  @IsArray()
  @IsUUID('all', { each: true })
  @IsOptional()
  attachmentIds?: string[];
}
```

### Nested Object Validation
```typescript
export class InvoiceDto {
  // Required nested object
  @ValidateNested()
  @Type(() => CustomerDto)
  customer!: CustomerDto;

  // Optional nested object
  @ValidateNested()
  @Type(() => AddressDto)
  @IsOptional()
  billingAddress?: AddressDto;

  // Array of nested objects
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceLineItemDto)
  lineItems!: InvoiceLineItemDto[];
}
```

## Migration from Interfaces

### Migration Strategy
1. **Create DTO with validation decorators**
2. **Add legacy type alias for compatibility**
3. **Update imports gradually**
4. **Remove legacy aliases after migration**
5. **Delete old interface files**

### Example Migration
```typescript
// STEP 1: Create DTO (tire.dto.ts)
import { TireType, TireCondition } from '@prisma/client';

export class TireDto {
  @IsUUID()
  id!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  brand!: string;

  @IsEnum(TireType)
  type!: TireType;

  @IsEnum(TireCondition)
  condition!: TireCondition;

  @IsString()
  @Matches(/^\d{3}\/\d{2}R\d{2}$/)
  size!: string;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  price!: number;

  createdAt!: Date;
  updatedAt!: Date;
}

// STEP 2: Legacy alias for backward compatibility
export type Tire = TireDto;

// STEP 3: Create CRUD DTOs
export class CreateTireDto {
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  brand!: string;

  @IsEnum(TireType)
  type!: TireType;

  @IsEnum(TireCondition)
  condition!: TireCondition;

  @IsString()
  @Matches(/^\d{3}\/\d{2}R\d{2}$/)
  size!: string;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  price!: number;

  @IsUrl()
  @IsOptional()
  imageUrl?: string;
}

export class UpdateTireDto {
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  @IsOptional()
  brand?: string;

  @IsEnum(TireCondition)
  @IsOptional()
  condition?: TireCondition;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @IsOptional()
  price?: number;

  @IsUrl()
  @IsOptional()
  imageUrl?: string;
}
```

### Handling Null vs Undefined
```typescript
// Repository layer converts Prisma null to DTO undefined
export class CustomerRepository {
  async findById(id: string): Promise<CustomerDto | null> {
    const customer = await this.prisma.customer.findUnique({
      where: { id }
    });

    if (!customer) return null;

    // Convert null to undefined for DTO compatibility
    return {
      ...customer,
      email: customer.email ?? undefined,
      phone: customer.phone ?? undefined,
      businessName: customer.businessName ?? undefined,
    };
  }
}
```

## Integration Patterns

### Backend Service Integration
```typescript
// Service layer using DTOs
import { CustomerDto, CreateCustomerDto, UpdateCustomerDto } from '@gt-automotive/shared-dto';

@Injectable()
export class CustomerService {
  async create(createCustomerDto: CreateCustomerDto): Promise<CustomerDto> {
    // Validate DTO (automatic with ValidationPipe)
    const customer = await this.customerRepository.create(createCustomerDto);
    return customer;
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto): Promise<CustomerDto> {
    // Partial validation for updates
    const customer = await this.customerRepository.update(id, updateCustomerDto);
    return customer;
  }
}
```

### Frontend Form Integration
```typescript
import { useForm } from 'react-hook-form';
import { CreateCustomerDto } from '@gt-automotive/shared-dto';

const CustomerForm: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<CreateCustomerDto>();

  const onSubmit = async (data: CreateCustomerDto) => {
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Handle validation errors from backend
        console.error('Validation errors:', errorData.errors);
      }
    } catch (error) {
      console.error('Error creating customer:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register('firstName', { 
          required: 'First name is required',
          minLength: { value: 1, message: 'First name cannot be empty' },
          maxLength: { value: 50, message: 'First name too long' }
        })}
        placeholder="First Name"
      />
      {errors.firstName && <span>{errors.firstName.message}</span>}
      
      {/* Additional form fields */}
    </form>
  );
};
```

### API Controller Integration
```typescript
import { CreateCustomerDto, UpdateCustomerDto, CustomerDto } from '@gt-automotive/shared-dto';

@Controller('customers')
export class CustomerController {
  @Post()
  async create(@Body() createCustomerDto: CreateCustomerDto): Promise<CustomerDto> {
    // ValidationPipe automatically validates the DTO
    return this.customerService.create(createCustomerDto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto
  ): Promise<CustomerDto> {
    return this.customerService.update(id, updateCustomerDto);
  }
}
```

## Performance Considerations

### Validation Optimization
```typescript
// Use validation groups for different contexts
export class UserDto {
  @IsEmail({}, { groups: ['create', 'update-email'] })
  email!: string;

  @IsString({ groups: ['create'] })
  @MinLength(8, { groups: ['create'] })
  password!: string;

  @IsOptional({ groups: ['profile-update'] })
  @IsString({ groups: ['profile-update'] })
  bio?: string;
}

// Validate with specific group
await validate(userDto, { groups: ['profile-update'] });
```

### Conditional Validation
```typescript
export class PaymentDto {
  @IsEnum(PaymentMethod)
  method!: PaymentMethod;

  // Only validate card details if payment method is CARD
  @ValidateIf(o => o.method === PaymentMethod.CARD)
  @IsString()
  @MinLength(16)
  @MaxLength(16)
  cardNumber?: string;

  @ValidateIf(o => o.method === PaymentMethod.CARD)
  @IsString()
  @Matches(/^\d{3}$/)
  cvv?: string;
}
```

### Memory Optimization
```typescript
// Skip missing properties for partial updates
const validationOptions: ValidatorOptions = {
  skipMissingProperties: true,
  whitelist: true, // Strip non-whitelisted properties
  forbidNonWhitelisted: true, // Throw error for extra properties
};

await validate(updateDto, validationOptions);
```

## Testing Strategies

### Unit Testing DTOs
```typescript
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CreateCustomerDto } from './customer.dto';

describe('CreateCustomerDto', () => {
  it('should validate correct customer data', async () => {
    const customerData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      type: 'INDIVIDUAL',
    };

    const dto = plainToClass(CreateCustomerDto, customerData);
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('should reject invalid email format', async () => {
    const customerData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'invalid-email',
      type: 'INDIVIDUAL',
    };

    const dto = plainToClass(CreateCustomerDto, customerData);
    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('email');
    expect(errors[0].constraints?.isEmail).toBeDefined();
  });

  it('should reject missing required fields', async () => {
    const customerData = {
      email: 'john@example.com',
      // Missing firstName, lastName, type
    };

    const dto = plainToClass(CreateCustomerDto, customerData);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    const properties = errors.map(e => e.property);
    expect(properties).toContain('firstName');
    expect(properties).toContain('lastName');
    expect(properties).toContain('type');
  });
});
```

### Integration Testing
```typescript
describe('CustomerController (e2e)', () => {
  it('should create customer with valid DTO', async () => {
    const createCustomerDto = {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      type: 'BUSINESS',
      businessName: 'Smith Auto',
    };

    const response = await request(app)
      .post('/api/customers')
      .send(createCustomerDto)
      .expect(201);

    expect(response.body).toMatchObject({
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      type: 'BUSINESS',
      businessName: 'Smith Auto',
    });
    expect(response.body.id).toBeDefined();
    expect(response.body.createdAt).toBeDefined();
  });

  it('should reject invalid customer data', async () => {
    const invalidDto = {
      firstName: '', // Too short
      email: 'invalid-email', // Invalid format
      type: 'INVALID_TYPE', // Invalid enum
    };

    const response = await request(app)
      .post('/api/customers')
      .send(invalidDto)
      .expect(400);

    expect(response.body.message).toContain('Validation failed');
    expect(response.body.errors).toBeInstanceOf(Array);
  });
});
```

## Troubleshooting

### Common Issues and Solutions

#### TypeScript Compilation Errors
```bash
# Error: "experimentalDecorators" not enabled
# Solution: Update tsconfig.json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

#### Class Validator Not Working
```typescript
// Error: Decorators not applying validation
// Solution: Ensure proper imports and ValidationPipe setup

// Correct imports
import { IsString, MinLength } from 'class-validator';
import { ValidationPipe } from '@nestjs/common';

// Proper ValidationPipe configuration
app.useGlobalPipes(new ValidationPipe({
  transform: true,
  whitelist: true,
}));
```

#### Enum Validation Failures
```typescript
// Error: Enum validation not working
// Wrong: Using custom enum
enum CustomTireType {
  ALL_SEASON = 'ALL_SEASON',
  WINTER = 'WINTER'
}

// Correct: Using Prisma enum
import { TireType } from '@prisma/client';

export class TireDto {
  @IsEnum(TireType) // Use Prisma enum
  type!: TireType;
}
```

#### Null vs Undefined Issues
```typescript
// Error: Validation fails with null values
// Solution: Convert null to undefined in repository layer

const customerDto = {
  ...customer,
  email: customer.email ?? undefined, // Convert null to undefined
  phone: customer.phone ?? undefined,
};
```

### Build Error Diagnostics
```bash
# Check DTO structure
yarn nx build @gt-automotive/shared-dto

# Validate individual DTOs
yarn test libs/shared/dto

# Check TypeScript configuration
yarn tsc --noEmit

# Validate imports across projects
yarn nx dep-graph
```

## Best Practices Summary

### DO's ✅
- Use Prisma enums as single source of truth
- Apply comprehensive validation decorators
- Use `undefined` for optional properties, not `null`
- Organize DTOs by business domain
- Create separate DTOs for Create/Update/Response operations
- Use type transformations for complex data types
- Write comprehensive tests for DTO validation
- Document complex validation rules
- Use meaningful error messages
- Implement proper TypeScript configuration

### DON'Ts ❌
- Don't create custom enums that duplicate Prisma enums
- Don't mix interfaces and DTOs in the same codebase
- Don't use `null` for optional properties in DTOs
- Don't skip validation decorators on any field
- Don't create monolithic DTOs with too many responsibilities
- Don't ignore TypeScript compilation warnings
- Don't skip testing validation rules
- Don't use hardcoded validation messages without context
- Don't expose sensitive data in response DTOs
- Don't forget to update index files when adding new DTOs

This comprehensive guide ensures consistent, type-safe, and maintainable DTO implementation across the GT Automotive application.