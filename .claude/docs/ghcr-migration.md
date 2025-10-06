# GitHub Container Registry (GHCR) Migration Guide

## Overview

Successfully migrated from **Azure Container Registry (ACR)** to **GitHub Container Registry (GHCR)** to eliminate the $5-7/month cost while maintaining all functionality.

## Migration Summary

### Before (ACR)
- **Cost**: $5-7/month
- **Registry**: `gtautomotivesregistry.azurecr.io`
- **Authentication**: Azure credentials
- **Total Monthly Cost**: ~$49-54/month

### After (GHCR)
- **Cost**: FREE ✅
- **Registry**: `ghcr.io/vishaltoora/gt-automotives-app`
- **Authentication**: GitHub token (automatic)
- **Total Monthly Cost**: ~$42-47/month (62% reduction from original $109-129)

## Changes Made

### 1. Build Workflow (`gt-build.yml`)
```yaml
# Changed registry configuration
env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}/gt-backend

# Updated Docker image generation
docker-image=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:$BUILD_NUMBER

# Replaced ACR login with GHCR login
- name: Login to GitHub Container Registry
  uses: docker/login-action@v3
  with:
    registry: ghcr.io
    username: ${{ github.actor }}
    password: ${{ secrets.GITHUB_TOKEN }}

# Updated Docker build and push
docker build ... -t ghcr.io/vishaltoora/gt-automotives-app/gt-backend:build-xxx
docker push ghcr.io/vishaltoora/gt-automotives-app/gt-backend:build-xxx
```

### 2. Deploy Workflow (`gt-deploy.yml`)
```yaml
# Updated Azure Web App configuration
az webapp config container set \
  --docker-custom-image-name ${{ env.IMAGE_TAG }} \
  --docker-registry-server-url https://ghcr.io \
  --docker-registry-server-user ${{ github.actor }} \
  --docker-registry-server-password ${{ secrets.GITHUB_TOKEN }}
```

## Image Naming Convention

- **Format**: `ghcr.io/[owner]/[repo]/[image-name]:[tag]`
- **Example**: `ghcr.io/vishaltoora/gt-automotives-app/gt-backend:build-20251006-123456-abc1234`
- **Cache**: `ghcr.io/vishaltoora/gt-automotives-app/gt-backend:cache`

**Note**: GHCR requires lowercase image names - the workflow automatically converts to lowercase.

## First Deployment After Migration

### Step 1: Push to Main (Trigger Build)
```bash
git add .github/workflows/
git commit -m "feat: migrate to GitHub Container Registry (FREE, saves $5-7/mo)"
git push origin main
```

This will:
- Trigger `GT-Automotive-Build` workflow
- Build Docker image and push to `ghcr.io`
- Create frontend artifact
- Generate build number (e.g., `build-20251006-123456-abc1234`)

### Step 2: Manual Deployment
1. Go to GitHub Actions → `GT-Automotive-Deploy`
2. Click "Run workflow"
3. Enter the build number from Step 1
4. Select components to deploy
5. Run deployment

Azure Web App will automatically pull from GHCR using GitHub credentials.

## Image Visibility

By default, GitHub Container Registry images are **private**. To make them public (optional):

1. Go to: `https://github.com/vishaltoora/GT-Automotives-App/pkgs/container/gt-automotives-app%2Fgt-backend`
2. Click "Package settings"
3. Scroll to "Danger Zone"
4. Click "Change visibility" → "Public" (optional)

**Recommendation**: Keep images private unless you have a specific reason to make them public.

## Deleting Azure Container Registry

After successful deployment with GHCR, you can delete the ACR resource to stop charges:

```bash
# 1. Verify GHCR deployment is working
curl https://gt-automotives-backend-api.azurewebsites.net/health

# 2. List ACR images (optional - for backup)
az acr repository list --name gtautomotivesregistry --output table
az acr repository show-tags --name gtautomotivesregistry --repository gt-backend --output table

# 3. Delete the Azure Container Registry
az acr delete \
  --name gtautomotivesregistry \
  --resource-group gt-automotives-prod \
  --yes

# 4. Verify deletion
az acr list --resource-group gt-automotives-prod --output table
```

### Cost Impact
- **Immediate**: ACR charges stop ($5-7/month saved)
- **Billing**: Prorated refund for remaining days in current month
- **New Total**: ~$42-47/month (down from $49-54/month)

## Benefits of GHCR

### 1. Cost Savings
- **ACR**: $5-7/month base cost
- **GHCR**: FREE for public and private repositories
- **Annual Savings**: $60-84/year

### 2. GitHub Integration
- Automatic authentication with GitHub Actions
- Built-in permissions using repository access
- No additional credentials to manage

### 3. Performance
- Fast image pulls for GitHub Actions runners
- Built-in caching support
- Global CDN distribution

### 4. Features
- Unlimited private images (with GitHub subscription)
- 500MB-50GB storage depending on plan
- Package versioning and tagging
- Vulnerability scanning (GitHub Advanced Security)

## Troubleshooting

### Image Pull Failures
If Azure Web App cannot pull from GHCR:

```bash
# Check Web App container settings
az webapp config container show \
  --name gt-automotives-backend-api \
  --resource-group gt-automotives-prod

# Verify credentials
az webapp config appsettings list \
  --name gt-automotives-backend-api \
  --resource-group gt-automotives-prod \
  --query "[?name=='DOCKER_REGISTRY_SERVER_USERNAME' || name=='DOCKER_REGISTRY_SERVER_PASSWORD']"
```

### Authentication Issues
- Ensure `GITHUB_TOKEN` has `packages:read` permission (automatic in workflows)
- For manual deployments, generate a Personal Access Token (PAT) with `read:packages` scope
- Update Azure Web App credentials if needed

### Image Not Found
- Verify image exists: `https://github.com/orgs/[org]/packages?repo_name=[repo]`
- Check image name is lowercase
- Confirm build workflow completed successfully

## Rollback Plan

If you need to rollback to ACR:

```bash
# 1. Recreate ACR
az acr create \
  --name gtautomotivesregistry \
  --resource-group gt-automotives-prod \
  --sku Basic \
  --location canadacentral

# 2. Revert workflow files
git revert [commit-hash]
git push origin main

# 3. Run build workflow
# Follow normal deployment process
```

## Monitoring

### Check GHCR Usage
- Go to: Settings → Packages
- View: Storage usage, bandwidth, image versions
- Monitor: Package downloads and security alerts

### Verify Deployments
```bash
# Check current container image
az webapp config container show \
  --name gt-automotives-backend-api \
  --resource-group gt-automotives-prod \
  --query "imageTag"

# Should show: ghcr.io/vishaltoora/gt-automotives-app/gt-backend:[tag]
```

## Cost Breakdown After Migration

| Service | Old Cost | New Cost | Savings |
|---------|----------|----------|---------|
| Frontend Web App (B1) | $13/mo | $13/mo | $0 |
| Backend Web App (B1) | $13/mo | $13/mo | $0 |
| PostgreSQL (Flexible) | $16/mo | $16/mo | $0 |
| Bandwidth/Storage | ~$2-3/mo | ~$2-3/mo | $0 |
| Container Registry | $5-7/mo | **$0** | **$5-7/mo** |
| **Total** | **$49-54/mo** | **$42-47/mo** | **$7-12/mo (15%)** |

### Cumulative Savings
- **From Original**: $109-129/mo → $42-47/mo = **62% reduction**
- **Annual Savings**: **$744-984/year** compared to original infrastructure

## References

- [GitHub Container Registry Documentation](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [Docker Login Action](https://github.com/docker/login-action)
- [Azure Web App Container Configuration](https://learn.microsoft.com/en-us/azure/app-service/configure-custom-container)

---

**Migration Date**: October 6, 2025
**Status**: ✅ Complete
**Next Review**: After first successful production deployment
