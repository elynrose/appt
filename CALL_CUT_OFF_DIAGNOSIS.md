# Call Cut Off Diagnosis

## Symptom
- ✅ Call rings (connects to Twilio)
- ❌ Call cuts/disconnects immediately

## Possible Causes

### 1. WebSocket Still Not Connecting
**Check Railway logs for:**
```
[Voice Webhook] Stream URL: wss://...
(No [WebSocket] logs)  ← Problem: WebSocket not connecting
```

**Solution:** Nginx might not be running or configured correctly

### 2. WebSocket Connects But Fails
**Check Railway logs for:**
```
[WebSocket] 🔌 Connection attempt received
[WebSocket] ❌ Socket error: ...  ← Problem: Connection fails
```

**Possible causes:**
- OpenAI API key invalid
- Firebase not initialized
- Missing environment variables
- Error in WebSocket handler

### 3. Nginx Not Running
**Check Railway logs for:**
- Nginx startup errors
- "nginx: command not found"
- Port binding errors

### 4. Fastify Not Starting
**Check Railway logs for:**
- "Backend listening on 5050" should appear
- If not, Fastify failed to start

## Diagnostic Steps

### Step 1: Check Railway Logs

1. **Go to Railway Dashboard:**
   - https://railway.com/project/5518da0f-8de5-4191-ab0c-912fe4d35c55
   - Backend service → **Logs** tab

2. **Look for these logs in order:**
   ```
   [Voice Webhook] Incoming call...
   [Voice Webhook] Stream URL: wss://...
   [Request] GET /twilio-media?...  ← Should appear if Nginx works
   [WebSocket] 🔌 Connection attempt received  ← Should appear
   [WebSocket] Creating transport and session...
   [WebSocket] ❌ Error: ...  ← If you see this, check the error
   ```

### Step 2: Check What You See

**Scenario A: No [Request] or [WebSocket] logs**
- Nginx is not forwarding WebSocket upgrades
- Check if nginx is running
- Check nginx configuration

**Scenario B: [WebSocket] logs appear but then error**
- WebSocket connects but fails
- Check error message
- Common errors:
  - `OPENAI_API_KEY is not set`
  - `Firestore is not initialised`
  - `Realtime session error`

**Scenario C: [WebSocket] connects but call still cuts**
- Check for timeout errors
- Check OpenAI API connection
- Check Firebase connection

## Quick Fixes

### Fix 1: Verify Environment Variables

Check Railway → Variables tab:
- ✅ `OPENAI_API_KEY` - Must be set
- ✅ `FIREBASE_SERVICE_ACCOUNT_BASE64` - Must be set
- ✅ `PUBLIC_URL` - Must be set to Railway URL

### Fix 2: Check Nginx is Running

Look in Railway logs for:
- Nginx startup messages
- Any nginx errors

### Fix 3: Check Fastify Started

Look in Railway logs for:
- `Backend listening on 5050`
- If not present, Fastify failed to start

## What to Share

After checking Railway logs, share:
1. **Do you see `[Request]` logs?** (Nginx forwarding)
2. **Do you see `[WebSocket] 🔌 Connection attempt received`?** (WebSocket connecting)
3. **Any error messages?** (What failed)
4. **Complete log output** from the call

This will help identify exactly where it's failing.

