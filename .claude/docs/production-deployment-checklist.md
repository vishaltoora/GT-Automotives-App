# Production Deployment Checklist

## Overview
This checklist ensures all necessary steps are completed for deploying GT Automotive to production.

**Production URL:** https://gt-automotives.com ✅ (HTTPS Working)  
**Production WWW:** https://www.gt-automotives.com ✅  
**Backend API:** http://gt-backend.eastus.azurecontainer.io:3000 ✅  
**Direct Azure URL:** https://gtautomotiveweb3007b23f.z9.web.core.windows.net/ ✅  
**Last Deployment:** September 9, 2025 (HTTPS Complete)

---

## Pre-Deployment Checklist

### Code Preparation
- [x] All TypeScript compilation errors resolved
- [x] Production build tested locally
- [x] Environment variables configured
- [x] Clerk production keys updated
- [x] CORS settings configured for production domain
- [x] Database migrations up to date

### Security Review
- [x] Authentication properly configured
- [x] API endpoints secured with proper roles
- [x] Sensitive data removed from codebase
- [ ] Production secrets stored securely in Azure
- [x] HTTPS enabled via Cloudflare
- [x] Public registration disabled

### Testing
- [x] Unit tests passing
- [x] Build process successful
- [ ] End-to-end testing completed
- [ ] All user roles tested (Admin, Staff, Customer)
- [x] Invoice printing tested
- [ ] Performance testing completed

---

## Deployment Steps

### 1. Azure Infrastructure Setup ✅
```bash
# Resource group created
az group create --name gt-automotives-prod --location eastus

# Database deployed
az postgres flexible-server create --name gt-automotives-db

# Container registry created
az acr create --name gtautomotivesregistry

# Storage account created
az storage account create --name gtautomotiveweb3007b23f
```

### 2. Backend Deployment ✅
```bash
# Build and push Docker image
docker build -f Dockerfile.backend -t gt-backend:latest .
docker tag gt-backend:latest gtautomotivesregistry.azurecr.io/gt-backend:latest
docker push gtautomotivesregistry.azurecr.io/gt-backend:latest

# Deploy container instance
az container create --name gt-backend --image gtautomotivesregistry.azurecr.io/gt-backend:latest
```

### 3. Frontend Deployment ✅
```bash
# Build frontend
yarn nx build webApp --prod

# Deploy to Azure Storage
./deploy-frontend.sh
```

### 4. Cloudflare Configuration ✅
- [x] Domain added to Cloudflare
- [x] DNS records configured
- [x] SSL/TLS settings enabled
- [x] Page rules created
- [x] Nameservers updated at registrar

### 5. Environment Variables
```bash
# Frontend (.env.production)
VITE_API_URL=https://api.gt-automotives.com/api
VITE_CLERK_PUBLISHABLE_KEY=pk_live_[YOUR_KEY]

# Backend (Container Environment)
NODE_ENV=production
DATABASE_URL=postgresql://[connection_string]
CLERK_SECRET_KEY=sk_live_[YOUR_KEY]
CORS_ORIGIN=https://gt-automotives.com
```

---

## Post-Deployment Verification

### Functional Testing
- [x] Homepage loads correctly at https://gt-automotives.com
- [x] WWW redirect working at https://www.gt-automotives.com
- [x] Login functionality works
- [x] Admin dashboard accessible
- [x] Staff dashboard accessible
- [x] Customer portal accessible
- [x] API health check passes
- [x] Database connection verified
- [x] Clerk authentication working in production
- [x] Invoice generation and printing works

### Performance Checks
- [ ] Page load time < 3 seconds
- [ ] API response time < 500ms
- [ ] CDN caching working
- [ ] Images optimized and loading

### Security Verification
- [x] SSL certificate valid (Cloudflare Universal SSL)
- [x] HTTPS redirect working (Cloudflare Page Rules)
- [x] Authentication required for protected routes
- [x] CORS properly configured
- [x] No sensitive data exposed in browser
- [x] Flexible SSL mode configured properly

### Monitoring Setup
- [ ] Azure Application Insights configured
- [ ] Error tracking enabled
- [ ] Performance monitoring active
- [ ] Budget alerts configured ($15/month)
- [ ] Uptime monitoring configured

---

## Rollback Plan

### Quick Rollback Steps
1. **Frontend Rollback:**
   ```bash
   # Restore previous build
   git checkout [previous_commit]
   yarn nx build webApp --prod
   ./deploy-frontend.sh
   ```

2. **Backend Rollback:**
   ```bash
   # Deploy previous container image
   az container update --name gt-backend \
     --image gtautomotivesregistry.azurecr.io/gt-backend:previous
   ```

3. **Database Rollback:**
   ```bash
   # Restore from backup
   az postgres flexible-server restore --name gt-automotives-db \
     --restore-point-in-time [timestamp]
   ```

---

## Known Issues & Workarounds

### Issue 1: API Port 3000 via Cloudflare
**Status:** Open  
**Workaround:** Direct API access at http://gt-backend.eastus.azurecontainer.io:3000  
**Solution:** Implement Azure Application Gateway or upgrade to Cloudflare Spectrum

### Issue 2: Clerk Production Keys
**Status:** ✅ Resolved (September 9, 2025)  
**Action Completed:** Production keys updated and working in both development and production

### Issue 3: Auto-stop Schedule
**Status:** Not Configured  
**Action Required:** Set up container scheduling for cost optimization

---

## Maintenance Tasks

### Daily
- [ ] Check application health
- [ ] Monitor error logs
- [ ] Review performance metrics

### Weekly
- [ ] Review Azure costs
- [ ] Check security alerts
- [ ] Backup verification

### Monthly
- [ ] Update dependencies
- [ ] Security patches
- [ ] Performance optimization review
- [ ] Cost analysis and optimization

---

## Emergency Contacts

### Technical Team
- **Infrastructure:** Azure Support Portal
- **Domain/SSL:** Cloudflare Support
- **Authentication:** Clerk Support

### Escalation Path
1. Check error logs in Azure Portal
2. Review Cloudflare analytics
3. Check GitHub issues
4. Contact technical support

---

## Quick Commands Reference

```bash
# Deploy frontend
./deploy-frontend.sh

# Check backend status
az container show -g gt-automotives-prod -n gt-backend --query instanceView.state

# View backend logs
az container logs -g gt-automotives-prod -n gt-backend --tail 50

# Restart backend
az container restart -g gt-automotives-prod -n gt-backend

# Update CORS
az container update -g gt-automotives-prod -n gt-backend \
  --environment-variables CORS_ORIGIN="https://gt-automotives.com"

# Test endpoints
curl https://gt-automotives.com
curl http://gt-backend.eastus.azurecontainer.io:3000/api/health
```

---

## Documentation References

- [Azure Implementation Guide](./azure-implementation-guide.md)
- [Cloudflare Setup Guide](./cloudflare-setup.md)
- [Development Status](./development-status.md)
- [Troubleshooting Guide](./troubleshooting.md)

---

**Last Updated:** September 8, 2025  
**Next Review:** September 15, 2025  
**Status:** Production Active with Minor Issues