
'use server';

import { getDb } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, orderBy } from 'firebase/firestore';
import type { Scan } from '@/lib/types';

/**
 * Reads scans from the Firestore database.
 * If a userId is provided, it filters scans for that user.
 * @param userId The optional ID of the user to filter scans for.
 * @returns A promise that resolves to an array of Scan objects.
 */
export async function getScanHistory(userId?: string): Promise<Scan[]> {
  const db = getDb();
  try {
    const scansRef = collection(db, 'scans');
    let q;

    if (userId) {
      // Query scans for a specific user, ordered by most recent
      q = query(scansRef, where('userId', '==', userId), orderBy('timestamp', 'desc'));
    } else {
      // Query all scans, ordered by most recent
      q = query(scansRef, orderBy('timestamp', 'desc'));
    }

    const querySnapshot = await getDocs(q);
    const scans: Scan[] = [];
    querySnapshot.forEach((doc) => {
      scans.push({ id: doc.id, ...doc.data() } as Scan);
    });

    return scans;
  } catch (error) {
    console.error('Failed to read scan history from Firestore:', error);
    // In case of error (e.g., permissions), return an empty array
    // to prevent the app from crashing.
    return [];
  }
}

/**
 * Adds a new scan record to the Firestore database.
 * @param newScan The scan data to add. It should not include an 'id' or 'timestamp'.
 * @returns A promise that resolves when the operation is complete.
 */
export async function addScanToHistory(newScan: Omit<Scan, 'id' | 'timestamp'>): Promise<void> {
  const db = getDb();
  try {
    const scanWithMetadata = {
      ...newScan,
      timestamp: new Date().toISOString(), // ISO 8601 format
    };

    await addDoc(collection(db, 'scans'), scanWithMetadata);

  } catch (error) {
    console.error('Failed to add scan to history in Firestore:', error);
    throw new Error('Could not save scan to history.');
  }
}
