# Twilio Call "Application Error" Troubleshooting

## Current Issue
Getting "Application error occurred" when making a call to your Twilio number.

## Quick Diagnostic Steps

### Step 1: Check Railway Backend Logs

1. **Go to Railway Dashboard:**
   - Open: https://railway.com/project/5518da0f-8de5-4191-ab0c-912fe4d35c55
   - Click on your **backend service**

2. **View Logs:**
   - Click **Deployments** tab
   - Click on the latest deployment
   - Click **View Logs** or check the **Logs** tab
   - Look for entries starting with `[Voice Webhook]` or `[WebSocket]`

3. **What to Look For:**
   - ✅ `[Voice Webhook] Incoming call` - Webhook is being received
   - ✅ `[Voice Webhook] Stream URL: wss://...` - Stream URL is generated
   - ❌ `[WebSocket] Connection attempt received` - Should appear after webhook
   - ❌ Any error messages

### Step 2: Verify PUBLIC_URL is Set Correctly

**CRITICAL:** The `PUBLIC_URL` must match your Railway backend URL exactly.

1. **Get Your Backend URL:**
   - In Railway dashboard → Backend service → Settings → Domains
   - Should be: `https://awake-cat-production-15ef.up.railway.app`

2. **Check Environment Variable:**
   - Go to Backend service → Variables tab
   - Verify `PUBLIC_URL` is set to: `https://awake-cat-production-15ef.up.railway.app`
   - **Must start with `https://`** (not `http://`)
   - **No trailing slash**

3. **If Not Set or Wrong:**
   - Update `PUBLIC_URL` to your exact Railway backend URL
   - **Redeploy backend** after changing (Railway will auto-redeploy)

### Step 3: Verify Twilio Webhook URL

1. **Go to Twilio Console:**
   - https://console.twilio.com/us1/develop/phone-numbers/manage/incoming
   - Click on your phone number

2. **Check "A CALL COMES IN" Webhook:**
   - Should be: `https://awake-cat-production-15ef.up.railway.app/voice?businessId=business-1`
   - HTTP method: `POST`
   - Click **Save** if you made changes

3. **Test the Webhook:**
   ```bash
   curl -X POST "https://awake-cat-production-15ef.up.railway.app/voice?businessId=business-1" \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "CallSid=test123&To=%2B15551234567"
   ```
   Should return TwiML XML.

### Step 4: Check Backend Environment Variables

Verify these are set in Railway backend service:

- [ ] `OPENAI_API_KEY` - Set and valid
- [ ] `FIREBASE_SERVICE_ACCOUNT_BASE64` - Set and valid
- [ ] `PUBLIC_URL` - Set to `https://awake-cat-production-15ef.up.railway.app`
- [ ] `PORT` - Set to `5050` (optional)

### Step 5: Check WebSocket Endpoint

The WebSocket endpoint should be accessible at:
```
wss://awake-cat-production-15ef.up.railway.app/twilio-media?businessId=business-1&callSid=test&plan=premium&to=%2B15551234567
```

**Test WebSocket (if you have a WebSocket client):**
- Use a tool like `wscat` or browser console
- Try connecting to the WebSocket URL above
- Should connect without errors

## Common Issues & Fixes

### Issue 1: No Webhook Logs

**Symptom:** No `[Voice Webhook]` logs appear when calling

**Fix:**
- Verify Twilio webhook URL is correct
- Check Twilio webhook logs in Twilio Console → Monitor → Logs
- Ensure webhook URL is accessible (not blocked by firewall)

### Issue 2: Webhook Received but No WebSocket Connection

**Symptom:** See `[Voice Webhook]` logs but no `[WebSocket]` logs

**Possible Causes:**
1. **PUBLIC_URL is wrong** - Check it matches your Railway URL exactly
2. **WebSocket URL is malformed** - Check logs for the Stream URL
3. **Railway WebSocket support** - Railway should support WebSockets, but verify

**Fix:**
- Double-check `PUBLIC_URL` environment variable
- Ensure it's `https://` not `http://`
- Redeploy backend after changing `PUBLIC_URL`

### Issue 3: WebSocket Connection Fails

**Symptom:** See `[WebSocket] Connection attempt received` but connection fails

**Possible Causes:**
1. Missing `businessId` or `callSid` in query params
2. OpenAI API key invalid
3. Firebase not initialized

**Fix:**
- Check logs for specific error messages
- Verify all environment variables are set
- Check that `businessId` exists in Firestore

### Issue 4: Error in TwiML Response

**Symptom:** Backend returns error TwiML

**Fix:**
- Check backend logs for the error
- Verify `businessId` is correct
- Check if business document exists in Firestore

## Debugging Commands

### Check Backend Setup
```bash
cd backend
railway run node check-setup.js
```

### View Recent Logs
```bash
cd backend
railway logs --tail 100
```

### Test Webhook Manually
```bash
curl -X POST "https://awake-cat-production-15ef.up.railway.app/voice?businessId=business-1" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "CallSid=test123&To=%2B15551234567"
```

Expected response: TwiML XML with `<Stream>` tag

## Expected Log Flow

When a call works correctly, you should see:

```
[Voice Webhook] Incoming call - CallSid: CA..., To: +15551234567, businessId param: business-1
[Voice Webhook] Call CA... from +15551234567, business: business-1, plan: premium
[Voice Webhook] Stream URL: wss://awake-cat-production-15ef.up.railway.app/twilio-media?businessId=business-1&callSid=CA...&plan=premium&to=%2B15551234567
[WebSocket] 🔌 Connection attempt received
[WebSocket] Query params - businessId: business-1, callSid: CA...
[WebSocket] Creating transport and session for call CA...
[WebSocket] Connecting to OpenAI Realtime API...
[WebSocket] ✅ Realtime session started for call CA... (business business-1).
```

## Next Steps

1. **Check Railway logs** - See what's actually happening
2. **Verify PUBLIC_URL** - Most common issue
3. **Verify Twilio webhook** - Ensure it's pointing to Railway
4. **Test webhook manually** - Use curl to test the endpoint
5. **Check environment variables** - All must be set

## Still Not Working?

If you've checked everything above:
1. Share the backend logs from Railway (last 50-100 lines)
2. Verify the exact error message from Twilio
3. Check if the backend is actually running (status should be "Deployed")

