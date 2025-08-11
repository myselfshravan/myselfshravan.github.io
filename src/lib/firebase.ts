import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { FirebaseConfig } from './types';

const firebaseConfig: FirebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let db: ReturnType<typeof getFirestore>;

// Initialize Firebase
try {
  if (typeof window !== 'undefined') {
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      throw new Error('Required Firebase configuration is missing');
    }
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  }
} catch (error) {
  const firebaseError = error as { code?: string; message?: string };
  console.error('Firebase initialization error:', {
    message: firebaseError.message || 'Unknown error',
    code: firebaseError.code,
    env: process.env.NODE_ENV,
    windowDefined: typeof window !== 'undefined',
  });
  // Don't throw in production to prevent app crashes
  if (process.env.NODE_ENV === 'development') {
    throw error;
  }
}

export { db };
