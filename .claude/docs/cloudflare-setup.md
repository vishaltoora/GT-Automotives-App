# Cloudflare HTTPS Setup Guide

## Overview
This document covers the complete Cloudflare setup for SSL/HTTPS configuration with Azure-hosted GT Automotive application.

**Domain:** gt-automotives.com  
**Setup Date:** September 8, 2025  
**Status:** ✅ Active

---

## Current Architecture

```
[Users] → [Cloudflare CDN/SSL] → [Azure Resources]
                ↓
    ┌───────────────────────────┐
    │   gt-automotives.com       │ → Azure Storage Static Website
    │   www.gt-automotives.com   │ → Azure Storage Static Website  
    │   api.gt-automotives.com   │ → Azure Container Instance
    └───────────────────────────┘
```

---

## DNS Configuration

### Cloudflare DNS Records

| Type | Name | Target | Proxy | Status |
|------|------|--------|-------|--------|
| CNAME | @ | gtautomotiveweb3007b23f.z9.web.core.windows.net | ✅ ON | Active |
| CNAME | www | gtautomotiveweb3007b23f.z9.web.core.windows.net | ✅ ON | Active |
| A | api | 52.226.203.8 | ✅ ON | Active |

### Cloudflare Nameservers
- Configured at domain registrar
- DNS propagation confirmed
- Resolution verified to Cloudflare IPs: 172.67.183.4, 104.21.51.171

---

## SSL/TLS Configuration

### Cloudflare SSL Settings
- **SSL/TLS Mode:** Flexible (Azure Storage doesn't support SSL on custom domains)
- **Always Use HTTPS:** ✅ Enabled
- **Automatic HTTPS Rewrites:** ✅ Enabled
- **HSTS:** Not configured (optional)
- **Minimum TLS Version:** TLS 1.2

### Edge Certificates
- **Universal SSL:** Active
- **Certificate Type:** Cloudflare managed
- **Auto-renewal:** Enabled

---

## Page Rules

### API Subdomain Rule
- **URL Pattern:** `*api.gt-automotives.com/*`
- **Settings:**
  - SSL: Flexible
  - Cache Level: Bypass
  - Always Use HTTPS: ON

---

## Azure Resource Configuration

### Storage Account
- **Name:** gtautomotiveweb3007b23f
- **Static Website:** Enabled
- **Primary Endpoint:** https://gtautomotiveweb3007b23f.z9.web.core.windows.net/
- **Custom Domain:** Not configured (using Cloudflare proxy)

### Container Instance (Backend)
- **Name:** gt-backend
- **FQDN:** gt-backend.eastus.azurecontainer.io
- **IP:** 52.226.203.8
- **Port:** 3000
- **Status:** Running

---

## Environment Configuration

### Frontend (.env.production)
```env
VITE_API_URL=https://api.gt-automotives.com/api
VITE_CLERK_PUBLISHABLE_KEY=pk_live_YOUR_CLERK_PUBLISHABLE_KEY
VITE_CLERK_FRONTEND_API=https://clerk.gt-automotives.com
```

### Backend Environment Variables
```bash
NODE_ENV=production
DATABASE_URL=[Azure PostgreSQL Connection String]
CORS_ORIGIN=https://gt-automotives.com
PORT=3000
```

---

## Deployment Scripts

### Frontend Deployment (deploy-frontend.sh)
```bash
#!/bin/bash
# Builds and deploys frontend to Azure Storage
yarn nx build webApp --prod
az storage blob upload-batch \
  --account-name gtautomotiveweb3007b23f \
  --account-key "[STORAGE_KEY]" \
  --source apps/webApp/dist \
  --destination '$web' \
  --overwrite
```

---

## Known Issues & Solutions

### Issue 1: API Port 3000 Not Accessible via Cloudflare
**Problem:** Cloudflare Free plan doesn't proxy non-standard ports  
**Current Workaround:** Direct access via http://gt-backend.eastus.azurecontainer.io:3000  
**Solutions:**
1. Upgrade to Cloudflare Spectrum (paid)
2. Deploy Azure Application Gateway as reverse proxy
3. Modify backend to use port 443
4. Use Azure Front Door for API routing

### Issue 2: CORS Configuration
**Problem:** CORS errors when frontend accesses backend  
**Solution:** Update container with proper CORS origin:
```bash
az container update \
  --resource-group gt-automotives-prod \
  --name gt-backend \
  --environment-variables CORS_ORIGIN="https://gt-automotives.com"
```

---

## Monitoring & Maintenance

### Health Checks
- Frontend: https://gt-automotives.com
- API Health: http://gt-backend.eastus.azurecontainer.io:3000/api/health
- Azure Storage: Check via Azure Portal
- Cloudflare Analytics: Available in dashboard

### Regular Maintenance Tasks
1. Monitor SSL certificate expiration (auto-renewed by Cloudflare)
2. Check DNS resolution monthly
3. Review Cloudflare analytics for security threats
4. Update Page Rules as needed
5. Monitor Azure costs

---

## Security Considerations

### Implemented
- ✅ SSL/TLS encryption via Cloudflare
- ✅ DDoS protection (Cloudflare)
- ✅ Web Application Firewall (Basic - Cloudflare Free)
- ✅ Bot protection (Cloudflare)

### Recommended Improvements
- [ ] Enable HSTS headers
- [ ] Configure Content Security Policy (CSP)
- [ ] Set up rate limiting rules
- [ ] Enable Cloudflare Web Analytics
- [ ] Configure firewall rules for API access

---

## Cost Analysis

### Cloudflare Costs
- **Plan:** Free
- **Features Included:** SSL, DDoS protection, CDN
- **Limitations:** No port proxying, limited analytics

### Potential Upgrades
- **Cloudflare Pro:** $20/month (WAF rules, image optimization)
- **Cloudflare Spectrum:** $5/month per 1GB (for port 3000 proxying)

---

## Troubleshooting

### DNS Not Resolving
```bash
# Check DNS propagation
nslookup gt-automotives.com 8.8.8.8
# Should return Cloudflare IPs
```

### SSL Certificate Issues
1. Check Cloudflare SSL/TLS settings
2. Verify DNS records are proxied (orange cloud)
3. Clear browser cache
4. Check in incognito mode

### Frontend Not Loading
```bash
# Verify Azure Storage is accessible
curl https://gtautomotiveweb3007b23f.z9.web.core.windows.net/
# Redeploy if needed
./deploy-frontend.sh
```

### API Connection Issues
```bash
# Test direct connection
curl http://gt-backend.eastus.azurecontainer.io:3000/api/health
# Check container status
az container show --resource-group gt-automotives-prod --name gt-backend
```

---

## Quick Reference Commands

```bash
# Deploy frontend
./deploy-frontend.sh

# Check container status
az container show -g gt-automotives-prod -n gt-backend --query instanceView.state

# View container logs
az container logs -g gt-automotives-prod -n gt-backend

# Update CORS for backend
az container update -g gt-automotives-prod -n gt-backend \
  --environment-variables CORS_ORIGIN="https://gt-automotives.com"

# Test endpoints
curl https://gt-automotives.com
curl http://gt-backend.eastus.azurecontainer.io:3000/api/health
```

---

## Next Steps

1. **Immediate:**
   - [ ] Update Clerk production keys
   - [ ] Configure CORS properly on backend
   - [ ] Test all user roles with HTTPS

2. **Short-term:**
   - [ ] Implement Azure Application Gateway for API
   - [ ] Set up monitoring alerts
   - [ ] Configure backup strategy

3. **Long-term:**
   - [ ] Consider Cloudflare Pro for enhanced features
   - [ ] Implement CI/CD pipeline with GitHub Actions
   - [ ] Set up staging environment

---

**Last Updated:** September 8, 2025  
**Author:** GT Automotive Development Team  
**Status:** Production Ready with API Port Limitation