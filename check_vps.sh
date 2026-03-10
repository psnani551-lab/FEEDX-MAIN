#!/bin/bash
ssh root@187.77.188.26 "ls -la /var/www/feedx/dist/index.html && pm2 logs feedx-production-server --lines 15 && cat /etc/nginx/nginx.conf"
