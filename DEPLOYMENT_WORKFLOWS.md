# 🚀 Deployment Workflows Guide

## Overview

This project uses a **two-stage deployment system** with separate build and deployment workflows for better control, rollback capabilities, and production safety.

## 🏗️ Build Workflow (`build.yml`)

**Triggers:** Automatically on every push to `main` branch

### What it does:
- ✅ Installs dependencies and generates Prisma client
- ✅ Runs linting, type checking, and tests
- ✅ Builds both frontend and backend
- ✅ Creates deployment packages with unique build numbers
- ✅ Stores artifacts for 30 days
- ✅ Provides deployment summary with build number

### Build Number Format:
```
build-YYYYMMDD-HHMMSS-shortsha
Example: build-20241212-143052-abc1234
```

### Artifacts Created:
- **Frontend:** `frontend-build-YYYYMMDD-HHMMSS-shortsha.zip`
- **Backend:** `backend-build-YYYYMMDD-HHMMSS-shortsha.zip`

---

## 🚀 Deploy Workflow (`deploy.yml`)

**Triggers:** Manual trigger with UI inputs

### How to Deploy:

1. **Go to GitHub Actions** → **Deploy to Production**
2. **Click "Run workflow"** button
3. **Fill in the form:**
   ```
   Build number: build-20241212-143052-abc1234
   ☑️ Deploy Frontend
   ☑️ Deploy Backend  
   ☑️ Run database migrations
   ```
4. **Click "Run workflow"** to start deployment

### Deployment Options:
- **Deploy Frontend:** Updates the web app frontend
- **Deploy Backend:** Updates the API backend
- **Run Migrations:** Executes database schema changes

### What it does:
- 📦 Downloads specified build artifacts
- 🗄️ Runs database migrations (if selected)
- 🖥️ Deploys backend to App Service
- 🌐 Deploys frontend to App Service
- 🔄 Restarts services
- ✅ Verifies deployments are working
- 📊 Provides deployment summary

---

## 🎯 Deployment Process

### Step 1: Build (Automatic)
```bash
git push origin main
# → Triggers build workflow
# → Creates build-YYYYMMDD-HHMMSS-shortsha
```

### Step 2: Deploy (Manual)
1. Go to **GitHub** → **Actions** → **Deploy to Production**
2. Click **"Run workflow"**
3. Enter the **build number** from Step 1
4. Select deployment options
5. Click **"Run workflow"**

---

## 🔄 Rollback Process

To rollback to a previous version:

1. **Find the previous build number** in GitHub Actions history
2. **Go to Deploy to Production** workflow  
3. **Enter the older build number**
4. **Run deployment**

Example:
```
Current: build-20241212-143052-abc1234 (broken)
Rollback to: build-20241211-120000-def5678 (working)
```

---

## 📋 Required GitHub Secrets

Make sure these secrets are configured in your repository:

```
AZURE_CREDENTIALS     # Azure service principal for deployments
DATABASE_URL          # Production database connection string
```

---

## 🏗️ Build Artifacts Include:

### Frontend Package:
- Built React application
- Express.js proxy server
- package.json with dependencies
- Health check endpoint
- Build information

### Backend Package:
- Compiled NestJS application
- Production package.json
- Prisma schema and migrations
- Build information

---

## 🌐 Production URLs

After deployment:
- **Frontend:** https://gt-automotives.com
- **Backend:** https://gt-automotives-backend.azurewebsites.net
- **Health Check:** https://gt-automotives.com/health

---

## 🔍 Monitoring

### Build Status:
- Check **Actions** → **Build and Package** for build results
- Look for build artifacts in the workflow summary

### Deployment Status:  
- Check **Actions** → **Deploy to Production** for deployment results
- Review deployment summary for service status

### Production Health:
- Frontend: `curl https://gt-automotives.com/health`
- Backend: `curl https://gt-automotives-backend.azurewebsites.net/health`

---

## 🚨 Troubleshooting

### Build Fails:
- Check test results and linting errors
- Fix code issues and push again
- New build will be created automatically

### Deployment Fails:
- Check Azure credentials are valid
- Verify build number exists and is correct
- Check App Service logs in Azure portal

### Site Not Working:
- Check if both frontend and backend are deployed
- Verify database migrations ran successfully
- Test health endpoints

---

## 💡 Tips

1. **Always deploy both frontend and backend together** for consistency
2. **Run migrations** when deploying database schema changes
3. **Keep build numbers** for easy rollback
4. **Test in staging first** before production deployment
5. **Monitor health endpoints** after deployment

---

## 🔄 Migration Notes

- Migrations are **forward-only** and **automatic** when selected
- Database schema changes should be **backward compatible** when possible
- Always **backup production data** before major schema changes