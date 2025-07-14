// src/lib/firebase.ts
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";

// IMPORTANT: These values are now hardcoded to prevent deployment issues.
const firebaseConfig = {
  apiKey: "AIzaSyABMKmDj6KR8Xc2Lno8H_eiRH6PwHYqoo8",
  authDomain: "custech-drugverify.firebaseapp.com",
  projectId: "custech-drugverify",
  storageBucket: "custech-drugverify.appspot.com",
  messagingSenderId: "1020634177452",
  appId: "1:1020634177452:web:e1a5fc7b7e3510c3a06409"
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

// This function ensures we initialize app only once, which is crucial for serverless environments and HMR.
function initializeFirebaseServices() {
    if (!getApps().length) {
        app = initializeApp(firebaseConfig);
    } else {
        app = getApp();
    }
    auth = getAuth(app);
    db = getFirestore(app);
}

initializeFirebaseServices();


export function getDb(): Firestore {
  if (!db) {
    initializeFirebaseServices();
  }
  return db;
}

export function getAuthInstance(): Auth {
  if (!auth) {
    initializeFirebaseServices();
  }
  return auth;
}
