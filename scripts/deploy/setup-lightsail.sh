#!/bin/bash
# Setup script for AWS Lightsail instance
# Run this script once on your Lightsail instance to prepare it for deployments

set -e

echo "🚀 Setting up AWS Lightsail instance for GT Automotive deployment..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
echo "📦 Installing Node.js 20.x..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Yarn
echo "📦 Installing Yarn..."
npm install -g yarn

# Install PM2 for process management
echo "📦 Installing PM2..."
npm install -g pm2

# Install serve for static file serving
echo "📦 Installing serve..."
npm install -g serve

# Install PostgreSQL client
echo "📦 Installing PostgreSQL client..."
sudo apt-get install -y postgresql-client

# Install AWS CLI
echo "📦 Installing AWS CLI..."
sudo apt-get install -y awscli

# Install other utilities
echo "📦 Installing utilities..."
sudo apt-get install -y git curl wget unzip nginx

# Create application directories
echo "📁 Creating application directories..."
sudo mkdir -p /home/ubuntu/GT-Automotives-App
sudo mkdir -p /home/ubuntu/logs
sudo chown -R ubuntu:ubuntu /home/ubuntu/GT-Automotives-App
sudo chown -R ubuntu:ubuntu /home/ubuntu/logs

# Create environment file template
echo "📝 Creating environment template..."
cat > /home/ubuntu/GT-Automotives-App/.env << 'EOF'
# Production Environment Variables
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL="postgresql://gtautomotives:Vishal1234@localhost:5432/gtautomotives_prod"

# Clerk Authentication
CLERK_SECRET_KEY=your_production_clerk_secret_key
CLERK_WEBHOOK_SECRET=your_production_webhook_secret
CLERK_JWKS_URL=https://clean-dove-53.clerk.accounts.dev/.well-known/jwks.json

# JWT Configuration
JWT_SECRET=your-very-strong-production-jwt-secret-minimum-32-characters

# CORS
CORS_ORIGIN=https://your-domain.com
FRONTEND_URL=https://your-domain.com
EOF

# Set up PM2 to start on boot
echo "⚙️ Setting up PM2 startup..."
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu

# Configure Nginx reverse proxy
echo "🌐 Configuring Nginx..."
sudo tee /etc/nginx/sites-available/gtautomotive > /dev/null << 'EOF'
server {
    listen 80;
    server_name _;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";

    # Frontend
    location / {
        proxy_pass http://localhost:4200;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Handle WebSocket connections
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS headers for API
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
        add_header Access-Control-Allow-Headers "Content-Type, Authorization";
        
        if ($request_method = 'OPTIONS') {
            return 200;
        }
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/gtautomotive /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

# Configure firewall
echo "🔥 Configuring UFW firewall..."
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw allow 3000
sudo ufw allow 4200
sudo ufw --force enable

# Install SSL certificate (optional - run manually with your domain)
echo "📝 SSL Certificate setup (run manually):"
echo "sudo apt install certbot python3-certbot-nginx"
echo "sudo certbot --nginx -d your-domain.com"

# Create log rotation
echo "📋 Setting up log rotation..."
sudo tee /etc/logrotate.d/gt-automotive > /dev/null << 'EOF'
/home/ubuntu/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
    create 0644 ubuntu ubuntu
    postrotate
        pm2 reloadLogs
    endscript
}
EOF

# Create backup script
echo "💾 Creating backup script..."
cat > /home/ubuntu/backup.sh << 'EOF'
#!/bin/bash
# Backup script for GT Automotive
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/ubuntu/backups"

mkdir -p $BACKUP_DIR

# Backup database
if [ ! -z "$DATABASE_URL" ]; then
    echo "Backing up database..."
    pg_dump $DATABASE_URL > $BACKUP_DIR/database_$TIMESTAMP.sql
fi

# Backup application files
echo "Backing up application files..."
tar -czf $BACKUP_DIR/app_$TIMESTAMP.tar.gz -C /home/ubuntu GT-Automotives-App

# Clean old backups (keep last 7 days)
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $TIMESTAMP"
EOF

chmod +x /home/ubuntu/backup.sh

# Add backup to crontab
echo "⏰ Setting up daily backup..."
(crontab -l 2>/dev/null; echo "0 2 * * * /home/ubuntu/backup.sh >> /home/ubuntu/logs/backup.log 2>&1") | crontab -

# Create monitoring script
echo "📊 Creating monitoring script..."
cat > /home/ubuntu/monitor.sh << 'EOF'
#!/bin/bash
# Simple monitoring script for GT Automotive

echo "=== GT Automotive System Status ==="
echo "Date: $(date)"
echo ""

echo "=== PM2 Processes ==="
pm2 status

echo ""
echo "=== Nginx Status ==="
sudo systemctl status nginx --no-pager -l

echo ""
echo "=== Disk Usage ==="
df -h

echo ""
echo "=== Memory Usage ==="
free -h

echo ""
echo "=== System Load ==="
uptime

echo ""
echo "=== Health Checks ==="
echo -n "Backend API: "
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health || echo "FAILED"

echo -n "Frontend: "
curl -s -o /dev/null -w "%{http_code}" http://localhost:4200 || echo "FAILED"

echo ""
echo "=== Recent Logs (Last 10 lines) ==="
echo "Backend:"
tail -n 5 /home/ubuntu/logs/backend-combined.log 2>/dev/null || echo "No logs yet"
echo ""
echo "Frontend:"
tail -n 5 /home/ubuntu/logs/frontend-combined.log 2>/dev/null || echo "No logs yet"
EOF

chmod +x /home/ubuntu/monitor.sh

# Display completion message
echo ""
echo "✅ AWS Lightsail instance setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Configure your environment variables in /home/ubuntu/GT-Automotives-App/.env"
echo "2. Set up your database (PostgreSQL)"
echo "3. Configure Clerk production keys"
echo "4. Set up SSL certificate with: sudo certbot --nginx -d your-domain.com"
echo "5. Configure GitHub secrets for deployment"
echo ""
echo "📊 Useful commands:"
echo "  Monitor: /home/ubuntu/monitor.sh"
echo "  Backup: /home/ubuntu/backup.sh"
echo "  PM2 status: pm2 status"
echo "  View logs: pm2 logs"
echo "  Restart services: pm2 reload all"
echo ""
echo "🌐 Your application will be available at:"
echo "  Frontend: http://your-instance-ip"
echo "  Backend API: http://your-instance-ip/api"
echo "  Health check: http://your-instance-ip/health"