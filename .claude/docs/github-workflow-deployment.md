# GitHub Workflow Deployment Documentation

This document provides comprehensive documentation for the GT Automotive GitHub Actions deployment workflow.

## Overview

The GT Automotive application uses a **two-step GitHub Actions workflow** for controlled deployments to Azure.

## Workflow Architecture (October 3, 2025 Update)

### Two-Step Deployment Process

#### Step 1: GT-Automotive-Build (Automatic)
- **Location**: `.github/workflows/gt-build.yml`
- **Trigger**: Automatic on push to `main` branch
- **Purpose**: Build artifacts with production configuration
- **Output**: Build number for manual deployment

#### Step 2: GT-Automotive-Deploy (Manual)
- **Location**: `.github/workflows/gt-deploy.yml`
- **Trigger**: Manual workflow dispatch with build number
- **Purpose**: Deploy specific build to production
- **Deployment Target**: Azure Web App B1 (both frontend and backend)

### GT-Automotive-Build Job Structure
```yaml
jobs:
  Build:
    - Install dependencies
    - Generate Prisma Client
    - Code quality checks (lint + typecheck in parallel)
    - Build frontend and shared libraries (parallel)
    - Prepare frontend artifact with reverse proxy
    - Build and push Docker image to ACR
    - Upload artifacts (frontend zip, build info, repository)
```

### GT-Automotive-Deploy Job Structure
```yaml
jobs:
  Deploy:
    - Download build artifacts (by build number)
    - Extract build information
    - Deploy backend to Web App (optional)
    - Run database migrations (optional)
    - Deploy frontend to Web App (optional)
    - Verify deployments with health checks
    - Create deployment summary
```

## Key Improvements

### October 3, 2025 - Backend Migration to Web App B1

**Change**: Migrated from Azure Container Instance to Azure Web App B1

**Benefits**:
- **Cost Reduction**: $73/mo → $13/mo (82% savings on backend)
- **Total Cost**: $109-129/mo → $49-54/mo (51-62% overall savings)
- **Same Performance**: Web App B1 provides equivalent resources
- **Better Integration**: Simplified security with service tags
- **Automatic SSL**: Built-in HTTPS support
- **Easier Management**: Standard Azure App Service tooling

**Architecture Change**:
```yaml
# Before: Container Instance deployment
az container create \
  --name gt-automotives-backend-prod \
  --dns-name-label gt-automotives-backend-prod \
  --cpu 2 --memory 4

# After: Web App deployment
az webapp config container set \
  --name gt-automotives-backend-api \
  --docker-custom-image-name $IMAGE_TAG
```

### September 17, 2025 - Shared Library and Parallel Deployment

### 1. Container Crash Loop Resolution

**Problem**: Containers deployed via GitHub workflow would crash immediately after startup.

**Root Causes Identified**:
- File structure mismatch (main.js at `server/main.js` vs root `main.js`)
- Missing shared library setup in node_modules
- Incorrect entry point in Dockerfile
- Missing environment variables

**Solutions Implemented**:
```dockerfile
# Reorganize file structure to match working deployment
if [ -d "server" ]; then
  cp -r server/* ./
  rm -rf server
fi

# Proper entry point
CMD ["node", "main.js"]  # Not CMD ["/app/start.sh"]
```

### 2. Shared Library Configuration

**Fix**: Proper setup of @gt-automotive/shared-dto in node_modules
```dockerfile
RUN if [ -d "./shared-dto-temp" ]; then \
      mkdir -p ./node_modules/@gt-automotive/shared-dto/dist/ && \
      cp -r ./shared-dto-temp/* ./node_modules/@gt-automotive/shared-dto/dist/ && \
      cp ./shared-dto-package.json ./node_modules/@gt-automotive/shared-dto/package.json && \
      rm -rf ./shared-dto-temp ./shared-dto-package.json; \
    fi
```

### 3. Parallel Deployment Optimization

**Before**: Frontend waited for backend deployment to complete
```yaml
needs: [validate-build, deploy-backend, deploy-backend-container]
```

**After**: Frontend and backend deploy simultaneously
```yaml
needs: validate-build  # Only waits for validation
```

**Impact**: ~50% reduction in total deployment time when deploying both services

### 4. Environment Variables

**Added Missing Variables**:
```yaml
CLERK_API_URL="${{ secrets.CLERK_API_URL }}"
CLERK_PUBLISHABLE_KEY="${{ secrets.CLERK_PUBLISHABLE_KEY }}"
CLERK_JWKS_URL="${{ secrets.CLERK_JWKS_URL }}"
FRONTEND_URL="${{ secrets.FRONTEND_URL }}"
```

## Deployment Process

### Step 1: Build (Automatic on Push)

**Trigger**: `git push origin main`

**GT-Automotive-Build Workflow**:
1. Install dependencies with caching
2. Generate Prisma Client
3. Run code quality checks (parallel):
   - ESLint
   - TypeScript type checking
4. Build artifacts (parallel):
   - Frontend (Vite) with **production Clerk keys**
   - Shared libraries (Nx)
5. Create frontend deployment package:
   - Add Express.js reverse proxy server
   - Include production environment variables
   - Package as zip file
6. Build backend Docker image:
   - Build with Docker BuildKit
   - Tag with build number
   - Push to Azure Container Registry
7. Upload artifacts:
   - Frontend zip
   - Build info (image tag, build number)
   - Repository source (for migrations)

**Output**: Build number (e.g., 82) shown in workflow summary

### Step 2: Deploy (Manual via GitHub UI)

**How to Deploy**:
1. Go to: https://github.com/vishaltoora/GT-Automotives-App/actions/workflows/gt-deploy.yml
2. Click "Run workflow"
3. Enter parameters:
   - **Build Number**: (from Step 1, e.g., 82)
   - **Target Environment**: production
   - **Deploy Frontend**: ✅
   - **Deploy Backend**: ✅
   - **Run Migrations**: ✅
4. Click "Run workflow"

**GT-Automotive-Deploy Workflow**:
1. Download build artifacts by build number
2. Extract build information (Docker image tag)
3. **Backend Deployment** (if selected):
   - Update Web App container image
   - Set environment variables
   - Restart Web App
   - Wait for container pull and startup
4. **Database Migrations** (if selected):
   - Install Prisma CLI
   - Run `prisma migrate deploy`
   - Verify migration success
5. **Frontend Deployment** (if selected):
   - Upload frontend zip to Web App
   - Restart frontend service
6. **Verification**:
   - Health check backend: https://gt-automotives-backend-api.azurewebsites.net/health
   - Health check frontend: https://gt-automotives.com/health
   - Retry logic with detailed status
7. **Summary**:
   - Deployment URLs
   - Cost optimization metrics
   - Component status

## Required GitHub Secrets

### Azure Credentials
- `AZURE_CREDENTIALS` - Service principal credentials

### Database
- `DATABASE_URL` - PostgreSQL connection string

### Authentication
- `JWT_SECRET` - JWT signing secret
- `CLERK_SECRET_KEY` - Clerk backend secret
- `CLERK_API_URL` - https://api.clerk.com
- `CLERK_PUBLISHABLE_KEY` - Clerk frontend key
- `CLERK_JWKS_URL` - Clerk JWKS endpoint
- `FRONTEND_URL` - Frontend URL for CORS

## Troubleshooting

### Container Crash Loop (RESOLVED)

**Symptoms**:
- Container exits immediately after start
- CrashLoopBackOff in container status
- Works with direct deployment but fails with workflow

**Resolution**:
1. Ensure file structure matches Dockerfile.simple
2. Verify all environment variables are set
3. Check entry point is `CMD ["node", "main.js"]`
4. Confirm shared libraries are properly configured

### Debugging Commands

```bash
# Check container status
az container show \
  --resource-group gt-automotives-prod \
  --name gt-backend-working \
  --query instanceView

# View container logs
az container logs \
  --resource-group gt-automotives-prod \
  --name gt-backend-working

# Check workflow run
gh run list --workflow=deploy.yml
gh run view [RUN_ID]
```

## Performance Metrics

### Build Times (GT-Automotive-Build)
- **Full Build**: 4-6 minutes
  - Dependencies + Prisma: 1-2 minutes
  - Code quality checks: 1 minute (parallel)
  - Frontend + shared libraries: 1-2 minutes (parallel)
  - Docker build + push: 2-3 minutes
- **Cached Build**: 3-4 minutes

### Deployment Times (GT-Automotive-Deploy)
- **Frontend Only**: 2-3 minutes
- **Backend Only**: 3-5 minutes (includes container pull)
- **Full Deployment**: 5-7 minutes
- **With Migrations**: +1-2 minutes

### Resource Usage (Web App B1)
- **Backend CPU**: Shared (equivalent to 1 core)
- **Backend Memory**: 1.75 GB
- **Frontend CPU**: Shared (equivalent to 1 core)
- **Frontend Memory**: 1.75 GB
- **Docker Image Size**: ~3.5 GB

### Cost Comparison
| Component | Before (Container) | After (Web App B1) | Savings |
|-----------|-------------------|-------------------|---------|
| Backend | $73/month | $13/month | **$60/mo (82%)** |
| Frontend | $13/month | $13/month | $0 |
| Database | $23/month | $23/month | $0 |
| **Total** | **$109/month** | **$49/month** | **$60/mo (55%)** |
- **Frontend Bundle**: ~10MB

## Best Practices

### 1. Always Test Locally First
```bash
# Use deploy-backend-container.sh for local testing
./deploy-backend-container.sh
```

### 2. Verify Environment Variables
Ensure all required secrets are configured in GitHub repository settings

### 3. Monitor Deployment
```bash
# Watch deployment progress
gh run watch
```

### 4. Use Container Deployment
Container deployment is recommended over App Service for better consistency

## Future Improvements

### Planned Enhancements
1. **Blue-Green Deployment**: Zero-downtime deployments
2. **Automated Rollback**: Automatic rollback on health check failures
3. **Performance Monitoring**: Integration with Azure Application Insights
4. **Multi-Environment Support**: Separate staging environment

### Optimization Opportunities
1. **Docker Layer Caching**: Reduce build times
2. **Artifact Caching**: Cache dependencies between builds
3. **Conditional Deployments**: Skip unchanged services
4. **Parallel Health Checks**: Concurrent verification

## Related Documentation

- [Backend Container Deployment Config](./backend-container-deployment-config.md)
- [Azure Deployment Plan](./azure-deployment-plan.md)
- [Production Deployment Checklist](./production-deployment-checklist.md)
- [Troubleshooting](./troubleshooting.md)

---

**Last Updated**: September 17, 2025
**Workflow Version**: 2.0.0 (with crash loop fixes and parallel deployment)