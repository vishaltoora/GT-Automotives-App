# DTO Manager Agent

## Purpose
Specialized agent for creating, updating, and managing Data Transfer Objects (DTOs) with class-validator decorators in the shared library, ensuring consistency across backend and frontend.

## Agent Type: `dto-manager`

## Tools Available
- Read, Write, Edit, MultiEdit, Glob, Grep

## Core Responsibilities

### 1. DTO Creation and Management
- Create DTOs in `libs/shared/dto/src/lib/` (consolidated location)
- Use Prisma enums as source of truth - import from `@prisma/client`
- Apply appropriate class-validator decorators with proper TypeScript configuration
- Follow consistent naming conventions and domain organization
- Use `undefined` instead of `null` for optional properties
- Group DTOs by domain (auth/, customer/, vehicle/, tire/, etc.)

### 2. Index File Management
- Automatically update `libs/shared/dto/src/index.ts`
- Export DTOs by domain from each subdirectory index
- Remove exports for deleted DTOs and deprecated interfaces
- Maintain clean barrel export structure
- Create legacy type aliases during migration for backward compatibility

### 3. Type Safety and Validation
- Use Prisma-generated enums (`@prisma/client`)
- Apply proper class-validator decorators
- Ensure definite assignment assertions (`!`) for required fields
- Handle optional fields with `@IsOptional()`

### 4. Cross-Project Updates
- Update backend services to use new DTOs
- Replace old interfaces/types with DTOs
- Fix import statements across the monorepo
- Ensure TypeScript compilation succeeds

## Agent Capabilities

### DTO Structure Standards
```typescript
// Example DTO structure
import { IsString, IsNumber, IsEnum, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { EntityEnum } from '@prisma/client';

export class EntityDto {
  @IsString()
  id!: string;

  @IsEnum(EntityEnum)
  type!: EntityEnum;

  @IsNumber()
  @Type(() => Number)
  price!: number;

  @IsString()
  @IsOptional()
  notes?: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export class CreateEntityDto {
  // Same validations but without id, dates
}

export class UpdateEntityDto {
  // All fields optional except validation
}
```

### Validation Patterns
- `@IsString()` - String validation
- `@IsNumber()` - Number validation  
- `@IsEnum(PrismaEnum)` - Enum validation using Prisma enums
- `@IsOptional()` - Optional fields
- `@IsUUID()` - UUID validation for IDs
- `@Type(() => Number)` - Type transformation
- `@Min(0)`, `@Max(100)` - Numeric constraints
- `@IsEmail()` - Email validation

### File Organization
```
libs/shared/dto/src/lib/
├── auth/
│   ├── auth.dto.ts
│   ├── user.dto.ts
│   └── index.ts
├── customer/
│   ├── customer.dto.ts
│   └── index.ts
├── vehicle/
│   ├── vehicle.dto.ts
│   └── index.ts
├── tire/
│   ├── tire.dto.ts
│   └── index.ts
├── invoice/
│   ├── invoice.dto.ts
│   └── index.ts
├── quotation/
│   ├── quotation.dto.ts
│   └── index.ts
└── index.ts (exports all domains)
```

## Usage Examples

### Create New DTO
```bash
/dto create user
# Creates user.dto.ts with CRUD DTOs and updates index
```

### Update Existing DTO
```bash
/dto update tire --add-field color:string --add-field notes:string?
# Adds new fields to tire DTO
```

### Generate DTOs from Prisma Schema
```bash
/dto generate-from-schema
# Analyzes Prisma schema and creates missing DTOs
```

### Validate DTO Structure
```bash
/dto validate
# Checks all DTOs for consistency and proper validation
```

### Fix Import References
```bash
/dto fix-imports
# Updates all references from interfaces to DTOs across the project
```

## Best Practices

### 1. Enum Usage
- Always import enums from `@prisma/client`
- Never create custom enums that duplicate Prisma enums
- Use `@IsEnum(PrismaEnum)` for validation

### 2. Property Definitions
- Required fields: Use definite assignment `field!: type`
- Optional fields: Use optional syntax `field?: type` with `@IsOptional()`
- Dates: Use `Date` type without validation (set by database)
- Numbers: Always use `@Type(() => Number)` for transformation

### 3. DTO Naming
- Base DTO: `EntityDto` (for response/display)
- Creation: `CreateEntityDto` (for POST requests)
- Updates: `UpdateEntityDto` (for PATCH requests)  
- Search/Filter: `EntityFiltersDto`, `EntitySearchDto`
- Results: `EntitySearchResultDto`

### 4. Index Management
- Export DTOs in alphabetical order
- Group related DTOs together
- Remove old interface exports
- Use barrel exports (`export * from './lib/dtos/entity.dto';`)

## Error Prevention

### Common Issues Avoided
- ❌ Using custom enums instead of Prisma enums
- ❌ Missing experimental decorators in tsconfig
- ❌ Inconsistent property initialization
- ❌ Missing class-validator imports
- ❌ Outdated index file exports

### TypeScript Configuration
Ensure `experimentalDecorators: true` and `emitDecoratorMetadata: true` in:
- `libs/shared/interfaces/tsconfig.lib.json`
- `server/tsconfig.app.json` 

## Integration Points

### Backend Integration
- Replace interface imports with DTO imports
- Use DTOs in service method signatures
- Apply DTOs in controller validation
- Update repository return types

### Frontend Integration  
- Use DTOs for form validation
- Type API responses with DTOs
- Leverage class-validator for client-side validation
- Maintain type safety across API boundaries

## Quality Assurance

### Validation Steps
1. ✅ All DTOs compile without TypeScript errors
2. ✅ Class-validator decorators are properly applied
3. ✅ Prisma enums are used consistently
4. ✅ Index file exports all DTOs
5. ✅ Backend services use DTOs instead of interfaces
6. ✅ Build process succeeds for both frontend and backend

### Testing Commands
```bash
# Test shared library build
yarn nx build @gt-automotive/shared-interfaces

# Test server build with DTOs
yarn build:server

# Test frontend build
yarn build:web

# Run type checking
yarn typecheck
```

## DTO Consolidation Best Practices (Based on Session Learnings)

### 1. Migration Strategy
- **Convert interfaces to DTOs**: All data transfer should use class-validator DTOs
- **Create legacy aliases**: Maintain backward compatibility during migration
- **Update imports systematically**: Frontend and backend simultaneously
- **Delete old interfaces**: After migration is complete and tested
- **Run typecheck frequently**: Catch issues early in migration process

### 2. Common DTO Patterns
```typescript
// CreateDto: Required fields for creation
export class CreateTireDto {
  @IsString()
  @MinLength(1)
  brand!: string;

  @IsEnum(TireType)
  type!: TireType;

  @IsString()
  size!: string;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  price!: number;
}

// UpdateDto: All optional fields for partial updates
export class UpdateTireDto {
  @IsString()
  @IsOptional()
  @MinLength(1)
  brand?: string;

  @IsEnum(TireType)
  @IsOptional()
  type?: TireType;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @IsOptional()
  price?: number;
}

// ResponseDto: API response with role-based exclusions
export class TireResponseDto {
  id!: string;
  brand!: string;
  type!: TireType;
  size!: string;
  price!: number;
  // Exclude sensitive fields based on user role
  createdAt!: Date;
  updatedAt!: Date;
}

// SearchDto: Query parameters with validation
export class TireSearchDto {
  @IsEnum(TireType)
  @IsOptional()
  type?: TireType;

  @IsString()
  @IsOptional()
  brand?: string;

  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 20;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @IsOptional()
  offset?: number = 0;
}
```

### 3. Validation Decorator Standards
- **String fields**: `@IsString()` + length constraints (`@MinLength`, `@MaxLength`)
- **Numbers**: `@IsNumber()` + `@Type(() => Number)` + range validation (`@Min`, `@Max`)
- **Enums**: `@IsEnum(PrismaEnum)` - always use Prisma-generated enums
- **Optional fields**: `@IsOptional()` + base validation
- **URLs**: `@IsUrl()` for image URLs and external links
- **Email**: `@IsEmail()` for email validation
- **UUIDs**: `@IsUUID()` for ID fields
- **Arrays**: `@IsArray()` + `@ValidateNested()` for complex arrays

### 4. Type Compatibility Patterns
```typescript
// Handle Prisma Decimal to number conversion
export class PriceDto {
  @IsNumber()
  @Type(() => Number)
  price!: number; // Convert from Prisma Decimal in repository
}

// Convert null to undefined for DTO compatibility
export class CustomerDto {
  @IsString()
  @IsOptional()
  email?: string; // Repository converts null → undefined

  @IsString()
  @IsOptional()
  phone?: string; // Repository converts null → undefined
}

// Transform complex types
export class DateRangeDto {
  @IsDateString()
  @Transform(({ value }) => new Date(value).toISOString())
  startDate!: string;

  @IsDateString()
  @Transform(({ value }) => new Date(value).toISOString())
  endDate!: string;
}
```

### 5. Common Migration Issues and Solutions

#### Issue: "Cannot use import statement outside a module"
**Solution**: Update tsconfig.json for proper module support
```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "module": "ESNext",
    "moduleResolution": "node"
  }
}
```

#### Issue: "Property has no initializer"
**Solution**: Use definite assignment assertions for required fields
```typescript
// Wrong
export class TireDto {
  brand: string; // Error: Property 'brand' has no initializer
}

// Correct
export class TireDto {
  @IsString()
  brand!: string; // Definite assignment assertion
}
```

#### Issue: "Enum not found"
**Solution**: Import enums from @prisma/client, not custom interfaces
```typescript
// Wrong
import { TireType } from '../interfaces/tire.types';

// Correct
import { TireType } from '@prisma/client';
```

### 6. Testing and Validation Workflow
```bash
# 1. Create/update DTOs
/dto create product
/dto update tire --add-field warranty:number?

# 2. Validate DTO structure
/dto validate

# 3. Test builds incrementally
yarn nx build @gt-automotive/shared-dto
yarn build:server
yarn build:web

# 4. Run type checking
yarn typecheck

# 5. Test runtime validation
yarn test:dto
```

### 7. Performance Considerations
- **Lazy loading**: Import DTOs only when needed
- **Tree shaking**: Use barrel exports for better bundling
- **Validation caching**: Cache validation results for repeated operations
- **Selective validation**: Skip validation in trusted internal operations

### 8. Integration with Repositories
```typescript
// Repository pattern with DTO conversion
export class TireRepository {
  async create(createTireDto: CreateTireDto): Promise<TireResponseDto> {
    // Validate input DTO
    await validateDto(createTireDto);
    
    // Create entity
    const tire = await this.prisma.tire.create({
      data: {
        ...createTireDto,
        // Handle type conversions
        price: new Decimal(createTireDto.price)
      }
    });
    
    // Convert to response DTO
    return {
      ...tire,
      price: tire.price.toNumber(), // Decimal → number
      email: tire.email ?? undefined // null → undefined
    };
  }
}
```

### 9. Quality Assurance Checklist
- ✅ All DTOs have proper class-validator decorators
- ✅ TypeScript compilation succeeds without errors
- ✅ Prisma enums used consistently (no custom enums)
- ✅ Optional properties use `undefined` not `null`
- ✅ Index files export all DTOs properly
- ✅ Legacy interfaces removed after migration
- ✅ Build succeeds for shared library, server, and frontend
- ✅ Runtime validation works as expected

### 10. Troubleshooting Common Issues

**Build fails with decorator errors**
- Check experimentalDecorators in tsconfig.json
- Verify class-validator imports
- Ensure proper TypeScript version compatibility

**Enum validation fails**
- Confirm enum imported from @prisma/client
- Check Prisma schema matches DTO enum usage
- Verify enum values are correctly typed

**Null vs undefined issues**
- Use `@IsOptional()` for optional fields
- Convert null to undefined in repositories
- Handle missing fields gracefully in DTOs

This comprehensive approach ensures reliable DTO consolidation while maintaining type safety and performance across the entire application.