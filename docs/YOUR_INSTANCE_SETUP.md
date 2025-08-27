# GT Automotive Lightsail Setup - Instance 15.222.139.163

## 🚀 Quick Setup Commands

### 1️⃣ SSH to Your Instance
```bash
# Replace path-to-your-key.pem with your actual key file path
ssh -i ~/path-to-your-key.pem ubuntu@15.222.139.163
```

### 2️⃣ Run Setup Script on Instance
```bash
# Download setup script
wget https://raw.githubusercontent.com/vishaltoora/GT-Automotives-App/main/scripts/deploy/setup-lightsail.sh

# Make executable
chmod +x setup-lightsail.sh

# Run setup (takes 5-10 minutes)
./setup-lightsail.sh
```

### 3️⃣ Set Up Database
```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib -y

# Create database and user
sudo -u postgres psql << 'EOF'
CREATE USER gtautomotives WITH PASSWORD 'Vishal1234';
CREATE DATABASE gtautomotives_prod OWNER gtautomotives;
GRANT ALL PRIVILEGES ON DATABASE gtautomotives_prod TO gtautomotives;
\q
EOF

# Test connection
psql -U gtautomotives -d gtautomotives_prod -h localhost -W
# Enter password: Vishal1234
```

### 4️⃣ Configure Environment Variables
```bash
# Create/edit environment file
nano /home/ubuntu/GT-Automotives-App/.env
```

Add this content:
```bash
# Production Environment
NODE_ENV=production
PORT=3000
API_PORT=3000

# Your Instance URLs
FRONTEND_URL=http://15.222.139.163
CORS_ORIGIN=http://15.222.139.163

# Database (local PostgreSQL)
DATABASE_URL="postgresql://gtautomotives:Vishal1234@localhost:5432/gtautomotives_prod"

# Clerk Production Keys (GET FROM CLERK DASHBOARD)
CLERK_SECRET_KEY=sk_live_YOUR_ACTUAL_KEY_HERE
CLERK_WEBHOOK_SECRET=whsec_YOUR_ACTUAL_WEBHOOK_SECRET
CLERK_JWKS_URL=https://clean-dove-53.clerk.accounts.dev/.well-known/jwks.json
VITE_CLERK_PUBLISHABLE_KEY=pk_live_YOUR_ACTUAL_KEY_HERE

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET=PASTE_YOUR_GENERATED_32_CHAR_SECRET_HERE
JWT_EXPIRES_IN=24h

# Logging
LOG_LEVEL=info
```

### 5️⃣ GitHub Secrets to Configure

Go to: https://github.com/vishaltoora/GT-Automotives-App/settings/secrets/actions

Add these secrets:

| Secret Name | Value |
|------------|-------|
| `LIGHTSAIL_IP` | `15.222.139.163` |
| `LIGHTSAIL_INSTANCE_NAME` | Your instance name from AWS console |
| `LIGHTSAIL_SSH_KEY` | Full content of your .pem file |
| `AWS_ACCESS_KEY_ID` | Your AWS access key |
| `AWS_SECRET_ACCESS_KEY` | Your AWS secret key |
| `AWS_REGION` | Your region (check Lightsail console) |
| `FRONTEND_DOMAIN` | `15.222.139.163` |
| `BACKEND_DOMAIN` | `15.222.139.163` |
| `DEPLOYMENT_BUCKET` | `gt-automotive-deployments` |

### 6️⃣ Create S3 Deployment Bucket
```bash
# From your local machine (not on Lightsail)
aws s3 mb s3://gt-automotive-deployments --region YOUR_REGION
```

### 7️⃣ Get Clerk Production Keys

1. Go to: https://dashboard.clerk.com/
2. Switch to "Production" mode
3. Get these keys:
   - **Secret key** (sk_live_...)
   - **Publishable key** (pk_live_...)
4. Set up webhook:
   - URL: `http://15.222.139.163/api/webhooks/clerk`
   - Get webhook secret (whsec_...)

### 8️⃣ First Deployment Test

After setup, commit and push:
```bash
git add .
git commit -m "Configure production deployment for 15.222.139.163"
git push origin main
```

Then:
1. Go to GitHub Actions
2. Run "Deploy to AWS Lightsail" workflow
3. Watch the logs

### 9️⃣ Verify Deployment

Check these URLs:
- Frontend: http://15.222.139.163
- Backend Health: http://15.222.139.163/api/health
- PM2 Status: `pm2 status` (via SSH)

## 🔍 Quick Troubleshooting

### Check services on instance:
```bash
ssh -i your-key.pem ubuntu@15.222.139.163

# Check PM2
pm2 status
pm2 logs

# Check Nginx
sudo systemctl status nginx

# Monitor script
/home/ubuntu/monitor.sh

# View logs
tail -f /home/ubuntu/logs/backend-combined.log
```

### Test database connection:
```bash
psql -U gtautomotives -d gtautomotives_prod -h localhost -W
```

### Check ports:
```bash
sudo lsof -i :3000  # Backend
sudo lsof -i :4200  # Frontend
sudo lsof -i :80    # Nginx
```

## 📝 Important Notes

- **Instance IP**: 15.222.139.163
- **Database User**: gtautomotives
- **Database Password**: Vishal1234
- **Database Name**: gtautomotives_prod
- **Backend Port**: 3000
- **Frontend Port**: 4200
- **Public Access**: Port 80 (via Nginx)

## ✅ Setup Checklist

- [ ] SSH access working to 15.222.139.163
- [ ] Setup script ran successfully
- [ ] PostgreSQL installed and database created
- [ ] Environment file configured
- [ ] Clerk production keys added
- [ ] GitHub secrets configured
- [ ] S3 bucket created
- [ ] First deployment successful
- [ ] Application accessible at http://15.222.139.163

---

**Your Instance**: 15.222.139.163  
**Region**: Check AWS Lightsail console  
**Support**: Check logs at `/home/ubuntu/logs/`