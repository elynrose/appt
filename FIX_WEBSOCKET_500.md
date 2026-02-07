# Fix WebSocket 500 Error

## Issue
The WebSocket endpoint returns HTTP 500 when accessed. This is expected for regular HTTP requests, but we need to ensure WebSocket upgrades work correctly.

## The Real Test: Railway Logs During a Call

The HTTP 500 error from `curl` is actually **normal** - WebSocket endpoints reject regular HTTP requests. The important thing is:

**Does Twilio successfully connect via WebSocket when making a real call?**

### Check Railway Logs:

1. **Open Railway Dashboard:**
   - https://railway.com/project/5518da0f-8de5-4191-ab0c-912fe4d35c55
   - Backend service → **Logs** tab

2. **Make a Real Call:**
   - Call your Twilio number
   - Watch the logs in real-time

3. **What You Should See:**

   **✅ If WebSocket Works:**
   ```
   [Voice Webhook] Incoming call - CallSid: CA...
   [Voice Webhook] Stream URL: wss://...
   [WebSocket] 🔌 Connection attempt received  ← THIS IS KEY
   [WebSocket] Query params - businessId: business-1, callSid: CA...
   [WebSocket] Creating transport and session...
   [WebSocket] ✅ Realtime session started
   ```

   **❌ If WebSocket Fails:**
   ```
   [Voice Webhook] Incoming call - CallSid: CA...
   [Voice Webhook] Stream URL: wss://...
   (No [WebSocket] logs)  ← PROBLEM: Twilio can't connect
   ```

## Possible Fixes

### Fix 1: Verify Fastify WebSocket Configuration

The WebSocket plugin is registered, but we can add explicit options:

```javascript
fastify.register(fastifyWs, {
  options: {
    maxPayload: 1048576, // 1MB
  },
});
```

### Fix 2: Check Railway WebSocket Support

Railway should support WebSockets, but verify:
- Your service is using the latest Railway runtime
- No firewall rules blocking WebSocket upgrades
- Railway status page shows no WebSocket issues

### Fix 3: Verify Environment Variables

Check that all required variables are set:
- `OPENAI_API_KEY` - Must be set
- `FIREBASE_SERVICE_ACCOUNT_BASE64` - Must be set
- `PUBLIC_URL` - Must be set to `https://awake-cat-production-15ef.up.railway.app`

### Fix 4: Test WebSocket Upgrade

Use a proper WebSocket client to test:

```bash
# Install wscat if needed
npm install -g wscat

# Test WebSocket connection
wscat -c "wss://awake-cat-production-15ef.up.railway.app/twilio-media?businessId=business-1&callSid=test&plan=premium&to=%2B15551234567"
```

If this connects, the WebSocket endpoint is working.

## Most Important: Check Logs During Real Call

The HTTP 500 from `curl` is **not the problem** - that's expected. The real test is:

1. **Make an actual call** to your Twilio number
2. **Check Railway logs** to see if `[WebSocket] 🔌 Connection attempt received` appears
3. **If it doesn't appear**, Twilio cannot connect to the WebSocket endpoint

## Next Steps

1. **Check Railway logs during a real call** - This is the most important step
2. **Share what you see:**
   - Do you see `[WebSocket]` logs?
   - Any error messages?
   - What happens after `[Voice Webhook]`?

3. **If no WebSocket logs appear**, the issue is:
   - Railway WebSocket upgrade not working
   - Network/firewall blocking WebSocket connections
   - Twilio cannot reach the WebSocket endpoint

## Why HTTP 500 is Normal

When you use `curl` to access a WebSocket endpoint:
- Fastify sees it's not a WebSocket upgrade request
- Returns an error (500) because the route only accepts WebSocket connections
- This is **expected behavior**

The real test is whether Twilio (which makes proper WebSocket upgrade requests) can connect.

