# Railway Deployment Guide

## Overview

Railway provides a permanent public URL with excellent WebSocket support, making it perfect for the Twilio integration.

## Prerequisites

1. Railway account (sign up at https://railway.app - free tier available)
2. Railway CLI installed
3. Git repository (optional, but recommended)

## Deployment Steps

### 1. Install Railway CLI

```bash
brew install railway
```

### 2. Login to Railway

```bash
railway login
```

This will open your browser to authenticate.

### 3. Initialize Railway Project

```bash
cd backend
railway init
```

This will:
- Create a new Railway project (or link to existing)
- Set up the deployment configuration

### 4. Set Environment Variables

Set all your environment variables in Railway:

```bash
railway variables set OPENAI_API_KEY=your-key-here
railway variables set FIREBASE_SERVICE_ACCOUNT_BASE64=your-base64-string
railway variables set PUBLIC_URL=$(railway domain)
railway variables set PORT=5050
```

Or set them via Railway dashboard:
1. Go to your project on Railway
2. Click on your service
3. Go to "Variables" tab
4. Add all environment variables from your `.env` file

### 5. Deploy Backend

```bash
cd backend
railway up
```

This will:
- Build your application
- Deploy it to Railway
- Give you a public URL

### 6. Get Your Public URL

After deployment:

```bash
railway domain
```

Or check in the Railway dashboard. The URL will be something like:
`https://your-app.up.railway.app`

### 7. Update Twilio Webhook

Update your Twilio webhook URL to:
```
https://your-app.up.railway.app/voice?businessId=business-1
```

### 8. Set PUBLIC_URL Environment Variable

```bash
railway variables set PUBLIC_URL=https://your-app.up.railway.app
```

Or get it automatically:
```bash
railway variables set PUBLIC_URL=$(railway domain)
```

## Environment Variables Needed

Make sure to set these in Railway:

- `OPENAI_API_KEY` - Your OpenAI API key
- `FIREBASE_SERVICE_ACCOUNT_BASE64` - Base64 encoded Firebase service account
- `PUBLIC_URL` - Your Railway public URL (set automatically or manually)
- `PORT` - Port number (Railway sets this automatically, but 5050 is default)
- `TWILIO_BUSINESS_<BUSINESS_ID>` - Twilio credentials for premium businesses

## Frontend Deployment (Optional)

You can also deploy the frontend to Railway:

```bash
cd frontend
railway init
railway up
```

Then set frontend environment variables:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_BACKEND_URL` - Your backend Railway URL

## Benefits of Railway

✅ Permanent public URL (no need to restart ngrok)
✅ Excellent WebSocket support
✅ Automatic HTTPS
✅ Easy environment variable management
✅ Free tier available
✅ Automatic deployments from Git

## Troubleshooting

- **WebSocket not working**: Make sure `PUBLIC_URL` is set correctly
- **Environment variables not loading**: Check Railway dashboard Variables tab
- **Build fails**: Check Railway logs in dashboard

## Next Steps After Deployment

1. Test the webhook: `curl https://your-app.up.railway.app/voice?businessId=test`
2. Update Twilio webhook URL
3. Test a call
4. Check logs in Railway dashboard

