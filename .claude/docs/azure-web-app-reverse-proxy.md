# Azure Web App as Reverse Proxy Solution

## Overview

Instead of using Azure Application Gateway, we can use a separate Azure Web App as a reverse proxy. This is simpler, cheaper, and provides the same SSL termination benefits.

## Architecture

```
Internet → HTTPS → Azure Web App (Reverse Proxy) → HTTP → Backend Container
                   (api.gt-automotives.com)              (Internal Azure)
```

## Benefits over Application Gateway

1. **Simpler Setup** - Just deploy a Node.js proxy app
2. **Cheaper** - Web App costs less than Application Gateway
3. **Easier SSL** - Automatic SSL certificates via Azure
4. **Custom Logic** - Can add authentication, logging, etc.
5. **Faster Deployment** - No complex network configuration

## Implementation Options

### Option 1: Express.js Reverse Proxy

Create a simple Express.js app that proxies requests:

```javascript
// proxy-server.js
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;

// Backend configuration
const BACKEND_URL = 'http://gt-backend.eastus.azurecontainer.io:3000';

// CORS configuration
app.use(cors({
  origin: [
    'https://gt-automotives.com',
    'https://www.gt-automotives.com'
  ],
  credentials: true
}));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'api-proxy' });
});

// Proxy all /api requests to backend
app.use('/api', createProxyMiddleware({
  target: BACKEND_URL,
  changeOrigin: true,
  secure: false,
  logLevel: 'info',
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(500).json({ error: 'Backend service unavailable' });
  }
}));

// Default route
app.get('/', (req, res) => {
  res.json({ 
    message: 'GT Automotive API Gateway', 
    status: 'running',
    backend: BACKEND_URL
  });
});

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
  console.log(`Proxying to: ${BACKEND_URL}`);
});
```

### Option 2: Using Existing Web App with Proxy Rules

Add proxy configuration to your existing Web App using `web.config`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <!-- API Proxy Rule -->
        <rule name="API Proxy" stopProcessing="true">
          <match url="^api/(.*)" />
          <conditions>
            <add input="{REQUEST_METHOD}" pattern="GET|POST|PUT|DELETE|PATCH|OPTIONS" />
          </conditions>
          <action type="Rewrite" 
                  url="http://gt-backend.eastus.azurecontainer.io:3000/api/{R:1}" 
                  logRewrittenUrl="true" />
        </rule>
        
        <!-- Default SPA Rule -->
        <rule name="SPA Route" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
          </conditions>
          <action type="Rewrite" url="/" />
        </rule>
      </rules>
    </rewrite>
    
    <!-- CORS Headers -->
    <httpProtocol>
      <customHeaders>
        <add name="Access-Control-Allow-Origin" value="*" />
        <add name="Access-Control-Allow-Methods" value="GET,POST,PUT,DELETE,OPTIONS" />
        <add name="Access-Control-Allow-Headers" value="Content-Type,Authorization" />
      </customHeaders>
    </httpProtocol>
  </system.webServer>
</configuration>
```

## Quick Implementation: Separate API Web App

### Step 1: Create API Proxy Web App

```bash
# Create a new Web App for API proxy
az webapp create \
  --resource-group gt-automotives-prod \
  --plan gt-automotives-plan \
  --name gt-api-proxy \
  --runtime "NODE:18-lts"

# Configure custom domain
az webapp config hostname add \
  --resource-group gt-automotives-prod \
  --webapp-name gt-api-proxy \
  --hostname api.gt-automotives.com

# Enable HTTPS only
az webapp update \
  --resource-group gt-automotives-prod \
  --name gt-api-proxy \
  --https-only true
```

### Step 2: Deploy Proxy Code

Create the proxy app and deploy it:

```bash
# Create deployment package
mkdir api-proxy && cd api-proxy

# Create package.json
cat > package.json << 'EOF'
{
  "name": "gt-api-proxy",
  "version": "1.0.0",
  "description": "GT Automotive API Gateway",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "http-proxy-middleware": "^2.0.6",
    "cors": "^2.8.5"
  },
  "engines": {
    "node": ">=18"
  }
}
EOF

# Create server.js (proxy code above)
# ... copy the Express.js code from Option 1

# Deploy to Azure
zip -r api-proxy.zip .
az webapp deploy \
  --resource-group gt-automotives-prod \
  --name gt-api-proxy \
  --src-path api-proxy.zip \
  --type zip
```

### Step 3: Configure SSL Certificate

```bash
# Azure will automatically provision SSL for custom domain
# Or use managed certificate
az webapp config ssl create \
  --resource-group gt-automotives-prod \
  --name gt-api-proxy \
  --hostname api.gt-automotives.com
```

## Simpler Alternative: Update Existing Web App

Since you already have a Web App running, we can add API proxy functionality to it:

### Option A: Combined Frontend + API Proxy

Update your existing Web App to serve both frontend and proxy API calls:

```javascript
// Add to your existing server.js
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Serve static files (existing frontend)
app.use(express.static(__dirname));

// API Proxy (NEW)
app.use('/api', createProxyMiddleware({
  target: 'http://gt-backend.eastus.azurecontainer.io:3000',
  changeOrigin: true,
  secure: false,
  logLevel: 'info'
}));

// SPA fallback (existing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## DNS Configuration

Add CNAME record in Namecheap:
```
CNAME: api → gt-automotives.com
```

This way `api.gt-automotives.com` points to your existing Web App, which can handle both frontend and API proxy.

## Implementation Steps

1. **Add proxy dependencies** to existing Web App
2. **Update server.js** to include API proxy routes  
3. **Configure CNAME** for api.gt-automotives.com
4. **Update frontend** to use https://api.gt-automotives.com/api
5. **Deploy and test**

Would you like me to implement Option A (update existing Web App) or create a separate API proxy Web App?