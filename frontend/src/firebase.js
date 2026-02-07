import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration pulled from environment variables.  See `.env.example`.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialise Firebase
const firebaseApp = initializeApp(firebaseConfig);

// Export commonly used Firebase services
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);