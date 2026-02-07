# Frontend Setup Complete! 🎉

## ✅ What's Been Configured

1. **Dependencies Installed** - All npm packages are installed
2. **Firebase Web App Configuration** - `.env` file created with:
   - Project ID: `studio-5771582587-5ae19`
   - Auth Domain: `studio-5771582587-5ae19.firebaseapp.com`
   - API Key and App ID configured

## 🚀 Running the Frontend

Start the development server:

```bash
cd frontend
npm run dev
```

The app will be available at `http://localhost:5173` (or the port Vite assigns).

## ⚠️ Important: Firebase Authentication Setup

Before you can use the frontend, you need to:

### 1. Enable Firebase Authentication

1. Go to [Firebase Console](https://console.firebase.google.com/project/studio-5771582587-5ae19/authentication)
2. Click **"Get started"** if you haven't enabled it yet
3. Enable **"Email/Password"** sign-in method:
   - Click on "Email/Password"
   - Toggle "Enable" to ON
   - Click "Save"

### 2. Set Up Custom Claims (businessId)

The app requires users to have a `businessId` custom claim in their authentication token. You can set this up in several ways:

**Option A: Using Firebase Admin SDK (Recommended)**

Create a script to set custom claims when users sign up or manually:

```javascript
// Example: Set businessId claim for a user
const admin = require('firebase-admin');
admin.auth().setCustomUserClaims(uid, { businessId: 'your-business-id' });
```

**Option B: Using Firebase Console (Manual)**

1. Go to Authentication > Users
2. For each user, you'll need to set custom claims programmatically (not available in console UI)

**Option C: Create a Cloud Function**

Set up a Cloud Function that automatically assigns businessId when users sign up.

### 3. Create Test Users

1. Go to [Firebase Console > Authentication](https://console.firebase.google.com/project/studio-5771582587-5ae19/authentication/users)
2. Click **"Add user"**
3. Enter email and password
4. Set the `businessId` custom claim using the Admin SDK

## 📱 Frontend Features

The frontend includes:
- **Login Page** - Firebase Authentication
- **Calls** - View and manage phone calls
- **Schedule** - View appointments
- **Services** - Manage business services
- **Settings** - Configure Twilio integration (for premium users)

## 🔗 Next Steps

1. Enable Firebase Authentication (see above)
2. Create test users with businessId claims
3. Start the frontend: `npm run dev`
4. Log in and test the application

## 🛠️ Troubleshooting

- **"businessId is null"** - User needs custom claims set (see above)
- **Authentication errors** - Make sure Email/Password is enabled
- **Firestore permission errors** - Check Firestore security rules are deployed

