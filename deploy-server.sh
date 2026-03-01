#!/bin/bash
# FeedX PRODUCTION DEPLOYER v1.0
# Run this inside /var/www/feedx on the server

echo "🏗️ Starting FeedX Production Build..."

# 1. Install Dependencies
echo "📦 Installing npm dependencies..."
npm install --production=false

# 2. Build Frontend
echo "🔨 Building static frontend assets..."
npm run build

# 3. Start Processes with PM2
echo "🚀 Starting PM2 processes..."
pm2 start ecosystem.config.cjs --env production

# 4. Save PM2 list & set to start on reboot
pm2 save
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME

# 5. Configure Nginx
echo "🕸️ Setting up Nginx proxy..."
sudo cp nginx.conf.template /etc/nginx/sites-available/feedx
sudo ln -sf /etc/nginx/sites-available/feedx /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx

echo "✅ DEPLOYMENT COMPLETE!"
echo "Site should be live at: http://feedxpolytechnic.com"
