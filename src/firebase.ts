import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import fallbackConfig from '../firebase-applet-config.json';

// Initialise Firebase strictly from Vite environment variables:
// VITE_FB_API_KEY, VITE_FB_AUTH_DOMAIN, VITE_FB_PROJECT_ID,
// VITE_FB_STORAGE_BUCKET, VITE_FB_MESSAGING_SENDER_ID, VITE_FB_APP_ID
// Falls back to applet config for preview execution without hardcoding keys.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FB_API_KEY || fallbackConfig.apiKey,
  authDomain: import.meta.env.VITE_FB_AUTH_DOMAIN || fallbackConfig.authDomain,
  projectId: import.meta.env.VITE_FB_PROJECT_ID || fallbackConfig.projectId || 'durgapurfix-1935c',
  storageBucket: import.meta.env.VITE_FB_STORAGE_BUCKET || fallbackConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FB_MESSAGING_SENDER_ID || fallbackConfig.messagingSenderId,
  appId: import.meta.env.VITE_FB_APP_ID || fallbackConfig.appId,
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
