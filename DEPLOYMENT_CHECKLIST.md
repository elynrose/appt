# Deployment Checklist

## ✅ Completed
- [x] Code pushed to GitHub
- [x] Railway projects created
- [x] Railway connected to GitHub

## 🔄 Next Steps

### 1. Set Environment Variables

#### Backend (https://railway.com/project/5518da0f-8de5-4191-ab0c-912fe4d35c55)
Go to your service → Variables tab → Add:

- `OPENAI_API_KEY` = (from your local .env)
- `FIREBASE_SERVICE_ACCOUNT_BASE64` = (from your local .env)
- `PUBLIC_URL` = (your Railway backend URL - will be shown after deployment)
- `PORT` = 5050 (optional, Railway sets this automatically)

#### Frontend (https://railway.com/project/51de7b51-98b9-47b3-8ae1-f6f9022e13d2)
Go to your service → Variables tab → Add:

- `VITE_FIREBASE_API_KEY` = (from your local frontend/.env)
- `VITE_FIREBASE_AUTH_DOMAIN` = `studio-5771582587-5ae19.firebaseapp.com`
- `VITE_FIREBASE_PROJECT_ID` = `studio-5771582587-5ae19`
- `VITE_FIREBASE_APP_ID` = `1:767449505901:web:a81ed5939980ebb673df64`
- `VITE_BACKEND_URL` = (your Railway backend URL)

### 2. Wait for Deployments

- Check Railway dashboard for deployment status
- Wait for both services to show "Deployed" status
- Check logs if there are any errors

### 3. Get Your URLs

After deployment completes:
- Backend URL: Check Railway dashboard or run `railway domain` in backend directory
- Frontend URL: Check Railway dashboard or run `railway domain` in frontend directory

### 4. Update Twilio Webhook

Once you have your backend URL, update Twilio webhook:
1. Go to [Twilio Console → Phone Numbers](https://console.twilio.com/us1/develop/phone-numbers/manage/incoming)
2. Click on your phone number
3. Under "A CALL COMES IN", set webhook URL to:
   ```
   https://your-backend-url.up.railway.app/voice?businessId=business-1
   ```
4. Set HTTP method to `POST`
5. Click "Save"

### 5. Update PUBLIC_URL

After getting your backend URL, set it in Railway:
- Go to backend service → Variables
- Set `PUBLIC_URL` = `https://your-backend-url.up.railway.app`

### 6. Test

1. **Test Backend:**
   ```bash
   curl https://your-backend-url.up.railway.app/voice?businessId=test
   ```
   Should return TwiML

2. **Test Frontend:**
   Open `https://your-frontend-url.up.railway.app` in browser

3. **Test Twilio Call:**
   Call your Twilio number and verify it connects

## Troubleshooting

- **Deployment fails**: Check Railway logs in dashboard
- **Environment variables not loading**: Make sure they're set in Railway Variables tab
- **WebSocket not working**: Verify `PUBLIC_URL` is set correctly
- **Frontend can't reach backend**: Check `VITE_BACKEND_URL` is set correctly

## Railway Dashboard Links

- **Backend Project**: https://railway.com/project/5518da0f-8de5-4191-ab0c-912fe4d35c55
- **Frontend Project**: https://railway.com/project/51de7b51-98b9-47b3-8ae1-f6f9022e13d2

