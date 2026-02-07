# WebSocket Connection Diagnosis

## Current Status

✅ **Webhook Working:**
```
[Voice Webhook] Stream URL: wss://awake-cat-production-15ef.up.railway.app/twilio-media?businessId=business-1&callSid=test123&plan=premium&to=%2B15551234567
```

## Critical Check

**Do you see this in Railway logs after the Stream URL?**
```
[Request] GET /twilio-media?...
[Request] Upgrade header: websocket
[WebSocket] 🔌 Connection attempt received
```

### If You See `[WebSocket]` Logs:
✅ **WebSocket is working!** The connection is being established.

### If You DON'T See `[WebSocket]` Logs:
❌ **Railway's edge layer is blocking WebSocket upgrades.**

## The Problem

Railway's edge/proxy layer (`railway-edge` server) is not forwarding WebSocket upgrade requests to your Fastify application. This is a known issue with Railway's infrastructure.

## Solutions

### Solution 1: Add Nginx Reverse Proxy (Recommended)

Add Nginx to handle WebSocket upgrades properly:

1. **Update Dockerfile to include Nginx:**
   ```dockerfile
   FROM node:20
   
   # Install nginx
   RUN apt-get update && apt-get install -y nginx && rm -rf /var/lib/apt/lists/*
   
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   
   # Copy nginx config
   COPY nginx.conf /etc/nginx/sites-available/default
   
   # Start script
   COPY start.sh /start.sh
   RUN chmod +x /start.sh
   
   EXPOSE 8080
   CMD ["/start.sh"]
   ```

2. **Create start.sh:**
   ```bash
   #!/bin/bash
   nginx
   node src/index.js
   ```

3. **Update nginx.conf:**
   - Nginx listens on Railway's PORT (8080)
   - Proxies to Fastify on localhost:5050
   - Properly forwards WebSocket upgrade headers

### Solution 2: Use Render (Quick Alternative)

Render has proven WebSocket support:

1. **Sign up:** https://render.com
2. **Create Web Service:**
   - Connect GitHub repo
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm run start`
3. **Set environment variables** (same as Railway)
4. **Update Twilio webhook** to Render URL

### Solution 3: Use Fly.io (Alternative)

Fly.io has excellent WebSocket support:

1. **Install Fly CLI:**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Create fly.toml** (see `RAILWAY_WEBSOCKET_FIX.md`)
3. **Deploy:**
   ```bash
   fly launch
   fly deploy
   ```

## Immediate Next Steps

1. **Check Railway logs** - Do you see `[Request]` or `[WebSocket]` logs?
2. **If not, Railway is blocking WebSocket upgrades**
3. **Choose a solution:**
   - Add Nginx proxy (most control)
   - Switch to Render (easiest, proven WebSocket support)
   - Switch to Fly.io (good WebSocket support)

## Why This Happens

Railway's edge layer:
- Handles SSL termination
- Routes HTTP requests
- **May not properly forward WebSocket upgrade headers**
- This is a known limitation with some proxy configurations

The forum post we found earlier confirms this is a Railway-specific issue that requires a proxy (nginx, caddy, traefik) to fix.

## Recommendation

**Try Render first** - it's the quickest way to verify WebSocket works:
- Takes ~10 minutes to set up
- Proven WebSocket support
- Free tier available
- Easy migration from Railway

If Render works, you know the code is correct and the issue is Railway-specific.

