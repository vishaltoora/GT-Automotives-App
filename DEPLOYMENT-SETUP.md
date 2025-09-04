# GT Automotive - Deployment Setup Guide

## ✅ Phase 2 Completed: Application Preparation

### What We've Created:

1. **Backend Docker Configuration**
   - `Dockerfile.server` - Multi-stage build for optimized container
   - `.dockerignore` - Excludes unnecessary files from build
   - Health check endpoint at `/api/health`

2. **Frontend Build Configuration**
   - `vite.config.production.ts` - Optimized for CDN deployment
   - Chunk splitting for better caching
   - Gzip compression enabled

3. **Environment Files**
   - `.env.production` - Backend production config template
   - `apps/webApp/.env.production` - Frontend production config template

4. **Deployment Scripts**
   - `scripts/deploy-backend.sh` - Deploy backend to Lightsail Container
   - `scripts/deploy-frontend.sh` - Deploy frontend to Lightsail Bucket

5. **CI/CD Pipeline**
   - `.github/workflows/deploy-production.yml` - Automated deployment on push to main

## 📋 Your AWS Lightsail Resources

- **Database**: `ls-2a6de9ece8ab9215b6691161b3a4d8ce412fa7e8.cfo6qsguqdy1.ca-central-1.rds.amazonaws.com`
- **Bucket**: `gt-automotive-frontend`
- **Region**: `ca-central-1` (Montreal)

## 🚀 Next Steps to Complete Deployment

### Step 1: Create Remaining Lightsail Resources

1. **Create Container Service** (if not already created):
   ```bash
   aws lightsail create-container-service \
     --region ca-central-1 \
     --service-name gt-automotive-backend \
     --power medium \
     --scale 2
   ```

2. **Create CDN Distribution** (if not already created):
   ```bash
   aws lightsail create-distribution \
     --region ca-central-1 \
     --distribution-name gt-automotive-cdn \
     --origin gt-automotive-frontend \
     --default-cache-behavior "targetOriginId=gt-automotive-frontend,viewerProtocolPolicy=redirect-to-https"
   ```

### Step 2: Configure GitHub Secrets

Add these secrets to your GitHub repository (Settings → Secrets → Actions):

```
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
DATABASE_URL_PROD=postgresql://dbmasteruser:YOUR_PASSWORD@ls-2a6de9ece8ab9215b6691161b3a4d8ce412fa7e8.cfo6qsguqdy1.ca-central-1.rds.amazonaws.com:5432/gt_automotive_prod?sslmode=require
CLERK_SECRET_KEY_PROD=sk_live_xxx
CLERK_PUBLISHABLE_KEY_PROD=pk_live_xxx
API_URL=https://your-container-service-url.ca-central-1.cs.amazonlightsail.com/api
FRONTEND_URL=https://your-cdn-domain.cloudfront.net
```

### Step 3: Database Migration

1. **Connect to production database**:
   ```bash
   export DATABASE_URL="postgresql://dbmasteruser:YOUR_PASSWORD@ls-2a6de9ece8ab9215b6691161b3a4d8ce412fa7e8.cfo6qsguqdy1.ca-central-1.rds.amazonaws.com:5432/gt_automotive_prod?sslmode=require"
   ```

2. **Run migrations**:
   ```bash
   yarn prisma migrate deploy
   ```

3. **Seed initial data** (optional):
   ```bash
   yarn prisma db seed
   ```

### Step 4: Initial Manual Deployment

1. **Make scripts executable**:
   ```bash
   chmod +x scripts/deploy-backend.sh
   chmod +x scripts/deploy-frontend.sh
   ```

2. **Deploy backend**:
   ```bash
   ./scripts/deploy-backend.sh
   ```

3. **Deploy frontend**:
   ```bash
   ./scripts/deploy-frontend.sh
   ```

### Step 5: Verify Deployment

1. **Check backend health**:
   ```bash
   curl https://your-container-service-url/api/health
   ```

2. **Check frontend**:
   - Visit your CDN URL in browser
   - Verify all pages load correctly

### Step 6: Configure DNS (Optional)

If you have a custom domain:
1. Add A record pointing to CDN distribution
2. Add SSL certificate in Lightsail
3. Update environment variables with new URLs

## 🔧 Manual Deployment Commands

### Deploy Backend Only:
```bash
docker build -f Dockerfile.server -t gt-backend:latest .
aws lightsail push-container-image --service-name gt-automotive-backend --label api --image gt-backend:latest
# Then create deployment through AWS Console or CLI
```

### Deploy Frontend Only:
```bash
yarn nx build webApp --prod
aws s3 sync apps/webApp/dist s3://gt-automotive-frontend --delete
aws lightsail reset-distribution-cache --distribution-name gt-automotive-cdn --paths "/*"
```

## 📊 Cost Summary

| Service | Monthly Cost |
|---------|-------------|
| Database (1GB/40GB) | $15 |
| Container Service (Medium×2) | $40 |
| Bucket (25GB/250GB transfer) | $3 |
| CDN (50GB transfer) | $2.50 |
| **Total** | **~$60.50** |

## 🔐 Security Checklist

- [ ] Database password is strong and stored securely
- [ ] Clerk API keys are configured
- [ ] CORS is set to production frontend URL only
- [ ] Database is not publicly accessible (after migration)
- [ ] SSL/TLS is enforced on all connections
- [ ] Environment variables are set in GitHub Secrets
- [ ] No secrets are committed to git

## 🛠 Troubleshooting

### Container deployment fails:
- Check Docker build locally: `docker build -f Dockerfile.server -t test .`
- Verify all environment variables are set
- Check container service has enough capacity

### Frontend not loading:
- Check bucket permissions (should be public read)
- Verify CDN distribution is active
- Check CORS settings on backend

### Database connection fails:
- Verify connection string format
- Check SSL mode is set to `require`
- Ensure database security group allows container service

## 📞 Support

For issues, check:
1. AWS Lightsail Console for service status
2. GitHub Actions logs for deployment errors
3. Container service logs: `aws lightsail get-container-log --service-name gt-automotive-backend`

---

**Status**: Application preparation complete. Ready for infrastructure creation and deployment.
**Next Action**: Create Container Service and CDN Distribution in AWS Lightsail.