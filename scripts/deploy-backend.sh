#!/bin/bash

# GT Automotive Backend Deployment Script for AWS Lightsail
# This script builds and deploys the backend container to Lightsail

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 GT Automotive Backend Deployment Script${NC}"
echo "==========================================="

# Configuration
SERVICE_NAME="gt-automotives-backend"
CONTAINER_NAME="api"
AWS_REGION="ca-central-1"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install it first.${NC}"
    exit 1
fi

# Step 1: Build the Docker image
echo -e "${YELLOW}📦 Building Docker image...${NC}"
docker build -f Dockerfile.server -t ${SERVICE_NAME}:latest .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Docker image built successfully${NC}"
else
    echo -e "${RED}❌ Docker build failed${NC}"
    exit 1
fi

# Step 2: Push to Lightsail Container Service
echo -e "${YELLOW}📤 Pushing image to Lightsail...${NC}"
aws lightsail push-container-image \
    --region ${AWS_REGION} \
    --service-name ${SERVICE_NAME} \
    --label ${CONTAINER_NAME} \
    --image ${SERVICE_NAME}:latest

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Image pushed successfully${NC}"
else
    echo -e "${RED}❌ Failed to push image to Lightsail${NC}"
    exit 1
fi

# Step 3: Get the pushed image name
echo -e "${YELLOW}🔍 Getting pushed image details...${NC}"
IMAGE_NAME=$(aws lightsail get-container-images \
    --region ${AWS_REGION} \
    --service-name ${SERVICE_NAME} \
    --query "containerImages[0].image" \
    --output text)

echo -e "${GREEN}📌 Image name: ${IMAGE_NAME}${NC}"

# Step 4: Deploy the new container version
echo -e "${YELLOW}🚀 Deploying new container version...${NC}"

# Create deployment configuration
cat > /tmp/container-deployment.json <<EOF
{
  "containers": {
    "${CONTAINER_NAME}": {
      "image": "${IMAGE_NAME}",
      "ports": {
        "3000": "HTTP"
      },
      "environment": {
        "NODE_ENV": "production",
        "PORT": "3000"
      }
    }
  },
  "publicEndpoint": {
    "containerName": "${CONTAINER_NAME}",
    "containerPort": 3000,
    "healthCheck": {
      "healthyThreshold": 2,
      "unhealthyThreshold": 3,
      "timeoutSeconds": 5,
      "intervalSeconds": 30,
      "path": "/api/health",
      "successCodes": "200-299"
    }
  }
}
EOF

aws lightsail create-container-service-deployment \
    --region ${AWS_REGION} \
    --service-name ${SERVICE_NAME} \
    --cli-input-json file:///tmp/container-deployment.json

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Deployment initiated successfully${NC}"
else
    echo -e "${RED}❌ Deployment failed${NC}"
    exit 1
fi

# Step 5: Monitor deployment status
echo -e "${YELLOW}⏳ Monitoring deployment status...${NC}"
echo "This may take a few minutes..."

while true; do
    STATUS=$(aws lightsail get-container-service-deployments \
        --region ${AWS_REGION} \
        --service-name ${SERVICE_NAME} \
        --query "deployments[0].state" \
        --output text)
    
    if [ "$STATUS" = "ACTIVE" ]; then
        echo -e "${GREEN}✅ Deployment successful!${NC}"
        break
    elif [ "$STATUS" = "FAILED" ]; then
        echo -e "${RED}❌ Deployment failed!${NC}"
        exit 1
    else
        echo "Current status: $STATUS"
        sleep 10
    fi
done

# Step 6: Get the service URL
echo -e "${YELLOW}🌐 Getting service URL...${NC}"
URL=$(aws lightsail get-container-services \
    --region ${AWS_REGION} \
    --service-name ${SERVICE_NAME} \
    --query "containerServices[0].url" \
    --output text)

echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo "============================"
echo -e "${GREEN}Service URL: ${URL}${NC}"
echo -e "${GREEN}Health Check: ${URL}/api/health${NC}"

# Cleanup
rm -f /tmp/container-deployment.json

echo ""
echo -e "${GREEN}🎉 Backend deployment successful!${NC}"