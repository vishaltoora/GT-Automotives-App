# Backend API Status & Communication Guide

## Current Status (September 12, 2025)

### Local Development ✅
- **Backend URL:** http://localhost:3000
- **Frontend URL:** http://localhost:4200
- **Status:** Both servers running successfully
- **CORS:** Configured for localhost:4200
- **Authentication:** Returns 401 when not authenticated (expected)

### Production Environment ⚠️
- **Expected Backend URL:** http://gt-backend.eastus.azurecontainer.io:3000
- **Current Status:** DNS not resolving (container may be stopped)
- **Frontend URL:** https://gt-automotives.com ✅
- **Issue:** Backend container instance appears to be down

## Testing Frontend-Backend Communication

### 1. Local Development Test

Start both servers:
```bash
# Terminal 1: Start backend
yarn dev:server

# Terminal 2: Start frontend
yarn dev:web
```

Test connection in browser console at http://localhost:4200:
```javascript
// Quick test
fetch('http://localhost:3000/api/users')
  .then(r => console.log('Status:', r.status))
  .catch(e => console.error('Error:', e));
```

Expected result: Status 401 (Unauthorized) - this is correct!

### 2. Use Test Script

We've created `test-api-communication.js`. To use it:
1. Open http://localhost:4200 in browser
2. Open DevTools Console (F12)
3. Copy and paste the script contents
4. It will test:
   - Backend reachability
   - CORS configuration
   - Preflight requests

### 3. Production Testing

Once backend is deployed:
```javascript
// Test production API
fetch('http://gt-backend.eastus.azurecontainer.io:3000/api/users')
  .then(r => console.log('Production Status:', r.status))
  .catch(e => console.error('Production Error:', e));
```

## API Endpoints

### Public Endpoints (No Auth Required)
- None currently (all endpoints require authentication)

### Protected Endpoints (Auth Required)
- `GET /api/users` - List users (Admin only)
- `GET /api/customers` - List customers
- `GET /api/tires` - List tires
- `GET /api/invoices` - List invoices
- `GET /api/quotations` - List quotations

## CORS Configuration

### Development
```typescript
// server/src/main.ts
app.enableCors({
  origin: 'http://localhost:4200',
  credentials: true,
});
```

### Production
```typescript
app.enableCors({
  origin: [
    'https://gt-automotives.com',
    'https://www.gt-automotives.com',
    'https://gt-automotives-frontend.azurewebsites.net'
  ],
  credentials: true,
});
```

## Environment Variables

### Backend Required
```env
# Database
DATABASE_URL=postgresql://...

# Clerk Auth
CLERK_SECRET_KEY=sk_live_...
CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_JWKS_URL=https://clerk.gt-automotives.com/.well-known/jwks.json

# CORS
CORS_ORIGIN=https://gt-automotives.com
```

### Frontend Required
```env
# API URL
VITE_API_URL=http://localhost:3000  # Development
VITE_API_URL=http://gt-backend.eastus.azurecontainer.io:3000/api  # Production

# Clerk
VITE_CLERK_PUBLISHABLE_KEY=pk_live_...
```

## Troubleshooting

### Issue: CORS Errors
**Error:** "Access to fetch at 'http://localhost:3000/api' from origin 'http://localhost:4200' has been blocked by CORS policy"

**Solution:**
1. Ensure backend is running
2. Check CORS configuration in main.ts
3. Verify origin matches exactly (including protocol and port)

### Issue: 401 Unauthorized
**This is expected!** All API endpoints require authentication.

**Solution:**
1. Log in via Clerk first
2. Clerk will add authentication headers automatically
3. Then API calls will work

### Issue: Connection Refused
**Error:** "Failed to fetch" or "net::ERR_CONNECTION_REFUSED"

**Solution:**
1. Ensure backend is running (`yarn dev:server`)
2. Check correct port (3000 for backend)
3. No firewall blocking the port

### Issue: Production Backend Down
**Current Status:** The Azure Container Instance appears to be stopped.

**To Fix:**
1. Access Azure Portal
2. Go to Container Instances
3. Start the gt-backend container
4. Or redeploy using deployment scripts

## Azure Container Commands

```bash
# Check container status
az container show \
  --resource-group gt-automotives-prod \
  --name gt-backend \
  --query instanceView.state

# Start container
az container start \
  --resource-group gt-automotives-prod \
  --name gt-backend

# View logs
az container logs \
  --resource-group gt-automotives-prod \
  --name gt-backend

# Restart container
az container restart \
  --resource-group gt-automotives-prod \
  --name gt-backend
```

## Next Steps

1. **Verify Azure Container Instance** is running
2. **Check DNS resolution** for backend domain
3. **Update production API URL** if backend URL changes
4. **Test with authentication** after logging in

## Summary

✅ **Local Development:** Frontend and backend communicate successfully
⚠️ **Production:** Backend container needs to be started/deployed
✅ **CORS:** Properly configured for development
✅ **Authentication:** Clerk integration working (401 is expected without login)

The frontend-backend communication architecture is correct. Once the production backend is deployed and running, the full system will be operational.