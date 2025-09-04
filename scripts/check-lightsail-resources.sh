#!/bin/bash

# Script to check existing Lightsail resources
# Make sure AWS CLI is configured first

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Checking AWS Lightsail Resources${NC}"
echo "========================================"

REGION="ca-central-1"

# Check Databases
echo -e "\n${YELLOW}📊 Databases:${NC}"
aws lightsail get-relational-databases --region $REGION --query "relationalDatabases[*].[name,state,engine,masterEndpoint.address]" --output table 2>/dev/null || echo "No databases found or access denied"

# Check Container Services
echo -e "\n${YELLOW}📦 Container Services:${NC}"
aws lightsail get-container-services --region $REGION --query "containerServices[*].[serviceName,state,power,scale,url]" --output table 2>/dev/null || echo "No container services found or access denied"

# Check Buckets
echo -e "\n${YELLOW}🪣 Buckets:${NC}"
aws lightsail get-buckets --region $REGION --query "buckets[*].[name,state,url]" --output table 2>/dev/null || echo "No buckets found or access denied"

# Check Distributions (CDN)
echo -e "\n${YELLOW}🌐 CDN Distributions:${NC}"
aws lightsail get-distributions --region $REGION --query "distributions[*].[name,status,domainName,origin.name]" --output table 2>/dev/null || echo "No distributions found or access denied"

echo -e "\n${GREEN}✅ Resource check complete!${NC}"
echo ""
echo "Next steps based on what's missing:"
echo "1. If no Container Service: Create one for the backend"
echo "2. If no CDN Distribution: Create one for the frontend bucket"
echo "3. Configure and deploy your applications"