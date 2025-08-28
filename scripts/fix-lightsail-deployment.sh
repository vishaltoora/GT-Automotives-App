#!/bin/bash
set -e

echo "🔧 GT Automotive Deployment Fix Script"
echo "======================================"
echo ""

APP_DIR="/home/ubuntu/GT-Automotives-App"
cd $APP_DIR

# Stop current PM2 processes
echo "⏹️ Stopping current PM2 processes..."
pm2 stop all || true
pm2 delete all || true

# Install global packages if missing
echo "📦 Checking global packages..."
if ! command -v serve &> /dev/null; then
  echo "Installing serve..."
  sudo npm install -g serve
fi

if ! command -v pm2 &> /dev/null; then
  echo "Installing PM2..."
  sudo npm install -g pm2
fi

# Fix backend dependencies
echo "🔧 Fixing backend dependencies..."
cd $APP_DIR/server

# Create proper package.json with all dependencies
cat > package.json << 'EOF'
{
  "name": "gt-automotive-server",
  "version": "1.0.0",
  "main": "main.js",
  "scripts": {
    "start": "node main.js"
  },
  "dependencies": {
    "@clerk/backend": "^2.7.1",
    "@clerk/clerk-sdk-node": "^5.1.6",
    "@nestjs/common": "^11.0.0",
    "@nestjs/config": "^4.0.2",
    "@nestjs/core": "^11.0.0",
    "@nestjs/jwt": "^11.0.0",
    "@nestjs/mapped-types": "^2.1.0",
    "@nestjs/passport": "^11.0.0",
    "@nestjs/platform-express": "^11.0.0",
    "@nestjs/serve-static": "^4.0.0",
    "@prisma/client": "^6.14.0",
    "@types/bcryptjs": "^3.0.0",
    "bcryptjs": "^3.0.2",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.2",
    "cors": "^2.8.5",
    "express": "^4.18.2",
    "express-jwt": "^8.0.0",
    "jsonwebtoken": "^9.0.0",
    "jwks-rsa": "^3.2.0",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "prisma": "^6.14.0",
    "reflect-metadata": "^0.1.13",
    "rxjs": "^7.8.0",
    "svix": "^1.73.0",
    "tsconfig-paths": "^4.2.0"
  }
}
EOF

echo "📦 Installing backend dependencies with yarn..."
yarn install --production

# Generate Prisma client
echo "🔧 Generating Prisma client..."
export DATABASE_URL="postgresql://gtautomotives:Vishal1234@localhost:5432/gtautomotives_prod"
npx prisma generate --schema=./prisma/schema.prisma || true

# Create new PM2 ecosystem config
echo "⚙️ Creating PM2 ecosystem configuration..."
cd $APP_DIR
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'gt-automotive-backend',
      script: '/home/ubuntu/GT-Automotives-App/server/main.js',
      cwd: '/home/ubuntu/GT-Automotives-App/server',
      instances: 1,
      exec_mode: 'fork',
      env_file: '/home/ubuntu/GT-Automotives-App/.env',
      error_file: '/home/ubuntu/logs/backend-err.log',
      out_file: '/home/ubuntu/logs/backend-out.log',
      time: true,
      autorestart: true,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    },
    {
      name: 'gt-automotive-frontend',
      script: 'serve',
      args: ['-s', '/home/ubuntu/GT-Automotives-App/frontend', '-l', '4200'],
      cwd: '/home/ubuntu/GT-Automotives-App',
      instances: 1,
      exec_mode: 'fork',
      env: { 
        NODE_ENV: 'production' 
      },
      error_file: '/home/ubuntu/logs/frontend-err.log',
      out_file: '/home/ubuntu/logs/frontend-out.log',
      time: true,
      autorestart: true,
      max_memory_restart: '200M'
    }
  ]
};
EOF

# Update .env file
echo "📝 Updating environment variables..."
cat > .env << 'EOF'
NODE_ENV=production
PORT=3000
DATABASE_URL="postgresql://gtautomotives:Vishal1234@localhost:5432/gtautomotives_prod"

# Clerk Configuration (add your production keys here)
CLERK_SECRET_KEY=sk_test_your_key_here
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret_here
CLERK_JWKS_URL=https://clean-dove-53.clerk.accounts.dev/.well-known/jwks.json

# JWT Configuration
JWT_SECRET=your-very-strong-production-jwt-secret-minimum-32-characters

# CORS
CORS_ORIGIN=http://localhost:4200
FRONTEND_URL=http://localhost:4200
EOF

# Start services with PM2
echo "🚀 Starting services with PM2..."
pm2 start ecosystem.config.js

# Save PM2 configuration
echo "💾 Saving PM2 configuration..."
pm2 save

# Setup PM2 startup
echo "🔄 Setting up PM2 to start on system boot..."
pm2 startup systemd -u ubuntu --hp /home/ubuntu || true

# Wait for services to stabilize
echo "⏳ Waiting for services to stabilize..."
sleep 10

# Check status
echo ""
echo "📊 PM2 Status:"
pm2 status

# Health check
echo ""
echo "🏥 Health Check:"
if pm2 list | grep -q "gt-automotive-backend.*online"; then
  echo "   ✅ Backend is running"
else
  echo "   ⚠️ Backend may have issues - check logs with: pm2 logs gt-automotive-backend"
fi

if pm2 list | grep -q "gt-automotive-frontend.*online"; then
  echo "   ✅ Frontend is running"
else
  echo "   ⚠️ Frontend may have issues - check logs with: pm2 logs gt-automotive-frontend"
fi

# Test endpoints
echo ""
echo "🔗 Testing endpoints:"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health | grep -q "200\|404"; then
  echo "   ✅ Backend API is responding"
else
  echo "   ⚠️ Backend API is not responding"
fi

if curl -s -o /dev/null -w "%{http_code}" http://localhost:4200 | grep -q "200"; then
  echo "   ✅ Frontend is responding"
else
  echo "   ⚠️ Frontend is not responding"
fi

echo ""
echo "✅ Fix script completed!"
echo ""
echo "🌐 Services should be available at:"
echo "   Frontend: http://$(curl -s ifconfig.me):4200"
echo "   Backend API: http://$(curl -s ifconfig.me):3000"
echo ""
echo "📊 Commands:"
echo "   Check status: pm2 status"
echo "   View logs: pm2 logs"
echo "   Restart all: pm2 restart all"
echo "   Backend logs: pm2 logs gt-automotive-backend"
echo "   Frontend logs: pm2 logs gt-automotive-frontend"