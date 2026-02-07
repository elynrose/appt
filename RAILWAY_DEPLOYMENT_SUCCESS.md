# Railway Deployment Success Guide

## Overview

This document explains how we successfully deployed both the backend and frontend services to Railway, including all the issues we encountered and how we resolved them.

## Final Working Configuration

### Backend Configuration

**File: `backend/railway.toml`**
```toml
[build]
builder = "NIXPACKS"
buildCommand = "npm install"

[deploy]
startCommand = "npm run start"
```

**File: `backend/.nvmrc`**
```
20
```

**Key Points:**
- Uses `npm install` instead of `npm ci` (more forgiving with lock file sync)
- Specifies Node.js 20 via `.nvmrc`
- Railway auto-detects Node version from `.nvmrc`

### Frontend Configuration

**File: `frontend/railway.toml`**
```toml
[build]
buildCommand = "npm run build"
```

**Key Points:**
- Simple build command for Vite
- Railway handles the rest automatically

## Issues Encountered and Solutions

### Issue 1: `npm ci` Lock File Sync Errors

**Error:**
```
npm error Missing: hono@4.11.8 from lock file
npm error Missing: express@5.2.1 from lock file
npm error Missing: acorn@8.15.0 from lock file
```

**Root Cause:**
Railway was using `npm ci` by default, which is stricter and requires perfect sync between `package.json` and `package-lock.json`. The lock file had transitive dependencies that weren't perfectly aligned.

**Solution:**
1. Added `buildCommand = "npm install"` to `backend/railway.toml` to override Railway's default `npm ci` behavior
2. Regenerated `package-lock.json` locally to ensure it's clean:
   ```bash
   cd backend
   rm -rf node_modules package-lock.json
   npm install
   git add package-lock.json
   git commit -m "Update package-lock.json"
   git push
   ```

### Issue 2: TOML Schema Parsing Error

**Error:**
```
Failed to parse TOML file backend/railway.toml: (1, 1): parsing error: keys cannot contain $ character
```

**Root Cause:**
Railway's TOML parser doesn't support the `$schema` key that some editors add for autocomplete.

**Solution:**
Removed the `$schema` line from both `backend/railway.toml` and `frontend/railway.toml`.

### Issue 3: GitHub Push Protection (Secrets in `.env.example`)

**Error:**
```
Push cannot contain secrets
```

**Root Cause:**
`.env.example` contained actual API keys and tokens instead of placeholders.

**Solution:**
Replaced all actual secrets in `backend/.env.example` with generic placeholders:
```env
OPENAI_API_KEY=sk-your-openai-api-key-here
FIREBASE_SERVICE_ACCOUNT_BASE64=your-base64-encoded-service-account-json-here
TWILIO_BUSINESS_business-1={"accountSid":"AC...","authToken":"...","phoneNumber":"+..."}
```

### Issue 4: Nixpacks Configuration Syntax Error

**Error:**
```
error: undefined variable 'nodejs-20_x'
```

**Root Cause:**
Attempted to create a custom `nixpacks.toml` with incorrect syntax for specifying Node.js version.

**Solution:**
Removed `nixpacks.toml` entirely and relied on:
- `.nvmrc` file for Node version specification
- Railway's auto-detection capabilities
- `railway.toml` for build command override

## Step-by-Step Deployment Process

### Prerequisites

1. **Railway Account**: Sign up at https://railway.app
2. **Railway CLI**: Install via `brew install railway` (macOS) or see [Railway docs](https://docs.railway.app/develop/cli)
3. **GitHub Repository**: Code must be pushed to GitHub
4. **Environment Variables**: Have all required values ready

### 1. Initial Setup

#### Backend Service

```bash
cd backend
railway login
railway init
# Select: Create new project
# Project name: awake-cat (or your choice)
```

#### Frontend Service

```bash
cd frontend
railway init
# Select: Create new project  
# Project name: incredible-flow (or your choice)
```

### 2. Configure Root Directories

**Critical Step:** Railway needs to know where each service's code is located.

1. Go to Railway dashboard: https://railway.com
2. For each service:
   - Click on the service
   - Go to **Settings** → **Source**
   - Set **Root Directory**:
     - Backend: `backend`
     - Frontend: `frontend`
   - Click **Save**

### 3. Set Environment Variables

#### Backend Environment Variables

Go to backend service → **Variables** tab:

| Variable | Description | Example |
|----------|-------------|---------|
| `OPENAI_API_KEY` | Your OpenAI API key | `sk-...` |
| `FIREBASE_SERVICE_ACCOUNT_BASE64` | Base64 encoded Firebase service account JSON | Get from local `.env` |
| `PUBLIC_URL` | Your Railway backend URL | `https://awake-cat-production-15ef.up.railway.app` |
| `PORT` | Server port (optional, Railway sets this) | `5050` |
| `TWILIO_BUSINESS_<ID>` | Twilio config for premium businesses (optional) | JSON object |

**Via CLI:**
```bash
cd backend
railway variables set OPENAI_API_KEY=sk-your-key-here
railway variables set FIREBASE_SERVICE_ACCOUNT_BASE64=your-base64-string
railway variables set PUBLIC_URL=$(railway domain)
```

#### Frontend Environment Variables

Go to frontend service → **Variables** tab:

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_FIREBASE_API_KEY` | Firebase web API key | From Firebase Console |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | `studio-5771582587-5ae19.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID | `studio-5771582587-5ae19` |
| `VITE_FIREBASE_APP_ID` | Firebase app ID | `1:767449505901:web:a81ed5939980ebb673df64` |
| `VITE_BACKEND_URL` | Backend Railway URL | `https://awake-cat-production-15ef.up.railway.app` |

**Via CLI:**
```bash
cd frontend
railway variables set VITE_FIREBASE_API_KEY=your-key
railway variables set VITE_FIREBASE_AUTH_DOMAIN=studio-5771582587-5ae19.firebaseapp.com
railway variables set VITE_FIREBASE_PROJECT_ID=studio-5771582587-5ae19
railway variables set VITE_FIREBASE_APP_ID=1:767449505901:web:a81ed5939980ebb673df64
railway variables set VITE_BACKEND_URL=$(cd ../backend && railway domain)
```

### 4. Connect to GitHub

1. In Railway dashboard, go to your project
2. Click **Settings** → **Connect GitHub**
3. Select your repository
4. Railway will automatically deploy on every push to `main`

### 5. Deploy

Railway will automatically deploy when you push to GitHub. To trigger manually:

```bash
# Backend
cd backend
git push origin main

# Frontend  
cd frontend
git push origin main
```

Or use Railway CLI:
```bash
cd backend
railway up

cd ../frontend
railway up
```

### 6. Get Your URLs

**Via Dashboard:**
- Go to each service in Railway dashboard
- Click **Settings** → **Domains**
- Your URL will be shown (e.g., `https://awake-cat-production-15ef.up.railway.app`)

**Via CLI:**
```bash
cd backend
railway domain

cd ../frontend
railway domain
```

### 7. Update Twilio Webhook

Once you have your backend URL:

1. Go to [Twilio Console → Phone Numbers](https://console.twilio.com/us1/develop/phone-numbers/manage/incoming)
2. Click on your phone number
3. Under **"A CALL COMES IN"**, set:
   - **Webhook URL**: `https://your-backend-url.up.railway.app/voice?businessId=business-1`
   - **HTTP Method**: `POST`
4. Click **Save**

### 8. Update PUBLIC_URL (if needed)

After deployment, ensure `PUBLIC_URL` matches your actual backend URL:

```bash
cd backend
railway variables set PUBLIC_URL=$(railway domain)
```

## Verification Checklist

- [ ] Both services show "Deployed" status in Railway dashboard
- [ ] Backend logs show server starting successfully
- [ ] Frontend logs show build completing successfully
- [ ] Backend URL is accessible (should return 404 or API response)
- [ ] Frontend URL loads the application
- [ ] Environment variables are set correctly
- [ ] Twilio webhook URL is updated
- [ ] `PUBLIC_URL` matches backend URL

## Troubleshooting

### Build Fails with `npm ci` Errors

**Solution:** Ensure `backend/railway.toml` has `buildCommand = "npm install"` and commit a clean `package-lock.json`.

### Service Not Found / Wrong Root Directory

**Solution:** Check Railway dashboard → Settings → Source → Root Directory is set correctly.

### Environment Variables Not Working

**Solution:** 
- Verify variables are set in Railway dashboard (not just locally)
- For frontend, ensure variables start with `VITE_` prefix
- Restart deployment after adding variables

### Deployment Stuck / Not Triggering

**Solution:**
- Check GitHub connection in Railway Settings
- Verify you're pushing to the correct branch (`main`)
- Manually trigger via Railway dashboard → Deployments → Redeploy

## Current Deployment URLs

- **Backend**: https://awake-cat-production-15ef.up.railway.app
- **Frontend**: https://incredible-flow-production-8ebb.up.railway.app

## Key Learnings

1. **Use `npm install` instead of `npm ci`** for Railway builds to avoid strict lock file sync issues
2. **Always set Root Directory** in Railway settings for monorepo/multi-service projects
3. **Remove `$schema` from `railway.toml`** - Railway's TOML parser doesn't support it
4. **Never commit secrets** - Use placeholders in `.env.example`
5. **Railway auto-detects Node version** from `.nvmrc` - no need for custom nixpacks config
6. **Frontend env vars must start with `VITE_`** for Vite to expose them to the client

## Next Steps

- Monitor logs in Railway dashboard for any runtime errors
- Set up custom domains if needed
- Configure auto-scaling if traffic increases
- Set up monitoring/alerting for production

