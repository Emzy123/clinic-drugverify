// src/lib/firebase-admin.ts
import admin from 'firebase-admin';
import type { App as AdminApp, ServiceAccount } from 'firebase-admin/app';
import { getAuth as getAdminAuth, Auth as AdminAuth } from 'firebase-admin/auth';
import { getFirestore as getAdminFirestore, Firestore as AdminFirestore } from 'firebase-admin/firestore';

// This is the recommended pattern for initializing Firebase Admin in a serverless environment like Vercel.
// It ensures that we only initialize the app once, preventing resource leaks and errors.

let adminApp: AdminApp;
let adminAuth: AdminAuth;
let adminDb: AdminFirestore;

// The JSON string is parsed to a ServiceAccount object.
function getServiceAccount(): ServiceAccount {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!serviceAccountJson) {
        throw new Error("Firebase initialization failed: The FIREBASE_SERVICE_ACCOUNT_JSON environment variable is not set. The application cannot start.");
    }
    try {
        return JSON.parse(serviceAccountJson);
    } catch (error: any) {
        console.error("CRITICAL: Firebase Admin initialization failed. Could not parse service account JSON.", error.message);
        throw new Error("Firebase Admin initialization failed due to malformed service account JSON.");
    }
}

if (!admin.apps.length) {
    try {
        adminApp = admin.initializeApp({
            credential: admin.credential.cert(getServiceAccount()),
        });
        adminAuth = getAdminAuth(adminApp);
        adminDb = getAdminFirestore(adminApp);
        console.log("Firebase Admin SDK initialized successfully.");
    } catch (e) {
        console.error("Firebase Admin SDK initialization error", e);
    }
} else {
    adminApp = admin.app();
    adminAuth = getAdminAuth(adminApp);
    adminDb = getAdminFirestore(adminApp);
}


export { adminApp, adminAuth, adminDb };
