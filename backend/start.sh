#!/bin/bash

# Start script for Railway with Nginx proxy
# Nginx handles WebSocket upgrades, proxies to Fastify

# Get PORT from environment (Railway sets this)
NGINX_PORT=${PORT:-8080}

# Create nginx config with actual PORT
cat > /etc/nginx/sites-available/default <<EOF
server {
    listen ${NGINX_PORT};
    server_name _;

    location / {
        proxy_pass http://localhost:5050;
        proxy_http_version 1.1;
        
        # WebSocket upgrade headers (CRITICAL for WebSocket support)
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection \$connection_upgrade;
        
        # Standard proxy headers
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # Preserve content-type for form data
        proxy_set_header Content-Type \$http_content_type;
        
        # WebSocket timeouts (long for real-time connections)
        proxy_read_timeout 86400;
        proxy_send_timeout 86400;
        
        # Buffer settings
        proxy_buffering off;
    }
}

# Map connection upgrade for WebSocket
map \$http_upgrade \$connection_upgrade {
    default upgrade;
    '' close;
}
EOF

# Start nginx in background
nginx

# Start Fastify backend on port 5050 (internal)
node src/index.js

