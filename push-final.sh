#!/bin/bash
set -e

echo "=== 1. Re-packaging clean archive (no macOS headers) ==="
export COPYFILE_DISABLE=1
tar -czf deploy.tar.gz dist server package.json .env.production ecosystem.config.cjs

echo "=== 2. Uploading to VPS (Atomic Upload) ==="
# Upload to a temporary filename to prevent extraction of partial uploads!
rsync -azP -e "ssh -o ServerAliveInterval=15 -o ServerAliveCountMax=3" deploy.tar.gz root@187.77.188.26:/var/www/feedx/deploy-temp.tar.gz

echo "=== 3. Cleaning old files & extracting ==="
# Only run this if the upload actually succeeded!
ssh -o ServerAliveInterval=15 -o ServerAliveCountMax=3 root@187.77.188.26 "cd /var/www/feedx && mv deploy-temp.tar.gz deploy.tar.gz && rm -rf dist server && tar -xzf deploy.tar.gz && pm2 restart ecosystem.config.cjs --update-env"

echo "=== Done! Please check the site now. ==="
