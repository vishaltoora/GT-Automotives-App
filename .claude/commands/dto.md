# DTO Management Commands

## Overview
Commands for managing Data Transfer Objects (DTOs) with class-validator in the shared library.

## Available Commands

### `/dto create <entity>`
Creates a new DTO file with CRUD operations and updates the index file.

**Usage:**
```bash
/dto create user
/dto create product
/dto create order
```

**What it does:**
- Creates `libs/shared/interfaces/src/lib/dtos/{entity}.dto.ts`
- Includes EntityDto, CreateEntityDto, UpdateEntityDto classes
- Adds appropriate class-validator decorators
- Uses Prisma enums where applicable
- Updates `src/index.ts` to export new DTOs
- Follows consistent naming and structure patterns

### `/dto update <entity> [options]`
Updates an existing DTO with new fields or modifications.

**Usage:**
```bash
/dto update user --add-field avatar:string?
/dto update product --add-field category:CategoryEnum
/dto update order --remove-field oldField
```

**Options:**
- `--add-field field:type` - Add new field (use `?` for optional)
- `--remove-field field` - Remove existing field
- `--update-field field:newType` - Change field type
- `--add-validation field:validator` - Add validation decorator

### `/dto generate-from-schema`
Analyzes Prisma schema and creates missing DTOs for all models.

**Usage:**
```bash
/dto generate-from-schema
```

**What it does:**
- Reads `libs/database/src/lib/prisma/schema.prisma`
- Identifies Prisma models without corresponding DTOs
- Creates DTOs with appropriate field types and validations
- Uses Prisma enums automatically
- Updates index file with all new exports

### `/dto validate`
Validates all existing DTOs for consistency and correctness.

**Usage:**
```bash
/dto validate
/dto validate --fix
```

**Checks:**
- ✅ All DTOs use Prisma enums (not custom enums)
- ✅ Class-validator decorators are properly applied
- ✅ Required fields have definite assignment (`!`)
- ✅ Optional fields use `@IsOptional()` decorator
- ✅ Index file exports all DTOs
- ✅ No duplicate or conflicting type definitions

**Options:**
- `--fix` - Automatically fix common issues

### `/dto fix-imports`
Updates all import statements across the project to use DTOs instead of interfaces.

**Usage:**
```bash
/dto fix-imports
/dto fix-imports --dry-run
```

**What it does:**
- Scans all TypeScript files in the project
- Replaces interface imports with DTO imports
- Updates import paths from old locations
- Fixes type annotations to use DTOs
- Updates method signatures and return types

**Options:**
- `--dry-run` - Show what would be changed without making changes

### `/dto list`
Lists all existing DTOs and their status.

**Usage:**
```bash
/dto list
/dto list --missing
```

**Output:**
```
📦 Existing DTOs:
✅ user.dto.ts (exported)
✅ customer.dto.ts (exported)
✅ vehicle.dto.ts (exported)
❌ product.dto.ts (not exported)

🔍 Prisma Models without DTOs:
- Invoice
- QuotationItem
- AuditLog
```

**Options:**
- `--missing` - Only show Prisma models without DTOs

### `/dto build-test`
Tests that all DTOs compile and build successfully.

**Usage:**
```bash
/dto build-test
/dto build-test --full
```

**What it does:**
- Builds shared interfaces library
- Runs TypeScript compilation
- Tests server build with DTOs
- Reports any compilation errors
- Validates decorator compatibility

**Options:**
- `--full` - Also test frontend build and full typecheck

### `/dto migration <from> <to>`
Migrates from old interface/type system to new DTO system.

**Usage:**
```bash
/dto migration interfaces dtos
/dto migration types dtos
```

**Migration process:**
1. Backup existing interface/type files
2. Create equivalent DTOs with validation
3. Update all import statements
4. Test compilation
5. Remove old files if successful
6. Update index exports

## Command Workflows

### Creating a New Entity DTO
```bash
# Create the DTO
/dto create product

# Validate it was created correctly
/dto validate

# Test that it builds
/dto build-test
```

### Migrating Existing Interfaces
```bash
# List current interfaces
/dto list --missing

# Generate DTOs from schema
/dto generate-from-schema

# Fix all imports to use DTOs
/dto fix-imports --dry-run
/dto fix-imports

# Validate everything is correct
/dto validate --fix

# Test full build
/dto build-test --full
```

### Adding Fields to Existing DTO
```bash
# Add new fields
/dto update user --add-field avatar:string? --add-field lastLogin:Date?

# Validate changes
/dto validate

# Test build
/dto build-test
```

## Advanced Usage

### Custom Validation Patterns
```bash
# Add email validation
/dto update user --add-validation email:@IsEmail()

# Add numeric constraints
/dto update product --add-validation price:@Min(0)

# Add enum validation
/dto update order --add-validation status:@IsEnum(OrderStatus)
```

### Batch Operations
```bash
# Create multiple DTOs
/dto create user customer vehicle tire invoice quotation

# Update multiple DTOs
/dto update user,customer --add-field lastModified:Date
```

## Integration with Other Commands

### With Git Workflows
```bash
# Create DTO and commit
/dto create product
/git quick-commit "Add product DTO with validation"

# Migration workflow
/dto migration interfaces dtos
/git quick-commit "Migrate to DTO system with class-validator"
```

### With Build System
```bash
# Create DTO and test build
/dto create order
/dto build-test
/build trigger  # If build test passes
```

### With Development Workflow
```bash
# Full development cycle
/dto create product         # Create DTO
/dto validate              # Validate structure
/dto build-test           # Test compilation
/git status               # Check changes
/git quick-commit "feat: add product DTO"
/build trigger            # Trigger CI/CD build
```

## Error Handling

### Common Error Patterns
- **Missing Experimental Decorators**: Automatically fix tsconfig
- **Prisma Enum Mismatches**: Suggest correct enum imports
- **Missing Index Exports**: Auto-update index file
- **Validation Decorator Issues**: Provide decorator suggestions
- **Build Compilation Errors**: Show specific TypeScript errors with fixes

### Recovery Commands
```bash
# If DTOs break build
/dto validate --fix
/dto build-test

# If migration fails
/dto migration rollback
/git reset --soft HEAD~1

# If imports are broken
/dto fix-imports --force
```

## Best Practices Enforcement

### Automatic Checks
- ✅ Prisma enum usage validation
- ✅ Proper decorator application
- ✅ Consistent naming conventions
- ✅ Required field initialization
- ✅ Index file synchronization

### Code Quality
- Enforces TypeScript strict mode compliance
- Validates class-validator usage patterns  
- Ensures consistent error handling
- Maintains documentation standards
- Checks for potential type conflicts

This command system provides comprehensive DTO management while learning from the manual process we just completed.