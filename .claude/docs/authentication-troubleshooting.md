# Authentication Troubleshooting Guide

## Overview
This guide provides solutions for common authentication issues with Clerk integration in the GT Automotive application.

## Common Issues and Solutions

### 1. 401 Unauthorized Errors in Development/Production

#### Error: `POST /api/invoices 401 (Unauthorized)`
**Symptom:** Admin user cannot create invoices, gets 401 errors despite being logged in

**Root Causes:**
1. **Missing Admin User in Database**: Admin user not seeded with correct Clerk ID
2. **Development/Production Domain Mismatch**: ClerkProvider using wrong domain configuration

**Solutions:**

**1. Seed Admin User in Database:**
```bash
yarn db:seed
```
This creates the admin user (`vishal.alawalpuria@gmail.com`) with Clerk ID `user_31JM1BAB2lrW82JVPgrbBekTx5H` and admin role.

**2. Fix ClerkProvider Configuration (Fixed in v1.2.0):**
The ClerkProvider now properly separates development and production configurations:

```typescript
// Only use custom domain for production builds with production key
const isProduction = import.meta.env.PROD;
const isProductionKey = publishableKey?.startsWith('pk_live_');

if (isProduction && isProductionKey && publishableKey?.includes('Y2xlcmsuZ3QtYXV0b21vdGl2ZXMuY29tJA')) {
  props.domain = 'clerk.gt-automotives.com';
  props.isSatellite = false;
}
```

**Key Changes:**
- Development (`pk_test_`): Uses default Clerk endpoints
- Production (`pk_live_`): Uses custom domain `clerk.gt-automotives.com`
- Prevents domain confusion during token refresh cycles

**Production Token Refresh Issue Fix:**
This also resolves the "first invoice works, second fails" issue in production by ensuring consistent domain usage throughout the session lifecycle.

### 2. DNS Resolution Errors

#### Error: `net::ERR_NAME_NOT_RESOLVED`
**Symptom:** Browser cannot resolve `clerk.gt-automotives.com`

**Causes:**
- DNS records not properly configured
- DNS propagation still in progress
- Incorrect CNAME values

**Solutions:**
1. Verify DNS records in your DNS provider:
   ```
   clerk → frontend-api.clerk.services (NOT clerk.accounts.dev)
   ```

2. Check DNS propagation:
   ```bash
   dig @8.8.8.8 clerk.gt-automotives.com CNAME +short
   ```

3. Wait for propagation (5-30 minutes)

4. Temporary workaround while DNS propagates:
   ```typescript
   props.domain = 'clean-dove-53.clerk.accounts.dev';
   ```

### 2. SSL Certificate Errors

#### Error: `net::ERR_SSL_VERSION_OR_CIPHER_MISMATCH`
**Symptom:** SSL handshake fails when accessing Clerk endpoints

**Causes:**
- SSL certificates not yet issued by Clerk
- DNS not verified in Clerk dashboard
- Trying to load JS from custom domain

**Solutions:**
1. Check Clerk Dashboard → Domains → Verify all DNS records show "Verified ✅"

2. Wait for SSL certificate issuance (5-10 minutes after verification)

3. Ensure JavaScript loads from Clerk CDN, not custom domain:
   ```typescript
   // Correct - API uses custom domain
   props.domain = 'clerk.gt-automotives.com';
   
   // JS automatically loads from clerk.accounts.dev
   ```

### 3. JavaScript Loading Issues

#### Error: Failed to load `https://clerk.gt-automotives.com/npm/@clerk/clerk-js@5/dist/clerk.browser.js`
**Symptom:** Clerk JavaScript library fails to load

**Cause:** Custom domain doesn't serve JavaScript files

**Solution:**
The custom domain is only for API calls. JavaScript must load from Clerk's CDN. This is handled automatically when properly configured.

If issue persists, force JS URL:
```typescript
if (typeof window !== 'undefined') {
  (window as any).CLERK_JS_URL = 'https://clerk.accounts.dev/npm/@clerk/clerk-js@5/dist/clerk.browser.js';
}
```

### 4. API Attribution Errors

#### Error: "Unable to attribute this request to an instance"
**Symptom:** API calls fail with 400 Bad Request

**Causes:**
- Publishable key doesn't match domain
- Using test key with production domain or vice versa

**Solutions:**
1. Match key with domain:
   - Test key (`pk_test_...`) → `*.clerk.accounts.dev`
   - Production key (`pk_live_...`) → Your custom domain

2. Verify environment variables:
   ```env
   VITE_CLERK_PUBLISHABLE_KEY=pk_live_Y2xlcmsuZ3QtYXV0b21vdGl2ZXMuY29tJA
   ```

### 5. Backend/Frontend Mismatch

#### Error: Authentication works in frontend but API calls fail
**Symptom:** User can sign in but API returns 401 Unauthorized

**Causes:**
- Backend using different Clerk keys
- JWKS URL mismatch
- CORS not configured

**Solutions:**
1. Ensure backend has matching configuration:
   ```env
   CLERK_SECRET_KEY=sk_live_YOUR_SECRET_KEY
   CLERK_PUBLISHABLE_KEY=pk_live_YOUR_KEY
   CLERK_JWKS_URL=https://clerk.gt-automotives.com/.well-known/jwks.json
   ```

2. Verify CORS allows frontend domain:
   ```env
   CORS_ORIGIN=https://gt-automotives.com
   ```

### 6. Development vs Production Issues

#### Error: Works locally but not in production
**Symptom:** Authentication works in development but fails when deployed

**Causes:**
- Environment variables not set in production
- Using development keys in production
- Missing GitHub secrets

**Solutions:**
1. Set GitHub secrets:
   ```
   VITE_CLERK_PUBLISHABLE_KEY
   CLERK_SECRET_KEY
   CLERK_JWKS_URL
   ```

2. Verify deployment workflow uses correct env vars:
   ```yaml
   env:
     VITE_CLERK_PUBLISHABLE_KEY: ${{ secrets.VITE_CLERK_PUBLISHABLE_KEY }}
   ```

### 7. Mock Provider Issues

#### Error: MockClerkProvider being used in production
**Symptom:** No actual authentication, mock data shown

**Cause:** Missing publishable key

**Solution:**
Ensure `VITE_CLERK_PUBLISHABLE_KEY` is set in production environment

### 8. Environment Variable Access Issues

#### Error: Authentication appears to work but session doesn't persist
**Symptom:**
- Login form appears and accepts credentials
- User gets redirected to home page instead of role-based dashboard
- Console shows `isSignedIn: false` and `publishableKey: 'NONE'` in useAuth hook
- Authentication works in ClerkProvider but fails in useAuth hook

**Root Cause:**
The `useAuth` hook and `ClerkProvider` use different methods to access environment variables:
- `ClerkProvider` uses direct `import.meta.env.VITE_CLERK_PUBLISHABLE_KEY` ✅
- `useAuth` hook uses `getEnvVar('VITE_CLERK_PUBLISHABLE_KEY')` which may fail ❌

**Debugging Steps:**
1. Check browser console for authentication state logs:
   ```
   🔍 useAuth Debug - Clerk State: {publishableKey: 'NONE'} ← Problem
   ```
2. Verify ClerkProvider logs show proper key:
   ```
   ✅ Using real ClerkProvider with key: pk_test_Y2xlYW4tZG92...
   ```

**Solution:**
Ensure consistent environment variable access across all authentication components:

```typescript
// In useAuth hook - Use direct import.meta.env access
// @ts-ignore
const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '';

// NOT: const publishableKey = getEnvVar('VITE_CLERK_PUBLISHABLE_KEY');
```

**Prevention:**
- Always use direct `import.meta.env` access for Vite environment variables
- Test authentication flow end-to-end after any environment variable changes
- Add debug logging to verify environment variables are properly loaded

### 9. Clerk SDK Authorization Issues (Backend)

#### Error: "Failed to create user in Clerk: Unauthorized"
**Symptom:**
- Frontend authentication works properly
- User creation via `/api/users/admin-staff` endpoint returns 500 Internal Server Error
- Backend logs show "Failed to create user in Clerk: Unauthorized"
- Other Clerk-related API calls may also fail with authorization errors

**Root Cause:**
The Clerk SDK requires proper client configuration with secret key and API URL. Using the default `clerkClient` import doesn't provide proper authentication configuration.

**Debugging Steps:**
1. Check backend logs for Clerk-related errors:
   ```
   Failed to create user in Clerk: Unauthorized
   ```
2. Verify environment variables are set:
   ```bash
   # In backend container/environment
   echo $CLERK_SECRET_KEY
   echo $CLERK_API_URL
   ```

**Solution:**
Configure Clerk client properly in backend services:

```typescript
// WRONG - Using default client
const { clerkClient } = await import('@clerk/clerk-sdk-node');

// CORRECT - Create configured client
const { createClerkClient } = await import('@clerk/clerk-sdk-node');

const clerkClient = createClerkClient({
  secretKey: this.configService.get<string>('CLERK_SECRET_KEY'),
  apiUrl: this.configService.get<string>('CLERK_API_URL') || 'https://api.clerk.com'
});
```

**Required Environment Variables:**
```env
CLERK_SECRET_KEY=sk_live_YOUR_SECRET_KEY
CLERK_API_URL=https://api.clerk.com
CLERK_PUBLISHABLE_KEY=pk_live_YOUR_PUBLISHABLE_KEY
CLERK_JWKS_URL=https://clerk.gt-automotives.com/.well-known/jwks.json
```

**Files to Update:**
- `server/src/users/users.service.ts` - User creation methods
- `server/src/auth/auth.service.ts` - User lookup methods

**Prevention:**
- Always use `createClerkClient` with explicit configuration
- Test all Clerk API operations after backend deployment
- Monitor backend logs for Clerk SDK errors
- Verify all required environment variables are set in production

### 10. Custom Domain Not Working

#### Error: Custom domain configured but not working
**Symptom:** DNS verified but still getting errors

**Timeline for Resolution:**
1. Add DNS records: Immediate
2. DNS propagation: 5-30 minutes
3. Clerk verification: 5-15 minutes
4. SSL issuance: 5-10 minutes
5. Total: ~30-45 minutes

**Verification Steps:**
```bash
# Check DNS
dig clerk.gt-automotives.com CNAME +short

# Test SSL
curl -I https://clerk.gt-automotives.com/v1/environment

# Check in browser console
console.log('Should see: Using verified custom domain: clerk.gt-automotives.com')
```

## Debugging Steps

### 1. Check Browser Console
```javascript
// Look for these messages
"Using verified custom domain: clerk.gt-automotives.com"
"Using production Clerk key with custom domain"
```

### 2. Verify Network Requests
- API calls should go to: `https://clerk.gt-automotives.com/v1/...`
- JS should load from: `https://clerk.accounts.dev/npm/...`

### 3. Test Authentication Flow
1. Clear browser cache and cookies
2. Open incognito/private window
3. Try sign in
4. Check network tab for failed requests
5. Review console for errors

### 4. Verify DNS Configuration
```bash
# Check all required records
for record in clerk accounts clkmail clk._domainkey clk2._domainkey; do
  echo "Checking $record.gt-automotives.com:"
  dig +short $record.gt-automotives.com CNAME
  echo "---"
done
```

## Quick Fixes

### Temporary Fallback to Test Domain
```typescript
// In ClerkProvider.tsx
if (publishableKey?.includes('Y2xlcmsuZ3QtYXV0b21vdGl2ZXMuY29tJA')) {
  props.domain = 'clean-dove-53.clerk.accounts.dev'; // Fallback
}
```

### Force Reload After Fix
```javascript
// Clear cache and reload
localStorage.clear();
sessionStorage.clear();
window.location.reload(true);
```

### Reset Authentication State
```javascript
// If Clerk is loaded
if (window.Clerk) {
  await window.Clerk.signOut();
  window.location.href = '/';
}
```

## Environment-Specific Configuration

### Development
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_Y2xlYW4tZG92ZS01My5jbGVyay5hY2NvdW50cy5kZXYk
```

### Production
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_live_Y2xlcmsuZ3QtYXV0b21vdGl2ZXMuY29tJA
```

## Monitoring

### Health Checks
1. Frontend: Check if sign-in button appears
2. Backend: `curl http://backend-url/health`
3. Clerk: Check dashboard for any alerts

### Logs to Review
- Browser console logs
- Network tab in DevTools
- GitHub Actions deployment logs
- Azure Container Instance logs
- Clerk Dashboard audit logs

## Prevention

### Best Practices
1. Always test authentication after deployment
2. Keep development and production keys separate
3. Document all DNS changes
4. Monitor Clerk dashboard for warnings
5. Set up error tracking (e.g., Sentry)

### Pre-deployment Checklist
- [ ] Environment variables set
- [ ] GitHub secrets configured
- [ ] DNS records verified
- [ ] SSL certificates issued
- [ ] CORS configured
- [ ] Backend/frontend keys match

## Support Resources

- [Clerk Support](https://clerk.com/support)
- [Clerk Discord](https://discord.com/invite/b5rXHjAg7A)
- [GitHub Issues](https://github.com/vishaltoora/GT-Automotives-App/issues)

## Known Issues (Production)

### User Creation Endpoint Issues
**Status:** 🔍 Under Investigation
**Affected Endpoints:** `/api/users/admin-staff`, other POST requests
**Scope:** Both production and local environments

**Current Symptoms:**
- Clerk SDK authorization has been fixed in production
- User creation and other POST request issues persist in both environments
- Requires further investigation in local environment first

**Next Steps:**
1. Debug user creation issues in local development environment
2. Identify root cause of POST request failures
3. Apply fixes to both local and production environments
4. Update documentation with resolution

---

**Last Updated:** September 16, 2025
**Status:** ✅ Authentication and Clerk SDK configuration resolved
**Pending:** 🔍 User creation endpoint debugging