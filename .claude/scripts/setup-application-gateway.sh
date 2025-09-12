#!/bin/bash

# Azure Application Gateway Setup for GT Automotive
# SSL Termination with HTTP backend communication

set -e

# Configuration
RESOURCE_GROUP="gt-automotives-prod"
LOCATION="eastus"
GATEWAY_NAME="gt-application-gateway"
PUBLIC_IP_NAME="gt-appgw-pip"
BACKEND_FQDN="gt-backend.eastus.azurecontainer.io"
DOMAIN_NAME="api.gt-automotives.com"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }

print_info "🚀 Setting up Azure Application Gateway for GT Automotive"
print_info "Resource Group: $RESOURCE_GROUP"
print_info "Location: $LOCATION"
print_info "Backend: $BACKEND_FQDN"
print_info "Domain: $DOMAIN_NAME"

# Check if Azure CLI is installed and logged in
if ! command -v az &> /dev/null; then
    print_error "Azure CLI not found. Please install Azure CLI first."
    exit 1
fi

# Check if logged in
if ! az account show &> /dev/null; then
    print_error "Not logged into Azure. Please run 'az login' first."
    exit 1
fi

print_info "Azure CLI authenticated successfully"

# Step 1: Create Public IP if it doesn't exist
print_info "Step 1: Creating Public IP for Application Gateway..."

if az network public-ip show --resource-group $RESOURCE_GROUP --name $PUBLIC_IP_NAME &> /dev/null; then
    print_warning "Public IP $PUBLIC_IP_NAME already exists"
else
    az network public-ip create \
        --resource-group $RESOURCE_GROUP \
        --name $PUBLIC_IP_NAME \
        --allocation-method Static \
        --sku Standard \
        --dns-name gt-api-$(date +%s)
    
    print_success "Created Public IP: $PUBLIC_IP_NAME"
fi

# Get the public IP address
PUBLIC_IP=$(az network public-ip show \
    --resource-group $RESOURCE_GROUP \
    --name $PUBLIC_IP_NAME \
    --query ipAddress -o tsv)

print_success "Public IP Address: $PUBLIC_IP"

# Step 2: Check if VNet exists, create if needed
print_info "Step 2: Checking Virtual Network..."

VNET_NAME="gt-automotives-vnet"
if ! az network vnet show --resource-group $RESOURCE_GROUP --name $VNET_NAME &> /dev/null; then
    print_info "Creating Virtual Network..."
    az network vnet create \
        --resource-group $RESOURCE_GROUP \
        --name $VNET_NAME \
        --address-prefix 10.0.0.0/16 \
        --subnet-name default-subnet \
        --subnet-prefix 10.0.1.0/24
    
    print_success "Created VNet: $VNET_NAME"
fi

# Step 3: Create Application Gateway subnet if it doesn't exist
print_info "Step 3: Creating Application Gateway subnet..."

APPGW_SUBNET="appgw-subnet"
if ! az network vnet subnet show --resource-group $RESOURCE_GROUP --vnet-name $VNET_NAME --name $APPGW_SUBNET &> /dev/null; then
    az network vnet subnet create \
        --resource-group $RESOURCE_GROUP \
        --vnet-name $VNET_NAME \
        --name $APPGW_SUBNET \
        --address-prefix 10.0.2.0/24
    
    print_success "Created Application Gateway subnet"
else
    print_warning "Application Gateway subnet already exists"
fi

# Step 4: Create Application Gateway
print_info "Step 4: Creating Application Gateway..."

if az network application-gateway show --resource-group $RESOURCE_GROUP --name $GATEWAY_NAME &> /dev/null; then
    print_warning "Application Gateway $GATEWAY_NAME already exists"
else
    # Create with basic configuration
    az network application-gateway create \
        --name $GATEWAY_NAME \
        --resource-group $RESOURCE_GROUP \
        --location $LOCATION \
        --vnet-name $VNET_NAME \
        --subnet $APPGW_SUBNET \
        --capacity 2 \
        --sku Standard_v2 \
        --http-settings-cookie-based-affinity Disabled \
        --frontend-port 80 \
        --http-settings-port 3000 \
        --http-settings-protocol Http \
        --public-ip-address $PUBLIC_IP_NAME \
        --servers $BACKEND_FQDN
    
    print_success "Created Application Gateway: $GATEWAY_NAME"
fi

# Step 5: Add HTTPS frontend port
print_info "Step 5: Configuring HTTPS frontend..."

# Add frontend port 443 for HTTPS
az network application-gateway frontend-port create \
    --resource-group $RESOURCE_GROUP \
    --gateway-name $GATEWAY_NAME \
    --name httpsPort \
    --port 443 || print_warning "HTTPS port may already exist"

# Step 6: Create health probe
print_info "Step 6: Creating health probe..."

az network application-gateway probe create \
    --resource-group $RESOURCE_GROUP \
    --gateway-name $GATEWAY_NAME \
    --name api-health-probe \
    --protocol Http \
    --host $BACKEND_FQDN \
    --path /api/health \
    --interval 30 \
    --timeout 30 \
    --threshold 3 || print_warning "Health probe may already exist"

print_success "Health probe configured"

# Step 7: Display next steps
print_success "🎉 Application Gateway setup completed!"
print_info ""
print_info "📋 Next Steps:"
print_info "1. Add DNS record in Namecheap:"
print_info "   A Record: api.gt-automotives.com → $PUBLIC_IP"
print_info ""
print_info "2. Configure SSL certificate (choose one):"
print_info "   Option A - Azure Managed Certificate (recommended):"
print_info "   az network application-gateway ssl-cert create \\"
print_info "     --resource-group $RESOURCE_GROUP \\"
print_info "     --gateway-name $GATEWAY_NAME \\"
print_info "     --name api-ssl-cert \\"
print_info "     --key-vault-secret-id 'https://your-keyvault.vault.azure.net/secrets/ssl-cert'"
print_info ""
print_info "   Option B - Upload custom certificate:"
print_info "   az network application-gateway ssl-cert create \\"
print_info "     --resource-group $RESOURCE_GROUP \\"
print_info "     --gateway-name $GATEWAY_NAME \\"
print_info "     --name api-ssl-cert \\"
print_info "     --cert-file your-certificate.pfx \\"
print_info "     --cert-password 'your-password'"
print_info ""
print_info "3. Create HTTPS listener and routing rule"
print_info ""
print_info "4. Test the setup:"
print_info "   curl -I https://api.gt-automotives.com/api/health"
print_info ""
print_info "📖 Full documentation: .claude/docs/azure-ssl-termination-setup.md"

# Save configuration for reference
cat > appgw-config.txt << EOF
Azure Application Gateway Configuration
=====================================
Resource Group: $RESOURCE_GROUP
Gateway Name: $GATEWAY_NAME
Public IP: $PUBLIC_IP
Backend: $BACKEND_FQDN
Domain: $DOMAIN_NAME

DNS Configuration Needed:
A Record: api.gt-automotives.com → $PUBLIC_IP

SSL Certificate Setup Required:
- Either Azure Managed Certificate
- Or upload custom certificate

Test Command:
curl -I https://api.gt-automotives.com/api/health
EOF

print_success "Configuration saved to: appgw-config.txt"
print_info "🔧 Application Gateway is ready for SSL certificate configuration!"