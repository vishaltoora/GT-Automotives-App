# Azure SSL Termination with Application Gateway

## Architecture Overview

```
Internet → HTTPS → Application Gateway → HTTP → Backend Services
```

- **Public-facing**: HTTPS with SSL certificates
- **Internal communication**: HTTP (faster, simpler)
- **SSL termination**: At Application Gateway level

## Implementation Plan

### 1. Azure Application Gateway Setup

```bash
# Resource group (if not exists)
RESOURCE_GROUP="gt-automotives-prod"
LOCATION="eastus"

# Create Application Gateway subnet
az network vnet subnet create \
  --resource-group $RESOURCE_GROUP \
  --vnet-name gt-automotives-vnet \
  --name appgw-subnet \
  --address-prefix 10.0.2.0/24

# Create public IP for Application Gateway
az network public-ip create \
  --resource-group $RESOURCE_GROUP \
  --name gt-appgw-pip \
  --allocation-method Static \
  --sku Standard \
  --dns-name gt-api

# Create Application Gateway
az network application-gateway create \
  --name gt-application-gateway \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --vnet-name gt-automotives-vnet \
  --subnet appgw-subnet \
  --capacity 2 \
  --sku Standard_v2 \
  --http-settings-cookie-based-affinity Disabled \
  --frontend-port 80 \
  --http-settings-port 3000 \
  --http-settings-protocol Http \
  --public-ip-address gt-appgw-pip \
  --servers gt-backend.eastus.azurecontainer.io
```

### 2. SSL Certificate Configuration

#### Option A: Azure Managed Certificate (Recommended)
```bash
# Add HTTPS listener with managed certificate
az network application-gateway ssl-cert create \
  --resource-group $RESOURCE_GROUP \
  --gateway-name gt-application-gateway \
  --name api-ssl-cert \
  --key-vault-secret-id "https://your-keyvault.vault.azure.net/secrets/ssl-cert"
```

#### Option B: Custom Certificate
```bash
# Upload SSL certificate
az network application-gateway ssl-cert create \
  --resource-group $RESOURCE_GROUP \
  --gateway-name gt-application-gateway \
  --name api-ssl-cert \
  --cert-file api-certificate.pfx \
  --cert-password "your-cert-password"
```

### 3. Backend Pool Configuration

```bash
# Update backend pool to point to Container Instance
az network application-gateway address-pool update \
  --resource-group $RESOURCE_GROUP \
  --gateway-name gt-application-gateway \
  --name appGatewayBackendPool \
  --servers gt-backend.eastus.azurecontainer.io
```

### 4. Health Probe Setup

```bash
# Create health probe
az network application-gateway probe create \
  --resource-group $RESOURCE_GROUP \
  --gateway-name gt-application-gateway \
  --name api-health-probe \
  --protocol Http \
  --host gt-backend.eastus.azurecontainer.io \
  --path /api/health \
  --interval 30 \
  --timeout 30 \
  --threshold 3
```

### 5. DNS Configuration

#### Custom Domain Setup
```bash
# Get Application Gateway public IP
APPGW_IP=$(az network public-ip show \
  --resource-group $RESOURCE_GROUP \
  --name gt-appgw-pip \
  --query ipAddress -o tsv)

echo "Application Gateway IP: $APPGW_IP"
```

**DNS Records to add in Namecheap:**
```
A Record: api.gt-automotives.com → [APPGW_IP]
CNAME: backend.gt-automotives.com → api.gt-automotives.com
```

## Configuration Files

### 1. Update Frontend Environment

```env
# apps/webApp/.env.production
VITE_API_URL=https://api.gt-automotives.com/api
```

### 2. Backend CORS Configuration

```typescript
// server/src/main.ts
app.enableCors({
  origin: [
    'https://gt-automotives.com',
    'https://www.gt-automotives.com',
    'https://api.gt-automotives.com' // Application Gateway
  ],
  credentials: true,
});
```

### 3. Application Gateway Rules

#### HTTP to HTTPS Redirect
```bash
# Create redirect rule (HTTP → HTTPS)
az network application-gateway redirect-config create \
  --resource-group $RESOURCE_GROUP \
  --gateway-name gt-application-gateway \
  --name http-to-https \
  --type Permanent \
  --target-listener https-listener \
  --include-path true \
  --include-query-string true
```

#### Backend HTTP Settings
```bash
# Configure backend HTTP settings
az network application-gateway http-settings create \
  --resource-group $RESOURCE_GROUP \
  --gateway-name gt-application-gateway \
  --name backend-http-settings \
  --port 3000 \
  --protocol Http \
  --cookie-based-affinity Disabled \
  --timeout 30 \
  --probe api-health-probe
```

## Complete Setup Script

```bash
#!/bin/bash
# Azure Application Gateway SSL Termination Setup

RESOURCE_GROUP="gt-automotives-prod"
LOCATION="eastus"
GATEWAY_NAME="gt-application-gateway"

echo "🚀 Setting up Azure Application Gateway with SSL Termination..."

# 1. Create Application Gateway
echo "Creating Application Gateway..."
az network application-gateway create \
  --name $GATEWAY_NAME \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --capacity 2 \
  --sku Standard_v2 \
  --public-ip-address gt-appgw-pip \
  --vnet-name gt-automotives-vnet \
  --subnet appgw-subnet \
  --servers gt-backend.eastus.azurecontainer.io \
  --http-settings-port 3000 \
  --http-settings-protocol Http

# 2. Get public IP
APPGW_IP=$(az network public-ip show \
  --resource-group $RESOURCE_GROUP \
  --name gt-appgw-pip \
  --query ipAddress -o tsv)

echo "✅ Application Gateway created!"
echo "📋 Next steps:"
echo "1. Add DNS record: api.gt-automotives.com → $APPGW_IP"
echo "2. Configure SSL certificate"
echo "3. Update frontend to use https://api.gt-automotives.com"
```

## Architecture Benefits

### 1. Security
- **SSL termination** at gateway level
- **Internal HTTP** communication (faster)
- **Centralized certificate management**

### 2. Performance
- **SSL offloading** from backend
- **Load balancing** capabilities
- **Health monitoring** and failover

### 3. Scalability
- **Multiple backend instances** support
- **Auto-scaling** Application Gateway
- **Traffic distribution**

### 4. Management
- **Single SSL certificate** for API endpoints
- **Centralized routing** rules
- **Easy backend updates**

## Alternative: Azure Front Door

For even better global performance:

```bash
# Create Azure Front Door
az afd profile create \
  --resource-group $RESOURCE_GROUP \
  --profile-name gt-automotives-frontdoor \
  --sku Standard_AzureFrontDoor

# Add backend
az afd origin-group create \
  --resource-group $RESOURCE_GROUP \
  --profile-name gt-automotives-frontdoor \
  --origin-group-name backend-group \
  --probe-request-type GET \
  --probe-protocol Http \
  --probe-interval-in-seconds 30 \
  --probe-path /api/health

az afd origin create \
  --resource-group $RESOURCE_GROUP \
  --profile-name gt-automotives-frontdoor \
  --origin-group-name backend-group \
  --origin-name gt-backend \
  --host-name gt-backend.eastus.azurecontainer.io \
  --origin-host-header gt-backend.eastus.azurecontainer.io \
  --http-port 3000 \
  --https-port 443 \
  --priority 1 \
  --weight 1000
```

## Testing

### 1. Verify SSL Termination
```bash
# Test HTTPS endpoint
curl -I https://api.gt-automotives.com/api/health

# Expected: 200 OK with SSL certificate
```

### 2. Backend Communication
```bash
# Backend still uses HTTP internally
curl -I http://gt-backend.eastus.azurecontainer.io:3000/api/health

# Expected: 200 OK (internal communication)
```

### 3. Frontend Integration
```javascript
// Test from browser console at https://gt-automotives.com
fetch('https://api.gt-automotives.com/api/users')
  .then(r => console.log('Status:', r.status))
  .catch(e => console.error('Error:', e));

// Expected: 401 (Unauthorized) - no Mixed Content error
```

## Implementation Priority

1. **Phase 1**: Set up Application Gateway with basic HTTP backend
2. **Phase 2**: Configure SSL certificate and HTTPS listener  
3. **Phase 3**: Update DNS and frontend configuration
4. **Phase 4**: Test end-to-end authentication flow

This approach gives you:
- ✅ HTTPS for public API calls
- ✅ HTTP for internal communication  
- ✅ SSL termination at the edge
- ✅ No Mixed Content errors
- ✅ Professional production architecture

---

**Next Steps**: Would you like me to help create the Azure Application Gateway setup scripts, or start with updating the frontend configuration?