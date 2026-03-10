#!/bin/bash
echo "Reverting PocketBase configuration and restoring Supabase NodeJS proxy..."

# The original NGINX configuration restoring /api to localhost:3001
cat > nginx-revert.conf << 'EOF'
server {
    server_name feedxpolytechnic.com;

    location / {
        root /var/www/feedx/dist;
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache";
    }

    # Proxy API requests to Node JS
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/feedxpolytechnic.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/feedxpolytechnic.com/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}

server {
    if ($host = feedxpolytechnic.com) {
        return 301 https://$host$request_uri;
    }

    listen 80;
    server_name feedxpolytechnic.com;
    return 404;
}
EOF

echo "Deploying the frontend bundle and server..."
ssh root@187.77.188.26 "cd /var/www/feedx && tar -xzf deploy.tar.gz && rm deploy.tar.gz && npm install && pm2 restart ecosystem.config.cjs"

echo "Applying NGINX config..."
scp nginx-revert.conf root@187.77.188.26:/etc/nginx/sites-available/feedxpolytechnic.com
ssh root@187.77.188.26 "systemctl stop pocketbase && systemctl disable pocketbase && nginx -t && systemctl reload nginx"

rm nginx-revert.conf
echo "Rollback successfully completed!"
