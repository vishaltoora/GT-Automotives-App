#!/bin/bash

# Migration Check Script
# Ensures proper migration workflow for schema changes

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔍 GT Automotives Migration Check${NC}"
echo "========================================"

# Check if schema.prisma exists
SCHEMA_PATH="libs/database/src/lib/prisma/schema.prisma"
if [ ! -f "$SCHEMA_PATH" ]; then
    echo -e "${RED}❌ Schema file not found: $SCHEMA_PATH${NC}"
    exit 1
fi

# Check for uncommitted schema changes
if git diff --name-only | grep -q "schema.prisma"; then
    echo -e "${YELLOW}⚠️  Uncommitted schema changes detected${NC}"
    echo -e "${YELLOW}   Schema changes must have corresponding migrations${NC}"

    # Check if any new migrations were created
    if [ -z "$(git diff --name-only | grep -E 'migrations/.*\.sql')" ]; then
        echo -e "${RED}❌ No migration files found for schema changes${NC}"
        echo -e "${RED}   You must create a migration before committing schema changes${NC}"
        echo ""
        echo -e "${YELLOW}Run this command to create a migration:${NC}"
        echo "DATABASE_URL=\"postgresql://postgres@localhost:5432/gt_automotive?schema=public\" npx prisma migrate dev --name \"your_migration_name\" --schema=libs/database/src/lib/prisma/schema.prisma"
        exit 1
    else
        echo -e "${GREEN}✅ Migration files found${NC}"
    fi
fi

# Check local migration status
echo ""
echo -e "${GREEN}📋 Checking local migration status...${NC}"
LOCAL_STATUS=$(DATABASE_URL="postgresql://postgres@localhost:5432/gt_automotive?schema=public" yarn -s prisma migrate status --schema="$SCHEMA_PATH" 2>/dev/null || echo "error")

if echo "$LOCAL_STATUS" | grep -q "Database schema is up to date"; then
    echo -e "${GREEN}✅ Local database is up to date${NC}"
elif echo "$LOCAL_STATUS" | grep -q "following migration"; then
    echo -e "${YELLOW}⚠️  Pending migrations in local database${NC}"
    echo -e "${YELLOW}   Run: yarn prisma migrate dev --schema=$SCHEMA_PATH${NC}"
elif [ "$LOCAL_STATUS" = "error" ]; then
    echo -e "${YELLOW}⚠️  Could not connect to local database${NC}"
    echo -e "${YELLOW}   Make sure PostgreSQL is running locally${NC}"
else
    echo -e "${RED}❌ Local migration status unclear${NC}"
    echo "$LOCAL_STATUS"
fi

# Production migration status check (optional)
echo ""
echo -e "${GREEN}🌐 Checking production migration status...${NC}"
PROD_URL="postgresql://gtadmin:P4dFPF6b5HasYFyrwcgOSfSdb@gt-automotives-db.postgres.database.azure.com:5432/gt_automotive?sslmode=require"
PROD_STATUS=$(DATABASE_URL="$PROD_URL" yarn -s prisma migrate status --schema="$SCHEMA_PATH" 2>/dev/null || echo "error")

if echo "$PROD_STATUS" | grep -q "Database schema is up to date"; then
    echo -e "${GREEN}✅ Production database is up to date${NC}"
elif echo "$PROD_STATUS" | grep -q "following migration"; then
    echo -e "${YELLOW}⚠️  Pending migrations in production database${NC}"
    echo -e "${YELLOW}   Deploy with: DATABASE_URL=\"$PROD_URL\" yarn prisma migrate deploy --schema=$SCHEMA_PATH${NC}"
elif [ "$PROD_STATUS" = "error" ]; then
    echo -e "${YELLOW}⚠️  Could not connect to production database${NC}"
    echo -e "${YELLOW}   Check network connection and credentials${NC}"
else
    echo -e "${RED}❌ Production migration status unclear${NC}"
    echo "$PROD_STATUS"
fi

# Summary
echo ""
echo -e "${GREEN}📊 Migration Check Summary${NC}"
echo "=========================="

if git diff --name-only | grep -q "schema.prisma" && [ -z "$(git diff --name-only | grep -E 'migrations/.*\.sql')" ]; then
    echo -e "${RED}❌ FAILED: Schema changes without migrations${NC}"
    exit 1
elif echo "$LOCAL_STATUS" | grep -q "following migration"; then
    echo -e "${YELLOW}⚠️  WARNING: Pending local migrations${NC}"
    exit 1
elif echo "$PROD_STATUS" | grep -q "following migration"; then
    echo -e "${YELLOW}⚠️  WARNING: Pending production migrations${NC}"
    echo -e "${YELLOW}   Production deployment needed${NC}"
    exit 0
else
    echo -e "${GREEN}✅ PASSED: All migrations are up to date${NC}"
    exit 0
fi