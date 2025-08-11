import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, serverTimestamp, Timestamp } from 'firebase/firestore';
import { Command, UserData } from './types';

const USER_ID_KEY = 'portfolio_user_id';
const USERS_COLLECTION = 'portfolio_users';

// Generate a unique ID for new users
const generateUserId = () => {
  return 'user_' + Math.random().toString(36).substr(2, 9);
};

// Get or create user ID from localStorage
const getUserId = () => {
  if (typeof window === 'undefined') return null;

  let userId = localStorage.getItem(USER_ID_KEY);
  if (!userId) {
    userId = generateUserId();
    localStorage.setItem(USER_ID_KEY, userId);
  }
  return userId;
};

export const trackVisit = async () => {
  const userId = getUserId();
  if (!userId) return;

  const userRef = doc(db, USERS_COLLECTION, userId);

  try {
    const userDoc = await getDoc(userRef);
    const now = serverTimestamp();

    if (!userDoc.exists()) {
      // First visit
      const newUserData: UserData = {
        userId,
        firstVisit: now as Timestamp,
        lastVisit: now as Timestamp,
        totalVisits: 1,
        commands: [],
      };
      await setDoc(userRef, newUserData);
    } else {
      // Subsequent visit
      await updateDoc(userRef, {
        lastVisit: now,
        totalVisits: (userDoc.data().totalVisits || 0) + 1,
      });
    }
  } catch (error) {
    const firestoreError = error as { code?: string; message?: string };
    console.error('Visit tracking error:', firestoreError.message || 'Unknown error');
  }
};

export const trackCommand = async (command: string) => {
  const userId = getUserId();
  if (!userId) return;

  const userRef = doc(db, USERS_COLLECTION, userId);

  try {
    // First check if the document exists
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      const now = serverTimestamp();
      const newUserData: UserData = {
        userId,
        firstVisit: now as Timestamp,
        lastVisit: now as Timestamp,
        totalVisits: 1,
        commands: [],
      };
      await setDoc(userRef, newUserData);
    }

    const newCommand: Command = {
      command,
      timestamp: new Date().toISOString(),
    };

    await updateDoc(userRef, {
      commands: arrayUnion(newCommand),
    });
  } catch (error) {
    const firestoreError = error as { code?: string; message?: string };
    console.error('Command tracking error:', firestoreError.message || 'Unknown error');
  }
};
