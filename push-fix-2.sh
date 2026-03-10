#!/bin/bash
echo "=== 1. Re-packaging clean archive (no macOS headers) ==="
export COPYFILE_DISABLE=1
tar -czf deploy.tar.gz dist server package.json .env.production

echo "=== 2. Uploading to VPS ==="
scp deploy.tar.gz root@187.77.188.26:/var/www/feedx/

echo "=== 3. Cleaning old files & extracting ==="
ssh root@187.77.188.26 "cd /var/www/feedx && rm -rf dist && tar -xzf deploy.tar.gz && pm2 restart ecosystem.config.cjs"

echo "=== Done! Please check the site now. ==="
