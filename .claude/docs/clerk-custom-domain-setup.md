# Clerk Custom Domain Setup Guide

## Overview
This guide documents the complete process for setting up Clerk authentication with a custom domain for production deployment.

## Prerequisites
- Domain registered and DNS management access (e.g., Namecheap)
- Clerk account with production instance
- Azure deployment infrastructure

## Complete Setup Process

### 1. Clerk Dashboard Configuration

#### Create Custom Domain in Clerk
1. Go to Clerk Dashboard → Your Application → Domains
2. Enter your domain: `gt-automotives.com`
3. Clerk will generate required DNS records

#### Required DNS Records
Clerk will provide 5 CNAME records that need to be added to your DNS:

```
1. Frontend API (Required for authentication)
   Host: clerk
   Value: frontend-api.clerk.services
   
2. Account Portal (User management)
   Host: accounts
   Value: accounts.clerk.services
   
3. Email Service - Main
   Host: clkmail
   Value: mail.d9fncy4yo9nl.clerk.services
   
4. Email Service - DKIM1
   Host: clk._domainkey
   Value: dkim1.d9fncy4yo9nl.clerk.services
   
5. Email Service - DKIM2
   Host: clk2._domainkey
   Value: dkim2.d9fncy4yo9nl.clerk.services
```

### 2. DNS Configuration (Namecheap Example)

1. Login to Namecheap → Domain List → Manage Domain
2. Go to Advanced DNS tab
3. Add each CNAME record:
   - Type: CNAME Record
   - Host: [as specified above]
   - Value: [as specified above]
   - TTL: Automatic
4. Save all changes

### 3. Production Keys Configuration

#### Environment Variables Required

**Frontend (.env.production or GitHub Secrets):**
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_live_Y2xlcmsuZ3QtYXV0b21vdGl2ZXMuY29tJA
```

**Backend (Container Environment Variables):**
```env
CLERK_SECRET_KEY=sk_live_YOUR_SECRET_KEY
CLERK_PUBLISHABLE_KEY=pk_live_Y2xlcmsuZ3QtYXV0b21vdGl2ZXMuY29tJA
CLERK_JWKS_URL=https://clerk.gt-automotives.com/.well-known/jwks.json
```

### 4. ClerkProvider Configuration

```typescript
// apps/webApp/src/app/providers/ClerkProvider.tsx
export function ClerkProvider({ children }: ClerkProviderProps) {
  const navigate = useNavigate();
  
  if (!publishableKey) {
    return <MockClerkProvider>{children}</MockClerkProvider>;
  }

  const getClerkProps = () => {
    const props: any = {
      publishableKey,
      navigate: (to: string) => navigate(to),
      appearance: {
        elements: {
          formButtonPrimary: {
            backgroundColor: '#1976d2',
            '&:hover': {
              backgroundColor: '#1565c0'
            }
          },
          footerActionLink: {
            color: '#1976d2'
          }
        }
      }
    };

    // For production key with verified custom domain
    if (publishableKey?.includes('Y2xlcmsuZ3QtYXV0b21vdGl2ZXMuY29tJA')) {
      props.domain = 'clerk.gt-automotives.com';
      props.isSatellite = false;
      console.log('Using verified custom domain: clerk.gt-automotives.com');
    }

    return props;
  };

  return (
    <ClerkProviderBase {...getClerkProps()}>
      {children}
    </ClerkProviderBase>
  );
}
```

### 5. GitHub Actions Deployment Configuration

```yaml
# .github/workflows/deploy-frontend.yml
- name: Build frontend
  run: |
    yarn build:web
  env:
    VITE_API_URL: http://gt-backend.eastus.azurecontainer.io:3000
    VITE_CLERK_PUBLISHABLE_KEY: pk_live_Y2xlcmsuZ3QtYXV0b21vdGl2ZXMuY29tJA
```

### 6. GitHub Secrets Required

Add these secrets in GitHub repository settings:

```
VITE_CLERK_PUBLISHABLE_KEY = pk_live_Y2xlcmsuZ3QtYXV0b21vdGl2ZXMuY29tJA
CLERK_SECRET_KEY = sk_live_YOUR_SECRET_KEY
CLERK_JWKS_URL = https://clerk.gt-automotives.com/.well-known/jwks.json
AZURE_CREDENTIALS = [Your Azure service principal JSON]
```

## Common Issues and Solutions

### Issue 1: DNS Not Resolving
**Error:** `net::ERR_NAME_NOT_RESOLVED` for `clerk.gt-automotives.com`

**Solution:**
1. Verify DNS records are correctly added in your DNS provider
2. Wait for DNS propagation (5-30 minutes)
3. Test with: `dig clerk.gt-automotives.com CNAME`

### Issue 2: SSL Certificate Errors
**Error:** `net::ERR_SSL_VERSION_OR_CIPHER_MISMATCH`

**Causes:**
1. DNS records not verified in Clerk dashboard
2. SSL certificates not yet issued by Clerk
3. Using wrong domain for JavaScript loading

**Solution:**
1. Ensure all DNS records show "Verified" in Clerk dashboard
2. Wait for SSL certificate provisioning (5-10 minutes after verification)
3. Clerk automatically handles SSL once DNS is verified

### Issue 3: JavaScript Loading from Wrong Domain
**Error:** Trying to load `https://clerk.gt-automotives.com/npm/@clerk/clerk-js@5/dist/clerk.browser.js`

**Solution:**
JavaScript files are served from Clerk's CDN, not your custom domain. The custom domain is only for API calls. Clerk automatically handles this when configured correctly.

### Issue 4: "Unable to attribute this request to an instance"
**Error:** API calls failing with attribution error

**Solution:**
Ensure the publishable key matches the domain configuration. Production keys ending with your custom domain base64 encoding must be used with that custom domain.

## Verification Steps

### 1. DNS Verification
```bash
# Check DNS propagation
dig @8.8.8.8 clerk.gt-automotives.com CNAME +short
# Should return: frontend-api.clerk.services

dig @8.8.8.8 accounts.gt-automotives.com CNAME +short
# Should return: accounts.clerk.services
```

### 2. SSL Certificate Check
```bash
# Test SSL endpoint
curl -I https://clerk.gt-automotives.com/v1/environment
# Should return HTTP 200 or 401 (not SSL errors)
```

### 3. Clerk Dashboard Verification
- All DNS records should show "Verified ✅"
- SSL certificates section should show "Issued"

### 4. Application Testing
1. Visit your production site
2. Open browser console (no errors)
3. Try sign in/sign out flow
4. Verify all user roles work (Admin/Staff/Customer)

## Timeline Expectations

1. **DNS Record Addition**: Immediate in DNS provider
2. **DNS Propagation**: 5-30 minutes globally
3. **Clerk DNS Verification**: 5-15 minutes after propagation
4. **SSL Certificate Issuance**: 5-10 minutes after verification
5. **Full Functionality**: ~30-45 minutes total

## Best Practices

1. **Always use production keys in production** - Never mix test and production keys
2. **Keep secrets secure** - Use GitHub secrets, never commit actual keys
3. **Monitor DNS changes** - DNS changes can take time to propagate
4. **Test incrementally** - Verify each step before proceeding
5. **Have fallback ready** - Keep test domain configuration as backup

## Rollback Plan

If issues occur with custom domain:

1. **Quick Fix:** Switch to test domain temporarily:
   ```typescript
   props.domain = 'clean-dove-53.clerk.accounts.dev';
   ```

2. **Revert DNS:** Remove or modify CNAME records if needed

3. **Update Keys:** Switch back to test keys if necessary

## Maintenance

- **DNS Records:** Keep DNS records unchanged once working
- **SSL Certificates:** Automatically renewed by Clerk
- **Monitoring:** Check Clerk dashboard periodically for any warnings
- **Updates:** Keep Clerk SDK versions updated

## Additional Resources

- [Clerk Custom Domain Documentation](https://clerk.com/docs/deployments/clerk-domains)
- [DNS Propagation Checker](https://dnschecker.org/)
- [Namecheap DNS Guide](https://www.namecheap.com/support/knowledgebase/article.aspx/319/2237/how-can-i-set-up-a-cname-record-for-my-domain)

---

**Last Updated:** September 11, 2025
**Status:** ✅ Complete and Working in Production