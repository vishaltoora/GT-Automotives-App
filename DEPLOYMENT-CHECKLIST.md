# GT Automotive - Deployment Checklist

## ✅ Completed Items

- [x] Created Backend Dockerfile (`Dockerfile.server`)
- [x] Created Frontend production config (`vite.config.production.ts`)
- [x] Created environment file templates (`.env.production`)
- [x] Created health check endpoint (`/api/health`)
- [x] Created deployment scripts (`scripts/deploy-*.sh`)
- [x] Created GitHub Actions workflow (`.github/workflows/deploy-production.yml`)
- [x] Added AWS credentials to GitHub Secrets (completed by user)

## 📋 Remaining Tasks

### Phase 3: Infrastructure Creation

#### 1. Container Service Setup
- [ ] Create Container Service for backend
  ```bash
  aws lightsail create-container-service \
    --region ca-central-1 \
    --service-name gt-automotive-backend \
    --power medium \
    --scale 2
  ```

#### 2. CDN Distribution Setup  
- [ ] Create CDN Distribution for frontend
  ```bash
  aws lightsail create-distribution \
    --region ca-central-1 \
    --distribution-name gt-automotive-cdn \
    --origin '{"name": "gt-automotive-frontend", "protocolPolicy": "https-only"}' \
    --default-cache-behavior '{"behavior": "cache"}'
  ```

### Phase 4: GitHub Secrets Configuration

Add these to GitHub Repository Settings → Secrets → Actions:

- [x] `AWS_ACCESS_KEY_ID` (completed)
- [x] `AWS_SECRET_ACCESS_KEY` (completed)
- [ ] `DATABASE_URL_PROD` - Full PostgreSQL connection string
- [ ] `CLERK_SECRET_KEY_PROD` - From Clerk Dashboard
- [ ] `CLERK_PUBLISHABLE_KEY_PROD` - From Clerk Dashboard  
- [ ] `API_URL` - Container Service URL (after creation)
- [ ] `FRONTEND_URL` - CDN Distribution URL (after creation)

### Phase 5: Database Setup

#### 1. Connect to Database
- [ ] Set database password
- [ ] Create production database
  ```sql
  CREATE DATABASE gt_automotive_prod;
  ```

#### 2. Run Migrations
- [ ] Execute Prisma migrations
  ```bash
  DATABASE_URL="postgresql://..." yarn prisma migrate deploy
  ```

#### 3. Seed Initial Data
- [ ] Create admin user
- [ ] Add initial configuration

### Phase 6: First Deployment

#### 1. Backend Deployment
- [ ] Build Docker image locally (test)
- [ ] Run deployment script
  ```bash
  ./scripts/deploy-backend.sh
  ```
- [ ] Verify health endpoint

#### 2. Frontend Deployment
- [ ] Build frontend locally (test)
- [ ] Run deployment script
  ```bash
  ./scripts/deploy-frontend.sh
  ```
- [ ] Verify CDN distribution

### Phase 7: Testing & Validation

- [ ] Test backend API endpoints
- [ ] Test frontend loading from CDN
- [ ] Verify authentication flow (Clerk)
- [ ] Test database connectivity
- [ ] Check CORS configuration
- [ ] Verify health monitoring

### Phase 8: DNS & SSL (Optional)

- [ ] Configure custom domain
- [ ] Add SSL certificates
- [ ] Update environment variables
- [ ] Test HTTPS connections

## 🔍 Verification Commands

```bash
# Check all resources
./scripts/check-lightsail-resources.sh

# Test backend health
curl https://[container-service-url]/api/health

# Check CDN status
aws lightsail get-distributions --region ca-central-1

# Monitor container logs
aws lightsail get-container-log \
  --service-name gt-automotive-backend \
  --container-name api
```

## 📝 Notes

- Database endpoint: `ls-2a6de9ece8ab9215b6691161b3a4d8ce412fa7e8.cfo6qsguqdy1.ca-central-1.rds.amazonaws.com`
- Bucket name: `gt-automotive-frontend`
- Region: `ca-central-1` (Montreal)
- Monthly cost estimate: ~$60.50

## ⚠️ Important Reminders

1. Never commit secrets to git
2. Always test locally before deploying
3. Monitor costs in AWS console
4. Set up billing alerts
5. Backup database before migrations
6. Document any custom configurations

---

**Status**: Ready to create Container Service and CDN Distribution
**Next Action**: Run `./scripts/check-lightsail-resources.sh` to see what exists