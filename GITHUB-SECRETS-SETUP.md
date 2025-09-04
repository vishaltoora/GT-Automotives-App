# GitHub Secrets Configuration

## 🔐 Complete List of Secrets to Add

Go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret

### ✅ Already Added (by you):
- `AWS_ACCESS_KEY_ID` 
- `AWS_SECRET_ACCESS_KEY`

### 📋 Need to Add:

```bash
# Database Connection
DATABASE_URL_PROD=postgresql://dbmasteruser:YOUR_DATABASE_PASSWORD@ls-2a6de9ece8ab9215b6691161b3a4d8ce412fa7e8.cfo6qsguqdy1.ca-central-1.rds.amazonaws.com:5432/gt_automotive_prod?sslmode=require

# API URLs
API_URL=https://gt-automotives-backend.z6qb54dz7z94j.ca-central-1.cs.amazonlightsail.com/api

# Frontend URL
FRONTEND_URL=https://d305hdjz2ut85m.cloudfront.net

# Clerk Authentication Keys (get from https://dashboard.clerk.com)
CLERK_SECRET_KEY_PROD=sk_live_YOUR_CLERK_SECRET_KEY
CLERK_PUBLISHABLE_KEY_PROD=pk_live_YOUR_CLERK_PUBLISHABLE_KEY
```

## 🔑 Your AWS Resources Summary:

| Resource | Value |
|----------|--------|
| **Database** | `ls-2a6de9ece8ab9215b6691161b3a4d8ce412fa7e8.cfo6qsguqdy1.ca-central-1.rds.amazonaws.com:5432` |
| **Container Service** | `gt-automotives-backend.z6qb54dz7z94j.ca-central-1.cs.amazonlightsail.com` |
| **Bucket** | `gt-automotive-frontend` |
| **CDN Distribution** | `d305hdjz2ut85m.cloudfront.net` |
| **Region** | `ca-central-1` |

## 📝 What You Need to Provide:

1. **Database Password** - The password you set for your Lightsail database
2. **Clerk Secret Key** - From Clerk Dashboard (starts with `sk_live_` or `sk_test_`)
3. **Clerk Publishable Key** - From Clerk Dashboard (starts with `pk_live_` or `pk_test_`)

## 🚀 After Adding Secrets:

Once you add all the secrets, you can:

1. **Test Backend Deployment**:
   ```bash
   chmod +x scripts/deploy-backend.sh
   ./scripts/deploy-backend.sh
   ```

2. **Test Frontend Deployment**:
   ```bash
   chmod +x scripts/deploy-frontend.sh
   ./scripts/deploy-frontend.sh
   ```

3. **Use GitHub Actions**: Push to main branch for automatic deployment

## ✅ Final URLs:

- **Frontend (Public)**: https://d305hdjz2ut85m.cloudfront.net
- **Backend API**: https://gt-automotives-backend.z6qb54dz7z94j.ca-central-1.cs.amazonlightsail.com/api
- **Health Check**: https://gt-automotives-backend.z6qb54dz7z94j.ca-central-1.cs.amazonlightsail.com/api/health

---

**Next Steps**: 
1. Get database password and Clerk keys
2. Add all secrets to GitHub
3. Run database migrations  
4. Deploy!