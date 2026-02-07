# Firebase Project Setup Guide

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter a project name (e.g., "agentic-appointment-app")
4. (Optional) Enable Google Analytics if desired
5. Click **"Create project"**
6. Wait for the project to be created, then click **"Continue"**

## Step 2: Enable Firestore Database

1. In the Firebase Console, click on **"Firestore Database"** in the left sidebar
2. Click **"Create database"**
3. Choose **"Start in test mode"** (for development) or **"Start in production mode"** (for production with security rules)
4. Select a location for your database (choose the closest to your users)
5. Click **"Enable"**

## Step 3: Create a Service Account

1. In the Firebase Console, click the **gear icon** (⚙️) next to "Project Overview"
2. Select **"Project settings"**
3. Go to the **"Service accounts"** tab
4. Click **"Generate new private key"**
5. A dialog will appear - click **"Generate key"**
6. A JSON file will be downloaded (e.g., `your-project-firebase-adminsdk-xxxxx.json`)

## Step 4: Set Up Firestore Security Rules (Important!)

1. Go to **Firestore Database** → **Rules**
2. For development, you can use these basic rules (update for production):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their business data
    match /businesses/{businessId} {
      allow read, write: if request.auth != null && 
        request.auth.token.businessId == businessId;
      
      match /calls/{callId} {
        allow read, write: if request.auth != null && 
          request.auth.token.businessId == businessId;
      }
      
      match /appointments/{appointmentId} {
        allow read, write: if request.auth != null && 
          request.auth.token.businessId == businessId;
      }
    }
    
    // Allow read access to phone routes (for basic plan routing)
    match /phoneRoutes/{phoneNumber} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## Step 5: Enable Firebase Authentication

1. In the Firebase Console, click on **"Authentication"** in the left sidebar
2. Click **"Get started"**
3. Enable **"Email/Password"** sign-in method:
   - Click on "Email/Password"
   - Toggle "Enable" to ON
   - Click "Save"

## Step 6: Configure Firebase for Frontend

1. In Firebase Console, go to **Project settings** (gear icon)
2. Scroll down to **"Your apps"** section
3. Click the **Web icon** (`</>`) to add a web app
4. Register your app with a nickname (e.g., "Agentic Appointment App")
5. Copy the Firebase configuration values:
   - `apiKey`
   - `authDomain`
   - `projectId`
   - `appId`
6. These will be used in your frontend `.env` file

## Step 7: Set Up Custom Claims (for businessId)

You'll need to set custom claims on user accounts to associate them with a businessId. This typically requires:
- A Cloud Function or Admin SDK script
- Or manual setup through the Firebase Console

For now, you can test by manually setting claims or using the Admin SDK in your backend.

## Step 8: Convert Service Account JSON to Base64

Once you have the service account JSON file, use the provided script to convert it to base64:

```bash
node encode-service-account.js path/to/your-service-account-key.json
```

Or manually:
```bash
base64 -i your-service-account-key.json | tr -d '\n'
```

Then add the output to your `.env` file as `FIREBASE_SERVICE_ACCOUNT_BASE64`.

