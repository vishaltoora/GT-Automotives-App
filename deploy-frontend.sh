#!/bin/bash

# GT Automotive Frontend Deployment Script
# This script builds and deploys the frontend to Azure Storage

set -e

echo "🚀 GT Automotive Frontend Deployment"
echo "======================================"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
STORAGE_ACCOUNT="gtautomotiveweb3007b23f"

# Get storage key from Azure CLI
STORAGE_KEY=$(az storage account keys list --account-name "$STORAGE_ACCOUNT" --resource-group gt-automotives-prod --query "[0].value" -o tsv)

if [ -z "$STORAGE_KEY" ]; then
  echo "❌ Failed to retrieve storage key. Make sure you're logged into Azure CLI."
  exit 1
fi

echo -e "${YELLOW}Building frontend for production...${NC}"
yarn nx build webApp --prod

echo -e "${YELLOW}Uploading to Azure Storage...${NC}"
az storage blob upload-batch \
  --account-name "$STORAGE_ACCOUNT" \
  --account-key "$STORAGE_KEY" \
  --source apps/webApp/dist \
  --destination '$web' \
  --overwrite

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "Your app is available at:"
echo "  HTTP:  http://gtautomotiveweb3007b23f.z9.web.core.windows.net/"
echo "  HTTPS: https://gt-automotives.com (via Cloudflare)"
echo ""
echo "API endpoints:"
echo "  Backend: https://api.gt-automotives.com"