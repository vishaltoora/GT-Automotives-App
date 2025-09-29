#!/bin/bash

# Migration Validate Script
# Validates current schema changes before committing

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SCHEMA_PATH="libs/database/src/lib/prisma/schema.prisma"
LOCAL_DB_URL="postgresql://postgres@localhost:5432/gt_automotive?schema=public"

echo -e "${GREEN}🔍 GT Automotives Migration Validation${NC}"
echo "========================================"

# Check if schema file exists
if [ ! -f "$SCHEMA_PATH" ]; then
    echo -e "${RED}❌ Schema file not found: $SCHEMA_PATH${NC}"
    exit 1
fi

VALIDATION_ERRORS=0

# Check 1: Schema changes require migrations
echo -e "${BLUE}📋 Checking schema changes...${NC}"
if git diff --name-only | grep -q "schema.prisma" || git diff --cached --name-only | grep -q "schema.prisma"; then
    echo -e "${YELLOW}⚠️  Schema changes detected${NC}"

    # Check if migrations exist for these changes
    if git diff --name-only | grep -E "migrations/.*\.sql" >/dev/null || git diff --cached --name-only | grep -E "migrations/.*\.sql" >/dev/null; then
        echo -e "${GREEN}✅ Migration files found${NC}"
    else
        echo -e "${RED}❌ No migration files for schema changes${NC}"
        echo "   You must create a migration: ./.claude/scripts/migration-create.sh \"name\""
        ((VALIDATION_ERRORS++))
    fi
else
    echo -e "${GREEN}✅ No schema changes detected${NC}"
fi

# Check 2: Local database status
echo ""
echo -e "${BLUE}🏠 Checking local database status...${NC}"
if pg_isready -h localhost -p 5432 -U postgres >/dev/null 2>&1; then
    LOCAL_STATUS=$(DATABASE_URL="$LOCAL_DB_URL" yarn -s prisma migrate status --schema="$SCHEMA_PATH" 2>/dev/null || echo "error")

    if echo "$LOCAL_STATUS" | grep -q "Database schema is up to date"; then
        echo -e "${GREEN}✅ Local database is up to date${NC}"
    elif echo "$LOCAL_STATUS" | grep -q "following migration"; then
        echo -e "${RED}❌ Local database has pending migrations${NC}"
        echo "   Run: DATABASE_URL=\"$LOCAL_DB_URL\" yarn prisma migrate dev"
        ((VALIDATION_ERRORS++))
    else
        echo -e "${YELLOW}⚠️  Could not determine local database status${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Cannot connect to local PostgreSQL${NC}"
    echo "   Migration validation incomplete"
fi

# Check 3: Prisma schema syntax validation
echo ""
echo -e "${BLUE}📝 Validating Prisma schema syntax...${NC}"
if npx prisma validate --schema="$SCHEMA_PATH" >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Prisma schema syntax is valid${NC}"
else
    echo -e "${RED}❌ Prisma schema has syntax errors${NC}"
    echo "   Fix schema syntax before proceeding"
    npx prisma validate --schema="$SCHEMA_PATH"
    ((VALIDATION_ERRORS++))
fi

# Check 4: Breaking changes analysis
echo ""
echo -e "${BLUE}⚠️  Analyzing for breaking changes...${NC}"
BREAKING_CHANGES=0

# Check for removed fields/tables (would need git diff analysis)
if git diff --name-only | grep -q "schema.prisma"; then
    # Simple check for potentially breaking changes
    if git diff "$SCHEMA_PATH" | grep -q "^-.*model\|^-.*@id\|^-.*@unique\|^-.*String\|^-.*Int\|^-.*Boolean"; then
        echo -e "${YELLOW}⚠️  Potentially breaking changes detected${NC}"
        echo "   Review changes carefully:"
        git diff "$SCHEMA_PATH" | grep "^-.*model\|^-.*@id\|^-.*@unique\|^-.*String\|^-.*Int\|^-.*Boolean" | head -5
        echo "   Consider production-safe migration patterns"
        ((BREAKING_CHANGES++))
    fi

    # Check for new required fields
    if git diff "$SCHEMA_PATH" | grep -q "^+.*String\s*$\|^+.*Int\s*$\|^+.*Boolean\s*$"; then
        echo -e "${YELLOW}⚠️  New required fields detected${NC}"
        echo "   Required fields on existing tables need special handling"
        echo "   Use production-safe migration pattern: nullable → populate → required"
        ((BREAKING_CHANGES++))
    fi

    if [ $BREAKING_CHANGES -eq 0 ]; then
        echo -e "${GREEN}✅ No obvious breaking changes detected${NC}"
    fi
else
    echo -e "${GREEN}✅ No schema changes to analyze${NC}"
fi

# Check 5: Migration file integrity
echo ""
echo -e "${BLUE}🔍 Checking migration file integrity...${NC}"
if [ -d "libs/database/src/lib/prisma/migrations" ]; then
    INVALID_MIGRATIONS=0

    for migration_dir in libs/database/src/lib/prisma/migrations/*/; do
        if [ -d "$migration_dir" ]; then
            migration_name=$(basename "$migration_dir")
            sql_file="$migration_dir/migration.sql"

            if [ ! -f "$sql_file" ]; then
                echo -e "${RED}❌ Missing SQL file: $migration_name${NC}"
                ((INVALID_MIGRATIONS++))
            elif [ ! -s "$sql_file" ]; then
                echo -e "${YELLOW}⚠️  Empty migration file: $migration_name${NC}"
                ((INVALID_MIGRATIONS++))
            fi
        fi
    done

    if [ $INVALID_MIGRATIONS -eq 0 ]; then
        echo -e "${GREEN}✅ All migration files are valid${NC}"
    else
        echo -e "${RED}❌ $INVALID_MIGRATIONS invalid migration file(s)${NC}"
        ((VALIDATION_ERRORS++))
    fi
else
    echo -e "${YELLOW}⚠️  No migration directory found${NC}"
fi

# Check 6: TypeScript compilation
echo ""
echo -e "${BLUE}🔧 Checking TypeScript compilation...${NC}"
if yarn typecheck >/dev/null 2>&1; then
    echo -e "${GREEN}✅ TypeScript compilation successful${NC}"
else
    echo -e "${RED}❌ TypeScript compilation errors${NC}"
    echo "   Fix TypeScript errors before proceeding"
    yarn typecheck | head -10
    ((VALIDATION_ERRORS++))
fi

# Summary
echo ""
echo -e "${BLUE}📊 Validation Summary${NC}"
echo "====================="

if [ $VALIDATION_ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ VALIDATION PASSED${NC}"
    echo "   Schema changes are ready for commit"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo "1. Test application locally: yarn dev"
    echo "2. Run tests: yarn test"
    echo "3. Commit changes: git add . && git commit"
    echo "4. Deploy when ready: ./.claude/scripts/migration-deploy.sh"
elif [ $VALIDATION_ERRORS -eq 1 ]; then
    echo -e "${YELLOW}⚠️  VALIDATION WARNING (1 issue)${NC}"
    echo "   Please address the issue above before committing"
    exit 1
else
    echo -e "${RED}❌ VALIDATION FAILED ($VALIDATION_ERRORS issues)${NC}"
    echo "   Please address all issues above before committing"
    exit 1
fi

# Optional: Run quick tests
echo ""
read -p "Run quick local tests? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}🧪 Running quick tests...${NC}"

    # Test server startup
    if yarn dev:server >/dev/null 2>&1 & SERVER_PID=$!; then
        sleep 3
        if kill -0 $SERVER_PID 2>/dev/null; then
            echo -e "${GREEN}✅ Server starts successfully${NC}"
            kill $SERVER_PID >/dev/null 2>&1
        else
            echo -e "${RED}❌ Server startup failed${NC}"
        fi
    fi

    # Test frontend build
    if yarn build:web >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend builds successfully${NC}"
    else
        echo -e "${RED}❌ Frontend build failed${NC}"
    fi
fi

echo ""
echo -e "${GREEN}Validation completed! 🔍${NC}"