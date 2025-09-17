# GitHub Workflow Deployment Documentation

This document provides comprehensive documentation for the GT Automotive GitHub Actions deployment workflow, including recent fixes and optimizations.

## Overview

The GT Automotive application uses GitHub Actions for continuous deployment to Azure. The workflow supports both frontend and backend deployments with parallel execution capabilities.

## Workflow Architecture

### Workflow File
- **Location**: `.github/workflows/deploy.yml`
- **Trigger**: Manual workflow dispatch
- **Deployment Types**: Container (recommended) or App Service

### Job Structure
```yaml
jobs:
  validate-build    # Validates build artifacts
  deploy-backend    # App Service deployment (optional)
  deploy-backend-container  # Container deployment (recommended)
  deploy-frontend   # Frontend deployment
  deployment-summary  # Summary and notifications
```

## Key Improvements (September 17, 2025)

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

### 1. Build Phase (Separate Workflow)
- Triggered on push to main branch
- Builds frontend and backend artifacts
- Uploads artifacts to GitHub Actions

### 2. Deployment Phase

#### Backend Container Deployment
1. Download backend artifact
2. Reorganize file structure (critical fix)
3. Create optimized Dockerfile
4. Build Docker image
5. Push to Azure Container Registry
6. Deploy to Azure Container Instances
7. Verify health endpoint

#### Frontend Deployment
1. Download frontend artifact
2. Deploy to Azure Web App
3. Restart App Service
4. Verify deployment

### 3. Post-Deployment
- Health checks
- Container logs monitoring
- Deployment summary generation

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

### Deployment Times (Approximate)
- **Sequential Deployment**: 12-15 minutes
- **Parallel Deployment**: 6-8 minutes
- **Backend Only**: 5-6 minutes
- **Frontend Only**: 3-4 minutes

### Resource Usage
- **Container CPU**: 2 cores
- **Container Memory**: 4 GB
- **Docker Image Size**: ~300MB
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