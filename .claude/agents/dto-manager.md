# DTO Manager Agent

## Purpose
Specialized agent for creating, updating, and managing Data Transfer Objects (DTOs) with class-validator decorators in the shared library, ensuring consistency across backend and frontend.

## Agent Type: `dto-manager`

## Tools Available
- Read, Write, Edit, MultiEdit, Glob, Grep

## Core Responsibilities

### 1. DTO Creation and Management
- Create DTOs in `libs/shared/interfaces/src/lib/dtos/`
- Use Prisma enums as source of truth
- Apply appropriate class-validator decorators
- Follow consistent naming conventions

### 2. Index File Management
- Automatically update `libs/shared/interfaces/src/index.ts`
- Export new DTOs properly
- Remove exports for deleted DTOs
- Maintain clean export structure

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
libs/shared/interfaces/src/lib/dtos/
├── user.dto.ts
├── customer.dto.ts
├── vehicle.dto.ts
├── tire.dto.ts
├── invoice.dto.ts
└── quotation.dto.ts
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

## Learning from Session

### Key Insights
1. **Prisma enums as source of truth** prevents type mismatches
2. **Experimental decorators** are required for class-validator
3. **Definite assignment assertions** (`!`) solve initialization errors
4. **Systematic approach** to fixing build errors is more effective
5. **Local testing** before committing prevents CI/CD failures

### Process Improvements
1. Always create DTOs with proper validation first
2. Update index files immediately after DTO creation
3. Test builds locally before committing
4. Fix all TypeScript errors systematically
5. Use consistent patterns across all DTOs

This agent should proactively suggest DTO creation when detecting interface usage and automatically maintain the shared library structure.