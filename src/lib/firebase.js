import { getApps, initializeApp } from "firebase/app";
import { ReCaptchaEnterpriseProvider, initializeAppCheck } from "firebase/app-check";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const missingConfig = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

export const isFirebaseConfigured = missingConfig.length === 0;

const firebaseApp = isFirebaseConfigured
  ? getApps()[0] ?? initializeApp(firebaseConfig)
  : null;

if (firebaseApp && import.meta.env.VITE_FIREBASE_APP_CHECK_SITE_KEY && typeof window !== "undefined") {
  initializeAppCheck(firebaseApp, {
    provider: new ReCaptchaEnterpriseProvider(import.meta.env.VITE_FIREBASE_APP_CHECK_SITE_KEY),
    isTokenAutoRefreshEnabled: true,
  });
}

export const auth = firebaseApp ? getAuth(firebaseApp) : null;
export const db = firebaseApp ? getFirestore(firebaseApp) : null;
export const functions = firebaseApp ? getFunctions(firebaseApp, "asia-south1") : null;
