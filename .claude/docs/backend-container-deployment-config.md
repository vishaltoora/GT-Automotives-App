# Backend Container Deployment Configuration

This document provides a comprehensive guide for deploying the GT Automotive backend using Docker containers to Azure Container Instances, including architectural fixes and troubleshooting solutions.

## Overview

The GT Automotive backend is a NestJS application that requires specific configuration for containerized deployment due to its monorepo architecture with shared libraries and Prisma ORM integration.

## Architecture Issues & Solutions

### Problem: Webpack Bundling Anti-Pattern

**Issue**: The original configuration used webpack to bundle server code, which is an anti-pattern for Node.js servers and causes issues with:
- Prisma client native binary loading
- Dynamic module resolution
- External dependency management

**Solution**: Configure webpack externals to prevent bundling of critical dependencies.

### Problem: Shared Library Resolution

**Issue**: The `@gt-automotive/shared-dto` library couldn't be resolved in the containerized environment due to incorrect node_modules structure.

**Solution**: Manually create proper node_modules structure after npm install completes.

### Problem: Prisma Client Initialization

**Issue**: Prisma client failed to initialize with error: `@prisma/client did not initialize yet. Please run "prisma generate"`

**Root Cause**: Webpack was bundling Prisma client code, breaking its native binary loading mechanism.

**Solution**: External Prisma dependencies and ensure proper client generation in the container.

## Implementation Details

### 1. Webpack Configuration

**File**: `server/webpack.config.js`

```javascript
const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require('path');

module.exports = {
  target: 'node',
  mode: 'production',
  output: {
    path: join(__dirname, 'dist'),
  },
  externals: {
    '@prisma/client': 'commonjs @prisma/client',
    '.prisma/client': 'commonjs .prisma/client',
    '@gt-automotive/shared-dto': 'commonjs @gt-automotive/shared-dto',
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      assets: ['./src/assets'],
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: true,
    }),
  ],
};
```

**Key Changes**:
- Added `externals` configuration to prevent bundling of Prisma and shared libraries
- Maintains Node.js target for server-side execution
- Preserves package.json generation for dependency management

### 2. Dockerfile Configuration

**File**: `Dockerfile.simple`

```dockerfile
FROM node:20-slim

WORKDIR /app

# Install system dependencies for Prisma
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy built server files
COPY backend-deploy/server/ ./
COPY backend-deploy/prisma/ ./prisma/

# Copy shared libraries temporarily (CRITICAL: Must use dist/libs/shared-dto path)
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

**Key Features**:
- **Base Image**: `node:20-slim` (Debian-based for better Node.js compatibility vs Alpine)
- **System Dependencies**: OpenSSL required for Prisma client
- **Staged Library Copy**: Temporary copy followed by proper node_modules structure creation
- **Security**: Non-root user execution
- **Production Optimization**: `--production` flag for npm install

### 3. Build Process

#### Local Build Commands

```bash
# 1. Build the server with externalized dependencies
yarn nx build server

# 2. Create deployment directory structure
rm -rf backend-deploy
cp -r server/dist backend-deploy
mkdir -p backend-deploy/server
cp -r server/dist/* backend-deploy/server/
cp -r libs/database/src/lib/prisma backend-deploy/

# 3. Build Docker container
docker build -t gt-backend:final-working -f Dockerfile.simple . --no-cache

# 4. Test locally
docker run -d --name test-container -p 3001:3000 \
  -e DATABASE_URL="your-db-url" \
  -e JWT_SECRET="your-jwt-secret" \
  -e CLERK_SECRET_KEY="your-clerk-key" \
  -e PORT="3000" \
  gt-backend:final-working

# 5. Verify health
curl http://localhost:3001/health
```

#### Azure Deployment Commands

```bash
# 1. Login to Azure Container Registry
az acr login --name gtautomotivesregistry

# 2. Tag for Azure
docker tag gt-backend:final-working gtautomotivesregistry.azurecr.io/gt-backend:simple-fix-final

# 3. Push to registry
docker push gtautomotivesregistry.azurecr.io/gt-backend:simple-fix-final

# 4. Deploy to Container Instances
az container create \
  --resource-group gt-automotives-prod \
  --name gt-backend-working \
  --image gtautomotivesregistry.azurecr.io/gt-backend:simple-fix-final \
  --os-type Linux \
  --dns-name-label gt-automotives-backend-working \
  --ports 3000 \
  --cpu 2 \
  --memory 4 \
  --registry-login-server gtautomotivesregistry.azurecr.io \
  --registry-username gtautomotivesregistry \
  --registry-password $(az acr credential show --name gtautomotivesregistry --query "passwords[0].value" --output tsv) \
  --environment-variables \
    DATABASE_URL="postgresql://gtadmin:PASSWORD@gt-automotives-db.postgres.database.azure.com:5432/gt_automotive?sslmode=require" \
    JWT_SECRET="your-jwt-secret-key-here" \
    CLERK_SECRET_KEY="sk_live_your-clerk-secret-key" \
    CLERK_API_URL="https://api.clerk.com" \
    CLERK_PUBLISHABLE_KEY="pk_live_your-publishable-key" \
    CLERK_JWKS_URL="https://clerk.gt-automotives.com/.well-known/jwks.json" \
    FRONTEND_URL="https://gt-automotives.com" \
    PORT="3000" \
    NODE_ENV="production"
```

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db?sslmode=require` |
| `JWT_SECRET` | JWT signing secret | `your-secure-jwt-secret` |
| `CLERK_SECRET_KEY` | Clerk authentication secret | `sk_live_...` |
| `CLERK_API_URL` | Clerk API endpoint | `https://api.clerk.com` |
| `CLERK_PUBLISHABLE_KEY` | Clerk frontend key | `pk_live_...` |
| `CLERK_JWKS_URL` | Clerk JWKS endpoint | `https://clerk.gt-automotives.com/.well-known/jwks.json` |
| `FRONTEND_URL` | Frontend domain for CORS | `https://gt-automotives.com` |
| `PORT` | Application port | `3000` |
| `NODE_ENV` | Environment mode | `production` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `LOG_LEVEL` | Logging level | `info` |
| `HELMET_ENABLED` | Security headers | `true` |
| `RATE_LIMIT_ENABLED` | Rate limiting | `true` |

## Production Deployment Configuration

### Azure Container Instances Specs

- **Resource Group**: `gt-automotives-prod`
- **Container Name**: `gt-backend-working`
- **DNS Label**: `gt-automotives-backend-working`
- **FQDN**: `gt-automotives-backend-working.canadacentral.azurecontainer.io`
- **CPU**: 2 cores
- **Memory**: 4 GB
- **OS**: Linux
- **Port**: 3000

### Health Endpoints

- **Basic Health**: `GET /health`
  ```json
  {
    "status": "ok",
    "timestamp": "2025-09-15T16:09:12.480Z",
    "uptime": 74.867857356,
    "environment": "production"
  }
  ```

- **Detailed Health**: `GET /health/detailed`

## Troubleshooting Guide

### Common Issues

#### 1. Prisma Client Not Found

**Symptoms**:
```
Error: @prisma/client did not initialize yet. Please run "prisma generate"
```

**Solutions**:
- Ensure Prisma is externalized in webpack config
- Verify `npx prisma generate` runs in Dockerfile
- Check that OpenSSL is installed in container

#### 2. Shared DTO Module Not Found

**Symptoms**:
```
Error: Cannot find module '@gt-automotive/shared-dto'
```

**Solutions**:
- Add shared-dto to webpack externals
- Ensure proper node_modules structure creation
- Verify dist files are copied correctly

#### 3. Clerk SDK Authorization Failures

**Symptoms**:
```
Failed to create user in Clerk: Unauthorized
Error: Request failed with status 401
```

**Solutions**:
- Ensure `CLERK_API_URL=https://api.clerk.com` is set in environment variables
- Update backend code to use `createClerkClient` instead of default `clerkClient`
- Verify all Clerk environment variables are properly configured:
  ```env
  CLERK_SECRET_KEY=sk_live_...
  CLERK_API_URL=https://api.clerk.com
  CLERK_PUBLISHABLE_KEY=pk_live_...
  CLERK_JWKS_URL=https://clerk.gt-automotives.com/.well-known/jwks.json
  ```

#### 4. Container Startup Failures

**Symptoms**:
- Container exits immediately
- CrashLoopBackOff state

**Debugging**:
```bash
# Check container logs
az container logs --resource-group gt-automotives-prod --name gt-backend-working

# Check container status
az container show --resource-group gt-automotives-prod --name gt-backend-working --query instanceView

# Test locally first
docker run -it --entrypoint /bin/sh gt-backend:final-working
```

#### 5. Database Connection Issues

**Symptoms**:
- Connection timeout errors
- Authentication failures

**Solutions**:
- Verify DATABASE_URL format
- Check Azure PostgreSQL firewall rules
- Ensure SSL mode is set correctly
- Validate credentials

### Performance Optimization

#### Container Resources

```bash
# Monitor resource usage
az container logs --resource-group gt-automotives-prod --name gt-backend-working

# Adjust resources if needed
az container create \
  --cpu 4 \           # Increase CPU
  --memory 8 \        # Increase memory
  # ... other options
```

#### Image Optimization

- Use `.dockerignore` to exclude unnecessary files
- Multi-stage builds for smaller images (if needed)
- Regular base image updates for security

## Security Considerations

### Container Security

1. **Non-root User**: Container runs as `nodejs` user
2. **Minimal Base Image**: `node:20-slim` reduces attack surface
3. **Dependency Scanning**: Regular vulnerability checks
4. **Secret Management**: Environment variables for sensitive data

### Network Security

1. **HTTPS**: Use Azure Application Gateway for SSL termination
2. **Firewall Rules**: Restrict database access to container IPs
3. **VNet Integration**: Consider Azure Virtual Network for private communication

## Monitoring & Logging

### Health Monitoring

```bash
# Basic health check script
#!/bin/bash
HEALTH_URL="http://gt-automotives-backend-working.canadacentral.azurecontainer.io:3000/health"
if curl -f -s $HEALTH_URL > /dev/null; then
  echo "✅ Backend is healthy"
else
  echo "❌ Backend is unhealthy"
  exit 1
fi
```

### Log Management

```bash
# Stream logs in real-time
az container attach --resource-group gt-automotives-prod --name gt-backend-working

# Export logs for analysis
az container logs --resource-group gt-automotives-prod --name gt-backend-working > backend.log
```

## Future Improvements

### Automation Opportunities

1. **CI/CD Pipeline**: GitHub Actions for automated deployment
2. **Infrastructure as Code**: ARM/Bicep templates for resources
3. **Monitoring Integration**: Azure Monitor/Application Insights
4. **Auto-scaling**: Azure Container Apps for dynamic scaling

### Architecture Evolution

1. **Microservices**: Split monolithic backend into smaller services
2. **Service Mesh**: Istio for advanced networking features
3. **Caching Layer**: Redis for improved performance
4. **Message Queue**: Service Bus for async processing

## Related Documentation

- [Azure Deployment Plan](./azure-deployment-plan.md)
- [Azure Implementation Guide](./azure-implementation-guide.md)
- [Production Deployment Checklist](./production-deployment-checklist.md)
- [Tech Stack](./tech-stack.md)
- [Troubleshooting](./troubleshooting.md)

## Recent Updates

### September 17, 2025 - Shared DTO Build Path Resolution & Successful Deployment
- ✅ **Build Path Discovery**: Fixed shared DTO library path - builds to `dist/libs/shared-dto/` NOT `libs/shared-dto/dist/`
- ✅ **GitHub Actions Fix**: Added explicit `yarn nx build shared-dto` step before backend packaging
- ✅ **Dockerfile Path Correction**: Updated all deployment configs to use `dist/libs/shared-dto/src/*` for copying
- ✅ **Container Deployment Success**: New working instance at gt-automotives-backend-api-fixes.canadacentral.azurecontainer.io:3000
- ✅ **Frontend Deployment**: Successful deployment with build: build-20250917-194153-534fa05
- ✅ **Full System Operational**: Both frontend and backend working together in production
- ✅ **Path Standardization**: All deployment configs now use consistent shared DTO build paths

### September 16, 2025 - Clerk SDK Authorization Fix
- ✅ **Environment Variables**: Added `CLERK_API_URL=https://api.clerk.com` to required variables
- ✅ **Backend Code**: Updated services to use `createClerkClient` with proper configuration
- ✅ **Deployment**: Container recreated with full Clerk environment variable set
- ✅ **Status**: Clerk SDK authorization issues resolved for user creation endpoints

### Known Issues Resolved
- ✅ **GitHub Workflow Crash Loop**: RESOLVED - Container now starts successfully from CI/CD
- ✅ **File Path Mismatches**: RESOLVED - Aligned with working direct deployment structure
- ✅ **Shared DTO Build Path**: RESOLVED - Library builds to `dist/libs/shared-dto/` and all configs updated
- ✅ **Missing Build Step**: RESOLVED - Added explicit shared DTO build step in GitHub Actions
- ✅ **Production Deployment**: RESOLVED - Full system deployed and operational

---

**Last Updated**: September 17, 2025
**Container Image**: `gtautomotivesregistry.azurecr.io/gt-backend:container-deploy-[build-number]`
**Production URL**: `http://gt-automotives-backend-api-fixes.canadacentral.azurecontainer.io:3000`
**Frontend Build**: `build-20250917-194153-534fa05`
**GitHub Workflow**: Shared DTO build integration complete