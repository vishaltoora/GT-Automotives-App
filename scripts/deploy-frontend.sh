#!/bin/bash

# GT Automotive Frontend Deployment Script for AWS Lightsail
# This script builds and deploys the frontend to Lightsail Bucket and CDN

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 GT Automotive Frontend Deployment Script${NC}"
echo "==========================================="

# Configuration
BUCKET_NAME="gt-automotive-frontend"
AWS_REGION="ca-central-1"
DISTRIBUTION_NAME="gt-automotives-distribution"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install it first.${NC}"
    exit 1
fi

# Step 1: Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
yarn install

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Dependencies installed successfully${NC}"
else
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi

# Step 2: Build the frontend
echo -e "${YELLOW}🔨 Building frontend application...${NC}"
yarn nx build webApp --prod

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend built successfully${NC}"
else
    echo -e "${RED}❌ Frontend build failed${NC}"
    exit 1
fi

# Step 3: Upload to S3/Lightsail Bucket
echo -e "${YELLOW}📤 Uploading to Lightsail bucket...${NC}"

# Upload all files except index.html with cache headers
aws s3 sync apps/webApp/dist s3://${BUCKET_NAME} \
    --region ${AWS_REGION} \
    --delete \
    --cache-control "public, max-age=31536000, immutable" \
    --exclude "index.html" \
    --exclude "*.map"

# Upload index.html with no-cache headers (for SPA routing)
aws s3 cp apps/webApp/dist/index.html s3://${BUCKET_NAME}/ \
    --region ${AWS_REGION} \
    --cache-control "no-cache, no-store, must-revalidate" \
    --content-type "text/html"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Files uploaded successfully${NC}"
else
    echo -e "${RED}❌ Failed to upload files to bucket${NC}"
    exit 1
fi

# Step 4: Get CDN Distribution (if exists)
echo -e "${YELLOW}🔍 Checking for CDN distribution...${NC}"

# Try to get distribution associated with the bucket
DISTRIBUTION_EXISTS=$(aws lightsail get-distributions \
    --region ${AWS_REGION} \
    --query "distributions[?origin.name=='${BUCKET_NAME}'].name" \
    --output text)

if [ -n "$DISTRIBUTION_EXISTS" ]; then
    DISTRIBUTION_NAME=$DISTRIBUTION_EXISTS
    echo -e "${GREEN}📌 Found distribution: ${DISTRIBUTION_NAME}${NC}"
    
    # Step 5: Invalidate CDN cache
    echo -e "${YELLOW}🔄 Invalidating CDN cache...${NC}"
    aws lightsail reset-distribution-cache \
        --region ${AWS_REGION} \
        --distribution-name ${DISTRIBUTION_NAME} \
        --paths "/*"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ CDN cache invalidated successfully${NC}"
    else
        echo -e "${YELLOW}⚠️  Failed to invalidate CDN cache (non-critical)${NC}"
    fi
    
    # Get distribution URL
    DISTRIBUTION_URL=$(aws lightsail get-distributions \
        --region ${AWS_REGION} \
        --query "distributions[?name=='${DISTRIBUTION_NAME}'].domainName" \
        --output text)
    
    echo -e "${GREEN}✅ Deployment Complete!${NC}"
    echo "============================"
    echo -e "${GREEN}CDN URL: https://${DISTRIBUTION_URL}${NC}"
else
    echo -e "${YELLOW}⚠️  No CDN distribution found for this bucket${NC}"
    echo -e "${YELLOW}📝 You may need to create a CDN distribution in Lightsail${NC}"
    
    # Get bucket endpoint
    BUCKET_URL=$(aws lightsail get-buckets \
        --region ${AWS_REGION} \
        --query "buckets[?name=='${BUCKET_NAME}'].url" \
        --output text)
    
    echo -e "${GREEN}✅ Deployment Complete!${NC}"
    echo "============================"
    echo -e "${GREEN}Bucket URL: ${BUCKET_URL}${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Frontend deployment successful!${NC}"
echo ""
echo "Next steps:"
echo "1. Update your backend CORS settings to allow the frontend URL"
echo "2. Update frontend environment variables with the backend API URL"
echo "3. Test the application thoroughly"