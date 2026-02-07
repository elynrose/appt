# Render WebSocket Connection Fix

## 🔍 Problem

- ✅ Webhook is working (receiving calls)
- ✅ Stream URL is generated correctly
- ❌ **No WebSocket connection logs** - Twilio isn't connecting

## 🎯 Root Cause

Twilio is trying to connect to the WebSocket endpoint, but the connection isn't reaching the server. This could be:

1. **`PUBLIC_URL` not set** - Using request headers might generate wrong URL
2. **Render WebSocket configuration** - May need explicit setup

## ✅ Solution Steps

### Step 1: Verify `PUBLIC_URL` Environment Variable

1. **Go to Render Dashboard:**
   - Backend service → **Environment** tab
   - Check if `PUBLIC_URL` is set
   - Should be: `https://agentic-appointment-backend.onrender.com` (your actual URL)

2. **If not set, add it:**
   ```
   PUBLIC_URL = https://agentic-appointment-backend.onrender.com
   ```
   - Replace with your actual Render backend URL
   - **No trailing slash!**

3. **Redeploy:**
   - Render will auto-redeploy when you save

### Step 2: Check Render Logs After Setting `PUBLIC_URL`

After setting `PUBLIC_URL` and redeploying, make a test call and check logs:

**Look for:**
```
[Voice Webhook] PUBLIC_URL env: https://agentic-appointment-backend.onrender.com
[Voice Webhook] Stream URL: wss://agentic-appointment-backend.onrender.com/twilio-media?...
```

**Then check for WebSocket logs:**
```
[Request] GET /twilio-media?businessId=...
[WebSocket] 🔌 Connection attempt received
```

### Step 3: If Still No WebSocket Logs

If you still don't see `[WebSocket]` logs, try:

1. **Test WebSocket endpoint directly:**
   ```bash
   # This should show connection attempt in logs
   curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" \
     "https://agentic-appointment-backend.onrender.com/twilio-media?businessId=business-1&callSid=test123"
   ```

2. **Check Render service settings:**
   - Ensure service type is **"Web Service"** (not Static Site)
   - Web Services support WebSockets natively

3. **Verify Fastify WebSocket registration:**
   - The code uses `fastify.get('/twilio-media', { websocket: true }, ...)`
   - This should work on Render

## 🔧 Alternative: Explicit WebSocket Route

If the above doesn't work, we may need to register the WebSocket route explicitly. But first, try setting `PUBLIC_URL`.

## 📋 Checklist

- [ ] `PUBLIC_URL` is set in Render environment variables
- [ ] `PUBLIC_URL` matches your Render backend URL exactly (no trailing slash)
- [ ] Service type is "Web Service" (not Static Site)
- [ ] Made a test call after setting `PUBLIC_URL`
- [ ] Checked logs for `[WebSocket] 🔌 Connection attempt received`

## 🎯 Expected Result

After setting `PUBLIC_URL` correctly, you should see:

1. **In webhook logs:**
   ```
   [Voice Webhook] PUBLIC_URL env: https://agentic-appointment-backend.onrender.com
   [Voice Webhook] Stream URL: wss://agentic-appointment-backend.onrender.com/twilio-media?...
   ```

2. **In WebSocket logs (NEW!):**
   ```
   [Request] GET /twilio-media?businessId=business-1&callSid=...
   [WebSocket] 🔌 Connection attempt received
   [WebSocket] Query params - businessId: business-1, callSid: ...
   [WebSocket] ✅ Realtime session started
   ```

3. **Call should work!** 🎉

## 🆘 Still Not Working?

If WebSocket still doesn't connect after setting `PUBLIC_URL`:

1. **Share Render logs** - Especially any errors
2. **Verify the Stream URL** - Copy it from logs and test in browser (should show WebSocket upgrade)
3. **Check Twilio logs** - Twilio dashboard might show connection errors

