#!/bin/bash
echo "=== Re-extracting files on VPS ==="
ssh root@187.77.188.26 "cd /var/www/feedx && tar -xzf deploy.tar.gz && pm2 restart ecosystem.config.cjs && pm2 logs feedx-production-server --lines 15"
echo "=== Extraction complete! ==="
