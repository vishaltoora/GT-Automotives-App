# AWS Lightsail Setup - Step by Step Guide

Follow these steps to set up your GT Automotive application on AWS Lightsail.

## 📦 Step 1: Create Lightsail Instance

### 1.1 Go to AWS Lightsail Console
```
https://lightsail.aws.amazon.com/
```

### 1.2 Create Instance
1. Click **"Create instance"**
2. **Select Region**: Choose closest to your users (e.g., us-east-1)
3. **Select Platform**: Linux/Unix
4. **Select Blueprint**: OS Only → Ubuntu 20.04 LTS
5. **Choose Instance Plan**: 
   - Development: $10/month (1 vCPU, 2GB RAM)
   - Production: $20/month (1 vCPU, 4GB RAM) - Recommended
6. **Name your instance**: `GT-Automotive-Production`
7. Click **"Create instance"**

### 1.3 Wait for Instance to Start
- Status will change from "Pending" to "Running"
- Note down the **Public IP address**

## 🔑 Step 2: Set Up SSH Access

### 2.1 Download SSH Key
1. In Lightsail console → Account → SSH keys
2. Download your default key (or create new one)
3. Save as `lightsail-key.pem` in safe location

### 2.2 Set Permissions
```bash
chmod 600 ~/Downloads/lightsail-key.pem
```

### 2.3 Test SSH Connection
```bash
ssh -i ~/Downloads/lightsail-key.pem ubuntu@YOUR_INSTANCE_IP
```

## 🛠️ Step 3: Run Setup Script on Instance

### 3.1 Connect to Your Instance
```bash
ssh -i ~/Downloads/lightsail-key.pem ubuntu@YOUR_INSTANCE_IP
```

### 3.2 Download and Run Setup Script
```bash
# Download setup script
wget https://raw.githubusercontent.com/vishaltoora/GT-Automotives-App/main/scripts/deploy/setup-lightsail.sh

# Make executable
chmod +x setup-lightsail.sh

# Run setup (this will take 5-10 minutes)
./setup-lightsail.sh
```

## 🗄️ Step 4: Set Up PostgreSQL Database

### 4.1 Install PostgreSQL
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib -y
```

### 4.2 Create Database and User
```bash
# Switch to postgres user
sudo -u postgres psql

# Run these SQL commands:
CREATE USER gtautomotives WITH PASSWORD 'Vishal1234';
CREATE DATABASE gtautomotives_prod OWNER gtautomotives;
GRANT ALL PRIVILEGES ON DATABASE gtautomotives_prod TO gtautomotives;
\q
```

### 4.3 Configure PostgreSQL
```bash
# Edit PostgreSQL config to allow local connections
sudo nano /etc/postgresql/12/main/postgresql.conf
# Find and uncomment: listen_addresses = 'localhost'

# Restart PostgreSQL
sudo systemctl restart postgresql
```

## 🔐 Step 5: Configure Environment Variables

### 5.1 Edit Environment File
```bash
nano /home/ubuntu/GT-Automotives-App/.env
```

### 5.2 Update with Your Values
```bash
# Application
NODE_ENV=production
PORT=3000

# Database (using your local PostgreSQL)
DATABASE_URL="postgresql://gtautomotives:Vishal1234@localhost:5432/gtautomotives_prod"

# Your domain (or use IP for testing)
FRONTEND_URL=http://YOUR_INSTANCE_IP
CORS_ORIGIN=http://YOUR_INSTANCE_IP

# Clerk Production Keys (GET THESE FROM CLERK DASHBOARD)
CLERK_SECRET_KEY=sk_live_[your-actual-key]
CLERK_WEBHOOK_SECRET=whsec_[your-actual-webhook-secret]
CLERK_JWKS_URL=https://clean-dove-53.clerk.accounts.dev/.well-known/jwks.json
VITE_CLERK_PUBLISHABLE_KEY=pk_live_[your-actual-publishable-key]

# JWT Secret (generate a strong one)
JWT_SECRET=your-very-strong-production-jwt-secret-minimum-32-chars-long
JWT_EXPIRES_IN=24h
```

### 5.3 Generate Strong JWT Secret
```bash
# Generate a secure random string
openssl rand -base64 32
```

## 🔑 Step 6: Get Clerk Production Keys

### 6.1 Go to Clerk Dashboard
```
https://dashboard.clerk.com/
```

### 6.2 Switch to Production
1. Toggle from "Development" to "Production" mode
2. If prompted, verify your domain

### 6.3 Get API Keys
1. Go to **"API Keys"**
2. Copy **Secret key** (starts with `sk_live_`)
3. Copy **Publishable key** (starts with `pk_live_`)

### 6.4 Set Up Webhook
1. Go to **"Webhooks"** 
2. Click **"Add endpoint"**
3. URL: `http://YOUR_INSTANCE_IP/api/webhooks/clerk`
4. Select events: `user.created`, `user.updated`, `user.deleted`
5. Copy the **Signing secret** (starts with `whsec_`)

## 📤 Step 7: Configure GitHub Secrets

### 7.1 Go to Your GitHub Repository
```
https://github.com/vishaltoora/GT-Automotives-App
```

### 7.2 Add Secrets
Go to **Settings** → **Secrets and variables** → **Actions**

Add these secrets (click "New repository secret" for each):

```yaml
AWS_ACCESS_KEY_ID: [Your AWS access key]
AWS_SECRET_ACCESS_KEY: [Your AWS secret key]
AWS_REGION: us-east-1
LIGHTSAIL_INSTANCE_NAME: GT-Automotive-Production
LIGHTSAIL_IP: [Your instance IP]
LIGHTSAIL_SSH_KEY: [Content of lightsail-key.pem]
FRONTEND_DOMAIN: [Your instance IP or domain]
BACKEND_DOMAIN: [Your instance IP or domain]
DEPLOYMENT_BUCKET: gt-automotive-deployments
```

### 7.3 Create S3 Bucket
```bash
# From your local machine with AWS CLI
aws s3 mb s3://gt-automotive-deployments --region us-east-1
```

## 🚀 Step 8: First Deployment

### 8.1 Commit and Push Files
```bash
git add .
git commit -m "Add deployment configuration"
git push origin main
```

### 8.2 Trigger Deployment
1. Go to GitHub → Actions tab
2. Find **"Deploy to AWS Lightsail"** workflow
3. Click **"Run workflow"**
4. Settings:
   - Environment: `production`
   - Branch: `main`
   - Deploy Backend: ✅
   - Deploy Frontend: ✅
5. Click **"Run workflow"**

### 8.3 Monitor Deployment
- Watch the GitHub Actions logs
- Should take 5-10 minutes
- Look for green checkmarks

## ✅ Step 9: Verify Deployment

### 9.1 Check Application
```bash
# Frontend
curl http://YOUR_INSTANCE_IP

# Backend Health
curl http://YOUR_INSTANCE_IP/api/health
```

### 9.2 Access Your Application
Open in browser:
```
http://YOUR_INSTANCE_IP
```

### 9.3 Check PM2 Status
```bash
ssh -i ~/Downloads/lightsail-key.pem ubuntu@YOUR_INSTANCE_IP
pm2 status
```

## 🔍 Step 10: Troubleshooting

### If deployment fails:

#### Check GitHub Actions logs
- Look for red X marks
- Click to see detailed error messages

#### SSH to instance and check:
```bash
# Check PM2 processes
pm2 status
pm2 logs

# Check Nginx
sudo systemctl status nginx

# Check environment file
cat /home/ubuntu/GT-Automotives-App/.env

# Run monitoring script
/home/ubuntu/monitor.sh
```

### Common Issues:

#### Database connection error:
```bash
# Test database connection
psql -U gtautomotives -d gtautomotives_prod -h localhost
```

#### Port already in use:
```bash
# Check what's using ports
sudo lsof -i :3000
sudo lsof -i :4200
```

#### Clerk authentication error:
- Verify production keys in `.env`
- Check webhook is accessible

## 🎉 Success Checklist

- [ ] Lightsail instance running
- [ ] SSH access working
- [ ] PostgreSQL database created
- [ ] Environment variables configured
- [ ] Clerk production keys set
- [ ] GitHub secrets configured
- [ ] First deployment successful
- [ ] Application accessible via browser
- [ ] Login working with admin account

## 📝 Next Steps

1. **Set up domain name** (optional)
2. **Configure SSL certificate** with Let's Encrypt
3. **Set up monitoring** and alerts
4. **Configure backups**
5. **Test all application features**

---

**Support**: If you encounter issues, check:
- GitHub Actions logs
- PM2 logs (`pm2 logs`)
- Application logs (`/home/ubuntu/logs/`)
- Nginx logs (`/var/log/nginx/`)

**Last Updated**: August 27, 2025