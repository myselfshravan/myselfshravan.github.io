import { db } from './firebase';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { Command, UserData, ButtonInteraction } from './types';

const USER_ID_KEY = 'portfolio_user_id';
const USERS_COLLECTION = 'portfolio_users';
const EXTERNAL_LINKS_COLLECTION = 'interactionv2';

interface ExternalLinkInteraction {
  userId: string;
  url: string;
  title: string;
  count: number;
  firstClick: Timestamp;
  lastClick: Timestamp;
}

// Generate unique IDs
export const generateUserId = () => {
  return 'user_' + Math.random().toString(36).substring(2, 11);
};

// Get or create user ID from localStorage
export const getUserId = () => {
  if (typeof window === 'undefined') return null;
  let userId = localStorage.getItem(USER_ID_KEY);
  if (!userId) {
    userId = generateUserId();
    localStorage.setItem(USER_ID_KEY, userId);
  }
  console.log('User ID:', userId); // Debugging line
  return userId;
};

export const trackVisit = async () => {
  const userId = getUserId();
  if (!userId || !db) return;

  const userRef = doc(db, USERS_COLLECTION, userId);

  try {
    const userDoc = await getDoc(userRef);
    const now = serverTimestamp();

    if (!userDoc.exists()) {
      // First visit - create new user
      const newUserData: UserData = {
        userId,
        firstVisit: now as Timestamp,
        lastVisit: now as Timestamp,
        totalVisits: 1,
        totalInteractions: 0,
        commands: [],
        sessions: [],
        topCategories: {},
        topActions: {},
        favoriteContent: {},
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
    console.error('Visit tracking error:', error);
  }
};

export const trackCommand = async (command: string) => {
  const userId = getUserId();
  if (!userId || !db) return;

  const userRef = doc(db, USERS_COLLECTION, userId);

  try {
    const newCommand: Command = {
      command,
      timestamp: new Date().toISOString(),
    };

    await updateDoc(userRef, {
      commands: arrayUnion(newCommand),
    });
  } catch (error) {
    console.error('Command tracking error:', error);
  }
};

// Simple button click tracking
export const trackButtonClick = async (
  category: string,
  identifier: string,
  action: string,
  context?: {
    section: string;
    position?: number;
    url?: string;
    metadata?: Record<string, unknown>;
  },
) => {
  const userId = getUserId();
  if (!userId || !db) return;
  const userRef = doc(db, USERS_COLLECTION, userId);
  try {
    // Create interaction object
    const interaction: ButtonInteraction = {
      category,
      identifier,
      action,
      context,
      timestamp: new Date().toISOString(),
    };
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) return;
    const userData = userDoc.data();
    // Update aggregated counters
    const topCategories = { ...(userData.topCategories || {}) };
    const topActions = { ...(userData.topActions || {}) };
    const favoriteContent = { ...(userData.favoriteContent || {}) };
    topCategories[category] = (topCategories[category] || 0) + 1;
    topActions[action] = (topActions[action] || 0) + 1;
    favoriteContent[identifier] = (favoriteContent[identifier] || 0) + 1;
    // Save everything in one update
    await updateDoc(userRef, {
      totalInteractions: (userData.totalInteractions || 0) + 1,
      topCategories,
      topActions,
      favoriteContent,
      // Add interaction to a simple interactions array
      interactions: arrayUnion(interaction),
    });
  } catch (error) {
    console.error('Button tracking error:', error);
  }
};

// External link tracking for interactionv2
export const trackExternalLinkClick = async (url: string, title: string) => {
  const userId = getUserId();
  if (!userId || !db) return;

  // Create a hash of the URL for the document ID to handle URL length limits
  const urlHash = btoa(url).replace(/[^a-zA-Z0-9]/g, '').substring(0, 20);
  const docId = `${userId}_${urlHash}`;
  const linkRef = doc(db, EXTERNAL_LINKS_COLLECTION, docId);

  try {
    const linkDoc = await getDoc(linkRef);
    const now = serverTimestamp() as Timestamp;

    if (!linkDoc.exists()) {
      // First time clicking this URL
      const newInteraction: ExternalLinkInteraction = {
        userId,
        url,
        title,
        count: 1,
        firstClick: now,
        lastClick: now,
      };
      await setDoc(linkRef, newInteraction);
    } else {
      // Increment existing count
      await updateDoc(linkRef, {
        count: (linkDoc.data().count || 0) + 1,
        lastClick: now,
        // Update title in case it changed
        title,
      });
    }
  } catch (error) {
    console.error('External link tracking error:', error);
  }
};

// Admin analytics functions
export const getAnalyticsData = async () => {
  const userId = getUserId();
  if (!userId || !db) return null;
  const userRef = doc(db, USERS_COLLECTION, userId);
  try {
    const userDoc = await getDoc(userRef);
    return userDoc.exists() ? userDoc.data() : null;
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return null;
  }
};
