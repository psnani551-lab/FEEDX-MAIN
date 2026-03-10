#!/bin/bash
echo "=== Checking file sizes on VPS ==="
ssh root@187.77.188.26 "ls -lh /var/www/feedx/dist/index.html && pm2 logs feedx-production-server --lines 15 && cat /etc/nginx/sites-available/feedxpolytechnic.com"
