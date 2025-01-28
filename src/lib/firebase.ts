import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { QueryDocumentSnapshot, 
  DocumentData,getFirestore, collection, query, where, orderBy, limit, startAfter } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';  // Add this import

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey) {
  throw new Error('Firebase API key is missing. Check your environment variables.');
}

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);

// Firestore collection references
export const customersRef = collection(db, 'customers');
export const jobsRef = collection(db, 'jobs');
export const teamsRef = collection(db, 'teams');

// Pagination helpers
export const getCustomersQuery = (
  lastDoc?: QueryDocumentSnapshot<DocumentData>,
  pageSize = 10
) => {
  const baseQuery = query(
    customersRef,
    orderBy('name'),
    limit(pageSize)
  );
  return lastDoc ? query(baseQuery, startAfter(lastDoc)) : baseQuery;
};

export const getJobsQuery = (
  customerName: string,
  lastDoc?: QueryDocumentSnapshot<DocumentData>,
  pageSize = 10
) => {
  const baseQuery = query(
    jobsRef,
    where('customerName', '==', customerName),
    orderBy('scheduledDate', 'desc'),
    limit(pageSize)
  );
  return lastDoc ? query(baseQuery, startAfter(lastDoc)) : baseQuery;
};