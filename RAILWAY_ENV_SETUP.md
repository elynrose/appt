# Railway Environment Variables Setup

## Backend Environment Variables

Go to: https://railway.com/project/5518da0f-8de5-4191-ab0c-912fe4d35c55

Set these variables in the Railway dashboard (Variables tab):

### Required Variables:

1. **OPENAI_API_KEY**
   ```
   sk-...
   ```

2. **FIREBASE_SERVICE_ACCOUNT_BASE64**
   ```
   (Your base64 encoded Firebase service account JSON)
   ```
   Get this from your local `.env` file

3. **PUBLIC_URL** (Already set via CLI)
   ```
   https://awake-cat-production-15ef.up.railway.app
   ```

4. **PORT** (Optional - Railway sets this automatically)
   ```
   5050
   ```

### Optional (for Premium Twilio users):

5. **TWILIO_BUSINESS_<BUSINESS_ID>**
   ```
   {"accountSid":"AC...","authToken":"...","phoneNumber":"+15551234567"}
   ```

## Frontend Environment Variables

Go to: https://railway.com/project/51de7b51-98b9-47b3-8ae1-f6f9022e13d2

Set these variables in the Railway dashboard (Variables tab):

1. **VITE_FIREBASE_API_KEY**
   ```
   (From your local frontend/.env)
   ```

2. **VITE_FIREBASE_AUTH_DOMAIN**
   ```
   studio-5771582587-5ae19.firebaseapp.com
   ```

3. **VITE_FIREBASE_PROJECT_ID**
   ```
   studio-5771582587-5ae19
   ```

4. **VITE_FIREBASE_APP_ID**
   ```
   1:767449505901:web:a81ed5939980ebb673df64
   ```

5. **VITE_BACKEND_URL** (Already set via CLI)
   ```
   https://awake-cat-production-15ef.up.railway.app
   ```

## Quick Setup via CLI

### Backend:
```bash
cd backend
railway variables set OPENAI_API_KEY=your-key-here
railway variables set FIREBASE_SERVICE_ACCOUNT_BASE64=your-base64-here
```

### Frontend:
```bash
cd frontend
railway variables set VITE_FIREBASE_API_KEY=your-key
railway variables set VITE_FIREBASE_AUTH_DOMAIN=studio-5771582587-5ae19.firebaseapp.com
railway variables set VITE_FIREBASE_PROJECT_ID=studio-5771582587-5ae19
railway variables set VITE_FIREBASE_APP_ID=1:767449505901:web:a81ed5939980ebb673df64
```

## URLs

- **Backend**: https://awake-cat-production-15ef.up.railway.app
- **Frontend**: https://incredible-flow-production-8ebb.up.railway.app

## Next Steps

1. Set all environment variables (see above)
2. Wait for deployments to complete
3. Update Twilio webhook URL to:
   ```
   https://awake-cat-production-15ef.up.railway.app/voice?businessId=business-1
   ```
4. Test the deployment!

