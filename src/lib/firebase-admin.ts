
import admin from 'firebase-admin';
import type { App as AdminApp, ServiceAccount } from 'firebase-admin/app';
import { getAuth as getAdminAuth, Auth as AdminAuth } from 'firebase-admin/auth';
import { getFirestore as getAdminFirestore, Firestore as AdminFirestore } from 'firebase-admin/firestore';

// This function initializes the Firebase Admin SDK. It's designed to be run only once.
function initializeAdmin() {
  // If the app is already initialized, we don't need to do anything.
  if (admin.apps.length > 0) {
    return admin.app();
  }

  // Get the service account JSON from the environment variable.
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (!serviceAccountJson) {
    throw new Error('Firebase initialization failed: The FIREBASE_SERVICE_ACCOUNT_JSON environment variable is not set.');
  }

  try {
    // Parse the JSON string into a ServiceAccount object.
    const serviceAccount: ServiceAccount = JSON.parse(serviceAccountJson);
    
    // Initialize the Firebase Admin App.
    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error: any) {
    // This will catch errors if the JSON is malformed.
    console.error("CRITICAL: Firebase Admin initialization failed. Could not parse service account JSON.", error.message);
    throw new Error("Firebase Admin initialization failed due to malformed service account JSON.");
  }
}

// Initialize the app immediately when this module is loaded.
// This ensures that it's ready for any function that needs it.
const adminApp: AdminApp = initializeAdmin();

// Export functions to get instances of Auth and Firestore.
// These functions will now use the globally initialized adminApp.
export function getAdminAuthInstance(): AdminAuth {
  return getAdminAuth(adminApp);
}

export function getAdminDb(): AdminFirestore {
  return getAdminFirestore(adminApp);
}
