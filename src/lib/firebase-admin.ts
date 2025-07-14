
// src/lib/firebase-admin.ts
import admin from 'firebase-admin';
import type { App as AdminApp, ServiceAccount } from 'firebase-admin/app';
import { getAuth as getAdminAuth, Auth as AdminAuth } from 'firebase-admin/auth';
import { getFirestore as getAdminFirestore, Firestore as AdminFirestore } from 'firebase-admin/firestore';

let adminApp: AdminApp | null = null;
let adminAuth: AdminAuth | null = null;
let adminDb: AdminFirestore | null = null;

// IMPORTANT: The service account key is now hardcoded as a Base64 string for deployment simplicity.
const SERVICE_ACCOUNT_BASE64 = "ewogICJ0eXBlIjogInNlcnZpY2VfYWNjb3VudCIsCiAgInByb2plY3RfaWQiOiAiY3VzdGVjaC1kcnVndmVyaWZ5IiwKICAicHJpdmF0ZV9rZXlfaWQiOiAiYWNhOWNkMzdkNzFiZWI3ZDY4YmExYjc3MGVhMzk1OTE2NWZjOTY5ZiIsCiAgInByaXZhdGVfa2V5IjogIi0tLS0tQkVHSU4gUFJJVkFURSBLRVktLS0tLVxuTUlJRXZnSUJBREFOQmdrcWhraUc5dzBCQVFFRkFBU0NCa2d3Z2dTa0FnRUFBa0lCQVFDMyNlTlBQWSs4K2N0a1xuLys3NGhrZXM2em5mNC9CNGZGK3RJcFRaMHFjcVRVSXA5NWFjcEJ4ZG5rUWUwNzV6K0Q3MjFXZEpzaFIweWVXMlxuZU1NRjJhdU5zSklPa0pISlBuRnZvZVNaNTJ0KzBCWW51NkxYdTBOMzFGVW11cUZ1dHhNSGJRZldmZHhBbnFYNVxuMzI4TS9GcDFFcDdSbEtBeVhJV0Nla0djK3lhb215WW9uaTN2Nnp0MWpDa0Q3VXNyL2dQbHVVOVpDaE5pN2VMVlxuL1BrMmxqbjVLUHJyNjBsdDFsQ3VBeUlHZ2creFUyeTI2ODZqK1JQenQ2Y0l5NFVNZXY2elR0V1BLQzV4Q3BxaVxuYzFHZTlKaWlvVllYa2J2RE8rRGp0elBDTkwwenFtSEg3RnhQbFgvTFdGWG9DaFFuVkl5TFlDMDQ5VWJXdm9tT1xuRFM0aUpZVEFnTUJBQUVDZ2dFQUEzZjI4RmlidmJoRHlIRHl2THVnWDlvRE9rQ09HbUJTMkN5V2ZmUlIxcDAyMm9BRUpvb014UkhIZklPSURaMks1dE5KdzRENjFPZTVERTNBaGp3NWVvL3llaGJ0d2N5TmpNdTY5dE1CV3lBblxudkZPbGw5QldpMEd2SmY2azJJZW1GM0ozTkY4bHJYSU1Zc3dDQ0U5dmdjdmU0cWdhY01JZkZtOW9tNjFvS3BoXkZpd1JIS21KcntIWlhtekp1UTlmMHREamVtK0ZQZWIzQVZKbmxFRmxCQTVnSGc4d3RTeitmQVcrZERRa2lWUFxuSlJsZG1zMEJaTGxrbUZ4ZFNuc3Y5L3VvdldYakZNTTlNT2J5L096WGtmeTR6aS9kRmpvQldWZ3RCN09rbGlveVxzZGNNeklpT0JKYUFjb2RNaWdxaXAvSWZJMnA5SGs1Yi8wNm9KZDc3YlhRa0JnUUR2Y1ozVXJCNk9DMWQzY1BYRlxuK2FETnAvM3VXZUxBWmdSVXRKUWw1MnArNlpwOXptRXZEcjg2WislN0NMeEpSUWN4eXo3VGUxZk1NQlkzS2R2K1xEL2g0dWtKQkRxSUJFbUoyTnlJQU50NzRWSGc5bjJpL3hDRTVuazhFQUxGd1VBMElyU0tDRjNFbk5FQ2krTFkrXG5lcmpXRnBqK1ZmVC81L2RmNHBkQWRWTDMvd0tCZ1FETEVYWlpMcXVSL3luOFdyUTZuNk9MZmhOZU8ycm9uQnlEaXpcbm5pd1JCZGJCblFWQ0xkZmV4M1orVExiU1dZL294WHVHUUU0eGJXUWI4Q1ozRHdwK0JQNzNHRUtHMFduWFplVFpcbk1hd0djVk5HSlY5U1hCZ3IzekscZ01SRTRCK2xHL3ZxZG54RFBSOFZWUUlvZmhiWHJxUVBsU3VnL2xDcjRJZC9cbmxSZDlRRDhCN1FLQmdRQ0hZdmFiQ2JjOUdheWJIaWVJU1YyaTZ4bnBhMm1LNGNRU3dRZ0g3SkdKc1BsUnFSL0tOPzgxZWR1bzlZZEE1a2JySU1DbFUxaVJXNTgwRWJjU01IV056Y01vaGQyVVB6ZHh6ciJ5TFRWeGxnMjU2aWlRXnJaVkR2cjl1eE9ESFliditOUE1PRzdNZk42eFVlY3lTQjFIN3VtQVBiY3JZeXA1QjM1bmNleXpmZWdRa0JnQnJwSkhCNkZoMDhqZlY1ZVF5ZzZKVmdObEw3THUwU2xsSm1WZnR2SldJUVdFU1BvajN3WHRnbmd0V0gyQ1E1Q3hmdVxuZzJoYWFPUDdJc29sa1haN0VNU2kybHJIQ0E0dnNkNmc0OFZ1TmM3ZXlCVHM4Wkx4T3l0azNUL2l4Zk5TWVgsYlxuQmVQZ3RmUmlPejU1OE1BZU9mVzRwdVhFY3lFNjdRdE1EbTgzdm1weEFvR0JBTjVLdExZZ3pFSFY0VTI5TXpiUVxuTzdWTWRDdFIxNDlRY3J2ZGJudXRCOWpUM2szU0tDb2s2KzZjTlhnT09ZZVkwWGdJOTB3Y3RyUjExbEorUG9iVlxuYWJJV1llWnkvRWxQSGNUZG1CRVMvVE9LTW5PdGtMWmZSemd1ZFhvZWc3OWZTeWIwMkNIem5tUHF1MSs4RUV3ZWVcblUqVm9lMFpHZXJzQ1lKbXpVZFI1alZBZwotLS0tLUVORCBQUklWQVRFIEtFWS0tLS0tXG4iLAogICJjbGllbnRfZW1haWwiOiAiZmlyZWJhc2UtYWRtaW5zZGstZmJzdmNAY3VzdGVjaC1kcnVndmVyaWZ5LmlhbS5nc2VydmljZWFjY291bnQuY29tIiwKICAiY2xpZW50X2lkIjogIjExMDUwNDc5ODgwMDcxNTM2NTc2NSIsCiAgImF1dGhfdXJpIjogImh0dHBzOi8vYWNjb3VudHMuZ29vZ2xlLmNvbS9vL29hdXRoMi9hdXRoIiwKICAidG9rZW5fdXJpIjogImh0dHBzOi8vb2F1dGgyLmdvb2dsZWFwaXMuY29tL3Rva2VuIiwKICAiYXV0aF9wcm92aWRlcl94NTA5X2NlcnRfdXJsIjogImh0dHBzOi8vd3d3Lmdvb2dsZWFwaXMuY29tL29hdXRoMi92MS9jZXJ0cyIsCiAgImNsaWVudF94NTA5X2NlcnRfdXJsIjogImh0dHBzOi8vd3d3Lmdvb2dsZWFwaXMuY29tL3JvYm90L3YxL21ldGFkYXRhL3g1MzkvZmlyZWJhc2UtYWRtaW5zZGstZmJzdmMlNDBjdXN0ZWNoLWRydWd2ZXJpZnkuaWFtLmdzZXJ2aWNlYWNjb3VudC5jb20iLAogICJ1bml2ZXJzZV9kb21haW4iOiAiZ29vZ2xlYXBpcy5jb20iCn0K";

function getServiceAccount(): ServiceAccount | null {
  try {
    const serviceAccountJson = Buffer.from(SERVICE_ACCOUNT_BASE64, 'base64').toString('utf-8');
    const parsedKey = JSON.parse(serviceAccountJson);

    // Basic validation of the parsed key
    if (!parsedKey.project_id || !parsedKey.private_key || !parsedKey.client_email) {
        console.error("Hardcoded FIREBASE_SERVICE_ACCOUNT_KEY is missing required fields (project_id, private_key, client_email).");
        return null;
    }
    return parsedKey;
  } catch (e) {
    console.error("Failed to parse hardcoded FIREBASE_SERVICE_ACCOUNT_KEY.", e);
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
