// src/lib/firebase.ts
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";

// These values are now read from environment variables for security and flexibility.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Basic validation to ensure environment variables are loaded, especially in a deployed environment.
if (process.env.NODE_ENV === 'production' && !firebaseConfig.apiKey) {
    console.error("Firebase config is missing. Make sure to set NEXT_PUBLIC_FIREBASE_... environment variables in your hosting provider (e.g., Vercel).");
}

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

// This function ensures we initialize app only once, which is crucial for serverless environments and HMR.
function initializeFirebaseServices() {
    if (!getApps().length) {
        // Only initialize if the config has the necessary key.
        if (firebaseConfig.apiKey) {
           app = initializeApp(firebaseConfig);
        } else {
           // In a production environment, this will prevent the app from crashing with an obscure error.
           console.error("Firebase App initialization failed: Missing API Key. Please check your environment variables.");
           // We can't proceed, so we'll have to return dummy/null objects or throw.
           // To prevent a hard crash, we'll let getDb and getAuthInstance handle the uninitialized state.
           return;
        }
    } else {
        app = getApp();
    }
    auth = getAuth(app);
    db = getFirestore(app);
}

initializeFirebaseServices();


export function getDb(): Firestore {
  if (!db) {
    // This might happen if initialization failed.
    if (process.env.NODE_ENV === 'production') {
        console.error("Firestore is not available. Initialization failed.");
        // Returning a dummy object to prevent app crash, though features will fail.
        return {} as Firestore;
    }
    initializeFirebaseServices();
  }
  return db;
}

export function getAuthInstance(): Auth {
  if (!auth) {
     // This might happen if initialization failed.
     if (process.env.NODE_ENV === 'production') {
        console.error("Firebase Auth is not available. Initialization failed.");
        // Returning a dummy object to prevent app crash, though features will fail.
        return {} as Auth;
     }
    initializeFirebaseServices();
  }
  return auth;
}
