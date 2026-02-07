# Render Deployment Guide

## Why Render?

Render has **excellent WebSocket support** and will solve the Railway WebSocket connection issues we've been experiencing.

## Step 1: Sign Up for Render

1. Go to: https://render.com
2. Sign up (free tier available)
3. Connect your GitHub account

## Step 2: Deploy Backend

1. **In Render Dashboard:**
   - Click **"New +"** → **"Web Service"**
   - Select **"Build and deploy from a Git repository"**
   - Connect your GitHub account if not already connected
   - Select repository: `elynrose/appt` (or your repo name)

2. **Configure Backend Service:**
   - **Name:** `agentic-appointment-backend` (or your choice)
   - **Environment:** `Node`
   - **Region:** Choose closest to you (e.g., `Oregon (US West)`)
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm run start`
   - **Plan:** Free (or paid if you prefer)

3. **Environment Variables:**
   Click **"Advanced"** → **"Add Environment Variable"** and add:
   ```
   OPENAI_API_KEY = sk-... (your OpenAI key)
   FIREBASE_SERVICE_ACCOUNT_BASE64 = ... (your base64 Firebase credentials)
   PUBLIC_URL = (will be set after deployment - Render will give you a URL)
   PORT = 5050 (optional, Render sets this automatically)
   ```

4. **Click "Create Web Service"**

5. **Wait for Deployment:**
   - Render will build and deploy
   - This takes 2-5 minutes
   - Watch the build logs

6. **Get Your Backend URL:**
   - After deployment, Render will show your URL
   - Example: `https://agentic-appointment-backend.onrender.com`
   - Copy this URL

7. **Set PUBLIC_URL:**
   - Go to your service → **Environment**
   - Add/Update: `PUBLIC_URL` = `https://your-backend-url.onrender.com`
   - Render will auto-redeploy

## Step 3: Deploy Frontend

1. **In Render Dashboard:**
   - Click **"New +"** → **"Web Service"**
   - Select your GitHub repository

2. **Configure Frontend Service:**
   - **Name:** `agentic-appointment-frontend` (or your choice)
   - **Environment:** `Node`
   - **Region:** Same as backend
   - **Branch:** `main`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start` (or use static site if preferred)
   - **Plan:** Free

3. **Environment Variables:**
   ```
   VITE_FIREBASE_API_KEY = your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN = studio-5771582587-5ae19.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID = studio-5771582587-5ae19
   VITE_FIREBASE_APP_ID = 1:767449505901:web:a81ed5939980ebb673df64
   VITE_BACKEND_URL = https://your-backend-url.onrender.com
   ```

4. **Click "Create Web Service"**

5. **Wait for Deployment**

## Step 4: Update Twilio Webhook

1. **Get your Render backend URL:**
   - From Render dashboard → Backend service
   - Copy the URL (e.g., `https://agentic-appointment-backend.onrender.com`)

2. **Update Twilio:**
   - Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/incoming
   - Click your phone number
   - Under "A CALL COMES IN":
     - **Webhook URL:** `https://your-backend-url.onrender.com/voice?businessId=business-1`
     - **HTTP Method:** `POST`
   - Click **"Save"**

## Step 5: Test

1. **Call your Twilio number**
2. **Check Render logs:**
   - Go to Render dashboard → Backend service → **Logs**
   - Look for:
     ```
     [Voice Webhook] Incoming call...
     [Voice Webhook] Stream URL: wss://...
     [Request] GET /twilio-media?...  ← Should appear!
     [WebSocket] 🔌 Connection attempt received  ← Should appear!
     [WebSocket] ✅ Realtime session started
     ```

## Render Advantages

- ✅ **Excellent WebSocket support** - No proxy issues
- ✅ **Free tier available** - Good for testing
- ✅ **Automatic HTTPS** - SSL certificates included
- ✅ **Easy deployment** - Just connect GitHub
- ✅ **Better logging** - Clear build and runtime logs

## Environment Variables Checklist

### Backend (Render):
- [ ] `OPENAI_API_KEY`
- [ ] `FIREBASE_SERVICE_ACCOUNT_BASE64`
- [ ] `PUBLIC_URL` (set after getting URL)
- [ ] `PORT` (optional, Render sets automatically)

### Frontend (Render):
- [ ] `VITE_FIREBASE_API_KEY`
- [ ] `VITE_FIREBASE_AUTH_DOMAIN`
- [ ] `VITE_FIREBASE_PROJECT_ID`
- [ ] `VITE_FIREBASE_APP_ID`
- [ ] `VITE_BACKEND_URL` (set after backend deploys)

## Troubleshooting

### Build Fails
- Check build logs in Render
- Verify Root Directory is correct (`backend` or `frontend`)
- Check Node version (should auto-detect from `.nvmrc`)

### WebSocket Still Doesn't Work
- Check Render logs for errors
- Verify `PUBLIC_URL` is set correctly
- Check that backend URL is accessible

### Frontend Build Fails
- Check that all `VITE_*` variables are set
- Verify build command: `npm install && npm run build`

## Next Steps After Deployment

1. ✅ Test webhook endpoint (should work)
2. ✅ Test WebSocket connection (should work on Render!)
3. ✅ Make a real call
4. ✅ Verify AI agent responds

Render should solve the WebSocket connection issues we've been having with Railway!

