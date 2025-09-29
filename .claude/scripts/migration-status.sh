#!/bin/bash

# Migration Status Script
# Shows detailed migration status across all environments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

SCHEMA_PATH="libs/database/src/lib/prisma/schema.prisma"
LOCAL_DB_URL="postgresql://postgres@localhost:5432/gt_automotive?schema=public"
PROD_DB_URL="postgresql://gtadmin:P4dFPF6b5HasYFyrwcgOSfSdb@gt-automotives-db.postgres.database.azure.com:5432/gt_automotive?sslmode=require"

echo -e "${GREEN}📊 GT Automotives Migration Status Report${NC}"
echo "=============================================="
echo "Generated: $(date)"
echo ""

# Check if schema file exists
if [ ! -f "$SCHEMA_PATH" ]; then
    echo -e "${RED}❌ Schema file not found: $SCHEMA_PATH${NC}"
    exit 1
fi

# Migration files overview
echo -e "${BLUE}📁 Migration Files Overview${NC}"
echo "----------------------------"
if [ -d "libs/database/src/lib/prisma/migrations" ]; then
    MIGRATION_COUNT=$(ls -1 libs/database/src/lib/prisma/migrations 2>/dev/null | wc -l)
    echo "Total migrations: $MIGRATION_COUNT"

    if [ $MIGRATION_COUNT -gt 0 ]; then
        echo ""
        echo "Recent migrations (latest 5):"
        ls -t libs/database/src/lib/prisma/migrations 2>/dev/null | head -5 | while read migration; do
            if [ -f "libs/database/src/lib/prisma/migrations/$migration/migration.sql" ]; then
                FIRST_LINE=$(head -1 "libs/database/src/lib/prisma/migrations/$migration/migration.sql" 2>/dev/null | sed 's/^-- //' || echo "No description")
                echo "  • $migration"
                echo "    $FIRST_LINE"
            fi
        done
    fi
else
    echo -e "${RED}❌ No migration directory found${NC}"
fi

echo ""

# Git status for schema changes
echo -e "${BLUE}📋 Git Status for Schema Changes${NC}"
echo "--------------------------------"
if git diff --name-only | grep -q "schema.prisma"; then
    echo -e "${YELLOW}⚠️  Uncommitted schema changes detected${NC}"
    echo "Modified files:"
    git diff --name-only | grep -E "(schema\.prisma|migration)" | sed 's/^/  • /'

    # Check for new migrations
    if git diff --name-only | grep -E "migrations/.*\.sql" >/dev/null; then
        echo -e "${GREEN}✅ New migration files found${NC}"
    else
        echo -e "${RED}❌ No migration files for schema changes${NC}"
    fi
elif git diff --cached --name-only | grep -q "schema.prisma"; then
    echo -e "${YELLOW}⚠️  Staged schema changes detected${NC}"
    echo "Staged files:"
    git diff --cached --name-only | grep -E "(schema\.prisma|migration)" | sed 's/^/  • /'
else
    echo -e "${GREEN}✅ No uncommitted schema changes${NC}"
fi

echo ""

# Local database status
echo -e "${BLUE}🏠 Local Database Status${NC}"
echo "-------------------------"
if pg_isready -h localhost -p 5432 -U postgres >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Local PostgreSQL connection OK${NC}"

    LOCAL_STATUS=$(DATABASE_URL="$LOCAL_DB_URL" yarn -s prisma migrate status --schema="$SCHEMA_PATH" 2>/dev/null || echo "error")

    if echo "$LOCAL_STATUS" | grep -q "Database schema is up to date"; then
        echo -e "${GREEN}✅ Local database is up to date${NC}"
    elif echo "$LOCAL_STATUS" | grep -q "following migration"; then
        echo -e "${YELLOW}⚠️  Pending migrations in local database${NC}"
        echo "Pending migrations:"
        echo "$LOCAL_STATUS" | grep -A 10 "following migration" | sed 's/^/  /'
    elif [ "$LOCAL_STATUS" = "error" ]; then
        echo -e "${RED}❌ Error checking local migration status${NC}"
    else
        echo -e "${YELLOW}⚠️  Unclear local migration status${NC}"
        echo "$LOCAL_STATUS"
    fi
else
    echo -e "${RED}❌ Cannot connect to local PostgreSQL${NC}"
    echo "   Make sure PostgreSQL is running on port 5432"
fi

echo ""

# Production database status
echo -e "${BLUE}🌐 Production Database Status${NC}"
echo "------------------------------"
PROD_STATUS=$(DATABASE_URL="$PROD_DB_URL" yarn -s prisma migrate status --schema="$SCHEMA_PATH" 2>/dev/null || echo "error")

if echo "$PROD_STATUS" | grep -q "Database schema is up to date"; then
    echo -e "${GREEN}✅ Production database is up to date${NC}"
elif echo "$PROD_STATUS" | grep -q "following migration"; then
    echo -e "${YELLOW}⚠️  Pending migrations in production database${NC}"
    echo "Pending migrations:"
    echo "$PROD_STATUS" | grep -A 10 "following migration" | sed 's/^/  /'
    echo ""
    echo -e "${CYAN}💡 To deploy: ./.claude/scripts/migration-deploy.sh${NC}"
elif [ "$PROD_STATUS" = "error" ]; then
    echo -e "${RED}❌ Cannot connect to production database${NC}"
    echo "   Check network connection and credentials"
else
    echo -e "${YELLOW}⚠️  Unclear production migration status${NC}"
    echo "$PROD_STATUS"
fi

echo ""

# Schema drift analysis
echo -e "${BLUE}🔍 Schema Drift Analysis${NC}"
echo "-------------------------"
if [ "$LOCAL_STATUS" != "error" ] && [ "$PROD_STATUS" != "error" ]; then
    if echo "$LOCAL_STATUS" | grep -q "up to date" && echo "$PROD_STATUS" | grep -q "up to date"; then
        echo -e "${GREEN}✅ No schema drift detected${NC}"
        echo "   Local and production databases are in sync"
    elif echo "$LOCAL_STATUS" | grep -q "up to date" && echo "$PROD_STATUS" | grep -q "following migration"; then
        echo -e "${YELLOW}⚠️  Production behind local${NC}"
        echo "   Production needs migration deployment"
    elif echo "$LOCAL_STATUS" | grep -q "following migration" && echo "$PROD_STATUS" | grep -q "up to date"; then
        echo -e "${YELLOW}⚠️  Local behind production${NC}"
        echo "   Local needs migration application"
    else
        echo -e "${RED}❌ Complex schema drift detected${NC}"
        echo "   Manual intervention may be required"
    fi
else
    echo -e "${YELLOW}⚠️  Cannot determine schema drift${NC}"
    echo "   Database connection issues prevent analysis"
fi

echo ""

# Quick actions
echo -e "${BLUE}⚡ Quick Actions${NC}"
echo "----------------"
echo "Available commands:"
echo "  • Check status: ./.claude/scripts/migration-check.sh"
echo "  • Create migration: ./.claude/scripts/migration-create.sh \"name\""
echo "  • Deploy to production: ./.claude/scripts/migration-deploy.sh"
echo "  • Fix schema drift: ./.claude/scripts/migration-fix-drift.sh"
echo ""
echo "Manual commands:"
echo "  • Local migrate: DATABASE_URL=\"$LOCAL_DB_URL\" yarn prisma migrate dev"
echo "  • Production deploy: DATABASE_URL=\"$PROD_DB_URL\" yarn prisma migrate deploy"
echo "  • Reset local: DATABASE_URL=\"$LOCAL_DB_URL\" yarn prisma migrate reset"

echo ""

# Health summary
echo -e "${BLUE}🏥 Health Summary${NC}"
echo "-----------------"
ISSUES=0

if git diff --name-only | grep -q "schema.prisma" && ! git diff --name-only | grep -E "migrations/.*\.sql" >/dev/null; then
    echo -e "${RED}❌ Schema changes without migrations${NC}"
    ((ISSUES++))
fi

if [ "$LOCAL_STATUS" != "error" ] && echo "$LOCAL_STATUS" | grep -q "following migration"; then
    echo -e "${YELLOW}⚠️  Local database needs migration${NC}"
    ((ISSUES++))
fi

if [ "$PROD_STATUS" != "error" ] && echo "$PROD_STATUS" | grep -q "following migration"; then
    echo -e "${YELLOW}⚠️  Production database needs migration${NC}"
    ((ISSUES++))
fi

if [ "$LOCAL_STATUS" = "error" ]; then
    echo -e "${RED}❌ Local database connection issues${NC}"
    ((ISSUES++))
fi

if [ "$PROD_STATUS" = "error" ]; then
    echo -e "${RED}❌ Production database connection issues${NC}"
    ((ISSUES++))
fi

if [ $ISSUES -eq 0 ]; then
    echo -e "${GREEN}✅ All systems healthy${NC}"
    echo "   No migration issues detected"
else
    echo -e "${YELLOW}⚠️  $ISSUES issue(s) detected${NC}"
    echo "   Review the status above and take appropriate action"
fi

echo ""
echo -e "${GREEN}Status report completed! 📊${NC}"