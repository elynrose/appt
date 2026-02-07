# Diagnose WebSocket Connection Issue

## ✅ What's Working
- Webhook endpoint is working correctly
- TwiML is being returned with correct WebSocket URL
- Backend is deployed and running

## ❌ What's Not Working
- WebSocket connection from Twilio to Railway

## Critical Check: Railway Logs

**The most important thing right now is to check Railway logs during a call.**

### Steps:

1. **Open Railway Dashboard:**
   - Go to: https://railway.com/project/5518da0f-8de5-4191-ab0c-912fe4d35c55
   - Click on your **backend service**

2. **Open Logs in Real-Time:**
   - Click **Logs** tab
   - Or: **Deployments** → Latest deployment → **View Logs**
   - Keep this window open

3. **Make a Test Call:**
   - Call your Twilio number
   - Watch the logs appear in real-time

4. **What You Should See:**

   **If WebSocket connection is attempted:**
   ```
   [Voice Webhook] Incoming call - CallSid: CA..., To: +15551234567, businessId param: business-1
   [Voice Webhook] Stream URL: wss://awake-cat-production-15ef.up.railway.app/twilio-media?...
   [WebSocket] 🔌 Connection attempt received  ← THIS IS KEY
   [WebSocket] Query params - businessId: business-1, callSid: CA...
   ```

   **If WebSocket connection is NOT attempted:**
   ```
   [Voice Webhook] Incoming call - CallSid: CA..., To: +15551234567, businessId param: business-1
   [Voice Webhook] Stream URL: wss://awake-cat-production-15ef.up.railway.app/twilio-media?...
   (No [WebSocket] logs appear)  ← PROBLEM: Twilio can't connect
   ```

## Possible Issues & Fixes

### Issue 1: No WebSocket Logs Appear

**Symptom:** See `[Voice Webhook]` but no `[WebSocket]` logs

**Possible Causes:**
1. **Railway WebSocket Support** - Railway might need specific configuration
2. **Network/Firewall** - Twilio can't reach the WebSocket endpoint
3. **URL Format** - WebSocket URL might be malformed

**Fixes to Try:**

#### Fix A: Verify Railway WebSocket Support
Railway should support WebSockets, but check:
- Ensure your service is using the latest Railway runtime
- Check Railway status page for any WebSocket issues

#### Fix B: Check Twilio Webhook Logs
1. Go to: https://console.twilio.com/us1/monitor/logs/webhooks
2. Look for your call
3. Check for connection errors

#### Fix C: Test WebSocket Endpoint
```bash
# This should attempt to upgrade to WebSocket (will fail, but shows if endpoint is reachable)
curl -i -N \
  -H "Connection: Upgrade" \
  -H "Upgrade: websocket" \
  -H "Sec-WebSocket-Version: 13" \
  -H "Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==" \
  "https://awake-cat-production-15ef.up.railway.app/twilio-media?businessId=business-1&callSid=test&plan=premium&to=%2B15551234567"
```

### Issue 2: WebSocket Logs Appear But Connection Fails

**Symptom:** See `[WebSocket] 🔌 Connection attempt received` but then errors

**Check for:**
- `[WebSocket] ❌ Socket error:` - Connection errors
- `[WebSocket] ❌ Realtime session error:` - OpenAI API issues
- Missing environment variables

**Fixes:**
- Check `OPENAI_API_KEY` is set correctly
- Verify Firebase is initialized
- Check for any error messages in logs

### Issue 3: Railway WebSocket Configuration

Railway might need the server to listen on `0.0.0.0` (which it already does), but verify:

```javascript
// In backend/src/index.js - should be:
fastify.listen({ port: PORT, host: '0.0.0.0' }, ...)
```

## Next Steps

1. **Check Railway logs during a call** - This is the most important step
2. **Share what you see:**
   - Do you see `[WebSocket] 🔌 Connection attempt received`?
   - Any error messages?
   - What happens after the webhook?

3. **Check Twilio logs:**
   - Go to Twilio Console → Monitor → Logs
   - Look for your call
   - Check for connection errors

## Quick Test

After checking logs, try this test:

```bash
# Test if the endpoint is reachable
curl -I "https://awake-cat-production-15ef.up.railway.app/twilio-media?businessId=business-1&callSid=test&plan=premium&to=%2B15551234567"
```

Should return HTTP headers (might be 400/404, but should respond).

## Most Likely Issue

Based on the webhook working but calls failing, the most likely issue is:

**Twilio cannot establish the WebSocket connection to Railway.**

This could be due to:
1. Railway WebSocket upgrade not working properly
2. Network/firewall blocking WebSocket connections
3. Railway needing specific WebSocket configuration

**The Railway logs will tell us exactly what's happening.**

