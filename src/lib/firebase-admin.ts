
// src/lib/firebase-admin.ts
import admin from 'firebase-admin';
import type { App as AdminApp, ServiceAccount } from 'firebase-admin/app';
import { getAuth as getAdminAuth, Auth as AdminAuth } from 'firebase-admin/auth';
import { getFirestore as getAdminFirestore, Firestore as AdminFirestore } from 'firebase-admin/firestore';

// This is a more robust pattern for ensuring singleton instances in a serverless environment.
let adminApp: AdminApp;
let adminAuth: AdminAuth;
let adminDb: AdminFirestore;

// The service account key is expected to be a Base64 encoded string from environment variables.
// This is a common practice for storing multi-line JSON keys in single-line env vars.
const SERVICE_ACCOUNT_BASE64 = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64;

function initializeAdminApp(): AdminApp {
  if (admin.apps.length > 0 && admin.apps[0]) {
    return admin.apps[0];
  }

  if (!SERVICE_ACCOUNT_BASE64) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY_BASE64 environment variable is not set. The server cannot authenticate with Firebase.");
  }

  try {
    const serviceAccountJson = Buffer.from(SERVICE_ACCOUNT_BASE64, 'base64').toString('utf-8');
    const serviceAccount: ServiceAccount = JSON.parse(serviceAccountJson);

    // Basic validation of the parsed key
    if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
        throw new Error("Parsed Firebase service account is missing required fields (project_id, private_key, client_email).");
    }
    
    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

  } catch (error: any) {
    console.error("Firebase Admin initialization failed:", error.message);
    throw new Error(`Failed to initialize Firebase Admin SDK: ${error.message}`);
  }
}

// Immediately initialize the app. If this fails, the app will crash on startup, which is
// better than failing silently during a user request.
try {
  adminApp = initializeAdminApp();
  adminAuth = getAdminAuth(adminApp);
  adminDb = getAdminFirestore(adminApp);
} catch (e) {
  console.error("CRITICAL: Firebase Admin SDK failed to initialize on startup.", e);
  // In a real scenario, you might have monitoring/alerting here.
}


export function getAdminAuthInstance(): AdminAuth {
  if (!adminAuth) {
    throw new Error("Firebase Admin Auth is not initialized. The application cannot function.");
  }
  return adminAuth;
}

export function getAdminDb(): AdminFirestore {
  if (!adminDb) {
    throw new Error("Firebase Admin Firestore is not initialized. The application cannot function.");
  }
  return adminDb;
}
