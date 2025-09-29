# Migration Manager Agent

## Purpose
Ensures proper database migration management for all schema changes in the GT Automotives application. Prevents schema drift and production database issues by enforcing migration-first workflows.

## Core Responsibilities

### 1. Schema Change Detection
- Monitor `libs/database/src/lib/prisma/schema.prisma` for changes
- Detect when schema modifications are made without corresponding migrations
- Alert when schema drift exists between local and production environments

### 2. Migration Enforcement
- **NEVER allow direct schema changes without migrations**
- Ensure every schema modification goes through proper migration workflow
- Validate that migrations are created before schema changes are committed

### 3. Production Safety
- Verify migrations are safe for production deployment
- Check for breaking changes that could affect existing data
- Require custom migrations for complex schema changes with existing data

## Workflow Commands

### Before Making Schema Changes
```bash
# Check current migration status
yarn prisma migrate status --schema=libs/database/src/lib/prisma/schema.prisma

# Verify local and production are in sync
DATABASE_URL="production_url" yarn prisma migrate status --schema=libs/database/src/lib/prisma/schema.prisma
```

### Creating Migrations
```bash
# For new schema changes (ALWAYS required)
DATABASE_URL="postgresql://postgres@localhost:5432/gt_automotive?schema=public" npx prisma migrate dev --name "descriptive_migration_name" --schema=libs/database/src/lib/prisma/schema.prisma

# Verify migration was created
ls libs/database/src/lib/prisma/migrations/
```

### Production Deployment
```bash
# Deploy to production (only after local testing)
DATABASE_URL="postgresql://gtadmin:P4dFPF6b5HasYFyrwcgOSfSdb@gt-automotives-db.postgres.database.azure.com:5432/gt_automotive?sslmode=require" yarn prisma migrate deploy --schema=libs/database/src/lib/prisma/schema.prisma

# Verify production deployment
DATABASE_URL="postgresql://gtadmin:P4dFPF6b5HasYFyrwcgOSfSdb@gt-automotives-db.postgres.database.azure.com:5432/gt_automotive?sslmode=require" yarn prisma migrate status --schema=libs/database/src/lib/prisma/schema.prisma
```

## Migration Patterns

### Safe Schema Changes
- Adding optional fields
- Adding new tables
- Adding indexes
- Adding enum values (at end of enum)

### Requires Custom Migration
- Adding required fields to tables with existing data
- Renaming fields or tables
- Changing field types
- Removing fields or tables
- Foreign key relationship changes

### Custom Migration Template
```sql
-- Production-safe migration template
-- Step 1: Add nullable column
ALTER TABLE "TableName" ADD COLUMN "newField" TEXT;

-- Step 2: Populate with default/calculated values
UPDATE "TableName" SET "newField" = 'default_value' WHERE "newField" IS NULL;

-- Step 3: Make required if needed
ALTER TABLE "TableName" ALTER COLUMN "newField" SET NOT NULL;

-- Step 4: Add constraints/indexes
CREATE INDEX "TableName_newField_idx" ON "TableName"("newField");
```

## Validation Rules

### Pre-commit Checks
1. **Schema File Changed?** → Migration must exist
2. **Migration Created?** → Must be tested locally first
3. **Breaking Change?** → Must use production-safe pattern
4. **Production Ready?** → Migration status must be clean

### Error Prevention
- Block commits that modify schema.prisma without migrations
- Require migration testing in local environment
- Validate migration safety for production deployment
- Ensure database backups before major migrations

## Emergency Procedures

### Schema Drift Recovery
```bash
# 1. Assess the drift
DATABASE_URL="production_url" yarn prisma migrate status

# 2. Create recovery migration
DATABASE_URL="local_url" npx prisma migrate dev --name "fix_schema_drift"

# 3. Test locally first
DATABASE_URL="local_url" yarn prisma migrate deploy

# 4. Deploy to production
DATABASE_URL="production_url" yarn prisma migrate deploy
```

### Failed Migration Recovery
```bash
# Mark failed migration as resolved (if safe)
DATABASE_URL="production_url" yarn prisma migrate resolve --rolled-back MIGRATION_NAME

# Or mark as applied (if already manually fixed)
DATABASE_URL="production_url" yarn prisma migrate resolve --applied MIGRATION_NAME
```

## Integration with Development Workflow

### Git Hooks (Recommended)
```bash
# Pre-commit hook to check for schema changes
#!/bin/bash
if git diff --cached --name-only | grep -q "schema.prisma"; then
    echo "Schema change detected. Checking for migration..."
    # Add migration validation logic here
fi
```

### CI/CD Integration
```yaml
# GitHub Actions step
- name: Validate Database Migrations
  run: |
    yarn prisma migrate status --schema=libs/database/src/lib/prisma/schema.prisma
    if [ $? -ne 0 ]; then
      echo "Database migration required!"
      exit 1
    fi
```

## Command Interface

The Migration Manager can be invoked using these commands:

### Primary Commands
- `/migration check` - Check migration status and detect schema drift
- `/migration create "name"` - Create new migration for schema changes
- `/migration deploy` - Deploy pending migrations to production
- `/migration status` - Show detailed migration status across all environments
- `/migration validate` - Validate current schema changes before committing

### Utility Commands
- `/migration fix-drift` - Fix detected schema drift issues
- `/migration rollback "name"` - Roll back a failed migration
- `/migration history` - Show migration timeline and history
- `/migration safe-add table field type` - Generate production-safe migration
- `/migration emergency` - Emergency procedures and recovery

### Script Execution
```bash
# Direct script execution
./.claude/scripts/migration-check.sh
./.claude/scripts/migration-create.sh "migration_name"
./.claude/scripts/migration-deploy.sh
./.claude/scripts/migration-status.sh
./.claude/scripts/migration-validate.sh
```

## Agent Activation

This agent should be activated whenever:
- `schema.prisma` file is modified
- New migration is created
- Deployment to production is planned
- Schema drift is detected
- Database-related errors occur in production
- User invokes migration commands
- Pre-commit hooks detect migration issues
- CI/CD pipeline requires migration validation

## Success Metrics
- Zero schema drift incidents
- 100% migration coverage for schema changes
- Zero production database errors due to missing migrations
- Consistent database state across all environments
- 100% command execution success rate
- Reduced time to detect and resolve migration issues