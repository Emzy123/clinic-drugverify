
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
  } else {
    const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64;
    if (!serviceAccountBase64) {
      console.error("Firebase Admin initialization failed: FIREBASE_SERVICE_ACCOUNT_KEY_BASE64 is not set.");
      return; 
    }
    try {
      // This is a common pattern for Vercel/serverless environments.
      // The service account JSON is stored as a Base64 encoded string in an environment variable.
      const serviceAccountJson = Buffer.from(serviceAccountBase64, 'base64').toString('utf-8');
      const serviceAccount: ServiceAccount = JSON.parse(serviceAccountJson);

      adminApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log("Firebase Admin SDK initialized successfully.");
    } catch (error: any) {
      console.error("CRITICAL: Firebase Admin initialization failed when parsing service account.", error.message);
    }
  }
}

// Call initialization on module load.
initializeAdminApp();

export function getAdminAuthInstance(): AdminAuth {
  if (!adminApp) {
      // This means the initial attempt failed.
      throw new Error("Firebase Admin SDK is not available. Check server logs for initialization errors.");
  }
  if (!adminAuth) {
    adminAuth = getAdminAuth(adminApp);
  }
  return adminAuth;
}

export function getAdminDb(): AdminFirestore {
   if (!adminApp) {
      // This means the initial attempt failed.
      throw new Error("Firebase Admin SDK is not available. Check server logs for initialization errors.");
  }
  if (!adminDb) {
    adminDb = getAdminFirestore(adminApp);
  }
  return adminDb;
}
