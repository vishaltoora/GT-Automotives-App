# Backend Access Security Implementation

## Overview
This document describes the security measures implemented to prevent direct public access to the backend API, ensuring all requests must come through the authenticated frontend proxy.

## Security Architecture

### Problem Solved
- **Before**: Backend was publicly accessible at `http://gt-automotives-backend-prod.canadacentral.azurecontainer.io:3000`
- **After**: Backend only accepts requests from the frontend proxy with proper authentication

### Security Layers

#### 1. Internal API Key Validation
- Secret key shared between proxy and backend
- Checked on every request (except health checks)
- Stored in environment variable: `INTERNAL_API_KEY`

#### 2. Proxy Signature Header
- Special header `X-Proxy-Signature` identifies legitimate proxy requests
- Value: `gt-automotive-proxy`
- Cannot be spoofed from browser requests

#### 3. Request Origin Tracking
- Logs all access attempts
- Tracks IP addresses and user agents
- Monitors for suspicious patterns

## Implementation Details

### Backend Guard (`InternalApiGuard`)
```typescript
// Checks every incoming request for:
1. Valid Internal API Key header
2. Proxy signature header
3. Allows health checks without authentication
4. Blocks and logs unauthorized attempts
```

### Proxy Configuration
```javascript
// Proxy adds these headers to every backend request:
- X-Internal-API-Key: [secret key]
- X-Proxy-Signature: gt-automotive-proxy
- X-Forwarded-For: [client IP]
- X-Real-IP: [client IP]
- X-Original-Host: [original host]
```

## Environment Configuration

### Required Environment Variables

#### Backend (Production)
```bash
INTERNAL_API_KEY=your-secret-api-key-here
NODE_ENV=production
```

#### Frontend Proxy
```bash
INTERNAL_API_KEY=same-secret-api-key-here
```

## Security Benefits

### ✅ Protected Against
1. **Direct API Access** - Cannot bypass frontend authentication
2. **Unauthorized Scraping** - API not accessible without proxy headers
3. **Token Theft** - Even with valid JWT, direct access is blocked
4. **DDoS Attacks** - Reduces attack surface to just the proxy
5. **Data Exfiltration** - Must go through monitored proxy

### 🔒 Defense in Depth
1. **Layer 1**: Clerk JWT authentication (user identity)
2. **Layer 2**: Internal API key (proxy identity)
3. **Layer 3**: Proxy signature (request source verification)
4. **Layer 4**: CORS whitelist (browser protection)

## Testing Security

### Test 1: Direct Backend Access (Should Fail)
```bash
# This should be blocked
curl http://gt-automotives-backend-prod.canadacentral.azurecontainer.io:3000/api/users \
  -H "Authorization: Bearer VALID_JWT_TOKEN"

# Response: 401 Unauthorized - "Direct API access not allowed"
```

### Test 2: With Invalid API Key (Should Fail)
```bash
curl http://gt-automotives-backend-prod.canadacentral.azurecontainer.io:3000/api/users \
  -H "Authorization: Bearer VALID_JWT_TOKEN" \
  -H "X-Internal-API-Key: wrong-key"

# Response: 401 Unauthorized - "Invalid API key"
```

### Test 3: Through Frontend Proxy (Should Work)
```bash
# Access through https://gt-automotives.com/api/* works
# Because proxy adds required headers automatically
```

## Monitoring & Alerts

### What to Monitor
- Failed authentication attempts in logs
- Unusual patterns of blocked requests
- Spike in direct access attempts
- Requests with invalid API keys

### Log Examples
```
🚫 Blocked direct API access attempt {
  path: '/api/users',
  method: 'GET',
  origin: 'unknown',
  userAgent: 'curl/7.64.1',
  ip: '192.168.1.1',
  hasApiKey: false,
  hasProxySignature: false
}
```

## Emergency Procedures

### If API Key is Compromised
1. **Immediate**: Generate new API key
2. **Update**: Set new key in GitHub Secrets
3. **Deploy**: Trigger new deployment for both frontend and backend
4. **Monitor**: Check logs for unauthorized access during compromised period

### Rotation Schedule
- Rotate API key every 90 days
- Keep previous key active for 24 hours during rotation
- Document rotation in security log

## Configuration Management

### GitHub Secrets Required
```
INTERNAL_API_KEY - Secret key for internal API authentication
```

### Setting the Secret
```bash
# Via GitHub CLI
gh secret set INTERNAL_API_KEY

# Via GitHub UI
Settings → Secrets → Actions → New repository secret
```

## Development vs Production

### Development Mode
- API key validation is optional
- Warnings logged but requests allowed
- Helps with local testing

### Production Mode
- Strict API key validation
- All violations blocked and logged
- No bypass allowed

## Future Enhancements

### Planned Improvements
1. **Rate Limiting** - Add per-IP request limits
2. **IP Allowlisting** - Restrict backend to Azure IP range only
3. **Request Signing** - HMAC signatures for critical operations
4. **Azure Private Endpoints** - Network-level isolation
5. **Web Application Firewall** - Additional DDoS protection

## Compliance & Standards

This implementation helps meet:
- **PCI DSS** - Secure API access controls
- **OWASP Top 10** - Protection against broken authentication
- **SOC 2** - Access control and monitoring
- **GDPR** - Data protection through access control

---

**Last Updated**: September 29, 2025
**Security Level**: HIGH
**Implementation Status**: ACTIVE