#!/bin/bash

# Migration Deploy Script
# Deploys pending migrations to production database

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SCHEMA_PATH="libs/database/src/lib/prisma/schema.prisma"
LOCAL_DB_URL="postgresql://postgres@localhost:5432/gt_automotive?schema=public"
PROD_DB_URL="postgresql://gtadmin:P4dFPF6b5HasYFyrwcgOSfSdb@gt-automotives-db.postgres.database.azure.com:5432/gt_automotive?sslmode=require"

echo -e "${GREEN}🚀 GT Automotives Production Migration Deployment${NC}"
echo "======================================================="

# Pre-deployment checks
echo -e "${BLUE}🔍 Running pre-deployment checks...${NC}"

# Check if schema file exists
if [ ! -f "$SCHEMA_PATH" ]; then
    echo -e "${RED}❌ Schema file not found: $SCHEMA_PATH${NC}"
    exit 1
fi

# Check local migration status
echo -e "${BLUE}📋 Checking local migration status...${NC}"
LOCAL_STATUS=$(DATABASE_URL="$LOCAL_DB_URL" yarn -s prisma migrate status --schema="$SCHEMA_PATH" 2>/dev/null || echo "error")

if echo "$LOCAL_STATUS" | grep -q "following migration"; then
    echo -e "${RED}❌ Local database has pending migrations${NC}"
    echo "Please run migrations locally first: yarn prisma migrate dev"
    exit 1
elif [ "$LOCAL_STATUS" = "error" ]; then
    echo -e "${YELLOW}⚠️  Could not check local database status${NC}"
    echo "Continuing with production deployment..."
else
    echo -e "${GREEN}✅ Local database is up to date${NC}"
fi

# Check production migration status
echo -e "${BLUE}🌐 Checking production migration status...${NC}"
PROD_STATUS=$(DATABASE_URL="$PROD_DB_URL" yarn -s prisma migrate status --schema="$SCHEMA_PATH" 2>/dev/null || echo "error")

if echo "$PROD_STATUS" | grep -q "Database schema is up to date"; then
    echo -e "${YELLOW}⚠️  No pending migrations in production${NC}"
    echo "Production database is already up to date"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Deployment cancelled"
        exit 0
    fi
elif echo "$PROD_STATUS" | grep -q "following migration"; then
    echo -e "${GREEN}✅ Pending migrations found in production${NC}"
    echo "Migrations to deploy:"
    echo "$PROD_STATUS" | grep -A 10 "following migration"
elif [ "$PROD_STATUS" = "error" ]; then
    echo -e "${RED}❌ Could not connect to production database${NC}"
    echo "Check network connection and credentials"
    exit 1
fi

# Show what will be deployed
echo ""
echo -e "${BLUE}📦 Migration files to deploy:${NC}"
if [ -d "libs/database/src/lib/prisma/migrations" ]; then
    MIGRATION_COUNT=$(ls -1 libs/database/src/lib/prisma/migrations | wc -l)
    echo "Total migrations available: $MIGRATION_COUNT"
    echo "Latest migrations:"
    ls -t libs/database/src/lib/prisma/migrations | head -5
else
    echo -e "${RED}❌ No migration directory found${NC}"
    exit 1
fi

# Safety confirmation
echo ""
echo -e "${YELLOW}⚠️  PRODUCTION DEPLOYMENT WARNING${NC}"
echo "============================================="
echo "You are about to deploy database migrations to production."
echo "This action will modify the production database schema."
echo ""
echo -e "${YELLOW}Important safety checks:${NC}"
echo "✓ Local migrations tested"
echo "✓ Application code deployed"
echo "✓ Database backup completed (recommended)"
echo ""
echo -e "${RED}This action cannot be easily undone!${NC}"
echo ""
read -p "Are you sure you want to deploy to production? (yes/no): " CONFIRMATION

if [ "$CONFIRMATION" != "yes" ]; then
    echo "Deployment cancelled"
    exit 0
fi

# Deploy migrations
echo ""
echo -e "${GREEN}🚀 Deploying migrations to production...${NC}"
echo "=============================================="

# Deploy with detailed output
if DATABASE_URL="$PROD_DB_URL" yarn prisma migrate deploy --schema="$SCHEMA_PATH"; then
    echo -e "${GREEN}✅ Migration deployment successful!${NC}"
else
    echo -e "${RED}❌ Migration deployment failed!${NC}"
    echo ""
    echo -e "${YELLOW}Failure recovery options:${NC}"
    echo "1. Check error messages above"
    echo "2. Verify database connectivity"
    echo "3. Check for data conflicts"
    echo "4. Consider rolling back: ./.claude/scripts/migration-rollback.sh"
    echo "5. Contact database administrator if needed"
    exit 1
fi

# Verify deployment
echo ""
echo -e "${BLUE}🔍 Verifying deployment...${NC}"
FINAL_STATUS=$(DATABASE_URL="$PROD_DB_URL" yarn -s prisma migrate status --schema="$SCHEMA_PATH" 2>/dev/null || echo "error")

if echo "$FINAL_STATUS" | grep -q "Database schema is up to date"; then
    echo -e "${GREEN}✅ Production database is now up to date${NC}"
elif [ "$FINAL_STATUS" = "error" ]; then
    echo -e "${RED}❌ Could not verify deployment status${NC}"
    echo "Check production database manually"
else
    echo -e "${YELLOW}⚠️  Deployment verification inconclusive${NC}"
    echo "$FINAL_STATUS"
fi

# Test production connectivity (optional)
echo ""
read -p "Test production API connectivity? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}🌐 Testing production API...${NC}"
    if curl -s -o /dev/null -w "%{http_code}" https://gt-automotives.com/api/health | grep -q "200"; then
        echo -e "${GREEN}✅ Production API is responding${NC}"
    else
        echo -e "${YELLOW}⚠️  Production API test inconclusive${NC}"
        echo "Check https://gt-automotives.com manually"
    fi
fi

# Post-deployment tasks
echo ""
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo "========================="
echo -e "${YELLOW}Post-deployment checklist:${NC}"
echo "☐ Test critical application features"
echo "☐ Check error logs for any issues"
echo "☐ Verify data integrity"
echo "☐ Monitor application performance"
echo "☐ Update team on deployment status"
echo ""
echo -e "${BLUE}Monitoring links:${NC}"
echo "• Production: https://gt-automotives.com"
echo "• API Health: https://gt-automotives.com/api/health"
echo "• GitHub Actions: https://github.com/vishaltoora/GT-Automotives-App/actions"
echo ""
echo -e "${GREEN}Migration deployment completed successfully! 🎉${NC}"

# Optional: Create deployment record
echo ""
read -p "Create deployment record in git? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    DEPLOYMENT_TAG="deploy-$(date +%Y%m%d-%H%M%S)"
    git tag -a "$DEPLOYMENT_TAG" -m "Production migration deployment $(date)"
    echo -e "${GREEN}✅ Created deployment tag: $DEPLOYMENT_TAG${NC}"
    echo "Push with: git push origin $DEPLOYMENT_TAG"
fi