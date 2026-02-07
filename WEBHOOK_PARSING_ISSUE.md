# Webhook Parsing Issue

## Problem
```
[Voice Webhook] Incoming call - CallSid: , To: , businessId param: undefined
```

The webhook is being called, but the request parameters are empty/undefined.

## Possible Causes

### 1. Form Body Not Being Parsed
Twilio sends form-encoded data (`application/x-www-form-urlencoded`), but it might not be parsed correctly.

**Check:**
- Is `@fastify/formbody` registered?
- Is the content-type header correct?

### 2. Request Method Mismatch
Twilio might be sending GET instead of POST, or vice versa.

**Check:**
- What HTTP method is Twilio using?
- Is the webhook configured for POST in Twilio console?

### 3. Nginx Proxy Stripping Headers
Nginx might be modifying the request before it reaches Fastify.

**Check:**
- Are headers being forwarded correctly?
- Is the request body being passed through?

## Enhanced Logging Added

I've added detailed logging to see:
- Raw request method and URL
- Raw request body
- Raw query parameters
- Request headers

This will show exactly what Railway/Nginx is receiving.

## Next Steps

1. **Make another test call**
2. **Check Railway logs** for the new detailed logs:
   ```
   [Voice Webhook] Raw request - Method: ...
   [Voice Webhook] Raw body: ...
   [Voice Webhook] Raw query: ...
   [Voice Webhook] Headers: ...
   ```

3. **Share the complete log output** - This will show what's actually being received

## Quick Fix to Try

If form body isn't being parsed, we might need to:
1. Ensure `@fastify/formbody` is registered before the route
2. Check if Nginx is modifying the request
3. Try accessing raw request stream if needed

## Check Twilio Webhook Configuration

In Twilio Console:
1. Go to Phone Numbers → Your number
2. Check "A CALL COMES IN" webhook:
   - URL: `https://awake-cat-production-15ef.up.railway.app/voice?businessId=business-1`
   - HTTP Method: Should be **POST** (not GET)
   - Click "Save"

Make another call and share the detailed logs!

