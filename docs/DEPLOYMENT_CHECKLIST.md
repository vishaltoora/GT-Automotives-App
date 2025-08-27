# GT Automotive - Production Deployment Checklist

## ✅ Pre-Deployment Setup (Complete)

- [x] AWS Lightsail instance created: 15.222.139.163
- [x] SSH access configured
- [x] Node.js, PostgreSQL, Nginx installed
- [x] Database configured: gtautomotives/Vishal1234/gtautomotives_prod
- [x] Clerk production keys obtained:
  - [x] Secret key: sk_live_YOUR_ACTUAL_KEY
  - [x] Webhook secret: whsec_YOUR_ACTUAL_WEBHOOK_SECRET
  - [x] Public key: pk_live_YOUR_ACTUAL_PUBLISHABLE_KEY
- [x] Local .env.production updated with production keys

## 🔄 Next Steps Required

### 1. Configure Environment on Lightsail Instance
SSH to your instance and create the .env file:

```bash
ssh -i your-key.pem ubuntu@15.222.139.163
nano /home/ubuntu/GT-Automotives-App/.env
```

Add this configuration:
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

# Clerk Production Keys (Replace with your actual keys)
CLERK_SECRET_KEY=sk_live_YOUR_ACTUAL_CLERK_SECRET_KEY
CLERK_WEBHOOK_SECRET=whsec_YOUR_ACTUAL_WEBHOOK_SECRET  
CLERK_JWKS_URL=https://gt-automotives.clerk.accounts.dev/.well-known/jwks.json
VITE_CLERK_PUBLISHABLE_KEY=pk_live_YOUR_ACTUAL_PUBLISHABLE_KEY

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET=PASTE_YOUR_GENERATED_32_CHAR_SECRET_HERE
JWT_EXPIRES_IN=24h

# Logging
LOG_LEVEL=info
```

### 2. Generate JWT Secret
```bash
# On your Lightsail instance, generate a secure JWT secret:
openssl rand -base64 32
```

### 3. Set Up GitHub Secrets
Go to: https://github.com/vishaltoora/GT-Automotives-App/settings/secrets/actions

Add these secrets:
- `AWS_ACCESS_KEY_ID` - Your AWS access key
- `AWS_SECRET_ACCESS_KEY` - Your AWS secret key  
- `AWS_REGION` - us-east-1 (or your region)
- `LIGHTSAIL_INSTANCE_NAME` - Your instance name from AWS console
- `LIGHTSAIL_IP` - 15.222.139.163
- `LIGHTSAIL_SSH_KEY` - Full content of your .pem file
- `FRONTEND_DOMAIN` - 15.222.139.163
- `BACKEND_DOMAIN` - 15.222.139.163  
- `DEPLOYMENT_BUCKET` - gt-automotive-deployments

### 4. Create S3 Deployment Bucket
```bash
# From your local machine
aws s3 mb s3://gt-automotive-deployments --region us-east-1
```

### 5. First Deployment Test
1. Commit and push your changes:
   ```bash
   git add .
   git commit -m "Configure production deployment for 15.222.139.163"
   git push origin main
   ```

2. Go to GitHub Actions → "Deploy to AWS Lightsail" workflow
3. Click "Run workflow"
4. Select:
   - Environment: production
   - Branch: main
   - Deploy Backend: ✅
   - Deploy Frontend: ✅

### 6. Verify Deployment
Check these URLs after deployment:
- Frontend: http://15.222.139.163
- Backend Health: http://15.222.139.163/api/health
- PM2 Status: `pm2 status` (via SSH)

## 🔍 Quick Troubleshooting

If deployment fails, check:
```bash
ssh -i your-key.pem ubuntu@15.222.139.163
pm2 status
pm2 logs
sudo systemctl status nginx
/home/ubuntu/monitor.sh
```

---

**Ready for deployment!** Complete steps 1-4 above, then trigger your first deployment.