# WebSocket Connection Check

The webhook is working correctly ✅, but the WebSocket connection is likely failing.

## Next Steps to Diagnose

### 1. Check Railway Backend Logs During a Call

1. **Open Railway Dashboard:**
   - Go to: https://railway.com/project/5518da0f-8de5-4191-ab0c-912fe4d35c55
   - Click on your backend service

2. **Open Logs:**
   - Click **Logs** tab (or Deployments → latest → View Logs)
   - Keep this open

3. **Make a Test Call:**
   - Call your Twilio number
   - Watch the logs in real-time

4. **What to Look For:**
   - `[Voice Webhook]` - Should appear ✅
   - `[WebSocket] 🔌 Connection attempt received` - Should appear if Twilio connects
   - `[WebSocket] ❌` - Any error messages

### 2. Test WebSocket Endpoint Directly

The WebSocket endpoint should be accessible. Let's verify Railway supports WebSockets:

```bash
# Test if the WebSocket endpoint responds (this will fail to upgrade, but should show headers)
curl -i -N \
  -H "Connection: Upgrade" \
  -H "Upgrade: websocket" \
  -H "Sec-WebSocket-Version: 13" \
  -H "Sec-WebSocket-Key: test" \
  "https://awake-cat-production-15ef.up.railway.app/twilio-media?businessId=business-1&callSid=test&plan=premium&to=%2B15551234567"
```

### 3. Common Issues

#### Issue A: Railway WebSocket Support
Railway should support WebSockets, but verify:
- Check Railway documentation for WebSocket support
- Ensure your service is using HTTP/1.1 (not HTTP/2 which can cause issues)

#### Issue B: Fastify WebSocket Configuration
The WebSocket might not be properly configured. Check:
- Fastify WebSocket plugin is registered correctly
- The route is set up with `{ websocket: true }`

#### Issue C: Twilio WebSocket Connection
Twilio might be having issues connecting:
- Check Twilio webhook logs: https://console.twilio.com/us1/monitor/logs/webhooks
- Look for connection errors
- Verify Twilio can reach your Railway URL

### 4. Check Backend Code

Verify the WebSocket endpoint is correctly set up in `backend/src/index.js`:

```javascript
fastify.get('/twilio-media', { websocket: true }, async (connection, req) => {
  // Should log connection attempts
  console.log(`[WebSocket] 🔌 Connection attempt received`);
  // ...
});
```

### 5. Railway-Specific WebSocket Issues

Railway might need specific configuration:
- Check if Railway requires any special headers
- Verify the WebSocket upgrade is working
- Check Railway's network/firewall settings

## What to Share

After making a test call, please share:
1. **Railway logs** - Last 50-100 lines after the call
2. **Any error messages** - From Railway logs or Twilio console
3. **Twilio webhook logs** - From Twilio Console → Monitor → Logs

This will help identify exactly where the connection is failing.

