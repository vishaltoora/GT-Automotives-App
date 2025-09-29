#!/bin/bash

# Migration Create Script
# Creates a new migration for schema changes

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if migration name provided
if [ -z "$1" ]; then
    echo -e "${RED}❌ Migration name required${NC}"
    echo "Usage: $0 \"migration_name\""
    echo "Example: $0 \"add_company_settings\""
    exit 1
fi

MIGRATION_NAME="$1"
SCHEMA_PATH="libs/database/src/lib/prisma/schema.prisma"
LOCAL_DB_URL="postgresql://postgres@localhost:5432/gt_automotive?schema=public"

echo -e "${GREEN}🚀 Creating Migration: ${MIGRATION_NAME}${NC}"
echo "=================================================="

# Check if schema file exists
if [ ! -f "$SCHEMA_PATH" ]; then
    echo -e "${RED}❌ Schema file not found: $SCHEMA_PATH${NC}"
    exit 1
fi

# Check for uncommitted schema changes
if ! git diff --name-only | grep -q "schema.prisma"; then
    echo -e "${YELLOW}⚠️  No schema changes detected${NC}"
    echo "Make sure you have modified the schema.prisma file before creating a migration"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Migration creation cancelled"
        exit 0
    fi
fi

# Check local database connectivity
echo -e "${BLUE}🔌 Checking local database connectivity...${NC}"
if ! pg_isready -h localhost -p 5432 -U postgres >/dev/null 2>&1; then
    echo -e "${RED}❌ Cannot connect to local PostgreSQL database${NC}"
    echo "Make sure PostgreSQL is running locally on port 5432"
    exit 1
fi

echo -e "${GREEN}✅ Local database connection OK${NC}"

# Create the migration
echo -e "${BLUE}📝 Creating migration...${NC}"
if DATABASE_URL="$LOCAL_DB_URL" npx prisma migrate dev --name "$MIGRATION_NAME" --schema="$SCHEMA_PATH"; then
    echo -e "${GREEN}✅ Migration created successfully${NC}"
else
    echo -e "${RED}❌ Migration creation failed${NC}"
    echo "Check the error messages above and fix any issues"
    exit 1
fi

# Show created migration files
echo ""
echo -e "${GREEN}📁 Migration files created:${NC}"
LATEST_MIGRATION=$(ls -t libs/database/src/lib/prisma/migrations/ | head -1)
if [ -n "$LATEST_MIGRATION" ]; then
    echo "Directory: libs/database/src/lib/prisma/migrations/$LATEST_MIGRATION"
    echo "SQL file: libs/database/src/lib/prisma/migrations/$LATEST_MIGRATION/migration.sql"

    # Show migration content
    echo ""
    echo -e "${BLUE}📋 Migration content:${NC}"
    echo "----------------------------------------"
    cat "libs/database/src/lib/prisma/migrations/$LATEST_MIGRATION/migration.sql"
    echo "----------------------------------------"
fi

# Test the migration locally
echo ""
echo -e "${BLUE}🧪 Testing migration locally...${NC}"
if yarn dev:server >/dev/null 2>&1 & SERVER_PID=$!; then
    sleep 3
    if kill -0 $SERVER_PID 2>/dev/null; then
        echo -e "${GREEN}✅ Server started successfully with new schema${NC}"
        kill $SERVER_PID >/dev/null 2>&1
    else
        echo -e "${YELLOW}⚠️  Server startup test inconclusive${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Could not test server startup${NC}"
fi

# Check migration status
echo ""
echo -e "${BLUE}📊 Current migration status:${NC}"
DATABASE_URL="$LOCAL_DB_URL" yarn -s prisma migrate status --schema="$SCHEMA_PATH" 2>/dev/null || echo "Status check failed"

# Next steps
echo ""
echo -e "${GREEN}🎉 Migration Creation Complete!${NC}"
echo "==========================================="
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Review the migration SQL above"
echo "2. Test your application locally: yarn dev"
echo "3. Commit the changes: git add . && git commit -m \"feat: $MIGRATION_NAME\""
echo "4. Deploy to production: ./.claude/scripts/migration-deploy.sh"
echo ""
echo -e "${YELLOW}Important:${NC}"
echo "- Test thoroughly before deploying to production"
echo "- Check if this is a breaking change that needs special handling"
echo "- Consider backing up production database before deployment"

# Offer to run immediate tests
echo ""
read -p "Run local tests now? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}🧪 Running local tests...${NC}"
    yarn test || echo -e "${YELLOW}⚠️  Some tests failed - review before deployment${NC}"
fi

echo ""
echo -e "${GREEN}Migration creation completed successfully! 🎉${NC}"