#!/bin/bash

# Start script for Railway with Nginx proxy
# Nginx handles WebSocket upgrades, proxies to Fastify

# Replace PORT in nginx.conf with Railway's PORT
sed -i "s/\${PORT:-8080}/${PORT:-8080}/g" /etc/nginx/sites-available/default

# Start nginx in background
nginx

# Start Fastify backend on port 5050 (internal)
node src/index.js

