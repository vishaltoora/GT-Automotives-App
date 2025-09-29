# CORS Security Configuration

## Overview
This document outlines the CORS (Cross-Origin Resource Sharing) security configuration for GT Automotives application.

## Current Configuration

### Allowed Origins (Production)
The following origins are whitelisted for production access:

1. **Primary Domain**: `https://gt-automotives.com`
2. **WWW Subdomain**: `https://www.gt-automotives.com`
3. **Development Localhost**: `http://localhost:4200` (for local testing)
4. **Backend Testing**: `http://localhost:3000` (for API testing)

### Security Features

#### Production Mode (NODE_ENV=production)
- ✅ **Strict origin validation** - Only whitelisted origins allowed
- ✅ **Credentials support** - Allows authenticated requests from trusted origins
- ✅ **CORS violations logged** - All blocked attempts are logged for security monitoring
- ✅ **No wildcard origins** - Prevents CSRF attacks

#### Development Mode (NODE_ENV=development)
- ✅ **Relaxed for localhost** - Any localhost port is allowed
- ✅ **Logging enabled** - Shows which origins are attempting access
- ✅ **Warnings for non-whitelisted** - Helps identify needed origins during development

## Adding New Allowed Origins

### Method 1: Environment Variable (Recommended for temporary/testing)
Add to your deployment environment:
```bash
ALLOWED_ORIGINS=https://staging.gt-automotives.com,https://test.gt-automotives.com
```

### Method 2: Code Update (Recommended for permanent origins)
Update the `allowedOrigins` array in:
- `/server/src/main.ts` (Backend)
- `/.github/workflows/gt-build.yml` (Frontend proxy)

## Security Best Practices

### DO's ✅
- Always use HTTPS in production
- Regularly review and audit allowed origins
- Remove unused origins
- Monitor CORS violation logs
- Use environment-specific configurations

### DON'Ts ❌
- Never use wildcard (*) in production with credentials
- Don't add untrusted third-party domains
- Avoid adding personal domains to production
- Don't disable CORS entirely

## Testing CORS

### Browser DevTools
1. Open Chrome/Edge DevTools (F12)
2. Go to Network tab
3. Look for preflight OPTIONS requests
4. Check response headers for `Access-Control-Allow-Origin`

### Command Line Test
```bash
# Test from allowed origin
curl -H "Origin: https://gt-automotives.com" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Authorization" \
     -X OPTIONS \
     https://gt-automotives.com/api/health -v

# Test from blocked origin
curl -H "Origin: https://malicious-site.com" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Authorization" \
     -X OPTIONS \
     https://gt-automotives.com/api/health -v
```

## Troubleshooting

### Common Issues

1. **"CORS policy: No 'Access-Control-Allow-Origin' header"**
   - Origin not in whitelist
   - Solution: Add origin to allowed list or check spelling

2. **"CORS policy: Cannot use wildcard with credentials"**
   - Browser security restriction
   - Solution: Use specific origins instead of wildcard

3. **Works in Edge but not Chrome**
   - Chrome has stricter CORS enforcement
   - Solution: Ensure proper origin whitelisting

4. **Works locally but not in production**
   - Production has stricter CORS settings
   - Solution: Add production URL to allowed origins

## Security Monitoring

### What to Monitor
- Failed CORS attempts in logs
- Unusual origin patterns
- Repeated attempts from blocked origins
- Successful requests from new origins

### Alert Triggers
- More than 100 CORS violations per hour from same origin
- Attempts from known malicious domains
- Successful requests from non-whitelisted origins (should never happen)

## Emergency Response

If CORS is being exploited:

1. **Immediate**: Remove compromised origin from whitelist
2. **Investigation**: Check logs for data access patterns
3. **Mitigation**: Implement rate limiting if not present
4. **Communication**: Notify affected users if data was accessed

## Configuration History

| Date | Change | Reason |
|------|--------|---------|
| 2025-09-29 | Implemented secure whitelist | Security hardening |
| 2025-09-29 | Added localhost origins | Development support |
| 2025-09-29 | Removed wildcard (*) | Prevent CSRF attacks |

---

Last Updated: September 29, 2025