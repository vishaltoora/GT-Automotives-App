# AWS Lightsail Deployment Guide

This guide covers deploying the GT Automotive application to AWS Lightsail.

## Prerequisites

- AWS Lightsail account set up
- Clerk production application configured
- Domain name (optional but recommended)

## Environment Variables Setup

### 1. Production Environment Variables

Copy the `.env.production` file to your Lightsail instance and update the following values:

#### Required Variables

```bash
# Application
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://your-domain.com
CORS_ORIGIN=https://your-domain.com

# Database - Choose one option:

# Option A: AWS RDS PostgreSQL (Recommended)
DATABASE_URL="postgresql://gtautomotive:your_password@gt-automotive-db.region.rds.amazonaws.com:5432/gt_automotive"

# Option B: Lightsail Managed Database
DATABASE_URL="postgresql://gtautomotive:your_password@ls-abc123.region.rds.amazonaws.com:5432/gt_automotive"

# Clerk Production Keys
CLERK_SECRET_KEY=sk_live_your_production_key
CLERK_WEBHOOK_SECRET=whsec_your_production_webhook_secret

# JWT Secret (Generate a strong 32+ character secret)
JWT_SECRET=your-very-strong-production-jwt-secret-minimum-32-characters
```

### 2. Getting Clerk Production Keys

1. **Login to Clerk Dashboard**: https://dashboard.clerk.com/
2. **Switch to Production**: Toggle from "Development" to "Production" mode
3. **Get API Keys**:
   - Go to "API Keys" section
   - Copy the "Secret key" (starts with `sk_live_`)
4. **Configure Webhooks**:
   - Go to "Webhooks" section
   - Add endpoint: `https://your-domain.com/api/webhooks/clerk`
   - Select events: `user.created`, `user.updated`, `user.deleted`
   - Copy the webhook secret (starts with `whsec_`)

### 3. Database Setup Options

#### Option A: AWS RDS PostgreSQL (Recommended for Production)

```bash
# Create RDS instance via AWS Console
# Instance class: db.t3.micro (for small workloads)
# Storage: 20GB General Purpose (SSD)
# Database name: gt_automotive
# Username: gtautomotive
# Password: [Strong password]

# Connection string format:
DATABASE_URL="postgresql://gtautomotive:your_password@gt-automotive-db.region.rds.amazonaws.com:5432/gt_automotive"
```

#### Option B: Lightsail Managed Database

```bash
# Create Lightsail database via console
# Plan: $15/month micro plan
# Database name: gt_automotive
# Username: gtautomotive

# Connection string will be provided by Lightsail
DATABASE_URL="postgresql://gtautomotive:password@ls-abc123.region.rds.amazonaws.com:5432/gt_automotive"
```

## Lightsail Instance Setup

### 1. Create Lightsail Instance

```bash
# Recommended specs:
# OS: Ubuntu 20.04 LTS
# Plan: $10/month (1 vCPU, 2GB RAM) minimum
# For production: $20/month (1 vCPU, 4GB RAM) recommended
```

### 2. Instance Configuration

Connect to your Lightsail instance via SSH:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Yarn
npm install -g yarn

# Install PM2 for process management
npm install -g pm2

# Install PostgreSQL client (for database operations)
sudo apt-get install -y postgresql-client

# Install Git
sudo apt-get install -y git

# Create application user
sudo useradd -m -s /bin/bash gtautomotive
sudo usermod -aG sudo gtautomotive
```

### 3. Deploy Application

```bash
# Switch to application user
sudo su - gtautomotive

# Clone repository
git clone https://github.com/vishaltoora/GT-Automotives-App.git
cd GT-Automotives-App

# Install dependencies
yarn install --production

# Create production environment file
cp server/.env.production server/.env
# Edit server/.env with your actual values
nano server/.env

# Run database migrations
yarn db:migrate

# Seed database (optional)
yarn db:seed

# Build applications
yarn build

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 4. PM2 Configuration

Create `ecosystem.config.js` in project root:

```javascript
module.exports = {
  apps: [
    {
      name: 'gt-automotive-backend',
      script: 'dist/main.js',
      cwd: './server',
      instances: 1,
      exec_mode: 'cluster',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true
    },
    {
      name: 'gt-automotive-frontend',
      script: 'serve',
      args: '-s dist -l 4200',
      cwd: './apps/webApp',
      instances: 1,
      env_production: {
        NODE_ENV: 'production'
      }
    }
  ]
};
```

## Networking & Security

### 1. Lightsail Firewall Rules

Configure firewall in Lightsail console:

```
Application  Protocol  Port range  Source
Custom       TCP       22          Your IP (SSH)
Custom       TCP       80          Anywhere (HTTP)
Custom       TCP       443         Anywhere (HTTPS)
Custom       TCP       3000        Anywhere (API)
Custom       TCP       4200        Anywhere (Frontend)
```

### 2. Load Balancer Setup (Optional)

For high availability:

1. Create Lightsail Load Balancer
2. Add SSL certificate
3. Configure health checks
4. Add instances to load balancer

### 3. SSL Certificate

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Install Nginx
sudo apt install nginx

# Configure Nginx reverse proxy
sudo nano /etc/nginx/sites-available/gtautomotive

# Nginx configuration:
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:4200;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/gtautomotive /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com
```

## Monitoring & Logs

### 1. PM2 Monitoring

```bash
# View logs
pm2 logs gt-automotive-backend
pm2 logs gt-automotive-frontend

# Monitor processes
pm2 monit

# Restart applications
pm2 restart gt-automotive-backend
pm2 restart gt-automotive-frontend
```

### 2. Health Check Endpoint

The backend includes a health check endpoint:

```
GET /api/health
```

### 3. Database Backup

```bash
# Create backup script
cat > /home/gtautomotive/backup-db.sh << 'EOF'
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > /home/gtautomotive/backups/gt_automotive_$TIMESTAMP.sql
# Keep only last 7 backups
find /home/gtautomotive/backups -name "*.sql" -mtime +7 -delete
EOF

chmod +x /home/gtautomotive/backup-db.sh

# Add to crontab (daily backup at 2 AM)
crontab -e
# Add: 0 2 * * * /home/gtautomotive/backup-db.sh
```

## Environment Variables Checklist

Before going live, ensure these variables are set:

- [ ] `NODE_ENV=production`
- [ ] `DATABASE_URL` (production database)
- [ ] `CLERK_SECRET_KEY` (production key)
- [ ] `CLERK_WEBHOOK_SECRET` (production webhook)
- [ ] `JWT_SECRET` (strong 32+ character secret)
- [ ] `FRONTEND_URL` (your domain)
- [ ] `CORS_ORIGIN` (your domain)

## Deployment Commands

Quick deployment commands:

```bash
# Deploy new changes
git pull origin main
yarn install --production
yarn build
pm2 reload ecosystem.config.js
```

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Check security groups allow connection
   - Verify DATABASE_URL format
   - Test with `psql $DATABASE_URL`

2. **Clerk Authentication Issues**
   - Verify production keys are being used
   - Check webhook endpoint is accessible
   - Confirm JWKS URL is correct

3. **CORS Issues**
   - Verify CORS_ORIGIN matches frontend domain
   - Check frontend VITE_API_URL points to backend

4. **PM2 Process Issues**
   ```bash
   # Check process status
   pm2 status
   
   # View detailed logs
   pm2 logs --lines 50
   
   # Restart all processes
   pm2 reload all
   ```

## Performance Optimization

1. **Database Optimization**
   - Enable connection pooling
   - Add database indexes
   - Monitor query performance

2. **Caching**
   - Add Redis for session caching
   - Implement API response caching

3. **CDN**
   - Use CloudFront for static assets
   - Enable gzip compression

---

**Last Updated**: August 27, 2025  
**Author**: GT Automotive Development Team