# Testing Twilio Calls

## Quick Test Checklist

### Pre-Test Verification

1. **Backend is Running:**
   ```bash
   cd backend
   npm run dev
   # Should see: "Backend listening on 5050"
   ```

2. **Environment Variables Set:**
   - `OPENAI_API_KEY` - Valid OpenAI API key
   - `FIREBASE_SERVICE_ACCOUNT_BASE64` - Valid Firebase credentials
   - `PUBLIC_URL` - Your public URL (ngrok or Railway)
   - `TWILIO_BUSINESS_<ID>` - Twilio credentials (if premium)

3. **Twilio Webhook Configured:**
   - Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/incoming
   - Webhook URL: `https://your-url/voice?businessId=business-1`
   - HTTP Method: `POST`

## Test Scenarios

### Test 1: Basic Call Flow

**Steps:**
1. Call your Twilio phone number
2. Should hear: "Thank you for calling. Please wait while I connect you to our scheduling assistant."
3. AI agent should respond
4. Try scheduling an appointment

**Expected Logs:**
```
[Voice Webhook] Incoming call - CallSid: CA...
[Voice Webhook] Stream URL: wss://...
[WebSocket] 🔌 Connection attempt received
[WebSocket] ✅ Realtime session started
```

### Test 2: Premium Plan (with businessId)

**Test URL:** `https://your-url/voice?businessId=business-1`

**Expected:**
- Webhook receives call with businessId
- Uses premium plan routing
- Connects to WebSocket

### Test 3: Basic Plan (phone number routing)

**Test URL:** `https://your-url/voice`

**Requirements:**
- Phone number must be in `/phoneRoutes/{phoneNumber}` collection
- Should resolve to a businessId

**Expected:**
- Webhook resolves businessId from phone number
- Uses basic plan routing

### Test 4: Error Handling

**Test Cases:**
1. **Missing businessId:**
   - Call without businessId and phone not in routes
   - Should hear: "Sorry, this number is not configured."

2. **Invalid businessId:**
   - Call with non-existent businessId
   - Should handle gracefully

## Testing Locally with ngrok

### Step 1: Start Backend
```bash
cd backend
npm run dev
```

### Step 2: Start ngrok
```bash
ngrok http 5050
```

### Step 3: Update Twilio Webhook
- Use ngrok URL: `https://your-ngrok-url.ngrok-free.app/voice?businessId=business-1`
- Set in Twilio Console

### Step 4: Make Test Call
- Call your Twilio number
- Watch backend logs
- Check for WebSocket connection

## Testing on Railway

### Step 1: Verify Deployment
- Check Railway dashboard → Backend service
- Status should be "Deployed"
- Check logs for: `Backend listening on 5050`

### Step 2: Update Twilio Webhook
- Use Railway URL: `https://awake-cat-production-15ef.up.railway.app/voice?businessId=business-1`
- Set in Twilio Console

### Step 3: Make Test Call
- Call your Twilio number
- Watch Railway logs in real-time
- Check for WebSocket connection

## Monitoring During Calls

### Watch Backend Logs
```bash
# Local
cd backend
tail -f backend.log

# Railway
# Go to Railway dashboard → Logs tab
```

### What to Look For

**✅ Successful Call:**
```
[Voice Webhook] Incoming call - CallSid: CA...
[Voice Webhook] Call CA... from +15551234567, business: business-1, plan: premium
[Voice Webhook] Stream URL: wss://...
[Request] GET /twilio-media?...
[Request] Upgrade header: websocket
[WebSocket] 🔌 Connection attempt received
[WebSocket] Creating transport and session...
[WebSocket] Connecting to OpenAI Realtime API...
[WebSocket] ✅ Realtime session started
```

**❌ Failed Call:**
```
[Voice Webhook] Incoming call - CallSid: CA...
[Voice Webhook] Stream URL: wss://...
(No [WebSocket] logs)  ← Problem: WebSocket not connecting
```

## Common Issues & Solutions

### Issue 1: "Application error occurred"
- **Cause:** WebSocket not connecting
- **Check:** Railway logs for `[WebSocket]` logs
- **Solution:** See `RAILWAY_WEBSOCKET_FIX.md`

### Issue 2: "Number not configured"
- **Cause:** No businessId found
- **Check:** Verify businessId in query or phoneRoutes
- **Solution:** Add businessId to query or phoneRoutes collection

### Issue 3: No response from AI
- **Cause:** OpenAI API key invalid or WebSocket failed
- **Check:** `OPENAI_API_KEY` is set and valid
- **Check:** WebSocket connection logs

### Issue 4: Call disconnects immediately
- **Cause:** WebSocket connection failed
- **Check:** Railway logs for WebSocket errors
- **Solution:** Check `PUBLIC_URL` is correct

## Test Script

Use this script to test the webhook endpoint:

```bash
# Test webhook endpoint
curl -X POST "https://your-url/voice?businessId=business-1" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "CallSid=test123&To=%2B15551234567"

# Should return TwiML with <Stream> tag
```

## Next Steps After Testing

1. **If calls work:** ✅ You're all set!
2. **If WebSocket doesn't connect:** See `RAILWAY_WEBSOCKET_FIX.md`
3. **If other errors:** Check logs and error messages

