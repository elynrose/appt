# Troubleshooting: Twilio WebSocket Connection Issues

## Problem: "Application Error" When Calling

### Symptoms
- Voice webhook is called successfully ✅
- Stream URL is generated correctly ✅
- No WebSocket connection logs ❌
- Call fails with "Application Error"

### Root Cause
Twilio cannot connect to the WebSocket endpoint through ngrok. This is likely due to:
1. **ngrok free tier WebSocket limitations** - Free tier may not properly support WebSocket upgrades
2. **WebSocket upgrade not working** - The HTTP to WebSocket upgrade is failing
3. **ngrok configuration** - May need specific configuration for WebSocket support

## Solutions

### Option 1: Use ngrok with WebSocket Support (Recommended for Testing)

Try restarting ngrok with explicit WebSocket support:

```bash
# Stop current ngrok
pkill ngrok

# Start ngrok with WebSocket support
ngrok http 5050 --scheme=https
```

### Option 2: Use Cloudflare Tunnel (Free Alternative)

Cloudflare Tunnel has better WebSocket support:

```bash
# Install cloudflared
brew install cloudflared

# Create tunnel
cloudflared tunnel --url http://localhost:5050
```

### Option 3: Deploy to a Cloud Service

Deploy to a service with public IP:
- **Railway** (recommended - already has config)
- **Render**
- **Fly.io**
- **Heroku**

### Option 4: Use ngrok Paid Plan

ngrok paid plans have better WebSocket support:
- Sign up at https://dashboard.ngrok.com
- Upgrade to a paid plan
- WebSocket connections will work reliably

## Verification Steps

1. **Check if WebSocket endpoint is accessible:**
   ```bash
   curl -i -N \
     -H "Connection: Upgrade" \
     -H "Upgrade: websocket" \
     -H "Sec-WebSocket-Version: 13" \
     -H "Sec-WebSocket-Key: test" \
     https://your-ngrok-url.ngrok-free.dev/twilio-media?businessId=test&callSid=test
   ```

2. **Check ngrok WebSocket support:**
   - Go to http://localhost:4040 (ngrok dashboard)
   - Check if WebSocket connections appear in the inspector

3. **Test locally first:**
   - Use `ws://localhost:5050/twilio-media` for local testing
   - Verify WebSocket handler works locally

## Current Status

Based on logs:
- ✅ Backend is running
- ✅ Voice webhook endpoint works
- ✅ TwiML is generated correctly
- ❌ WebSocket endpoint not reachable through ngrok

## Next Steps

1. Try restarting ngrok with explicit HTTPS
2. Consider using Cloudflare Tunnel
3. Or deploy to Railway/Render for production use

