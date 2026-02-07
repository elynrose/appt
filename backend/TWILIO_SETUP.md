# Twilio Setup Guide

## Overview

This app supports two Twilio integration modes:

1. **Basic Plan** - Uses a shared Twilio number (configured by admin)
2. **Premium Plan** - Uses your own Twilio account and phone number

## For Premium Users

### Step 1: Get Your Twilio Credentials

1. Sign up for a [Twilio account](https://www.twilio.com/try-twilio) (free trial available)
2. Go to [Twilio Console Dashboard](https://console.twilio.com/)
3. Find your credentials:
   - **Account SID**: Found on the dashboard (starts with `AC`)
   - **Auth Token**: Click "Show" next to Auth Token (keep this secret!)
   - **Phone Number**: Go to Phone Numbers > Manage > Active numbers

### Step 2: Validate Credentials in App

1. Log into the app
2. Go to Settings page
3. Enter your Twilio credentials:
   - Account SID
   - Auth Token
   - Phone Number (in E.164 format, e.g., `+15551234567`)
4. Click "Validate"
5. If validation succeeds, proceed to Step 3

### Step 3: Add Credentials to Backend .env

After validation, add your credentials to the backend `.env` file:

```bash
TWILIO_BUSINESS_<YOUR_BUSINESS_ID>={"accountSid":"AC...","authToken":"...","phoneNumber":"+15551234567"}
```

Replace `<YOUR_BUSINESS_ID>` with your actual business ID (e.g., `business-1`).

**Example:**
```env
TWILIO_BUSINESS_business-1={"accountSid":"AC1234567890abcdef","authToken":"your_auth_token_here","phoneNumber":"+15551234567"}
```

You can use the helper script:
```bash
cd backend
node add-twilio-credentials.js <business-id> <account-sid> <auth-token> <phone-number>
```

### Step 4: Configure Twilio Webhook

1. Go to [Twilio Console > Phone Numbers](https://console.twilio.com/us1/develop/phone-numbers/manage/incoming)
2. Click on your phone number
3. Scroll to "Voice & Fax" section
4. Under "A CALL COMES IN", set the webhook URL:
   - **For Premium**: `https://your-ngrok-url.ngrok-free.dev/voice?businessId=YOUR_BUSINESS_ID`
   - Replace `YOUR_BUSINESS_ID` with your actual business ID
5. Set HTTP method to `POST` (or `HTTP POST`)
6. Click "Save"

### Step 5: Restart Backend

After adding credentials to `.env`, restart your backend server:

```bash
cd backend
npm run dev
```

## For Basic Plan Users

1. Contact admin to get assigned a phone number
2. Admin will create a mapping in Firestore: `/phoneRoutes/{phoneNumber}` → `{businessId: "your-business-id"}`
3. No additional setup needed - calls will be automatically routed

## Testing

1. Call your Twilio phone number
2. You should hear: "Thank you for calling. Please wait while I connect you to our scheduling assistant."
3. The AI agent will answer and help schedule appointments

## Troubleshooting

- **"Phone number not found in account"** - Make sure the phone number is in E.164 format and belongs to your Twilio account
- **"Unable to verify credentials"** - Check that Account SID and Auth Token are correct
- **Webhook not receiving calls** - Verify the ngrok URL is correct and the backend is running
- **Calls not connecting** - Check that OpenAI API key is set in backend `.env`

## Security Notes

- Never commit `.env` file to git
- Auth Token is sensitive - keep it secret
- Credentials are stored in environment variables, not in the database
- Each premium business has its own isolated credentials

