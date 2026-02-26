#!/bash
# FeedX VPS INITIALIZER v1.0
# For Ubuntu 24.04 LTS

echo "🚀 Initializing FeedX Production Server..."

# 1. Update System
sudo apt update && sudo apt upgrade -y

# 2. Install Essentials
sudo apt install -y curl git nginx ufw build-essential

# 3. Install Node.js 20 (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 4. Install PM2
sudo npm install -g pm2

# 5. Setup Project Directory
sudo mkdir -p /var/www/feedx
sudo chown -R $USER:$USER /var/www/feedx

# 6. Configure Firewall
sudo ufw allow 'Nginx Full'
sudo ufw allow 22
sudo ufw --force enable

echo "✅ Server Initialized! Next Step: Transfer your code to /var/www/feedx"
