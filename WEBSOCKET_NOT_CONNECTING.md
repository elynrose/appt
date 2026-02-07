# WebSocket Not Connecting - Diagnosis

## Current Status
✅ Voice webhook is working - call is received
❌ WebSocket connection is NOT being established - no `[WebSocket]` logs appear

## The Problem

You're seeing:
```
[Voice Webhook] Call CA111dec4e2ab190564b6ef9ab207de984 from +12763659195, business: business-1, plan: premium
```

But **NOT** seeing:
```
[WebSocket] 🔌 Connection attempt received
```

This means Twilio cannot connect to the WebSocket endpoint.

## What to Check in Railway Logs

Please check the Railway logs and look for:

1. **Stream URL Log:**
   - Should see: `[Voice Webhook] Stream URL: wss://...`
   - Verify the URL is correct

2. **Any Error Messages:**
   - Look for any errors after the webhook log
   - Check for connection timeouts
   - Look for 500/502/503 errors

3. **Complete Log Output:**
   - Share the full log output from the call
   - Include everything from `[Voice Webhook]` onwards

## Possible Causes

### Cause 1: Railway WebSocket Upgrade Not Working

Railway might not be properly handling WebSocket upgrades. This could be:
- Railway edge/proxy not forwarding WebSocket upgrades
- HTTP/2 vs HTTP/1.1 issues
- Railway configuration issue

**Fix:** Check Railway documentation for WebSocket support, or try a different deployment platform.

### Cause 2: WebSocket URL Format Issue

The Stream URL might be malformed or Railway might be rewriting it.

**Check:** Look for the `[Voice Webhook] Stream URL:` log line and verify:
- Starts with `wss://` (not `ws://`)
- Has correct domain: `awake-cat-production-15ef.up.railway.app`
- Has all query parameters: `businessId`, `callSid`, `plan`, `to`

### Cause 3: Railway Edge/Proxy Blocking WebSocket

Railway's edge layer might be blocking or not forwarding WebSocket upgrades.

**Fix:** This might require Railway support or using a different deployment method.

### Cause 4: Fastify WebSocket Configuration

The WebSocket route might not be properly registered or configured.

**Check:** Verify the route is registered before the server starts.

## Diagnostic Steps

### Step 1: Check Complete Logs

In Railway logs, look for the complete output:
```
[Voice Webhook] Incoming call - CallSid: CA...
[Voice Webhook] Call CA... from +12763659195, business: business-1, plan: premium
[Voice Webhook] Stream URL: wss://...  ← CHECK THIS LINE
```

### Step 2: Verify Stream URL

The Stream URL should be:
```
wss://awake-cat-production-15ef.up.railway.app/twilio-media?businessId=business-1&callSid=CA...&plan=premium&to=%2B12763659195
```

### Step 3: Test WebSocket Endpoint Manually

Try using a WebSocket client to test:

```bash
# Install wscat
npm install -g wscat

# Test connection
wscat -c "wss://awake-cat-production-15ef.up.railway.app/twilio-media?businessId=business-1&callSid=test123&plan=premium&to=%2B12763659195"
```

If this fails, the WebSocket endpoint is not accessible.

### Step 4: Check Twilio Webhook Logs

1. Go to: https://console.twilio.com/us1/monitor/logs/webhooks
2. Find your call (CallSid: CA111dec4e2ab190564b6ef9ab207de984)
3. Check for:
   - WebSocket connection errors
   - Timeout errors
   - 500/502/503 errors

## Potential Solutions

### Solution 1: Verify PUBLIC_URL

Ensure `PUBLIC_URL` in Railway is set to:
```
https://awake-cat-production-15ef.up.railway.app
```

(No trailing slash, must be `https://`)

### Solution 2: Check Railway WebSocket Support

Railway should support WebSockets, but verify:
- Check Railway status page
- Contact Railway support if needed
- Check Railway documentation for WebSocket requirements

### Solution 3: Add More Logging

Add logging to see if the WebSocket route is even being hit:

```javascript
// In backend/src/index.js, add before the WebSocket route:
fastify.addHook('onRequest', async (request, reply) => {
  if (request.url.startsWith('/twilio-media')) {
    console.log(`[Request] ${request.method} ${request.url}`);
    console.log(`[Request] Headers:`, request.headers);
    console.log(`[Request] Is WebSocket upgrade:`, request.headers.upgrade === 'websocket');
  }
});
```

### Solution 4: Try Different Deployment

If Railway WebSocket support is the issue, consider:
- Render (has good WebSocket support)
- Fly.io (excellent WebSocket support)
- Heroku (WebSocket support)
- AWS/GCP with proper WebSocket configuration

## Next Steps

1. **Share the complete log output** from Railway during the call
2. **Check for the Stream URL log** - verify it's correct
3. **Check Twilio webhook logs** - see if Twilio reports connection errors
4. **Test WebSocket manually** - use wscat to test if endpoint is accessible

## Most Likely Issue

Based on the symptoms (webhook works, WebSocket doesn't connect), the most likely issue is:

**Railway's edge/proxy layer is not properly forwarding WebSocket upgrade requests.**

This could be:
- Railway configuration issue
- HTTP/2 vs HTTP/1.1 compatibility
- Railway edge not supporting WebSocket upgrades

**The Railway logs will tell us more - please share the complete log output from the call.**

