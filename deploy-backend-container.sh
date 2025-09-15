#!/bin/bash

# GT Automotive Backend Container Deployment Script
# Implements all the architectural fixes learned from container deployment troubleshooting

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }

# Configuration
IMAGE_NAME="gt-backend:container-deploy-$(date +%Y%m%d-%H%M%S)"
CONTAINER_NAME="gt-backend-test"
PORT="3001"

print_info "GT Automotive Backend Container Deployment"
echo "=========================================="

# Validate prerequisites
print_info "Checking prerequisites..."

if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed!"
    exit 1
fi

if ! command -v yarn &> /dev/null; then
    print_error "Yarn is not installed!"
    exit 1
fi

print_success "Prerequisites validated"

# Build shared DTO library (critical for container deployment)
print_info "Building shared DTO library..."
if yarn nx build @gt-automotive/shared-dto; then
    print_success "Shared DTO library built successfully"
else
    print_error "Failed to build shared DTO library"
    exit 1
fi

# Build backend server with webpack externals
print_info "Building backend server with container fixes..."
if yarn build:server; then
    print_success "Backend server built successfully"
    
    # Verify webpack externals are working
    if grep -q "require.*@prisma/client" server/dist/main.js 2>/dev/null; then
        print_success "✓ Prisma client externalized correctly"
    else
        print_warning "⚠ Prisma client externalization may have issues"
    fi
    
    if grep -q "require.*@gt-automotive/shared-dto" server/dist/main.js 2>/dev/null; then
        print_success "✓ Shared DTO externalized correctly"
    else
        print_warning "⚠ Shared DTO externalization may have issues"
    fi
else
    print_error "Failed to build backend server"
    exit 1
fi

# Create deployment directory with proper structure
print_info "Creating deployment package with container fixes..."

# Clean up any previous deployment
rm -rf backend-deploy

# Create deployment directory structure
mkdir -p backend-deploy/server
mkdir -p backend-deploy/prisma

# Copy built server files (webpack externalized)
cp -r server/dist/* backend-deploy/server/

# Copy Prisma schema and migrations
cp libs/database/src/lib/prisma/schema.prisma backend-deploy/prisma/
cp -r libs/database/src/lib/prisma/migrations backend-deploy/prisma/ 2>/dev/null || echo "No migrations directory found"

# Copy shared libraries for manual node_modules structure creation
mkdir -p backend-deploy/shared-dto-temp
cp -r libs/shared/dto/dist/* backend-deploy/shared-dto-temp/
cp libs/shared/dto/package.json backend-deploy/shared-dto-package.json

# Create production package.json with webpack externalized dependencies
cat > backend-deploy/package.json << 'EOF'
{
  "name": "gt-automotives-backend",
  "version": "container-deploy",
  "description": "GT Automotive Backend API with Container Architecture Fixes",
  "main": "server/main.js",
  "scripts": {
    "start": "node server/main.js"
  },
  "dependencies": {
    "@prisma/client": "^5.0.0",
    "prisma": "^5.0.0"
  },
  "engines": {
    "node": ">=20"
  }
}
EOF

# Create optimized Dockerfile with all fixes
cat > backend-deploy/Dockerfile << 'EOF'
FROM node:20-slim

WORKDIR /app

# Install system dependencies for Prisma
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy deployment package (contains all necessary files)
COPY . ./

# Install dependencies and generate Prisma client with proper WASM binaries
RUN npm install --production && \
    npm install prisma@latest && \
    npx prisma generate --schema=./prisma/schema.prisma

# Create proper node_modules structure for shared libraries (critical architectural fix)
RUN mkdir -p ./node_modules/@gt-automotive/shared-dto/dist/ && \
    cp -r ./shared-dto-temp/* ./node_modules/@gt-automotive/shared-dto/dist/ && \
    cp ./shared-dto-package.json ./node_modules/@gt-automotive/shared-dto/package.json && \
    rm -rf ./shared-dto-temp ./shared-dto-package.json

# Create non-root user for security
RUN groupadd -r nodejs && useradd -r -g nodejs nodejs && \
    chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 3000

# Use webpack-built main.js with externalized dependencies
CMD ["node", "server/main.js"]
EOF

print_success "Deployment package created with all container fixes"

# Build Docker image
print_info "Building Docker image: $IMAGE_NAME"
cd backend-deploy
if docker build -t "$IMAGE_NAME" . --no-cache; then
    print_success "Docker image built successfully"
else
    print_error "Failed to build Docker image"
    exit 1
fi
cd ..

# Stop any existing container
print_info "Stopping any existing container..."
docker stop "$CONTAINER_NAME" 2>/dev/null || true
docker rm "$CONTAINER_NAME" 2>/dev/null || true

# Check if environment variables are set
if [ -z "$DATABASE_URL" ] || [ -z "$JWT_SECRET" ]; then
    print_warning "Environment variables not fully set"
    print_info "Please set: DATABASE_URL, JWT_SECRET, CLERK_SECRET_KEY"
    print_info "Example:"
    echo 'export DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"'
    echo 'export JWT_SECRET="your-jwt-secret"'
    echo 'export CLERK_SECRET_KEY="sk_test_..."'
    print_info "Then run: docker run -d --name $CONTAINER_NAME -p $PORT:3000 \\"
    print_info "  -e DATABASE_URL=\"\$DATABASE_URL\" \\"
    print_info "  -e JWT_SECRET=\"\$JWT_SECRET\" \\"
    print_info "  -e CLERK_SECRET_KEY=\"\$CLERK_SECRET_KEY\" \\"
    print_info "  -e PORT=\"3000\" \\"
    print_info "  -e NODE_ENV=\"production\" \\"
    print_info "  $IMAGE_NAME"
else
    # Run container with environment variables
    print_info "Starting container: $CONTAINER_NAME on port $PORT"
    docker run -d \
        --name "$CONTAINER_NAME" \
        -p "$PORT:3000" \
        -e DATABASE_URL="$DATABASE_URL" \
        -e JWT_SECRET="$JWT_SECRET" \
        -e CLERK_SECRET_KEY="${CLERK_SECRET_KEY:-}" \
        -e PORT="3000" \
        -e NODE_ENV="production" \
        "$IMAGE_NAME"

    print_success "Container started successfully"
    
    # Wait for container to start and test
    print_info "Waiting for container to start..."
    sleep 10
    
    # Test health endpoint
    if curl -f -s "http://localhost:$PORT/health" > /dev/null; then
        print_success "Container is responding to health checks!"
        print_info "🌐 Container URL: http://localhost:$PORT"
        print_info "🔍 Health: http://localhost:$PORT/health"
        print_info "📋 Logs: docker logs $CONTAINER_NAME"
    else
        print_warning "Container may not be ready yet"
        print_info "Check logs: docker logs $CONTAINER_NAME"
    fi
fi

print_success "Container deployment completed!"
print_info "Image: $IMAGE_NAME"
print_info "Container: $CONTAINER_NAME"
print_info "Port: $PORT"

# Clean up deployment directory
rm -rf backend-deploy