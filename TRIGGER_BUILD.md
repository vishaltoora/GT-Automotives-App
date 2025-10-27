# Build Trigger

This file is used to trigger new builds when configuration changes require rebuilding.

## Build 163 - Fix VITE_API_URL Configuration

**Date**: October 27, 2025
**Reason**: Build 162 had VITE_API_URL set to direct backend URL, causing 401 errors
**Fix**: Set VITE_API_URL to empty string to use reverse proxy at `/api`
**Expected Result**: Frontend will use reverse proxy, which adds X-Internal-API-Key header

### Root Cause
- Build 162 had `VITE_API_URL=https://gt-automotives-backend-api.azurewebsites.net`
- This made frontend bypass reverse proxy and call backend directly
- InternalApiGuard blocked direct calls without X-Internal-API-Key header
- Result: 401 Unauthorized errors on all API calls

### Solution
- Changed Azure setting: `VITE_API_URL=""` (empty)
- Triggering new build to bake in empty VITE_API_URL
- Frontend will use relative `/api` URLs
- Reverse proxy will add X-Internal-API-Key header
- Backend will accept authenticated requests

### Build 146 Working Configuration (Reference)
- VITE_API_URL: (empty)
- Requests go to: `https://gt-automotives.com/api/*`
- Reverse proxy forwards to: `https://gt-automotives-backend-api.azurewebsites.net/api/*`
- Reverse proxy adds header: `X-Internal-API-Key: <key>`
- Backend validates header and allows request
