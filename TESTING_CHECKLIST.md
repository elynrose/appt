# Pre-Testing Checklist

Use this checklist to verify everything is ready before testing the deployed application.

## ✅ Backend Verification

### 1. Backend is Deployed and Running
- [ ] Go to Railway dashboard → Backend service
- [ ] Status shows "Deployed" (green)
- [ ] Check logs for any errors
- [ ] Backend URL is accessible: `https://awake-cat-production-15ef.up.railway.app`

**Test Backend Health:**
```bash
curl https://awake-cat-production-15ef.up.railway.app
# Should return 404 (expected - no root route) or check logs
```

### 2. Backend Environment Variables Set

Go to Railway dashboard → Backend service → Variables tab:

- [ ] `OPENAI_API_KEY` - Set and valid
- [ ] `FIREBASE_SERVICE_ACCOUNT_BASE64` - Set and valid
- [ ] `PUBLIC_URL` - Set to backend Railway URL
- [ ] `PORT` - Set to 5050 (optional, Railway auto-sets)

**Verify via CLI:**
```bash
cd backend
railway variables
```

### 3. Backend Configuration Files

- [ ] `backend/railway.toml` exists with `buildCommand = "npm install"`
- [ ] `backend/.nvmrc` exists with `20`
- [ ] `backend/package.json` has correct start script

## ✅ Frontend Verification

### 4. Frontend is Deployed and Running
- [ ] Go to Railway dashboard → Frontend service
- [ ] Status shows "Deployed" (green)
- [ ] Check logs - should show successful build
- [ ] Frontend URL is accessible: `https://incredible-flow-production-8ebb.up.railway.app`

**Test Frontend:**
```bash
curl https://incredible-flow-production-8ebb.up.railway.app
# Should return HTML (the React app)
```

### 5. Frontend Environment Variables Set

Go to Railway dashboard → Frontend service → Variables tab:

- [ ] `VITE_FIREBASE_API_KEY` - Set
- [ ] `VITE_FIREBASE_AUTH_DOMAIN` - Set to `studio-5771582587-5ae19.firebaseapp.com`
- [ ] `VITE_FIREBASE_PROJECT_ID` - Set to `studio-5771582587-5ae19`
- [ ] `VITE_FIREBASE_APP_ID` - Set
- [ ] `VITE_BACKEND_URL` - Set to backend Railway URL

**Verify via CLI:**
```bash
cd frontend
railway variables
```

### 6. Frontend Configuration Files

- [ ] `frontend/railway.toml` exists with `buildCommand = "npm run build"`
- [ ] Frontend builds successfully (check Railway logs)

## ✅ Firebase Setup

### 7. Firebase Configuration
- [ ] Firebase project is active: `studio-5771582587-5ae19`
- [ ] Authentication is enabled (Google + Email)
- [ ] Firestore rules are deployed
- [ ] Service account has proper permissions

**Test Firebase Connection:**
```bash
cd backend
node check-setup.js
# Should show all checks passing
```

## ✅ Twilio Setup (for Premium Users)

### 8. Twilio Webhook Configuration
- [ ] Go to [Twilio Console → Phone Numbers](https://console.twilio.com/us1/develop/phone-numbers/manage/incoming)
- [ ] Click on your phone number
- [ ] Under "A CALL COMES IN", webhook URL is set to:
  ```
  https://awake-cat-production-15ef.up.railway.app/voice?businessId=business-1
  ```
- [ ] HTTP method is set to `POST`
- [ ] Click "Save"

### 9. Twilio Credentials (if using Premium plan)
- [ ] `TWILIO_BUSINESS_<BUSINESS_ID>` variable is set in Railway backend
- [ ] Credentials are valid JSON format
- [ ] Phone number is correct

**Test Twilio Credentials:**
```bash
cd backend
node add-twilio-credentials.js business-1
# Should validate successfully
```

## ✅ User Setup

### 10. User Authentication
- [ ] User account exists in Firebase Authentication
- [ ] User has `businessId` custom claim set
- [ ] Business document exists in Firestore: `/businesses/{businessId}`

**Check User Claims:**
```bash
cd backend
node set-user-claims.js your-email@example.com business-1
```

**Check Business Document:**
```bash
cd backend
node create-business.js business-1 basic America/New_York
```

## 🧪 Testing Steps

Once all checkboxes above are complete, proceed with testing:

### Test 1: Frontend Access
1. Open frontend URL in browser: `https://incredible-flow-production-8ebb.up.railway.app`
2. Should see login page
3. No console errors

### Test 2: User Login
1. Click "Continue with Google"
2. Sign in with Firebase-authenticated account
3. Should redirect to dashboard (or onboarding if no businessId)

### Test 3: Onboarding (if needed)
1. If redirected to onboarding, fill out form:
   - Business name
   - Timezone
   - Plan (basic or premium)
2. Submit form
3. Should redirect to dashboard

### Test 4: Dashboard Access
1. Should see calls/appointments interface
2. Can navigate between pages
3. No errors in browser console

### Test 5: Backend API (if accessible)
```bash
# Test onboarding endpoint
curl -X POST https://awake-cat-production-15ef.up.railway.app/onboarding \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ID_TOKEN" \
  -d '{"businessName":"Test","timezone":"America/New_York","plan":"basic"}'
```

### Test 6: Twilio Call (Premium Users)
1. Call your Twilio phone number
2. Should connect to OpenAI agent
3. Check backend logs for:
   - Voice webhook received
   - WebSocket connection opened
   - Agent interaction logs

## 🚨 Common Issues to Check

### Backend Issues
- **404 on all routes**: Check `PUBLIC_URL` is set correctly
- **500 errors**: Check environment variables, especially Firebase credentials
- **WebSocket fails**: Check `PUBLIC_URL` uses `https://` (not `http://`)

### Frontend Issues
- **Blank page**: Check browser console for errors
- **Firebase auth fails**: Verify all `VITE_FIREBASE_*` variables are set
- **API calls fail**: Check `VITE_BACKEND_URL` is correct

### Twilio Issues
- **"Application error"**: Check backend logs, verify webhook URL is correct
- **No WebSocket connection**: Verify `PUBLIC_URL` is set and uses HTTPS
- **Call doesn't connect**: Check Twilio credentials are valid

## Quick Verification Commands

```bash
# Check backend health
curl -I https://awake-cat-production-15ef.up.railway.app

# Check frontend
curl -I https://incredible-flow-production-8ebb.up.railway.app

# Check backend setup
cd backend
railway run node check-setup.js

# View backend logs
cd backend
railway logs

# View frontend logs
cd frontend
railway logs
```

## Ready to Test? ✅

Once all items above are checked, you're ready to test! Start with Test 1 and work through each test sequentially.

