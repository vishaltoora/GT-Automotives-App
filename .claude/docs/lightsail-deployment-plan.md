# AWS Lightsail Deployment Plan for GT Automotive

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         AWS Lightsail                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐     ┌──────────────────┐                │
│  │  Lightsail CDN   │────▶│ Lightsail Bucket │                │
│  │  Distribution    │     │   (Frontend)     │                │
│  └──────────────────┘     └──────────────────┘                │
│           │                                                     │
│           │                                                     │
│           ▼                                                     │
│  ┌──────────────────┐     ┌──────────────────┐                │
│  │    Container     │────▶│  Managed Database │                │
│  │  Service (x2)    │     │   (PostgreSQL)    │                │
│  │   (Backend API)  │     └──────────────────┘                │
│  └──────────────────┘                                          │
│                                                                 │
│  ┌──────────────────────────────────────────┐                 │
│  │         GitHub Actions CI/CD              │                 │
│  └──────────────────────────────────────────┘                 │
└─────────────────────────────────────────────────────────────────┘
```

## Phase 1: Infrastructure Setup

### Step 1.1: AWS Account & Lightsail Access
- [ ] Log into AWS Console
- [ ] Navigate to Lightsail service
- [ ] Create IAM user for CI/CD with programmatic access
- [ ] Save access keys securely for GitHub Actions

### Step 1.2: Database Setup
**Timeline: 30 minutes**

1. **Create Managed Database**
   - Service: Lightsail → Databases
   - Engine: PostgreSQL 15
   - Plan: $15 USD (1 GB RAM, 1 vCPU, 40 GB SSD)
   - Database name: `gt_automotive_prod`
   - Master username: `postgres`
   - Generate strong password
   - Enable automatic backups
   - Set backup retention: 7 days
   - Enable public mode temporarily for migration

2. **Security Configuration**
   - Note the endpoint URL
   - Configure SSL/TLS enforcement
   - Add your IP for initial setup
   - Plan to restrict to container service later

### Step 1.3: Container Service Setup
**Timeline: 45 minutes**

1. **Create Container Service**
   - Service: Lightsail → Containers
   - Service name: `gt-automotive-backend`
   - Capacity:
     - Power: Medium (1 GB RAM, 0.5 vCPUs)
     - Scale: 2 nodes (for high availability)
   - Monthly cost: ~$40 USD

2. **Container Configuration**
   - Container name: `api-server`
   - Image: Will be pushed from GitHub Actions
   - Port: 3000
   - Health check path: `/api/health`
   - Environment variables (to be set):
     ```
     NODE_ENV=production
     PORT=3000
     DATABASE_URL=[from managed database]
     CLERK_PUBLISHABLE_KEY=[from Clerk]
     CLERK_SECRET_KEY=[from Clerk]
     CORS_ORIGIN=https://cdn.gtautomotive.ca
     ```

### Step 1.4: Static Hosting Setup
**Timeline: 30 minutes**

1. **Create Lightsail Bucket**
   - Service: Lightsail → Storage → Buckets
   - Bucket name: `gt-automotive-frontend`
   - Region: Same as container service
   - Plan: $3 USD (25 GB storage, 250 GB transfer)
   - Enable versioning
   - Configure bucket for static website hosting

2. **Bucket Access Configuration**
   - Create access key for CI/CD uploads
   - Set bucket policy for public read access:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::gt-automotive-frontend/*"
       }
     ]
   }
   ```

### Step 1.5: CDN Distribution Setup
**Timeline: 20 minutes**

1. **Create Distribution**
   - Service: Lightsail → Networking → Distributions
   - Origin: Select the Lightsail bucket
   - Distribution name: `gt-automotive-cdn`
   - Caching behavior:
     - Default: Cache for 86400 seconds
     - Path pattern `/api/*`: Don't cache (proxy to container)
   - Custom domain: `app.gtautomotive.ca` (if available)
   - Enable compression
   - Plan: $2.50 USD (50 GB transfer)

2. **CDN Configuration**
   - Default root object: `index.html`
   - Error pages:
     - 404 → `/index.html` (for SPA routing)
     - 403 → `/index.html`
   - Headers to forward: `Authorization`, `Content-Type`
   - Query strings: Forward all

## Phase 2: Application Preparation

### Step 2.1: Backend Dockerfile
**Location:** `/server/Dockerfile`

```dockerfile
# Multi-stage build for optimization
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build:server

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

### Step 2.2: Frontend Build Configuration
**Update:** `/apps/webApp/vite.config.ts`

- Set base URL for CDN
- Configure asset paths
- Optimize chunk splitting
- Enable gzip compression

### Step 2.3: Environment Configuration
**Create:** `/.env.production`

```env
# Backend
DATABASE_URL=postgresql://user:pass@endpoint:5432/gt_automotive_prod
CLERK_SECRET_KEY=sk_live_xxx
NODE_ENV=production

# Frontend
VITE_API_URL=https://api.gtautomotive.ca
VITE_CLERK_PUBLISHABLE_KEY=pk_live_xxx
```

## Phase 3: Database Migration

### Step 3.1: Backup Current Data
```bash
pg_dump current_db > backup_$(date +%Y%m%d).sql
```

### Step 3.2: Migrate Schema
```bash
# Connect to production database
DATABASE_URL="postgresql://..." yarn prisma migrate deploy
```

### Step 3.3: Seed Initial Data
```bash
# Run production seeds
DATABASE_URL="postgresql://..." yarn db:seed:production
```

## Phase 4: CI/CD Pipeline Setup

### Step 4.1: GitHub Secrets Configuration
Add these secrets to GitHub repository:

```
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_LIGHTSAIL_SERVICE_NAME
AWS_BUCKET_NAME
AWS_REGION
DATABASE_URL_PROD
CLERK_SECRET_KEY_PROD
CLERK_PUBLISHABLE_KEY_PROD
```

### Step 4.2: GitHub Actions Workflow
**File:** `/.github/workflows/deploy-production.yml`

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: yarn install
      - run: yarn test
      - run: yarn lint
      - run: yarn typecheck

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ secrets.AWS_REGION }}
      
      - name: Build Docker image
        run: |
          docker build -t gt-backend:${{ github.sha }} ./server
          
      - name: Push to Lightsail
        run: |
          aws lightsail push-container-image \
            --service-name gt-automotive-backend \
            --label backend \
            --image gt-backend:${{ github.sha }}
            
      - name: Deploy new version
        run: |
          aws lightsail create-container-service-deployment \
            --service-name gt-automotive-backend \
            --containers file://container.json \
            --public-endpoint file://endpoint.json

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18
          
      - name: Install and Build
        run: |
          yarn install
          yarn build:web
        env:
          VITE_CLERK_PUBLISHABLE_KEY: ${{ secrets.CLERK_PUBLISHABLE_KEY_PROD }}
          VITE_API_URL: https://api.gtautomotive.ca
          
      - name: Configure AWS
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ secrets.AWS_REGION }}
          
      - name: Deploy to S3
        run: |
          aws s3 sync apps/webApp/dist s3://gt-automotive-frontend \
            --delete \
            --cache-control "public, max-age=31536000, immutable" \
            --exclude "index.html" \
            --exclude "*.json"
            
          aws s3 cp apps/webApp/dist/index.html s3://gt-automotive-frontend/ \
            --cache-control "no-cache, no-store, must-revalidate"
            
      - name: Invalidate CDN
        run: |
          aws lightsail reset-distribution-cache \
            --distribution-name gt-automotive-cdn
```

## Phase 5: Deployment Execution

### Step 5.1: Initial Manual Deployment
1. **Backend Container**
   ```bash
   # Build and tag
   docker build -t gt-backend:v1 ./server
   
   # Push to Lightsail
   aws lightsail push-container-image \
     --service-name gt-automotive-backend \
     --label backend-v1 \
     --image gt-backend:v1
   
   # Deploy
   aws lightsail create-container-service-deployment \
     --service-name gt-automotive-backend \
     --containers '{"api":{"image":"backend-v1","ports":{"3000":"HTTP"}}}' \
     --public-endpoint '{"containerName":"api","containerPort":3000,"healthCheck":{"path":"/api/health"}}'
   ```

2. **Frontend Static Files**
   ```bash
   # Build production
   yarn build:web
   
   # Upload to bucket
   aws s3 sync apps/webApp/dist s3://gt-automotive-frontend --delete
   
   # Invalidate CDN cache
   aws lightsail reset-distribution-cache --distribution-name gt-automotive-cdn
   ```

### Step 5.2: DNS Configuration
1. **Domain Setup** (if using custom domain)
   - Create A record: `app.gtautomotive.ca` → CDN distribution
   - Create A record: `api.gtautomotive.ca` → Container service
   - Wait for DNS propagation (up to 48 hours)

2. **SSL Certificates**
   - Enable Lightsail managed certificates
   - Verify domain ownership
   - Wait for certificate provisioning

## Phase 6: Monitoring & Optimization

### Step 6.1: Health Checks
1. **Backend Health Endpoint**
   ```typescript
   // server/src/health/health.controller.ts
   @Controller('health')
   export class HealthController {
     @Get()
     check() {
       return {
         status: 'ok',
         timestamp: new Date().toISOString(),
         uptime: process.uptime()
       };
     }
   }
   ```

2. **Frontend Health Check**
   - Monitor CDN distribution metrics
   - Set up CloudWatch alarms for 4xx/5xx errors

### Step 6.2: Performance Monitoring
1. **Metrics to Track**
   - Container CPU/Memory usage
   - Database connections
   - Response times
   - Error rates
   - CDN cache hit ratio

2. **Alerting Setup**
   - Container service unhealthy
   - Database CPU > 80%
   - Error rate > 1%
   - Budget alerts

### Step 6.3: Backup Strategy
1. **Database Backups**
   - Daily automated snapshots
   - Weekly manual backups
   - Test restore procedure monthly

2. **Code Backups**
   - Git tags for each deployment
   - Container image versioning
   - Frontend assets versioning in S3

## Phase 7: Rollback Plan

### Step 7.1: Backend Rollback
```bash
# List available images
aws lightsail get-container-images --service-name gt-automotive-backend

# Deploy previous version
aws lightsail create-container-service-deployment \
  --service-name gt-automotive-backend \
  --containers '{"api":{"image":"backend-v{previous}"}}'
```

### Step 7.2: Frontend Rollback
```bash
# S3 versioning allows easy rollback
aws s3api list-object-versions --bucket gt-automotive-frontend

# Restore previous version
aws s3api copy-object \
  --bucket gt-automotive-frontend \
  --copy-source gt-automotive-frontend/index.html?versionId=xxx
```

## Cost Breakdown

| Service | Configuration | Monthly Cost |
|---------|--------------|--------------|
| Managed Database | 1 GB RAM, 40 GB SSD | $15 |
| Container Service | Medium × 2 nodes | $40 |
| Static Bucket | 25 GB storage, 250 GB transfer | $3 |
| CDN Distribution | 50 GB transfer | $2.50 |
| **Total** | | **~$60.50** |

## Security Checklist

- [ ] Database not publicly accessible
- [ ] Container service uses HTTPS only
- [ ] Environment variables properly secured
- [ ] Clerk authentication configured
- [ ] CORS properly configured
- [ ] Rate limiting implemented
- [ ] SQL injection protection (Prisma)
- [ ] XSS protection headers
- [ ] Container images scanned for vulnerabilities
- [ ] Regular security updates scheduled

## Timeline Summary

| Phase | Duration | Description |
|-------|----------|-------------|
| Infrastructure Setup | 2 hours | Create all Lightsail resources |
| Application Prep | 1 hour | Configure build and env files |
| Database Migration | 1 hour | Migrate and seed data |
| CI/CD Setup | 1 hour | Configure GitHub Actions |
| Initial Deployment | 1 hour | First production deployment |
| Testing & Validation | 2 hours | Verify all functionality |
| **Total** | **8 hours** | Complete deployment |

## Next Steps

1. Review and approve this plan
2. Allocate AWS budget ($60.50/month)
3. Schedule deployment window
4. Create rollback documentation
5. Train team on deployment process
6. Set up monitoring dashboards
7. Document runbooks for common issues

## Support Resources

- [AWS Lightsail Documentation](https://docs.aws.amazon.com/lightsail/)
- [Lightsail Container Service Guide](https://lightsail.aws.amazon.com/ls/docs/en_us/articles/amazon-lightsail-container-services)
- [Lightsail CDN Setup](https://lightsail.aws.amazon.com/ls/docs/en_us/articles/amazon-lightsail-content-delivery-networks)
- [GitHub Actions for AWS](https://github.com/aws-actions)

---

**Document Status:** Ready for Review
**Last Updated:** September 2025
**Author:** GT Automotive DevOps Team