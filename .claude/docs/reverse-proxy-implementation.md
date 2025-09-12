# Azure Web App Reverse Proxy Implementation Guide

## Overview

This document details the implementation of a reverse proxy solution using Azure Web App to resolve Mixed Content security errors in the GT Automotive application. The reverse proxy eliminates the need for separate Application Gateway infrastructure while providing secure HTTPS API access.

## Problem Statement

### Mixed Content Error
The application experienced Mixed Content security errors when the HTTPS frontend tried to communicate with an HTTP backend:

```
Mixed Content: The page at 'https://gt-automotives.com/' was loaded over HTTPS, 
but requested an insecure XMLHttpRequest endpoint 
'http://gt-backend.eastus.azurecontainer.io:3000/api/auth/me'. 
This request has been blocked; the content must be served over HTTPS.
```

### Root Cause
- **Frontend**: Served via HTTPS (https://gt-automotives.com)
- **Backend**: Internal HTTP service (http://gt-backend.eastus.azurecontainer.io:3000)
- **Security Policy**: Modern browsers block mixed HTTPS/HTTP requests

## Solution Architecture

### Before (Problematic)
```
Internet → HTTPS → Frontend (Azure Web App)
                     ↓
                  ❌ HTTP → Backend Container (Mixed Content Error)
```

### After (Secure)
```
Internet → HTTPS → Web App (gt-automotives.com)
                     ├── Static Frontend (React)
                     └── /api → Reverse Proxy → HTTP Backend (Internal)
```

## Implementation Details

### 1. GitHub Actions Deployment Update

The deployment process was updated to create a Node.js Express server that serves both static files and acts as a reverse proxy:

**File**: `.github/workflows/deploy-frontend.yml`

```javascript
// server.js - Generated during deployment
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8080;

// Backend configuration
const BACKEND_URL = 'http://gt-backend.eastus.azurecontainer.io:3000';

// CORS middleware for API routes
app.use('/api', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://gt-automotives.com');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// API Proxy - Forward all /api requests to backend
app.use('/api', createProxyMiddleware({
  target: BACKEND_URL,
  changeOrigin: true,
  secure: false,
  timeout: 30000,
  logLevel: 'info',
  onError: (err, req, res) => {
    console.error('Proxy error:', err.message);
    res.status(500).json({ 
      error: 'Backend service unavailable',
      message: err.message 
    });
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`Proxying: ${req.method} ${req.url} -> ${BACKEND_URL}${req.url}`);
  }
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'gt-automotive-web-app',
    backend: BACKEND_URL,
    timestamp: new Date().toISOString()
  });
});

// Serve static files (React app)
app.use(express.static(__dirname));

// Handle client-side routing (SPA) - Must be last
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 GT Automotive Web App running on port ${PORT}`);
  console.log(`📡 Proxying API requests to: ${BACKEND_URL}`);
  console.log(`🌐 Frontend: https://gt-automotives.com`);
  console.log(`🔗 API: https://gt-automotives.com/api`);
});
```

### 2. Frontend Configuration Update

**Build Environment Variables**:
```bash
# Updated in GitHub Actions workflow
VITE_API_URL: https://gt-automotives.com/api  # Changed from HTTP backend URL
VITE_CLERK_PUBLISHABLE_KEY: pk_live_Y2xlcmsuZ3QtYXV0b21vdGl2ZXMuY29tJA
```

**Production Environment File**:
```bash
# apps/webApp/.env.production
VITE_API_URL=https://gt-automotives.com/api
```

### 3. Package Dependencies

**Deployment Package.json**:
```json
{
  "name": "gt-automotives-frontend",
  "version": "1.0.0",
  "description": "GT Automotive Web App with API Proxy",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "http-proxy-middleware": "^2.0.6"
  },
  "engines": {
    "node": ">=18"
  }
}
```

## Security Features

### 1. CORS Configuration
- **Origin**: Limited to `https://gt-automotives.com`
- **Credentials**: Enabled for authentication
- **Methods**: Restricted to necessary HTTP methods
- **Headers**: Controlled header access

### 2. SSL Termination
- **Public Interface**: HTTPS via Azure Web App SSL
- **Internal Communication**: HTTP between proxy and backend
- **Security Boundary**: SSL terminates at the Web App level

### 3. Error Handling
- **Proxy Errors**: Graceful error handling with proper status codes
- **Backend Unavailable**: Clear error messages for debugging
- **Timeout Handling**: 30-second timeout for backend requests

## Benefits

### 1. Security
- ✅ **Mixed Content Resolved**: All API calls use HTTPS
- ✅ **Single SSL Certificate**: One certificate covers both frontend and API
- ✅ **No External HTTP Calls**: All requests stay within HTTPS domain

### 2. Simplicity
- ✅ **Single Web App**: No need for separate Application Gateway
- ✅ **Unified Deployment**: Frontend and API proxy deploy together
- ✅ **Simple Configuration**: All routing handled in one place

### 3. Cost-Effectiveness
- ✅ **Lower Costs**: Web App cheaper than Application Gateway
- ✅ **Resource Efficiency**: Single service handles multiple concerns
- ✅ **No Additional Infrastructure**: Uses existing Web App service

### 4. Performance
- ✅ **Reduced Latency**: Proxy runs on same infrastructure as frontend
- ✅ **Connection Reuse**: Efficient backend connection management
- ✅ **Caching Potential**: Can add response caching if needed

## Monitoring and Debugging

### 1. Health Check Endpoint
```bash
curl https://gt-automotives.com/health
```

**Expected Response**:
```json
{
  "status": "healthy",
  "service": "gt-automotive-web-app", 
  "backend": "http://gt-backend.eastus.azurecontainer.io:3000",
  "timestamp": "2025-09-12T16:37:38.024Z"
}
```

### 2. Proxy Logging
The server logs all proxy requests for debugging:
```
Proxying: GET /api/auth/me -> http://gt-backend.eastus.azurecontainer.io:3000/api/auth/me
```

### 3. Error Responses
When backend is unavailable:
```json
{
  "error": "Backend service unavailable",
  "message": "getaddrinfo ENOTFOUND gt-backend.eastus.azurecontainer.io"
}
```

## Deployment Process

### 1. Automatic via GitHub Actions
1. **Trigger**: Push to `main` branch
2. **Build**: Frontend built with HTTPS API URL
3. **Package**: Express server and dependencies added to build
4. **Deploy**: ZIP deployed to Azure Web App
5. **Restart**: Web App restarted to load new configuration

### 2. Manual Deployment (if needed)
```bash
# Build frontend locally
yarn build:web

# Create server files
cd apps/webApp/dist
# Add server.js and package.json
# Create deployment zip

# Deploy to Azure
az webapp deploy \
  --resource-group gt-automotives-prod \
  --name gt-automotives-frontend \
  --src-path deployment.zip \
  --type zip
```

## Troubleshooting

### 1. Mixed Content Errors Still Occurring
**Cause**: Frontend still using old API URL
**Solution**: 
1. Check build environment variables in GitHub Actions
2. Verify `.env.production` file
3. Clear browser cache
4. Redeploy with correct configuration

### 2. API Requests Failing
**Cause**: Backend container not responding
**Solution**:
1. Check backend container status
2. Verify backend URL in proxy configuration
3. Check Azure Container Instance logs
4. Restart backend container if needed

### 3. CORS Errors
**Cause**: Incorrect origin or header configuration
**Solution**:
1. Verify CORS origin matches frontend domain
2. Check allowed headers include Authorization
3. Ensure credentials: true is set

## Alternative Implementations

### Option 1: Azure Application Gateway
- **Pros**: Enterprise-grade features, advanced routing
- **Cons**: More expensive, complex configuration
- **Use Case**: Large-scale applications with complex routing needs

### Option 2: Azure Front Door
- **Pros**: Global CDN, advanced caching
- **Cons**: Higher cost, more complex
- **Use Case**: Global applications with high traffic

### Option 3: API Management
- **Pros**: API versioning, analytics, throttling
- **Cons**: Additional cost, complexity
- **Use Case**: Public APIs with multiple consumers

## Best Practices

### 1. Security
- Always validate origin in CORS configuration
- Use secure headers (HSTS, CSP) when possible
- Monitor for suspicious traffic patterns
- Regular security audits of proxy configuration

### 2. Performance
- Implement response caching for static API responses
- Use connection pooling for backend connections
- Monitor proxy response times
- Set appropriate timeout values

### 3. Monitoring
- Log all proxy requests for debugging
- Set up alerts for proxy errors
- Monitor backend health through proxy
- Track API response times

### 4. Maintenance
- Regular updates of proxy dependencies
- Test proxy functionality during deployments
- Backup proxy configuration
- Document any custom modifications

## Conclusion

The Azure Web App reverse proxy implementation successfully resolves Mixed Content security errors while providing a cost-effective, secure solution for API access. The implementation is production-ready and provides a solid foundation for future enhancements.

**Key Success Factors**:
- ✅ Mixed Content errors eliminated
- ✅ Single HTTPS domain for all requests
- ✅ Cost-effective infrastructure
- ✅ Automated deployment process
- ✅ Comprehensive error handling
- ✅ Production monitoring capabilities

---

**Implementation Date**: September 12, 2025  
**Status**: Production Active  
**Next Review**: October 12, 2025  
**Maintainer**: Development Team