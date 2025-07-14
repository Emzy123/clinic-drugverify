export interface Scan {
  id: string;
  userId?: string; // Made optional for now, can be removed later
  barcode: string;
  drugName: string | null;
  manufacturer: string | null;
  status: 'Verified' | 'Suspect' | 'Unknown';
  timestamp: string; // ISO 8601 format
  isFlagged: boolean;
  reason?: string;
}

export interface User {
  id: string;
  fullname: string;
  email: string;
  photoURL?: string | null;
  password?: string; // Should be hashed in a real app
}
