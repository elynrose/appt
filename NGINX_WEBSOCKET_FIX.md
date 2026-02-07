# Nginx WebSocket Fix for Railway

## What Was Added

I've added an **Nginx reverse proxy** to fix Railway's WebSocket upgrade forwarding issue.

## How It Works

1. **Nginx listens on Railway's PORT** (set by Railway)
2. **Fastify runs on port 5050** (internal)
3. **Nginx proxies all requests** to Fastify
4. **Nginx properly forwards WebSocket upgrade headers** that Railway's edge was stripping

## Files Changed

1. **`backend/Dockerfile`** - Added nginx installation and configuration
2. **`backend/nginx.conf`** - Nginx config with WebSocket upgrade support
3. **`backend/start.sh`** - Script to start both nginx and Fastify

## How Railway Will Deploy

1. Railway will build the Docker image
2. Nginx will be installed
3. On start:
   - Nginx starts and listens on Railway's PORT
   - Fastify starts on port 5050
   - Nginx proxies requests to Fastify with proper WebSocket headers

## Testing After Deployment

1. **Wait for Railway to redeploy** (automatic after git push)
2. **Make a test call** to your Twilio number
3. **Check Railway logs** for:
   ```
   [Voice Webhook] Stream URL: wss://...
   [Request] GET /twilio-media?...
   [Request] Upgrade header: websocket  ← Should appear now!
   [WebSocket] 🔌 Connection attempt received  ← Should appear now!
   [WebSocket] ✅ Realtime session started
   ```

## Expected Results

✅ **WebSocket connections should now work!**

Nginx will:
- Receive WebSocket upgrade requests from Twilio
- Forward them to Fastify with proper headers
- Fastify will accept the WebSocket connection
- AI agent will respond to calls

## If It Still Doesn't Work

If WebSocket still doesn't connect after this:
1. Check Railway logs for nginx errors
2. Verify nginx is starting (check logs)
3. Consider trying Render (proven WebSocket support)

## Alternative: Quick Test with Render

If you want to test quickly without waiting:
1. Sign up at https://render.com
2. Deploy backend (no nginx needed - Render handles WebSocket properly)
3. Test call
4. If it works, you know the code is correct

The Nginx solution should fix the Railway WebSocket issue. Railway will automatically redeploy with the new configuration.

