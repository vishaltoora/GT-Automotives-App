#!/bin/bash

set -e

echo "🚀 GT Automotive Backend Deployment Script"
echo "=========================================="

# Get current git commit hash
COMMIT_HASH=$(git rev-parse --short HEAD)
echo "📍 Current commit: $COMMIT_HASH"

# Azure Container Registry details
REGISTRY="gtautomotivesregistry.azurecr.io"
IMAGE_NAME="gt-backend"
CONTAINER_NAME="gt-backend-container"

# Check if local image exists
echo "🔍 Checking for local image..."
if docker images | grep -q "gt-backend.*$COMMIT_HASH"; then
    echo "✅ Local image gt-backend:$COMMIT_HASH found"
else
    echo "❌ Local image gt-backend:$COMMIT_HASH not found"
    echo "Please run: docker build -f Dockerfile.backend -t gt-backend:$COMMIT_HASH -t gt-backend:latest ."
    exit 1
fi

# Login to Azure Container Registry
echo "🔐 Logging into Azure Container Registry..."
az acr login --name gtautomotivesregistry

# Tag and push images
echo "🏷️  Tagging images for registry..."
docker tag gt-backend:$COMMIT_HASH $REGISTRY/$IMAGE_NAME:$COMMIT_HASH
docker tag gt-backend:latest $REGISTRY/$IMAGE_NAME:latest

echo "📤 Pushing images to registry..."
docker push $REGISTRY/$IMAGE_NAME:$COMMIT_HASH
docker push $REGISTRY/$IMAGE_NAME:latest

# Update Azure Container Instance
echo "🔄 Updating Azure Container Instance..."
az container delete \
    --resource-group gt-automotive-rg \
    --name $CONTAINER_NAME \
    --yes || echo "Container not found, will create new one"

# Wait for deletion
echo "⏳ Waiting for container deletion..."
sleep 10

# Create new container with updated image
echo "🆕 Creating new container with updated image..."
az container create \
    --resource-group gt-automotive-rg \
    --name $CONTAINER_NAME \
    --image $REGISTRY/$IMAGE_NAME:latest \
    --cpu 1 \
    --memory 1 \
    --ports 3000 \
    --ip-address Public \
    --location eastus \
    --environment-variables \
        NODE_ENV=production \
        PORT=3000 \
        CLERK_JWKS_URL="https://clean-dove-53.clerk.accounts.dev/.well-known/jwks.json" \
        CORS_ORIGIN="https://gt-automotives.com" \
        JWT_EXPIRES_IN="24h" \
    --secure-environment-variables \
        DATABASE_URL="postgresql://gtautoadmin:Vino\$Vishal@gt-automotive-db.postgres.database.azure.com:5432/gt_automotive?sslmode=require" \
        CLERK_SECRET_KEY="sk_live_YOUR_ACTUAL_CLERK_SECRET_KEY_HERE" \
        JWT_SECRET="GENERATE_WITH_OPENSSL_RAND_BASE64_32"

echo "⏳ Waiting for container to start..."
sleep 30

# Get container status and IP
echo "📊 Container status:"
az container show \
    --resource-group gt-automotive-rg \
    --name $CONTAINER_NAME \
    --query "{Status:instanceView.state,IP:ipAddress.ip,FQDN:ipAddress.fqdn}" \
    --output table

# Get container logs
echo "📄 Container logs:"
az container logs \
    --resource-group gt-automotive-rg \
    --name $CONTAINER_NAME

echo "✅ Deployment completed!"
echo "🌐 Backend should be available at: http://gt-backend.eastus.azurecontainer.io:3000"