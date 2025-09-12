# Migration Agent - Interface to DTO Consolidation

## Purpose
Specialized agent for systematically migrating from TypeScript interfaces to class-validator DTOs, ensuring zero downtime and maintaining type safety throughout the process.

## Agent Type: `migration-agent`

## Core Responsibilities

### 1. Interface-to-DTO Migration Planning
- Analyze existing interface usage across the codebase
- Create migration roadmap with dependency mapping
- Identify breaking changes and compatibility requirements
- Plan rollback strategies for each migration step

### 2. Systematic Migration Execution
- Convert interfaces to DTOs with proper validation decorators
- Create legacy type aliases for backward compatibility
- Update imports across frontend and backend simultaneously
- Validate builds at each migration step

### 3. Dependency Resolution
- Map interface dependencies and usage patterns
- Resolve circular dependencies during migration
- Handle complex type relationships (unions, intersections, generics)
- Maintain API contract compatibility

### 4. Quality Assurance
- Validate DTO structure and decorators
- Ensure TypeScript compilation success
- Test runtime validation behavior
- Verify API contract consistency

## Migration Methodology

### Phase 1: Discovery and Analysis
```bash
# Analyze current interface usage
/migration analyze-interfaces

# Map dependencies and usage patterns
/migration dependency-map

# Identify migration complexity and risks
/migration risk-assessment

# Create migration plan
/migration create-plan
```

### Phase 2: DTO Creation with Legacy Support
```bash
# Convert interface to DTO with legacy alias
/migration convert-interface Customer --create-legacy-alias

# Example output creates:
# 1. CustomerDto in libs/shared/dto/src/lib/customer/
# 2. Legacy alias: type Customer = CustomerDto
# 3. Updated index exports
```

### Phase 3: Gradual Import Migration
```bash
# Update imports in batches by domain
/migration update-imports --domain customer --dry-run
/migration update-imports --domain customer

# Validate changes don't break compilation
/migration validate-build --incremental
```

### Phase 4: Legacy Cleanup
```bash
# Remove legacy aliases after migration complete
/migration cleanup-legacy --confirm

# Delete old interface files
/migration delete-interfaces --confirm
```

## Migration Patterns

### 1. Simple Interface to DTO
```typescript
// Before: interface
export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
}

// After: DTO with validation
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

  createdAt!: Date;
  updatedAt!: Date;
}

// Legacy alias for compatibility
export type Customer = CustomerDto;
```

### 2. Enum-Heavy Interface Migration
```typescript
// Before: custom enum interface
export interface Tire {
  id: string;
  brand: string;
  type: 'ALL_SEASON' | 'WINTER' | 'SUMMER' | 'PERFORMANCE';
  condition: 'NEW' | 'USED' | 'DAMAGED';
  size: string;
  price: number;
}

// After: DTO with Prisma enums
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
  @Matches(/^\d+\/\d+R\d+$/) // Tire size pattern
  size!: string;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @Max(10000)
  price!: number;

  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  createdAt!: Date;
  updatedAt!: Date;
}

// Legacy alias
export type Tire = TireDto;
```

### 3. Complex Nested Interface Migration
```typescript
// Before: nested interfaces
export interface Invoice {
  id: string;
  customer: Customer;
  items: InvoiceItem[];
  totals: InvoiceTotals;
  status: InvoiceStatus;
}

export interface InvoiceItem {
  id: string;
  tire: Tire;
  quantity: number;
  unitPrice: number;
  total: number;
}

// After: DTO with nested validation
export class InvoiceItemDto {
  @IsUUID()
  id!: string;

  @ValidateNested()
  @Type(() => TireDto)
  tire!: TireDto;

  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  quantity!: number;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  unitPrice!: number;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  total!: number;
}

export class InvoiceDto {
  @IsUUID()
  id!: string;

  @ValidateNested()
  @Type(() => CustomerDto)
  customer!: CustomerDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items!: InvoiceItemDto[];

  @IsEnum(InvoiceStatus)
  status!: InvoiceStatus;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  subtotal!: number;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  tax!: number;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  total!: number;

  createdAt!: Date;
  updatedAt!: Date;
}
```

## Migration Commands

### Analysis Commands
```bash
# List all interfaces in the codebase
/migration list-interfaces

# Show interface usage and dependencies
/migration analyze Customer --show-usage --show-dependencies

# Assess migration complexity
/migration complexity-score Customer

# Find circular dependencies
/migration find-circular-deps
```

### Conversion Commands
```bash
# Convert single interface to DTO
/migration convert Customer --domain customer

# Convert multiple related interfaces
/migration convert-batch Customer,CustomerAddress,CustomerContact --domain customer

# Convert with custom validation rules
/migration convert Tire --domain tire --validation-preset complex
```

### Validation Commands
```bash
# Validate DTO structure
/migration validate-dto CustomerDto

# Check backward compatibility
/migration validate-compatibility Customer CustomerDto

# Test migration impact
/migration test-migration --dry-run
```

### Cleanup Commands
```bash
# Remove legacy aliases
/migration remove-legacy Customer --confirm

# Delete old interface files
/migration cleanup-interfaces --domain customer --confirm

# Verify cleanup completion
/migration verify-cleanup
```

## Error Prevention and Recovery

### Common Migration Pitfalls
1. **Breaking API contracts**: Always validate API compatibility
2. **Missing validation decorators**: Use comprehensive validation presets
3. **Circular dependencies**: Resolve dependency order before migration
4. **Enum mismatches**: Always use Prisma enums as source of truth
5. **Null vs undefined**: Handle optionality consistently

### Recovery Strategies
```bash
# Rollback partial migration
/migration rollback --to-commit <hash>

# Restore interface from backup
/migration restore-interface Customer

# Fix broken imports automatically
/migration fix-broken-imports

# Emergency compilation fix
/migration emergency-fix --skip-validation
```

### Build Validation Pipeline
```bash
# Incremental validation during migration
1. /migration validate-shared-lib
2. /migration validate-server  
3. /migration validate-frontend
4. /migration validate-integration

# Full validation before commit
/migration validate-all --strict
```

## Integration with Development Workflow

### Pre-Migration Checklist
- [ ] All tests passing
- [ ] No pending changes in git
- [ ] Backup created
- [ ] Migration plan approved
- [ ] Rollback strategy defined

### During Migration
- [ ] Create feature branch
- [ ] Run analysis commands
- [ ] Convert interfaces systematically
- [ ] Validate builds incrementally  
- [ ] Update documentation
- [ ] Test API compatibility

### Post-Migration Checklist
- [ ] All builds successful
- [ ] Tests updated and passing
- [ ] Legacy aliases removed
- [ ] Interface files deleted
- [ ] Documentation updated
- [ ] Performance benchmarks verified

## Quality Metrics

### Success Indicators
- ✅ Zero TypeScript compilation errors
- ✅ All validation decorators properly applied
- ✅ API contracts maintained
- ✅ Performance not degraded
- ✅ Test coverage maintained
- ✅ Clean git history

### Performance Benchmarks
- Migration time per interface
- Build time impact
- Runtime validation overhead
- Bundle size changes
- Memory usage comparison

## Advanced Migration Scenarios

### Generic Interface Migration
```typescript
// Before: generic interface
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

// After: generic DTO
export class ApiResponseDto<T> {
  @ValidateNested()
  data!: T;

  @IsBoolean()
  success!: boolean;

  @IsString()
  @IsOptional()
  message?: string;
}
```

### Union Type Migration
```typescript
// Before: union types
export interface SearchResult {
  type: 'customer' | 'vehicle' | 'tire';
  data: Customer | Vehicle | Tire;
}

// After: discriminated union DTO
export class SearchResultDto {
  @IsEnum(['customer', 'vehicle', 'tire'])
  type!: 'customer' | 'vehicle' | 'tire';

  @ValidateNested()
  @Type(() => Object) // Use type discriminator
  data!: CustomerDto | VehicleDto | TireDto;
}
```

This migration agent ensures systematic, safe, and complete interface-to-DTO migrations while maintaining code quality and system stability throughout the process.