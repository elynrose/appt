# Render Quick Start Guide

## 🚀 Deploy in 5 Minutes

### Step 1: Sign Up
1. Go to: https://render.com
2. Sign up with GitHub
3. Authorize Render to access your repositories

### Step 2: Deploy Backend

1. **Click "New +" → "Web Service"**
2. **Select your repository:** `elynrose/appt` (or your repo)
3. **Configure:**
   - **Name:** `agentic-appointment-backend`
   - **Environment:** `Node`
   - **Region:** `Oregon (US West)` (or closest to you)
   - **Branch:** `main`
   - **Root Directory:** `backend` ⚠️ **IMPORTANT**
   - **Build Command:** `npm install`
   - **Start Command:** `npm run start`
   - **Plan:** `Free`

4. **Click "Create Web Service"**

5. **Wait for deployment** (2-5 minutes)

6. **Get your backend URL:**
   - Render will show: `https://agentic-appointment-backend-xxxx.onrender.com`
   - Copy this URL

7. **Set Environment Variables:**
   - Go to your service → **Environment** tab
   - Add:
     ```
     OPENAI_API_KEY = sk-... (your key)
     FIREBASE_SERVICE_ACCOUNT_BASE64 = ... (your base64 credentials)
     PUBLIC_URL = https://agentic-appointment-backend-xxxx.onrender.com
     ```
   - Render will auto-redeploy

### Step 3: Deploy Frontend

1. **Click "New +" → "Web Service"**
2. **Select your repository:** `elynrose/appt`
3. **Configure:**
   - **Name:** `agentic-appointment-frontend`
   - **Environment:** `Node`
   - **Region:** Same as backend
   - **Branch:** `main`
   - **Root Directory:** `frontend` ⚠️ **IMPORTANT**
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start`
   - **Plan:** `Free`

4. **Set Environment Variables:**
   ```
   VITE_FIREBASE_API_KEY = AIzaSyAfX20OsEdxSyJrIApZp_IU4yERf5moOic
   VITE_FIREBASE_AUTH_DOMAIN = studio-5771582587-5ae19.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID = studio-5771582587-5ae19
   VITE_FIREBASE_APP_ID = 1:767449505901:web:a81ed5939980ebb673df64
   VITE_BACKEND_URL = https://agentic-appointment-backend-xxxx.onrender.com
   ```

5. **Click "Create Web Service"**

### Step 4: Update Twilio Webhook

1. **Go to:** https://console.twilio.com/us1/develop/phone-numbers/manage/incoming
2. **Click your phone number**
3. **Under "A CALL COMES IN":**
   - **Webhook URL:** `https://your-backend-url.onrender.com/voice?businessId=business-1`
   - **HTTP Method:** `POST`
4. **Click "Save"**

### Step 5: Test!

1. **Call your Twilio number**
2. **Check Render logs:**
   - Backend service → **Logs** tab
   - Look for:
     ```
     [Voice Webhook] Incoming call...
     [WebSocket] 🔌 Connection attempt received  ← Should appear!
     [WebSocket] ✅ Realtime session started
     ```

## ✅ Expected Results

With Render, you should see:
- ✅ Webhook works (already working)
- ✅ **WebSocket connects!** (this is what we need)
- ✅ AI agent responds
- ✅ Calls work end-to-end

## 🎉 Why Render Works

- **Native WebSocket support** - No proxy issues
- **Proper HTTP/WebSocket handling** - Edge layer forwards upgrades correctly
- **No Nginx needed** - Render handles it

## 📋 Environment Variables Checklist

### Backend:
- [ ] `OPENAI_API_KEY`
- [ ] `FIREBASE_SERVICE_ACCOUNT_BASE64`
- [ ] `PUBLIC_URL` (set after getting URL)

### Frontend:
- [ ] `VITE_FIREBASE_API_KEY`
- [ ] `VITE_FIREBASE_AUTH_DOMAIN`
- [ ] `VITE_FIREBASE_PROJECT_ID`
- [ ] `VITE_FIREBASE_APP_ID`
- [ ] `VITE_BACKEND_URL`

## 🆘 Troubleshooting

### Build Fails
- Check Root Directory is correct (`backend` or `frontend`)
- Check build logs in Render

### WebSocket Still Doesn't Work
- Verify `PUBLIC_URL` matches your Render backend URL exactly
- Check Render logs for errors

### Frontend Doesn't Load
- Check all `VITE_*` variables are set
- Verify `VITE_BACKEND_URL` is correct

## 🎯 Next Steps

1. Deploy backend to Render
2. Deploy frontend to Render
3. Update Twilio webhook
4. Make a test call
5. **WebSocket should work!** 🎉

