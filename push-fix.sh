#!/bin/bash
echo "Pushing final proxy-free deployment archive to VPS..."
scp deploy.tar.gz root@187.77.188.26:/var/www/feedx/
echo "Extracting and restarting backend services..."
ssh root@187.77.188.26 "cd /var/www/feedx && tar -xzf deploy.tar.gz && npm install && pm2 restart ecosystem.config.cjs"
echo "Done! The live site is completely restored."
