# Authentication Troubleshooting Guide

## Overview
This guide provides solutions for common authentication issues with Clerk integration in the GT Automotive application.

## Common Issues and Solutions

### 1. DNS Resolution Errors

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

### 9. Custom Domain Not Working

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

---

**Last Updated:** September 11, 2025
**Status:** ✅ All authentication issues resolved