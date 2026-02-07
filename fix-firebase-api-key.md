# Fix Firebase API Key Error

## Problem
Frontend is showing: `Firebase: Error (auth/api-key-not-valid.-please-pass-a-valid-api-key.)`

## Root Cause
The `VITE_FIREBASE_API_KEY` environment variable is either:
1. Not set in Railway
2. Set with an incorrect value
3. Not included in the frontend build (Vite requires env vars at build time)

## Solution

### Step 1: Get the Correct Firebase API Key

The API key from your setup script is:
```
AIzaSyAfX20OsEdxSyJrIApZp_IU4yERf5moOic
```

**OR** get it from Firebase Console:
1. Go to: https://console.firebase.google.com/project/studio-5771582587-5ae19/settings/general
2. Scroll to "Your apps" section
3. Click on your web app (or create one if needed)
4. Copy the `apiKey` value

### Step 2: Set Environment Variable in Railway

**Option A: Via Railway Dashboard**
1. Go to: https://railway.com/project/51de7b51-98b9-47b3-8ae1-f6f9022e13d2
2. Click on your frontend service
3. Go to **Variables** tab
4. Add/Update: `VITE_FIREBASE_API_KEY` = `AIzaSyAfX20OsEdxSyJrIApZp_IU4yERf5moOic`
5. Click **Save**

**Option B: Via Railway CLI**
```bash
cd frontend
railway variables set VITE_FIREBASE_API_KEY=AIzaSyAfX20OsEdxSyJrIApZp_IU4yERf5moOic
```

### Step 3: Verify All Firebase Variables

Make sure ALL these are set in Railway:

```bash
cd frontend
railway variables set VITE_FIREBASE_API_KEY=AIzaSyAfX20OsEdxSyJrIApZp_IU4yERf5moOic
railway variables set VITE_FIREBASE_AUTH_DOMAIN=studio-5771582587-5ae19.firebaseapp.com
railway variables set VITE_FIREBASE_PROJECT_ID=studio-5771582587-5ae19
railway variables set VITE_FIREBASE_APP_ID=1:767449505901:web:a81ed5939980ebb673df64
railway variables set VITE_BACKEND_URL=https://awake-cat-production-15ef.up.railway.app
```

### Step 4: Redeploy Frontend

**Important:** After setting environment variables, you MUST redeploy for Vite to include them in the build.

**Via Railway Dashboard:**
1. Go to your frontend service
2. Click **Deployments** tab
3. Click **Redeploy** on the latest deployment

**Via Railway CLI:**
```bash
cd frontend
railway up
```

**Via Git (automatic):**
```bash
cd frontend
# Make a small change to trigger redeploy
touch .redeploy
git add .redeploy
git commit -m "Trigger redeploy for Firebase env vars"
git push origin main
```

### Step 5: Verify

After redeployment:
1. Open frontend URL: https://incredible-flow-production-8ebb.up.railway.app
2. Check browser console - should NOT see Firebase API key error
3. Try logging in with Google

## Quick Fix Command

Run this to set all Firebase variables at once:

```bash
cd frontend
railway variables set VITE_FIREBASE_API_KEY=AIzaSyAfX20OsEdxSyJrIApZp_IU4yERf5moOic
railway variables set VITE_FIREBASE_AUTH_DOMAIN=studio-5771582587-5ae19.firebaseapp.com
railway variables set VITE_FIREBASE_PROJECT_ID=studio-5771582587-5ae19
railway variables set VITE_FIREBASE_APP_ID=1:767449505901:web:a81ed5939980ebb673df64
railway variables set VITE_BACKEND_URL=https://awake-cat-production-15ef.up.railway.app
railway up
```

## Why This Happens

Vite (the frontend build tool) requires environment variables to be available **at build time**, not just runtime. When Railway builds your frontend, it needs these variables to be set so they can be embedded in the JavaScript bundle.

If you set the variables after the build, they won't be included, and you'll get this error.

