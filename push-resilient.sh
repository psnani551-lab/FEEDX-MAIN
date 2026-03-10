#!/bin/bash
set -e # Exit immediately if a command exits with a non-zero status.

echo "=== 1. Re-packaging clean archive (no macOS headers) ==="
export COPYFILE_DISABLE=1
tar -czf deploy.tar.gz dist server package.json .env.production

echo "=== 2. Uploading to VPS (Using rsync for resilience against connection drops) ==="
# rsync will resume the upload if the connection drops
rsync -azP -e "ssh -o ServerAliveInterval=15 -o ServerAliveCountMax=3" deploy.tar.gz root@187.77.188.26:/var/www/feedx/

echo "=== 3. Cleaning old files & extracting ==="
# Only run this if the upload actually succeeded securely
ssh -o ServerAliveInterval=15 -o ServerAliveCountMax=3 root@187.77.188.26 "cd /var/www/feedx && rm -rf dist && tar -xzf deploy.tar.gz && pm2 restart ecosystem.config.cjs"

echo "=== Done! Please check the site now. ==="
