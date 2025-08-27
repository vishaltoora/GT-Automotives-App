# Manual Deployment Guide - GitHub to AWS Lightsail

This guide covers how to set up manual deployment from GitHub to your AWS Lightsail instance using GitHub Actions.

## 🎯 Overview

You can manually trigger deployments with full control over:
- **Which branch/commit to deploy**
- **Environment (production/staging)**
- **Which services to deploy** (backend, frontend, or both)

## 🔧 One-Time Setup

### 1. Prepare Your Lightsail Instance

Run the setup script on your Lightsail instance:

```bash
# SSH into your Lightsail instance
ssh -i your-key.pem ubuntu@your-instance-ip

# Download and run setup script
wget https://raw.githubusercontent.com/your-username/GT-Automotives-App/main/scripts/deploy/setup-lightsail.sh
chmod +x setup-lightsail.sh
./setup-lightsail.sh
```

### 2. Configure Environment Variables

Edit the environment file on your Lightsail instance:

```bash
nano /home/ubuntu/GT-Automotives-App/.env
```

Update these critical values:
```bash
# Your domain
FRONTEND_URL=https://your-domain.com
CORS_ORIGIN=https://your-domain.com

# Database connection
DATABASE_URL="postgresql://gtautomotives:Vishal1234@localhost:5432/gtautomotives_prod"

# Clerk production keys
CLERK_SECRET_KEY=sk_live_your_actual_production_key
CLERK_WEBHOOK_SECRET=whsec_your_actual_webhook_secret

# Strong JWT secret
JWT_SECRET=your-very-strong-32-character-production-secret
```

### 3. Set Up GitHub Secrets

In your GitHub repository, go to **Settings > Secrets and Variables > Actions** and add:

#### AWS Configuration
```
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
```

#### Lightsail Configuration
```
LIGHTSAIL_INSTANCE_NAME=your-instance-name
LIGHTSAIL_IP=your.instance.ip.address
LIGHTSAIL_SSH_KEY=-----BEGIN RSA PRIVATE KEY-----
your-private-key-content
-----END RSA PRIVATE KEY-----
```

#### Domain Configuration
```
FRONTEND_DOMAIN=your-domain.com
BACKEND_DOMAIN=api.your-domain.com
```

#### Deployment Configuration
```
DEPLOYMENT_BUCKET=your-s3-bucket-for-deployments
```

### 4. Create S3 Bucket for Deployments

```bash
# Create S3 bucket for storing deployment packages
aws s3 mb s3://gt-automotive-deployments --region us-east-1
```

### 5. Set Up Database

On your Lightsail instance:

```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database user and database
sudo -u postgres psql << 'EOF'
CREATE USER gtautomotives WITH PASSWORD 'Vishal1234';
CREATE DATABASE gtautomotives_prod OWNER gtautomotives;
GRANT ALL PRIVILEGES ON DATABASE gtautomotives_prod TO gtautomotives;
\q
EOF
```

## 🚀 How to Deploy

### 1. Manual Deployment via GitHub Actions

1. **Go to GitHub Actions**:
   - Navigate to your repository
   - Click on "Actions" tab
   - Find "Deploy to AWS Lightsail" workflow

2. **Click "Run workflow"**:
   - Select the branch you want to deploy
   - Choose environment (production/staging)
   - Select which services to deploy:
     - ✅ Deploy Backend
     - ✅ Deploy Frontend
   - Click "Run workflow"

### 2. Deployment Options

You can customize each deployment:

```yaml
Environment: production
Branch: main
Deploy Backend: ✅
Deploy Frontend: ✅
```

Or deploy only specific services:

```yaml
Environment: production
Branch: feature/user-management
Deploy Backend: ✅
Deploy Frontend: ❌  # Only deploy backend
```

### 3. Monitor Deployment

- **GitHub Actions**: Watch the deployment progress in real-time
- **Lightsail Instance**: Monitor via SSH or AWS console
- **Application Health**: Check health endpoints after deployment

## 📊 Deployment Process

### What Happens During Deployment

1. **Build Phase**:
   - Checkout selected branch/commit
   - Install dependencies
   - Build backend (NestJS)
   - Build frontend (React/Vite)

2. **Package Phase**:
   - Create deployment package
   - Upload to S3 bucket
   - Generate deployment metadata

3. **Deploy Phase**:
   - Download package to Lightsail instance
   - Stop running services
   - Backup current deployment
   - Deploy new files
   - Run database migrations
   - Start services
   - Health check

4. **Verification Phase**:
   - Test backend API endpoint
   - Test frontend accessibility
   - Report deployment status

### Deployment Structure

```
/home/ubuntu/GT-Automotives-App/
├── server/
│   ├── dist/           # Built backend
│   ├── node_modules/   # Production dependencies
│   └── prisma/         # Database schema
├── frontend/           # Built frontend assets
├── .env               # Environment variables
├── ecosystem.config.js # PM2 configuration
└── deployment-info.txt # Deployment metadata
```

## 🔍 Monitoring & Troubleshooting

### Health Checks

After deployment, these endpoints should work:

- **Frontend**: `https://your-domain.com`
- **Backend API**: `https://your-domain.com/api/health`
- **System Health**: `https://your-domain.com/health`

### Useful Commands on Lightsail

```bash
# Check PM2 processes
pm2 status

# View logs
pm2 logs
pm2 logs gt-automotive-backend
pm2 logs gt-automotive-frontend

# Restart services
pm2 reload gt-automotive-backend
pm2 reload gt-automotive-frontend

# Monitor system
/home/ubuntu/monitor.sh

# View deployment info
cat /home/ubuntu/GT-Automotives-App/deployment-info.txt
```

### Rollback Process

If a deployment fails:

1. **Automatic Rollback**: Services use previous backup if new deployment fails
2. **Manual Rollback**:
   ```bash
   # Stop current services
   pm2 stop all
   
   # Restore from backup
   cd /home/ubuntu
   rm -rf GT-Automotives-App
   cp -r GT-Automotives-App.backup.TIMESTAMP GT-Automotives-App
   
   # Start services
   cd GT-Automotives-App
   pm2 start ecosystem.config.js
   ```

## 📋 Pre-Deployment Checklist

Before each deployment:

- [ ] Code is tested and ready
- [ ] Environment variables are updated
- [ ] Database migrations are prepared
- [ ] Clerk production keys are configured
- [ ] SSL certificate is valid
- [ ] Health check endpoints work
- [ ] Backup is created

## 🔐 Security Considerations

### Environment Security
- Never commit production secrets to Git
- Use GitHub Secrets for sensitive data
- Rotate SSH keys regularly
- Monitor access logs

### Network Security
- Configure UFW firewall on Lightsail
- Use HTTPS with valid SSL certificates
- Restrict database access
- Enable CloudFlare or similar CDN

### Application Security
- Keep dependencies updated
- Monitor for security vulnerabilities
- Use strong JWT secrets
- Enable security headers in Nginx

## 📈 Advanced Features

### Deployment Environments

You can set up multiple environments:

```yaml
# Production deployment
Environment: production
Domain: gtautomotive.com

# Staging deployment
Environment: staging
Domain: staging.gtautomotive.com
```

### Custom Deployment Scripts

Add custom scripts to `scripts/deploy/` for:
- Pre-deployment checks
- Post-deployment verification
- Custom migration scripts
- Notification systems

### Monitoring Integration

Integrate with monitoring services:
- **CloudWatch**: AWS native monitoring
- **New Relic**: Application performance monitoring
- **Sentry**: Error tracking
- **Slack/Discord**: Deployment notifications

## 📞 Support

### Deployment Issues
- Check GitHub Actions logs for build errors
- SSH into Lightsail to check application logs
- Verify environment variables and secrets
- Test health endpoints manually

### Quick Fixes
```bash
# Restart all services
pm2 reload all

# Clear PM2 logs
pm2 flush

# Check disk space
df -h

# Check memory usage
free -h

# View system status
/home/ubuntu/monitor.sh
```

---

**Last Updated**: August 27, 2025  
**Author**: GT Automotive Development Team