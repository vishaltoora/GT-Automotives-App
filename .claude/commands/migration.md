# Migration Manager Commands

## Overview
Commands to invoke the Migration Manager agent for database schema change management.

## Available Commands

### `/migration check`
**Purpose**: Check current migration status and detect schema drift
**Usage**: `/migration check`
**What it does**:
- Runs migration status check on local and production databases
- Detects uncommitted schema changes without migrations
- Validates migration consistency across environments
- Provides actionable recommendations

**Example Output**:
```
🔍 GT Automotives Migration Check
========================================
✅ Local database is up to date
⚠️  Pending migrations in production database
   Deploy with: DATABASE_URL="prod_url" yarn prisma migrate deploy
```

### `/migration create <name>`
**Purpose**: Create a new migration for schema changes
**Usage**: `/migration create "add_new_feature"`
**Parameters**:
- `name` (required): Descriptive name for the migration
**What it does**:
- Creates migration for current schema changes
- Tests migration locally
- Validates migration safety
- Provides next steps for deployment

**Example**:
```
/migration create "add_company_settings"
```

### `/migration deploy`
**Purpose**: Deploy pending migrations to production
**Usage**: `/migration deploy`
**What it does**:
- Validates local migration status first
- Checks production readiness
- Deploys migrations to production database
- Verifies successful deployment
- Provides rollback instructions if needed

### `/migration status`
**Purpose**: Show detailed migration status across all environments
**Usage**: `/migration status`
**What it does**:
- Shows local database migration status
- Shows production database migration status
- Lists pending migrations
- Identifies any drift or inconsistencies

### `/migration validate`
**Purpose**: Validate current schema changes before committing
**Usage**: `/migration validate`
**What it does**:
- Checks if schema changes need migrations
- Validates migration safety for production
- Checks for breaking changes
- Provides migration recommendations

### `/migration fix-drift`
**Purpose**: Fix detected schema drift issues
**Usage**: `/migration fix-drift`
**What it does**:
- Analyzes schema drift between environments
- Creates corrective migrations
- Provides step-by-step fix instructions
- Validates fix before deployment

### `/migration rollback <migration-name>`
**Purpose**: Roll back a failed or problematic migration
**Usage**: `/migration rollback "20250928_add_company_table"`
**Parameters**:
- `migration-name` (required): Name of migration to roll back
**What it does**:
- Marks migration as rolled back in database
- Provides manual rollback SQL if needed
- Validates database state after rollback
- Suggests next steps

### `/migration history`
**Purpose**: Show migration history and timeline
**Usage**: `/migration history`
**What it does**:
- Lists all applied migrations with timestamps
- Shows migration status across environments
- Identifies any missing or failed migrations
- Provides migration timeline view

### `/migration safe-add <table> <field> <type>`
**Purpose**: Generate production-safe migration for adding required fields
**Usage**: `/migration safe-add "Invoice" "companyId" "String"`
**Parameters**:
- `table` (required): Table name to modify
- `field` (required): Field name to add
- `type` (required): Field type (String, Int, etc.)
**What it does**:
- Generates production-safe migration pattern
- Handles existing data properly
- Creates step-by-step SQL migration
- Tests migration locally first

### `/migration emergency`
**Purpose**: Emergency migration procedures and recovery
**Usage**: `/migration emergency`
**What it does**:
- Provides emergency migration recovery procedures
- Shows how to resolve failed migrations
- Gives database backup and restore guidance
- Provides hotfix deployment options

## Command Integration Examples

### Daily Development Workflow
```bash
# Before starting work
/migration check

# After making schema changes
/migration validate
/migration create "add_user_preferences"

# Before committing
/migration check
```

### Production Deployment Workflow
```bash
# Pre-deployment validation
/migration status
/migration validate

# Deploy migrations
/migration deploy

# Post-deployment verification
/migration status
```

### Emergency Response Workflow
```bash
# When production issues detected
/migration emergency
/migration status
/migration fix-drift
```

## Command Implementation

### Slash Command Handler
```typescript
// .claude/handlers/migration-commands.ts
export const migrationCommands = {
  'migration check': () => runMigrationCheck(),
  'migration create': (name: string) => createMigration(name),
  'migration deploy': () => deployMigrations(),
  'migration status': () => showMigrationStatus(),
  'migration validate': () => validateMigrations(),
  'migration fix-drift': () => fixSchemaDrift(),
  'migration rollback': (name: string) => rollbackMigration(name),
  'migration history': () => showMigrationHistory(),
  'migration safe-add': (table: string, field: string, type: string) =>
    generateSafeMigration(table, field, type),
  'migration emergency': () => showEmergencyProcedures(),
};
```

### Command Scripts Mapping
```json
{
  "migration:check": "./.claude/scripts/migration-check.sh",
  "migration:create": "./.claude/scripts/migration-create.sh",
  "migration:deploy": "./.claude/scripts/migration-deploy.sh",
  "migration:status": "./.claude/scripts/migration-status.sh",
  "migration:validate": "./.claude/scripts/migration-validate.sh",
  "migration:fix-drift": "./.claude/scripts/migration-fix-drift.sh",
  "migration:rollback": "./.claude/scripts/migration-rollback.sh",
  "migration:history": "./.claude/scripts/migration-history.sh",
  "migration:safe-add": "./.claude/scripts/migration-safe-add.sh",
  "migration:emergency": "./.claude/scripts/migration-emergency.sh"
}
```

## VS Code Integration

### Command Palette
```json
// .vscode/settings.json
{
  "commands": [
    {
      "command": "gt.migration.check",
      "title": "GT: Check Migration Status",
      "category": "GT Automotives"
    },
    {
      "command": "gt.migration.create",
      "title": "GT: Create Migration",
      "category": "GT Automotives"
    },
    {
      "command": "gt.migration.deploy",
      "title": "GT: Deploy Migrations",
      "category": "GT Automotives"
    }
  ]
}
```

### Quick Actions
```json
// .vscode/tasks.json
{
  "tasks": [
    {
      "label": "Migration Check",
      "type": "shell",
      "command": "${workspaceFolder}/.claude/scripts/migration-check.sh",
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared"
      }
    }
  ]
}
```

## Command Aliases

### Short Commands
- `/mig check` → `/migration check`
- `/mig create` → `/migration create`
- `/mig deploy` → `/migration deploy`
- `/mig status` → `/migration status`
- `/mig fix` → `/migration fix-drift`

### Package.json Scripts
```json
{
  "scripts": {
    "mig:check": "yarn migration:check",
    "mig:create": "yarn migration:create",
    "mig:deploy": "yarn migration:deploy",
    "mig:status": "yarn migration:status"
  }
}
```

## Error Handling

### Command Validation
- Validate required parameters before execution
- Check database connectivity before operations
- Verify file permissions for script execution
- Provide helpful error messages with next steps

### Fallback Procedures
- If automated commands fail, provide manual instructions
- Show exact shell commands for direct execution
- Provide alternative approaches for complex scenarios
- Include contact information for emergency support

## Security Considerations

### Production Access
- Commands that affect production require confirmation
- Sensitive database URLs are masked in output
- Production operations require explicit user consent
- All production changes are logged and auditable

### Command Permissions
- Development commands: No restrictions
- Staging commands: Require confirmation
- Production commands: Require explicit approval
- Emergency commands: Require admin privileges

## Integration with Existing Workflows

### Git Hooks
- Pre-commit: Auto-run `/migration check`
- Pre-push: Auto-run `/migration validate`
- Post-merge: Auto-run `/migration status`

### CI/CD Pipeline
- Build stage: Run `/migration validate`
- Deploy stage: Run `/migration deploy`
- Post-deploy: Run `/migration status`

### Monitoring Integration
- Failed migrations trigger alerts
- Schema drift detection sends notifications
- Production deployment status updates stakeholders