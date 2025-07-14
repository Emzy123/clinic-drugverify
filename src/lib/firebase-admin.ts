
import admin from 'firebase-admin';
import type { App as AdminApp, ServiceAccount } from 'firebase-admin/app';
import { getAuth as getAdminAuth, Auth as AdminAuth } from 'firebase-admin/auth';
import { getFirestore as getAdminFirestore, Firestore as AdminFirestore } from 'firebase-admin/firestore';

let adminApp: AdminApp | null = null;
let adminAuth: AdminAuth | null = null;
let adminDb: AdminFirestore | null = null;

function initializeAdminApp() {
  if (admin.apps.length > 0) {
    adminApp = admin.app();
    return; // Already initialized
  }

  // Vercel handles multi-line environment variables, so we can pass the raw JSON.
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountJson) {
    console.error("Firebase Admin initialization failed: FIREBASE_SERVICE_ACCOUNT_JSON is not set.");
    return;
  }

  try {
    const serviceAccount: ServiceAccount = JSON.parse(serviceAccountJson);

    adminApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("Firebase Admin SDK initialized successfully from raw JSON.");
  } catch (error: any) {
    console.error("CRITICAL: Firebase Admin initialization failed. Could not parse service account JSON.", error.message);
  }
}

// Call initialization on module load.
initializeAdminApp();

export function getAdminAuthInstance(): AdminAuth {
  if (!adminApp) {
    throw new Error("Firebase Admin SDK is not available. Check server logs for initialization errors.");
  }
  if (!adminAuth) {
    adminAuth = getAdminAuth(adminApp);
  }
  return adminAuth;
}

export function getAdminDb(): AdminFirestore {
  if (!adminApp) {
    throw new Error("Firebase Admin SDK is not available. Check server logs for initialization errors.");
  }
  if (!adminDb) {
    adminDb = getAdminFirestore(adminApp);
  }
  return adminDb;
}
