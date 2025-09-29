# Migration Enforcement Workflow

## Overview
Automated workflow to ensure all schema changes have corresponding migrations before they can be committed or deployed.

## Pre-commit Hook Implementation

### Git Hook Setup
```bash
# Create pre-commit hook
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash

# GT Automotives Migration Check
./.claude/scripts/migration-check.sh

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Commit blocked due to migration issues"
    echo "Please resolve the issues above before committing"
    exit 1
fi

echo "✅ Migration check passed"
EOF

chmod +x .git/hooks/pre-commit
```

### Alternative: Manual Check Command
```bash
# Run migration check manually
./.claude/scripts/migration-check.sh
```

## CI/CD Integration

### GitHub Actions Workflow Addition
```yaml
# Add to .github/workflows/gt-deploy.yml
jobs:
  migration-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: yarn install --frozen-lockfile

      - name: Check Database Migrations
        run: |
          chmod +x ./.claude/scripts/migration-check.sh
          ./.claude/scripts/migration-check.sh
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}

  deploy:
    needs: migration-check  # Only deploy if migration check passes
    runs-on: ubuntu-latest
    # ... rest of deployment steps
```

## Development Workflow Commands

### Daily Development
```bash
# Before starting work - check migration status
./.claude/scripts/migration-check.sh

# After making schema changes - create migration
DATABASE_URL="postgresql://postgres@localhost:5432/gt_automotive?schema=public" npx prisma migrate dev --name "descriptive_name" --schema=libs/database/src/lib/prisma/schema.prisma

# Before committing - verify everything is ready
./.claude/scripts/migration-check.sh
git add .
git commit -m "feat: add new schema feature with migration"
```

### Production Deployment
```bash
# Before deploying - final check
./.claude/scripts/migration-check.sh

# Deploy migrations to production
DATABASE_URL="postgresql://gtadmin:P4dFPF6b5HasYFyrwcgOSfSdb@gt-automotives-db.postgres.database.azure.com:5432/gt_automotive?sslmode=require" yarn prisma migrate deploy --schema=libs/database/src/lib/prisma/schema.prisma

# Verify deployment
DATABASE_URL="postgresql://gtadmin:P4dFPF6b5HasYFyrwcgOSfSdb@gt-automotives-db.postgres.database.azure.com:5432/gt_automotive?sslmode=require" yarn prisma migrate status --schema=libs/database/src/lib/prisma/schema.prisma
```

## Migration Patterns by Change Type

### 1. Adding New Table
```typescript
// schema.prisma
model NewTable {
  id        String   @id @default(cuid())
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```
```bash
# Safe - no existing data affected
npx prisma migrate dev --name "add_new_table"
```

### 2. Adding Optional Field
```typescript
// schema.prisma
model ExistingTable {
  id       String  @id @default(cuid())
  name     String
  newField String? // Optional field
}
```
```bash
# Safe - nullable field
npx prisma migrate dev --name "add_optional_field"
```

### 3. Adding Required Field (Complex)
```typescript
// schema.prisma - DO NOT do this directly if table has data
model ExistingTable {
  id          String @id @default(cuid())
  name        String
  requiredField String // This will break with existing data!
}
```
```sql
-- Custom migration required
-- libs/database/src/lib/prisma/migrations/TIMESTAMP_add_required_field_safely/migration.sql

-- Step 1: Add nullable column
ALTER TABLE "ExistingTable" ADD COLUMN "requiredField" TEXT;

-- Step 2: Populate with default values
UPDATE "ExistingTable" SET "requiredField" = 'default_value' WHERE "requiredField" IS NULL;

-- Step 3: Make NOT NULL
ALTER TABLE "ExistingTable" ALTER COLUMN "requiredField" SET NOT NULL;
```

### 4. Foreign Key Relationships
```typescript
// schema.prisma
model Invoice {
  id        String  @id @default(cuid())
  companyId String  // New foreign key
  company   Company @relation(fields: [companyId], references: [id])
}

model Company {
  id       String    @id @default(cuid())
  name     String
  invoices Invoice[]
}
```
```sql
-- Custom migration with data handling
-- 1. Create Company table first
-- 2. Insert default company
-- 3. Add nullable companyId to Invoice
-- 4. Update all invoices with default company
-- 5. Make companyId NOT NULL
-- 6. Add foreign key constraint
```

## Error Recovery Procedures

### Schema Drift Detected
```bash
# 1. Check what's different
DATABASE_URL="production_url" yarn prisma migrate status

# 2. Create fixing migration
npx prisma migrate dev --name "fix_schema_drift"

# 3. Deploy fix
DATABASE_URL="production_url" yarn prisma migrate deploy
```

### Failed Migration
```bash
# 1. Check migration status
DATABASE_URL="production_url" yarn prisma migrate status

# 2. Mark as rolled back if safe
DATABASE_URL="production_url" yarn prisma migrate resolve --rolled-back MIGRATION_NAME

# 3. Fix and redeploy
DATABASE_URL="production_url" yarn prisma migrate deploy
```

### Blocked Commit
```bash
# 1. Run check to see what's wrong
./.claude/scripts/migration-check.sh

# 2. Create missing migration
npx prisma migrate dev --name "fix_missing_migration"

# 3. Verify and commit
./.claude/scripts/migration-check.sh
git add .
git commit -m "fix: add missing migration"
```

## Best Practices Enforcement

### Code Review Checklist
- [ ] Schema changes have corresponding migrations
- [ ] Migration has been tested locally
- [ ] Migration is production-safe (handles existing data)
- [ ] Migration has descriptive name
- [ ] No direct database modifications in code

### Automated Checks
1. **Pre-commit**: Block commits without migrations
2. **CI/CD**: Verify migration status before deployment
3. **Production**: Always check migration status before deployment
4. **Monitoring**: Alert on schema drift detection

## Integration Points

### VS Code Extensions
```json
// .vscode/settings.json
{
  "emeraldwalk.runonsave": {
    "commands": [
      {
        "match": "schema\\.prisma$",
        "cmd": "./.claude/scripts/migration-check.sh"
      }
    ]
  }
}
```

### Package.json Scripts
```json
{
  "scripts": {
    "migration:check": "./.claude/scripts/migration-check.sh",
    "migration:create": "DATABASE_URL=\"postgresql://postgres@localhost:5432/gt_automotive?schema=public\" npx prisma migrate dev --schema=libs/database/src/lib/prisma/schema.prisma",
    "migration:deploy": "DATABASE_URL=\"postgresql://gtadmin:P4dFPF6b5HasYFyrwcgOSfSdb@gt-automotives-db.postgres.database.azure.com:5432/gt_automotive?sslmode=require\" yarn prisma migrate deploy --schema=libs/database/src/lib/prisma/schema.prisma",
    "migration:status": "yarn prisma migrate status --schema=libs/database/src/lib/prisma/schema.prisma"
  }
}
```