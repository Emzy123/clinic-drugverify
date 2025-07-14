
// src/lib/firebase-admin.ts
import admin from 'firebase-admin';
import type { App as AdminApp, ServiceAccount } from 'firebase-admin/app';
import { getAuth as getAdminAuth, Auth as AdminAuth } from 'firebase-admin/auth';
import { getFirestore as getAdminFirestore, Firestore as AdminFirestore } from 'firebase-admin/firestore';

let adminApp: AdminApp | null = null;
let adminAuth: AdminAuth | null = null;
let adminDb: AdminFirestore | null = null;

// The service account key is expected to be a Base64 encoded string.
// This is a common practice for storing multi-line JSON keys in single-line environment variables.
const SERVICE_ACCOUNT_BASE64 = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64;

function getServiceAccount(): ServiceAccount | null {
  if (!SERVICE_ACCOUNT_BASE64) {
    console.error("FIREBASE_SERVICE_ACCOUNT_KEY_BASE64 environment variable is not set.");
    return null;
  }
  try {
    const serviceAccountJson = Buffer.from(SERVICE_ACCOUNT_BASE64, 'base64').toString('utf-8');
    const parsedKey = JSON.parse(serviceAccountJson);

    // Basic validation of the parsed key
    if (!parsedKey.project_id || !parsedKey.private_key || !parsedKey.client_email) {
        console.error("FIREBASE_SERVICE_ACCOUNT_KEY_BASE64 is missing required fields (project_id, private_key, client_email).");
        return null;
    }
    return parsedKey;
  } catch (e) {
    console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY_BASE64.", e);
    return null;
  }
}

function initializeAdminApp(): AdminApp | null {
  // If the admin app is already initialized, return it.
  if (admin.apps.length > 0 && admin.apps[0]) {
    return admin.apps[0];
  }

  const serviceAccount = getServiceAccount();
  // If no service account is found, do not attempt to initialize.
  if (!serviceAccount) {
    return null;
  }
  
  try {
    // Initialize the app if it hasn't been already.
    adminApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    return adminApp;
  } catch (error) {
    // This can happen if initializeApp is called multiple times, which we guard against,
    // but also for other config errors.
    if ((error as any).code === 'app/duplicate-app') {
        return admin.app();
    }
    console.error("Firebase Admin initialization failed:", error);
    return null;
  }
}

// Call initialization once.
initializeAdminApp();


export function getAdminAuthInstance(): AdminAuth | null {
  if (adminAuth) return adminAuth;
  if (admin.apps.length === 0 || !admin.apps[0]) return null;
  adminAuth = getAdminAuth(admin.apps[0]);
  return adminAuth;
}

export function getAdminDb(): AdminFirestore | null {
  if (adminDb) return adminDb;
  if (admin.apps.length === 0 || !admin.apps[0]) return null;
  adminDb = getAdminFirestore(admin.apps[0]);
  return adminDb;
}
