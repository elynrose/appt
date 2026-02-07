# Render Setup - Step by Step

## Prerequisites Checklist

Before starting, make sure you have:
- [ ] Signed into Render (https://render.com)
- [ ] GitHub repository is accessible (https://github.com/elynrose/appt)
- [ ] Environment variable values ready:
  - OpenAI API key
  - Firebase service account (base64)
  - Firebase web app credentials

## Step 1: Deploy Backend Service

### 1.1 Create Backend Service

1. **In Render Dashboard:**
   - Click **"New +"** button (top right)
   - Select **"Web Service"**

2. **Connect Repository:**
   - If first time: Click **"Connect account"** → Select GitHub → Authorize
   - Select repository: `elynrose/appt` (or your repo name)
   - Click **"Connect"**

3. **Configure Service:**
   - **Name:** `agentic-appointment-backend`
   - **Environment:** `Node`
   - **Region:** `Oregon (US West)` (or closest to you)
   - **Branch:** `main`
   - **Root Directory:** `backend` ⚠️ **CRITICAL - Must be `backend`**
   - **Build Command:** `npm install`
   - **Start Command:** `npm run start`
   - **Plan:** `Free` (or `Starter` if you prefer)

4. **Click "Create Web Service"**

5. **Wait for Build:**
   - Watch the build logs
   - Should see: "Installing dependencies..."
   - Should see: "Build successful"
   - Takes 2-5 minutes

### 1.2 Get Backend URL

After deployment completes:
- Render will show your service URL
- Example: `https://agentic-appointment-backend.onrender.com`
- **Copy this URL** - you'll need it!

### 1.3 Set Backend Environment Variables

1. **In your backend service:**
   - Click **"Environment"** tab (left sidebar)
   - Click **"Add Environment Variable"**

2. **Add these variables:**
   ```
   Key: OPENAI_API_KEY
   Value: sk-... (your OpenAI API key)
   ```

   ```
   Key: FIREBASE_SERVICE_ACCOUNT_BASE64
   Value: ... (your base64 encoded Firebase service account JSON)
   ```

   ```
   Key: PUBLIC_URL
   Value: https://agentic-appointment-backend.onrender.com
   (Use the actual URL Render gave you)
   ```

3. **After adding each variable:**
   - Render will auto-save
   - Service will auto-redeploy

4. **Wait for redeploy to complete**

## Step 2: Deploy Frontend Service

### 2.1 Create Frontend Service

1. **In Render Dashboard:**
   - Click **"New +"** → **"Web Service"**
   - Select repository: `elynrose/appt`

2. **Configure Service:**
   - **Name:** `agentic-appointment-frontend`
   - **Environment:** `Node`
   - **Region:** Same as backend
   - **Branch:** `main`
   - **Root Directory:** `frontend` ⚠️ **CRITICAL - Must be `frontend`**
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start`
   - **Plan:** `Free`

3. **Click "Create Web Service"**

4. **Wait for Build** (2-5 minutes)

### 2.2 Set Frontend Environment Variables

1. **In your frontend service:**
   - Click **"Environment"** tab
   - Click **"Add Environment Variable"**

2. **Add these variables:**
   ```
   VITE_FIREBASE_API_KEY = AIzaSyAfX20OsEdxSyJrIApZp_IU4yERf5moOic
   VITE_FIREBASE_AUTH_DOMAIN = studio-5771582587-5ae19.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID = studio-5771582587-5ae19
   VITE_FIREBASE_APP_ID = 1:767449505901:web:a81ed5939980ebb673df64
   VITE_BACKEND_URL = https://agentic-appointment-backend.onrender.com
   (Use your actual backend URL from Step 1.2)
   ```

3. **Wait for redeploy**

## Step 3: Update Twilio Webhook

1. **Get your Render backend URL:**
   - From Render dashboard → Backend service
   - Copy the URL (e.g., `https://agentic-appointment-backend.onrender.com`)

2. **Update Twilio:**
   - Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/incoming
   - Click on your phone number
   - Under **"A CALL COMES IN"**:
     - **Webhook URL:** `https://your-backend-url.onrender.com/voice?businessId=business-1`
     - Replace `your-backend-url` with your actual Render URL
     - **HTTP Method:** `POST`
   - Click **"Save"**

## Step 4: Test Deployment

### 4.1 Test Backend

1. **Check backend is running:**
   - Render dashboard → Backend service → **Logs**
   - Should see: `Backend listening on 5050` (or Render's PORT)

2. **Test webhook endpoint:**
   ```bash
   curl -X POST "https://your-backend-url.onrender.com/voice?businessId=business-1" \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "CallSid=test123&To=%2B15551234567"
   ```
   Should return TwiML XML.

### 4.2 Test Frontend

1. **Open frontend URL:**
   - From Render dashboard → Frontend service
   - Copy the URL
   - Open in browser
   - Should see login page

### 4.3 Test Call

1. **Call your Twilio number**
2. **Watch Render logs:**
   - Backend service → **Logs** tab
   - Look for:
     ```
     [Voice Webhook] Incoming call...
     [WebSocket] 🔌 Connection attempt received  ← Should appear!
     [WebSocket] ✅ Realtime session started
     ```

## Troubleshooting

### Backend Build Fails
- Check Root Directory is `backend` (not empty)
- Check build logs for errors
- Verify `package.json` exists in `backend/` directory

### Frontend Build Fails
- Check Root Directory is `frontend`
- Verify all `VITE_*` variables are set
- Check build logs for missing variables

### WebSocket Still Doesn't Work
- Verify `PUBLIC_URL` matches your Render backend URL exactly
- Check Render logs for WebSocket connection attempts
- Make sure backend URL is accessible

## Success Indicators

✅ **Backend:**
- Service shows "Live" status
- Logs show "Backend listening on..."
- Webhook test returns TwiML

✅ **Frontend:**
- Service shows "Live" status
- URL loads login page
- No console errors

✅ **Call:**
- Call connects
- See `[WebSocket] 🔌 Connection attempt received` in logs
- AI agent responds

## Next Steps After Setup

1. ✅ Test webhook endpoint
2. ✅ Test frontend loads
3. ✅ Make a test call
4. ✅ Verify WebSocket connects (should work on Render!)
5. ✅ Test full call flow

Let me know when you've completed each step and I can help troubleshoot any issues!

