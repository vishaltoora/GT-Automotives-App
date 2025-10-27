# Build Trigger

This file is used to trigger new builds when configuration changes require rebuilding.

## Build 164 - Fix VITE_API_URL Configuration (CORRECTED)

**Date**: October 27, 2025
**Reason**: Build 162 had VITE_API_URL set to direct backend URL, causing 401 errors
**Fix**: Set VITE_API_URL to `https://gt-automotives.com` (matching Build 146 working configuration)
**Expected Result**: Frontend will route through reverse proxy, which adds X-Internal-API-Key header

### Root Cause
- Build 162 had `VITE_API_URL=https://gt-automotives-backend-api.azurewebsites.net`
- This made frontend bypass reverse proxy and call backend directly
- InternalApiGuard blocked direct calls without X-Internal-API-Key header
- Result: 401 Unauthorized errors on all API calls

### Solution (CORRECTED)
- Build 163: Tried empty VITE_API_URL (incorrect - not the Build 146 config)
- Build 164: Using `VITE_API_URL=https://gt-automotives.com` (matches Build 146)
- Changed Azure setting: `VITE_API_URL=https://gt-automotives.com`
- Triggering new build to bake in correct VITE_API_URL
- Frontend will make requests to same domain
- Reverse proxy will add X-Internal-API-Key header
- Backend will accept authenticated requests

### Build 146 Working Configuration (Verified from logs)
- VITE_API_URL: `https://gt-automotives.com` ✅
- Requests go to: `https://gt-automotives.com/api/*`
- Reverse proxy forwards to: `https://gt-automotives-backend-api.azurewebsites.net/api/*`
- Reverse proxy adds header: `X-Internal-API-Key: <key>`
- Backend validates header and allows request

### Build 162 Broken Configuration
- VITE_API_URL: `https://gt-automotives-backend-api.azurewebsites.net` ❌
- Requests go directly to backend (bypasses proxy)
- No X-Internal-API-Key header added
- Backend rejects with 401 Unauthorized
