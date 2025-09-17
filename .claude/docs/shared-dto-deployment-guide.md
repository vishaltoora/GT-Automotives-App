# Shared DTO Deployment Guide

This document provides a comprehensive guide for properly deploying the shared DTO library (`@gt-automotive/shared-dto`) in the GT Automotive monorepo, including the critical path fixes that resolved deployment pipeline issues.

## Overview

The GT Automotive application uses a shared DTO library to maintain consistent type definitions between frontend and backend. This guide documents the correct build paths, deployment configuration, and lessons learned from resolving deployment pipeline failures.

## Critical Path Resolution ✅

### Problem: Incorrect Build Path Assumptions
The deployment pipeline was failing because of incorrect assumptions about where the shared DTO library builds its output files.

**Incorrect Assumption**: Library builds to `libs/shared-dto/dist/`
**Actual Reality**: Library builds to `dist/libs/shared-dto/`

### Root Cause Analysis

1. **Nx Build Behavior**: Nx monorepo tool builds all libraries to the root `dist/` directory
2. **Path Structure**: `dist/libs/[library-name]/` is the standard output pattern
3. **Deployment Scripts**: Were copying from non-existent `libs/shared-dto/dist/` directory
4. **GitHub Actions**: Missing explicit shared DTO build step before packaging backend

## Solution Implementation

### 1. Correct Build Path Configuration

#### Local Development
```bash
# Build the shared DTO library
yarn nx build shared-dto

# Verify build output location
ls -la dist/libs/shared-dto/
# Should show:
# - src/
# - package.json
# - index.d.ts
# etc.
```

#### Dockerfile Configuration
```dockerfile
# CORRECT: Copy from dist/libs/shared-dto path
COPY dist/libs/shared-dto/src/ ./shared-dto-temp/
COPY dist/libs/shared-dto/package.json ./shared-dto-package.json

# INCORRECT (old way):
# COPY libs/shared-dto/dist/ ./shared-dto-temp/
```

### 2. GitHub Actions Workflow Fix

#### Required Build Step
```yaml
name: Deploy Backend to Azure Container

jobs:
  deploy:
    steps:
    - name: Checkout code
      uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '20'
        cache: 'yarn'

    # CRITICAL: Build shared DTO BEFORE backend packaging
    - name: Build shared DTO library
      run: yarn nx build shared-dto

    - name: Build backend
      run: yarn nx build server

    # Rest of deployment steps...
```

#### File Copy Operations
```yaml
- name: Prepare deployment files
  run: |
    # Copy backend build
    cp -r server/dist backend-deploy/server/

    # Copy shared DTO from CORRECT path
    mkdir -p backend-deploy/shared-dto
    cp -r dist/libs/shared-dto/* backend-deploy/shared-dto/

    # Copy Prisma schema
    cp -r libs/database/src/lib/prisma backend-deploy/
```

### 3. Updated Dockerfile Structure

#### Final Working Dockerfile
```dockerfile
FROM node:20-slim

WORKDIR /app

# Install system dependencies for Prisma
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy built server files
COPY backend-deploy/server/ ./
COPY backend-deploy/prisma/ ./prisma/

# Copy shared libraries from CORRECT build path
COPY dist/libs/shared-dto/src/ ./shared-dto-temp/
COPY dist/libs/shared-dto/package.json ./shared-dto-package.json

# Install dependencies and generate Prisma client
RUN npm install --production && \
    npx prisma generate --schema=./prisma/schema.prisma

# Create proper node_modules structure after npm install
RUN mkdir -p ./node_modules/@gt-automotive/shared-dto/dist/ && \
    cp -r ./shared-dto-temp/* ./node_modules/@gt-automotive/shared-dto/dist/ && \
    cp ./shared-dto-package.json ./node_modules/@gt-automotive/shared-dto/package.json && \
    rm -rf ./shared-dto-temp ./shared-dto-package.json

# Create non-root user
RUN groupadd -r nodejs && useradd -r -g nodejs nodejs && \
    chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 3000

CMD ["node", "main.js"]
```

## Verification Steps

### 1. Local Build Verification
```bash
# Clean previous builds
yarn nx reset

# Build shared DTO library
yarn nx build shared-dto

# Verify output exists
if [ -d "dist/libs/shared-dto" ]; then
  echo "✅ Shared DTO built correctly"
  ls -la dist/libs/shared-dto/
else
  echo "❌ Shared DTO build failed or incorrect path"
fi
```

### 2. Docker Build Verification
```bash
# Build Docker image locally
docker build -t test-backend .

# Run container to test shared DTO resolution
docker run --rm test-backend node -e "
  try {
    const shared = require('@gt-automotive/shared-dto');
    console.log('✅ Shared DTO loaded successfully');
    console.log('Available exports:', Object.keys(shared));
  } catch (err) {
    console.log('❌ Shared DTO failed to load:', err.message);
  }
"
```

### 3. Production Deployment Verification
```bash
# Check container logs for import errors
az container logs -g gt-automotives-prod -n gt-backend-api-fixes --tail 100

# Test API endpoint that uses shared DTOs
curl http://gt-automotives-backend-api-fixes.canadacentral.azurecontainer.io:3000/api/health

# Should return without import errors
```

## Build Path Reference

### Correct Paths (✅ Use These)
```
dist/libs/shared-dto/                    # Library build output
dist/libs/shared-dto/src/               # Source files
dist/libs/shared-dto/package.json       # Package metadata
dist/libs/shared-dto/index.d.ts         # Type definitions
```

### Incorrect Paths (❌ Don't Use These)
```
libs/shared-dto/dist/                   # This directory doesn't exist
libs/shared-dto/src/                    # This is source, not built output
shared-dto/dist/                        # Wrong location entirely
```

## Deployment Pipeline Configuration

### GitHub Actions Workflow Template
```yaml
name: Deploy GT Automotive Backend

on:
  push:
    branches: [main]
    paths:
      - 'server/**'
      - 'libs/**'
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout repository
      uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '20'
        cache: 'yarn'

    - name: Install dependencies
      run: yarn install --ignore-engines

    # STEP 1: Build shared DTO library FIRST
    - name: Build shared DTO library
      run: yarn nx build shared-dto

    # STEP 2: Build backend server
    - name: Build backend server
      run: yarn nx build server

    # STEP 3: Prepare deployment package
    - name: Prepare deployment files
      run: |
        mkdir -p backend-deploy
        cp -r server/dist backend-deploy/server/
        cp -r dist/libs/shared-dto backend-deploy/shared-dto/
        cp -r libs/database/src/lib/prisma backend-deploy/

    # STEP 4: Build and push Docker image
    - name: Login to Azure Container Registry
      uses: azure/docker-login@v1
      with:
        login-server: gtautomotivesregistry.azurecr.io
        username: ${{ secrets.ACR_USERNAME }}
        password: ${{ secrets.ACR_PASSWORD }}

    - name: Build and push Docker image
      run: |
        docker build -t gtautomotivesregistry.azurecr.io/gt-backend:container-deploy-${{ github.sha }} .
        docker push gtautomotivesregistry.azurecr.io/gt-backend:container-deploy-${{ github.sha }}

    # STEP 5: Deploy to Azure Container Instance
    - name: Deploy to Azure
      uses: azure/CLI@v1
      with:
        azcliversion: 2.53.0
        inlineScript: |
          az container create \
            --resource-group gt-automotives-prod \
            --name gt-backend-api-fixes \
            --image gtautomotivesregistry.azurecr.io/gt-backend:container-deploy-${{ github.sha }} \
            --registry-login-server gtautomotivesregistry.azurecr.io \
            --registry-username ${{ secrets.ACR_USERNAME }} \
            --registry-password ${{ secrets.ACR_PASSWORD }} \
            --environment-variables \
              NODE_ENV=production \
              DATABASE_URL="${{ secrets.DATABASE_URL }}" \
              CLERK_SECRET_KEY="${{ secrets.CLERK_SECRET_KEY }}" \
              CLERK_API_URL="https://api.clerk.com" \
              PORT=3000
```

## Troubleshooting Guide

### Common Issues and Solutions

#### Issue 1: Module Not Found Error
**Symptoms**:
```
Error: Cannot find module '@gt-automotive/shared-dto'
```

**Solutions**:
1. Verify shared DTO is built: `yarn nx build shared-dto`
2. Check build output exists: `ls dist/libs/shared-dto/`
3. Ensure Dockerfile copies from correct path: `dist/libs/shared-dto/`

#### Issue 2: Build Step Missing in CI/CD
**Symptoms**:
- Local builds work but CI/CD fails
- Docker image builds but container crashes on startup

**Solutions**:
1. Add explicit build step in GitHub Actions:
   ```yaml
   - name: Build shared DTO library
     run: yarn nx build shared-dto
   ```
2. Ensure build happens BEFORE backend packaging

#### Issue 3: Incorrect File Paths in Dockerfile
**Symptoms**:
```
COPY failed: file not found in build context
```

**Solutions**:
1. Update Dockerfile paths:
   ```dockerfile
   # Correct
   COPY dist/libs/shared-dto/src/ ./shared-dto-temp/

   # Incorrect
   COPY libs/shared-dto/dist/ ./shared-dto-temp/
   ```

### Debugging Commands

#### Check Build Output
```bash
# List all built libraries
find dist/libs -name "package.json" -exec dirname {} \;

# Check shared DTO build specifically
ls -la dist/libs/shared-dto/
```

#### Verify Docker Context
```bash
# Check what files are available for Docker build
docker build --no-cache --progress=plain -t debug-build . 2>&1 | grep -i "copy"
```

#### Test Container Locally
```bash
# Build and run locally to test imports
docker build -t test-backend .
docker run --rm -it test-backend /bin/bash

# Inside container, test module resolution
node -e "console.log(require.resolve('@gt-automotive/shared-dto'))"
```

## Lessons Learned

### 1. Nx Build Behavior Understanding
- Nx builds all libraries to `dist/libs/[library-name]/`
- Never assume libraries build to their source directory
- Always verify actual build output paths

### 2. CI/CD Pipeline Dependencies
- Shared libraries must be built before dependent projects
- Explicit build steps prevent race conditions
- Order of operations is critical in monorepo deployments

### 3. Docker Context Awareness
- Docker can only access files in build context
- Verify all COPY paths exist at build time
- Use multi-stage builds if needed for complex dependencies

### 4. Path Consistency
- Keep all deployment scripts consistent with actual build paths
- Document and verify paths in multiple environments
- Update all references when paths change

## Production Status

### Current Working Configuration ✅
- **Backend Container**: gt-automotives-backend-api-fixes.canadacentral.azurecontainer.io:3000
- **Build Status**: Successful deployment with shared DTO integration
- **Frontend Build**: build-20250917-194153-534fa05
- **CI/CD Pipeline**: GitHub Actions with explicit shared DTO build step

### Deployment Verification
```bash
# Health check
curl http://gt-automotives-backend-api-fixes.canadacentral.azurecontainer.io:3000/api/health

# Expected response:
{
  "status": "ok",
  "timestamp": "2025-09-17T19:45:00.000Z",
  "uptime": 123.456,
  "environment": "production"
}
```

## Related Documentation

- [Backend Container Deployment Config](./backend-container-deployment-config.md)
- [Azure Deployment Plan](./azure-deployment-plan.md)
- [Production Deployment Checklist](./production-deployment-checklist.md)
- [Development Status](./development-status.md)

---

**Document Created**: September 17, 2025
**Last Updated**: September 17, 2025
**Status**: Production Verified ✅
**Next Review**: Monthly or when shared library structure changes