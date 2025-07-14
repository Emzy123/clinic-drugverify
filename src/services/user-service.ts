
'use server';

import { getAdminDb } from '@/lib/firebase-admin';
import type { User } from '@/lib/types';

interface UpsertResult {
    success: boolean;
    user: User | null;
    error?: string;
}

/**
 * Finds a user by their UID in Firestore using the Admin SDK.
 * @param uid The user's UID from Firebase Auth.
 * @returns The user object if found, otherwise null.
 */
export async function findUserById(uid: string): Promise<User | null> {
  const adminDb = getAdminDb();
  if (!adminDb) {
    console.error('Firebase Admin DB is not initialized. Cannot find user.');
    return null;
  }

  try {
    const userDocRef = adminDb.collection('users').doc(uid);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      console.warn(`User document not found in Firestore for UID: ${uid}`);
      return null;
    }

    const userData = userDoc.data();
    return { id: userDoc.id, ...userData } as User;
  } catch(error) {
    console.error('Error finding user by ID with Admin SDK:', error);
    throw new Error('Could not query the database.');
  }
}

/**
 * Creates or updates a user record in Firestore after a successful
 * authentication via an external provider (like Google).
 * @param userData The user data from the authentication provider.
 * @returns An object indicating success or failure, with the user object or an error message.
 */
export async function upsertUser(userData: Omit<User, 'password'> & { photoURL?: string }): Promise<UpsertResult> {
  const adminDb = getAdminDb();
   if (!adminDb) {
    const errorMsg = "Server is not configured for user management. Missing FIREBASE_SERVICE_ACCOUNT_KEY.";
    console.error(errorMsg);
    return { success: false, user: null, error: errorMsg };
  }

  const userRef = adminDb.collection('users').doc(userData.id);

  try {
    const doc = await userRef.get();

    if (!doc.exists) {
      // User is signing up for the first time
      const newUser: User = {
        id: userData.id,
        fullname: userData.fullname,
        email: userData.email,
        photoURL: userData.photoURL || null,
      };
      await userRef.set({
        ...newUser,
        createdAt: new Date().toISOString(),
      });
      return { success: true, user: newUser };
    } else {
      // User exists, update their info if necessary (e.g., photoURL change)
      const existingData = doc.data() as User;
      const updatedUser: User = {
        ...existingData,
        fullname: userData.fullname, // Always update name in case it changes in Google
        photoURL: userData.photoURL || existingData.photoURL || null,
      };
      await userRef.update({
        fullname: updatedUser.fullname,
        photoURL: updatedUser.photoURL,
      });
      return { success: true, user: updatedUser };
    }
  } catch (error) {
    console.error("Error upserting user in Firestore:", error);
    return { success: false, user: null, error: "Could not create or update user record in the database." };
  }
}
