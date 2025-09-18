# Azure Implementation Guide - Step by Step

## Complete Setup Guide for GT Automotive App
**Estimated Time:** 2-3 hours  
**Monthly Cost:** $11-22  
**Architecture:** Container Instance (Backend) + Storage/CDN (Frontend) + Serverless PostgreSQL

---

## 📋 Pre-Setup Checklist

Before starting, ensure you have:
- [ ] macOS/Linux/Windows with terminal access
- [ ] Credit card for Azure account (won't be charged during free trial)
- [ ] GitHub account with repo access
- [ ] Clerk account with keys ready
- [ ] Working local development environment
- [ ] Azure CLI installed (we'll cover this)
- [ ] Domain name for HTTPS (optional but recommended)
- [ ] Cloudflare account for SSL/CDN (free tier sufficient)

---

## PHASE 1: Azure Account & CLI Setup (15 minutes)

### Step 1.1: Create Azure Account
```bash
# 1. Open browser and navigate to:
open https://azure.microsoft.com/free/

# 2. Click "Start free" and sign up
# 3. You'll get $200 credit for 30 days
# 4. No charges during free trial period
```

### Step 1.2: Install Azure CLI
```bash
# For macOS:
brew update && brew install azure-cli

# For Ubuntu/Debian:
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# For Windows:
# Download from https://aka.ms/installazurecliwindows

# Verify installation:
az --version
# Should show: azure-cli 2.x.x
```

### Step 1.3: Login and Configure Azure
```bash
# Login to Azure (opens browser)
az login

# List subscriptions
az account list --output table

# Set default subscription (use your subscription ID)
az account set --subscription "YOUR_SUBSCRIPTION_ID"

# Verify current subscription
az account show --output table
```

### Step 1.4: Create Resource Group
```bash
# Create resource group in East US (cheapest region)
az group create \
  --name gt-automotive-prod \
  --location eastus

# Verify creation
az group show --name gt-automotive-prod --output table
```

✅ **Checkpoint:** You should see your resource group created in East US region.

---

## PHASE 2: Serverless PostgreSQL Setup (20 minutes)

### Step 2.1: Generate Secure Password
```bash
# Generate and save password
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
echo "SAVE THIS PASSWORD: $DB_PASSWORD"

# Also save to a file (delete after setup)
echo "Database Password: $DB_PASSWORD" > db_credentials.txt
```

### Step 2.2: Create Serverless PostgreSQL
```bash
# Create PostgreSQL Flexible Server with serverless configuration
az postgres flexible-server create \
  --resource-group gt-automotive-prod \
  --name gt-automotive-db \
  --location eastus \
  --admin-user gtadmin \
  --admin-password "$DB_PASSWORD" \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --storage-size 32 \
  --version 15 \
  --backup-retention 7 \
  --zone 1 \
  --high-availability Disabled \
  --public-access 0.0.0.0

# This takes 5-10 minutes to complete
```

### Step 2.3: Configure Firewall Rules
```bash
# Get your current IP
MY_IP=$(curl -s ifconfig.me)
echo "Your IP: $MY_IP"

# Allow your IP for initial setup
az postgres flexible-server firewall-rule create \
  --resource-group gt-automotive-prod \
  --name gt-automotive-db \
  --rule-name AllowSetupIP \
  --start-ip-address $MY_IP \
  --end-ip-address $MY_IP

# Allow Azure services
az postgres flexible-server firewall-rule create \
  --resource-group gt-automotive-prod \
  --name gt-automotive-db \
  --rule-name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

### Step 2.4: Create Database and Test Connection
```bash
# Get server FQDN
DB_HOST=$(az postgres flexible-server show \
  --resource-group gt-automotive-prod \
  --name gt-automotive-db \
  --query fullyQualifiedDomainName -o tsv)

echo "Database Host: $DB_HOST"

# Create database connection string
DATABASE_URL="postgresql://gtadmin:$DB_PASSWORD@$DB_HOST:5432/postgres?sslmode=require"

# Test connection and create database
psql "$DATABASE_URL" -c "CREATE DATABASE gt_automotive;"

# Update connection string for app
DATABASE_URL="postgresql://gtadmin:$DB_PASSWORD@$DB_HOST:5432/gt_automotive?sslmode=require"
echo "App DATABASE_URL: $DATABASE_URL"

# Save to file for later use
echo "$DATABASE_URL" > database_url.txt
```

✅ **Checkpoint:** Database created and accessible. Save DATABASE_URL for later.

---

## PHASE 3: Container Registry Setup (10 minutes)

### Step 3.1: Create Azure Container Registry
```bash
# Create container registry (Basic tier includes 10GB free)
az acr create \
  --resource-group gt-automotive-prod \
  --name gtautomotiveregistry \
  --sku Basic \
  --admin-enabled true

# Get registry login server
ACR_LOGIN_SERVER=$(az acr show \
  --name gtautomotiveregistry \
  --query loginServer -o tsv)

echo "Registry Server: $ACR_LOGIN_SERVER"
```

### Step 3.2: Get Registry Credentials
```bash
# Get admin username
ACR_USERNAME=$(az acr credential show \
  --name gtautomotiveregistry \
  --query username -o tsv)

# Get admin password
ACR_PASSWORD=$(az acr credential show \
  --name gtautomotiveregistry \
  --query "passwords[0].value" -o tsv)

echo "Registry Username: $ACR_USERNAME"
echo "Registry Password: $ACR_PASSWORD"

# Save credentials
cat > acr_credentials.txt << EOF
Registry: $ACR_LOGIN_SERVER
Username: $ACR_USERNAME
Password: $ACR_PASSWORD
EOF
```

✅ **Checkpoint:** Container registry created with credentials saved.

---

## PHASE 4: Prepare Application Code (15 minutes)

### Step 4.1: Create Backend Dockerfile
```bash
# Navigate to your project root
cd ~/projects/gt-automotives-app

# Create Dockerfile for backend
cat > Dockerfile.backend << 'EOF'
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package files
COPY package.json yarn.lock nx.json tsconfig*.json ./
COPY .eslintrc.json ./

# Copy source code
COPY libs ./libs
COPY apps/server ./apps/server

# Install dependencies and build
RUN yarn install --frozen-lockfile
RUN yarn nx build server --prod

# Runtime stage
FROM node:18-alpine
WORKDIR /app

# Copy built application
COPY --from=builder /app/dist/apps/server ./
COPY --from=builder /app/node_modules ./node_modules

# Copy and generate Prisma client
COPY --from=builder /app/libs/database/src/lib/prisma ./prisma
RUN npx prisma generate

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "main.js"]
EOF
```

### Step 4.2: Create Frontend Build Script
```bash
# Create build script for frontend
cat > build-frontend.sh << 'EOF'
#!/bin/bash

# Exit on error
set -e

echo "Building frontend for production..."

# Clean previous build
rm -rf dist/apps/webApp

# Build with production environment
yarn nx build webApp --prod

echo "Frontend build complete!"
echo "Build output: dist/apps/webApp"
EOF

chmod +x build-frontend.sh
```

### Step 4.3: Update Environment Files
```bash
# Create production environment file for frontend
cat > apps/webApp/.env.production << EOF
VITE_API_URL=https://gt-backend.eastus.azurecontainer.io:3000
VITE_CLERK_PUBLISHABLE_KEY=pk_live_YOUR_CLERK_KEY_HERE
EOF

echo "⚠️  IMPORTANT: Update .env.production with your actual Clerk key!"
```

✅ **Checkpoint:** Dockerfiles and build scripts created.

---

## PHASE 5: Build and Push Backend Container (20 minutes)

### Step 5.1: Build Backend Image Locally
```bash
# Build backend image
docker build -f Dockerfile.backend -t gt-backend:latest .

# Tag for Azure registry
docker tag gt-backend:latest $ACR_LOGIN_SERVER/gt-backend:latest
```

### Step 5.2: Push to Azure Container Registry
```bash
# Login to Azure Container Registry
az acr login --name gtautomotiveregistry

# Push image (this may take 5-10 minutes)
docker push $ACR_LOGIN_SERVER/gt-backend:latest

# Verify image uploaded
az acr repository list --name gtautomotiveregistry --output table
```

Alternative: Build directly in Azure (if local Docker isn't working):
```bash
# Build in Azure (no local Docker required)
az acr build \
  --registry gtautomotiveregistry \
  --image gt-backend:latest \
  --file Dockerfile.backend \
  .
```

✅ **Checkpoint:** Backend image successfully pushed to registry.

---

## PHASE 6: Deploy Backend Container Instance (15 minutes)

### Step 6.1: Create Backend Container Instance
```bash
# Read saved credentials
DATABASE_URL=$(cat database_url.txt)
ACR_PASSWORD=$(cat acr_credentials.txt | grep Password | cut -d' ' -f2)

# Create container instance
az container create \
  --resource-group gt-automotive-prod \
  --name gt-backend \
  --image $ACR_LOGIN_SERVER/gt-backend:latest \
  --cpu 1 \
  --memory 1.5 \
  --registry-login-server $ACR_LOGIN_SERVER \
  --registry-username gtautomotiveregistry \
  --registry-password "$ACR_PASSWORD" \
  --ports 3000 \
  --dns-name-label gt-backend \
  --location eastus \
  --environment-variables \
    NODE_ENV=production \
    DATABASE_URL="$DATABASE_URL" \
    CLERK_SECRET_KEY="sk_live_YOUR_CLERK_SECRET" \
    CLERK_PUBLISHABLE_KEY="pk_live_YOUR_CLERK_KEY" \
    PORT=3000 \
  --restart-policy OnFailure

echo "⚠️  IMPORTANT: Update the container with your actual Clerk keys!"
```

### Step 6.2: Get Backend URL and Test
```bash
# Get container FQDN
BACKEND_URL=$(az container show \
  --resource-group gt-automotive-prod \
  --name gt-backend \
  --query ipAddress.fqdn -o tsv)

echo "Backend URL: https://$BACKEND_URL:3000"

# Test backend health endpoint
curl "http://$BACKEND_URL:3000/api/health"

# View container logs
az container logs \
  --resource-group gt-automotive-prod \
  --name gt-backend
```

✅ **Checkpoint:** Backend container running and accessible.

---

## PHASE 7: Setup Frontend with Azure Storage (15 minutes)

### Step 7.1: Create Storage Account
```bash
# Create storage account (must be globally unique)
STORAGE_NAME="gtautomotiveweb$(openssl rand -hex 4)"
az storage account create \
  --name $STORAGE_NAME \
  --resource-group gt-automotive-prod \
  --location eastus \
  --sku Standard_LRS \
  --kind StorageV2

echo "Storage Account: $STORAGE_NAME"
```

### Step 7.2: Enable Static Website Hosting
```bash
# Enable static website
az storage blob service-properties update \
  --account-name $STORAGE_NAME \
  --static-website \
  --404-document index.html \
  --index-document index.html

# Get website URL
WEBSITE_URL=$(az storage account show \
  --name $STORAGE_NAME \
  --query primaryEndpoints.web -o tsv)

echo "Website URL: $WEBSITE_URL"
```

### Step 7.3: Build Frontend
```bash
# Update frontend with backend URL
BACKEND_URL=$(az container show \
  --resource-group gt-automotive-prod \
  --name gt-backend \
  --query ipAddress.fqdn -o tsv)

# Update production environment
cat > apps/webApp/.env.production << EOF
VITE_API_URL=http://$BACKEND_URL:3000
VITE_CLERK_PUBLISHABLE_KEY=pk_live_YOUR_CLERK_KEY_HERE
EOF

# Build frontend
./build-frontend.sh
```

### Step 7.4: Deploy Frontend to Storage
```bash
# Get storage key
STORAGE_KEY=$(az storage account keys list \
  --account-name $STORAGE_NAME \
  --query "[0].value" -o tsv)

# Upload frontend files
az storage blob upload-batch \
  --account-name $STORAGE_NAME \
  --account-key "$STORAGE_KEY" \
  --source dist/apps/webApp \
  --destination '$web' \
  --overwrite

echo "Frontend deployed to: $WEBSITE_URL"
```

✅ **Checkpoint:** Frontend accessible via Azure Storage static website.

---

## PHASE 8: Setup CDN for Performance (10 minutes)

### Step 8.1: Create CDN Profile
```bash
# Create CDN profile
az cdn profile create \
  --name gt-automotive-cdn \
  --resource-group gt-automotive-prod \
  --sku Standard_Microsoft
```

### Step 8.2: Create CDN Endpoint
```bash
# Extract storage hostname
STORAGE_HOSTNAME=$(echo $WEBSITE_URL | sed 's|https://||' | sed 's|/||')

# Create CDN endpoint
az cdn endpoint create \
  --name gt-automotive \
  --profile-name gt-automotive-cdn \
  --resource-group gt-automotive-prod \
  --origin $STORAGE_HOSTNAME \
  --origin-host-header $STORAGE_HOSTNAME \
  --enable-compression true \
  --query-string-caching IgnoreQueryString

# Get CDN URL
CDN_URL=$(az cdn endpoint show \
  --name gt-automotive \
  --profile-name gt-automotive-cdn \
  --resource-group gt-automotive-prod \
  --query hostName -o tsv)

echo "CDN URL: https://$CDN_URL"
```

✅ **Checkpoint:** CDN configured for global content delivery.

---

## PHASE 9: Database Migration & Seeding (10 minutes)

### Step 9.1: Run Migrations
```bash
# Set database URL
export DATABASE_URL=$(cat database_url.txt)

# Run Prisma migrations
yarn prisma migrate deploy

# Generate Prisma client
yarn prisma generate
```

### Step 9.2: Seed Initial Data
```bash
# Run seed script
yarn db:seed

# Verify data
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM \"User\";"
```

✅ **Checkpoint:** Database schema created and seeded.

---

## PHASE 10: Configure Auto-Stop for Cost Savings (10 minutes)

### Step 10.1: Create Stop Script
```bash
# Create auto-stop script
cat > container-schedule.sh << 'EOF'
#!/bin/bash

# Stop container at night (11 PM)
stop_containers() {
  az container stop \
    --resource-group gt-automotive-prod \
    --name gt-backend
  echo "Container stopped at $(date)"
}

# Start container in morning (7 AM)
start_containers() {
  az container start \
    --resource-group gt-automotive-prod \
    --name gt-backend
  echo "Container started at $(date)"
}

# Check current hour
HOUR=$(date +%H)

if [ $HOUR -ge 23 ] || [ $HOUR -lt 7 ]; then
  stop_containers
else
  start_containers
fi
EOF

chmod +x container-schedule.sh
```

### Step 10.2: Setup Automated Schedule (Optional)
```bash
# Add to crontab (on a server that's always running)
# Stop at 11 PM
echo "0 23 * * * /path/to/container-schedule.sh" | crontab -l

# Start at 7 AM
echo "0 7 * * * /path/to/container-schedule.sh" | crontab -l
```

✅ **Checkpoint:** Auto-stop configured to save costs.

---

## PHASE 11: Final Testing & Verification (10 minutes)

### Step 11.1: Test All Endpoints
```bash
# Test backend health
curl http://$BACKEND_URL:3000/api/health

# Test frontend via Storage
open $WEBSITE_URL

# Test frontend via CDN
open https://$CDN_URL
```

### Step 11.2: Verify Clerk Authentication
1. Open the CDN URL in browser
2. Click "Login"
3. Verify Clerk authentication works
4. Test all three user roles (Admin, Staff, Customer)

### Step 11.3: Clean Up Temporary Files
```bash
# Remove credential files (after saving them securely)
rm -f db_credentials.txt
rm -f database_url.txt
rm -f acr_credentials.txt
```

✅ **Checkpoint:** Application fully deployed and functional!

---

## 📊 Cost Monitoring

### Check Current Usage
```bash
# View container instance hours used
az monitor metrics list \
  --resource "/subscriptions/$(az account show --query id -o tsv)/resourceGroups/gt-automotive-prod/providers/Microsoft.ContainerInstance/containerGroups/gt-backend" \
  --metric "CPUUsage" \
  --interval PT1H

# Check monthly cost estimate
az consumption usage list \
  --start-date $(date -v-30d +%Y-%m-%d) \
  --end-date $(date +%Y-%m-%d) \
  --query "[?contains(instanceName, 'gt-automotive')]" \
  --output table
```

### Stay Within Free Tier
- Container: Max 13.8 hours/day to stay free
- Stop containers 11 PM - 7 AM = 8 hours stopped
- 16 hours running = slightly over free tier (~$5/month)
- Weekend stops can compensate for weekday overages

---

## 🔧 Troubleshooting

### Container Won't Start
```bash
# Check container logs
az container logs --resource-group gt-automotive-prod --name gt-backend

# Check container events
az container show --resource-group gt-automotive-prod --name gt-backend --query events[-5:]

# Restart container
az container restart --resource-group gt-automotive-prod --name gt-backend
```

### Database Connection Issues
```bash
# Check firewall rules
az postgres flexible-server firewall-rule list \
  --resource-group gt-automotive-prod \
  --name gt-automotive-db

# Test direct connection
psql "$DATABASE_URL" -c "SELECT 1;"

# Check if database is paused (serverless)
az postgres flexible-server show \
  --resource-group gt-automotive-prod \
  --name gt-automotive-db \
  --query state
```

### Frontend Not Loading
```bash
# Re-upload frontend files
az storage blob upload-batch \
  --account-name $STORAGE_NAME \
  --account-key "$STORAGE_KEY" \
  --source dist/apps/webApp \
  --destination '$web' \
  --overwrite

# Purge CDN cache
az cdn endpoint purge \
  --resource-group gt-automotive-prod \
  --profile-name gt-automotive-cdn \
  --name gt-automotive \
  --content-paths "/*"
```

### High Costs
```bash
# Stop container immediately
az container stop --resource-group gt-automotive-prod --name gt-backend

# Check what's consuming credits
az consumption usage list \
  --start-date $(date -v-7d +%Y-%m-%d) \
  --end-date $(date +%Y-%m-%d) \
  --output table
```

---

## 🎯 Success Checklist

- [x] Azure account created with $200 credit
- [x] Resource group created in East US (gt-automotives-prod)
- [x] PostgreSQL serverless database running (gt-automotives-db)
- [x] Container Registry with backend image (gtautomotivesregistry)
- [x] Backend container instance deployed (gt-backend)
- [x] Frontend deployed to Azure Storage (gtautomotiveweb3007b23f)
- [x] CDN configured for frontend (via Cloudflare)
- [x] Database migrated and seeded
- [ ] Auto-stop schedule configured
- [x] All endpoints tested and working
- [ ] Clerk authentication functional (keys need updating)
- [x] Temporary credential files deleted
- [x] HTTPS enabled via Cloudflare (gt-automotives.com)

---

## 📈 Next Steps

1. **Update Clerk Production Keys** in container environment
2. **Configure API Gateway** for proper HTTPS on port 3000
3. **Set up Budget Alerts** at $15/month
4. **Setup GitHub Actions** for CI/CD
5. **Enable Application Insights** for monitoring
6. **Configure Auto-stop Schedule** for cost savings

---

## 💰 Expected Monthly Costs

| Component | Usage | Cost |
|-----------|-------|------|
| PostgreSQL | Auto-pause 50% | $6-9 |
| Container | 8 hrs/day | $0-5 |
| Storage | 1GB static files | $0.20 |
| Container Registry | Basic | $5 |
| CDN | <5GB transfer | $0 |
| **TOTAL** | | **$11-19** |

---

## 🆘 Support Resources

- [Azure Portal](https://portal.azure.com)
- [Azure CLI Docs](https://docs.microsoft.com/cli/azure/)
- [Container Instances Guide](https://docs.microsoft.com/azure/container-instances/)
- [Static Website Hosting](https://docs.microsoft.com/azure/storage/blobs/storage-blob-static-website)
- [PostgreSQL Flexible Server](https://docs.microsoft.com/azure/postgresql/flexible-server/)

---

**Document Created:** January 2025  
**Last Updated:** September 8, 2025
**Implementation Status:** ✅ Deployed to Production
**Live URL:** https://gt-automotives.com
**Implementation Time:** 2-3 hours  
**Monthly Total:** $11-22

---

## 📝 Notes Section

Use this space to record:
- Your specific resource names
- Any customizations made
- Issues encountered
- Solutions found

```
Production Deployment - September 8, 2025:
-------------------------------------------
- Domain: gt-automotives.com (via Cloudflare)
- Frontend: gtautomotiveweb3007b23f.z9.web.core.windows.net
- Backend: gt-backend.eastus.azurecontainer.io:3000
- Database: gt-automotives-db (Azure PostgreSQL)
- Deploy Script: ./deploy-frontend.sh
- Cloudflare DNS configured and active
- HTTPS enabled via Cloudflare SSL
```