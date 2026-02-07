# 🔴 URGENT: Fix Firebase API Key Error

## The Problem
Your frontend is showing: `Firebase: Error (auth/api-key-not-valid.-please-pass-a-valid-api-key.)`

This means the Firebase API key is not set in Railway, or the frontend wasn't rebuilt after setting it.

## ⚡ Quick Fix (5 minutes)

### Step 1: Set Environment Variables in Railway Dashboard

1. **Go to Railway Dashboard:**
   - Open: https://railway.com/project/51de7b51-98b9-47b3-8ae1-f6f9022e13d2
   - Click on your **frontend service**

2. **Go to Variables Tab:**
   - Click **Variables** in the left sidebar
   - Add/Update these variables:

| Variable Name | Value |
|--------------|-------|
| `VITE_FIREBASE_API_KEY` | `your_firebase_api_key` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `studio-5771582587-5ae19.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `studio-5771582587-5ae19` |
| `VITE_FIREBASE_APP_ID` | `1:767449505901:web:a81ed5939980ebb673df64` |
| `VITE_BACKEND_URL` | `https://awake-cat-production-15ef.up.railway.app` |

3. **Click "Save" or "Add Variable" for each one**

### Step 2: Redeploy Frontend

**CRITICAL:** After setting variables, you MUST redeploy because Vite needs env vars at build time.

**Option A: Via Dashboard (Easiest)**
1. Still in your frontend service
2. Click **Deployments** tab
3. Click the **three dots (⋯)** on the latest deployment
4. Click **Redeploy**

**Option B: Via Git (Automatic)**
```bash
cd frontend
touch .redeploy
git add .redeploy
git commit -m "Trigger redeploy for Firebase env vars"
git push origin main
```

### Step 3: Wait for Deployment

- Watch the deployment logs in Railway
- Wait for status to show "Deployed" (green)
- This usually takes 2-3 minutes

### Step 4: Test

1. Open: https://incredible-flow-production-8ebb.up.railway.app
2. Check browser console (F12) - should NOT see Firebase error
3. Try logging in with Google

## ✅ Verification Checklist

After redeployment, verify:
- [ ] Frontend URL loads without errors
- [ ] Browser console shows no Firebase API key errors
- [ ] Login page appears correctly
- [ ] Google Sign-In button is visible

## 🚨 Why This Happens

Vite (your frontend build tool) requires environment variables to be available **at build time**. When Railway builds your app, it embeds these variables into the JavaScript bundle.

If you:
- Set variables after the build → They won't be included
- Set variables but don't redeploy → Old build still has missing values

**Solution:** Always redeploy after setting environment variables!

## 📋 All Required Variables Summary

Make sure ALL of these are set in Railway frontend service:

```
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=studio-5771582587-5ae19.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=studio-5771582587-5ae19
VITE_FIREBASE_APP_ID=1:767449505901:web:a81ed5939980ebb673df64
VITE_BACKEND_URL=https://awake-cat-production-15ef.up.railway.app
```

## Need Help?

If the error persists after redeploying:
1. Check Railway logs for build errors
2. Verify variables are spelled correctly (case-sensitive!)
3. Make sure you're setting them in the **frontend** service, not backend
4. Check that the API key is correct in Firebase Console

