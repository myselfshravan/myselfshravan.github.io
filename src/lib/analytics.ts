import { db } from './firebase';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
  Timestamp,
  UpdateData,
} from 'firebase/firestore';
import { Command, UserData, ButtonInteraction, ExternalLinkClick } from './types';
import { detectDeviceInfo } from './deviceInfo';
import { lookupHashMapping, validateHash } from './hash-utils';

const USER_ID_KEY = 'portfolio_user_id';
const USERS_COLLECTION = 'portfolio_users_prod';

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

export const trackVisit = async (hash?: string) => {
  const userId = getUserId();
  if (!userId || !db) return;

  const userRef = doc(db, USERS_COLLECTION, userId);
  const deviceInfo = detectDeviceInfo();

  try {
    const userDoc = await getDoc(userRef);
    const now = serverTimestamp();

    // Get hash mapping or create organic entry
    let hashMapping = {
      hash: 'XXX',
      name: 'organic',
    };
    if (hash && validateHash(hash)) {
      const lookup = await lookupHashMapping(hash, userId);
      if (lookup) {
        hashMapping = lookup;
      }
    }

    if (!userDoc.exists()) {
      // First visit - create new user
      const newUserData: UserData = {
        userId,
        firstVisit: now as Timestamp,
        lastVisit: now as Timestamp,
        totalVisits: 1,
        device: deviceInfo,
        hashMappings: [
          {
            hash: hashMapping.hash,
            name: hashMapping.name,
            timestamp: now as Timestamp,
          },
        ],
      };
      await setDoc(userRef, newUserData);
    } else {
      // Update existing user data
      const userData = userDoc.data();
      const updateData: UpdateData<UserData> = {
        lastVisit: now,
        totalVisits: (userData.totalVisits || 0) + 1,
      };

      // Add device info if missing
      if (!userData.device) {
        updateData.device = deviceInfo;
      }

      // Always add hash mapping (organic or from hash)
      const newMapping = {
        hash: hashMapping.hash,
        name: hashMapping.name,
        timestamp: now as Timestamp,
      };
      updateData.hashMappings = arrayUnion(newMapping);

      await updateDoc(userRef, updateData);
    }
    console.log(
      'Visit tracked for user:',
      userId,
      hashMapping ? `with hash mapping: ${hashMapping.hash}` : '',
    );
  } catch (error) {
    console.error('Visit tracking error:', error);
  }
};

export const trackCommand = async (
  command: string,
  response?: string,
  type: 'terminal' | 'ai' = 'terminal',
) => {
  const userId = getUserId();
  if (!userId || !db) return;

  const userRef = doc(db, USERS_COLLECTION, userId);

  try {
    // Create command object without undefined values
    const newCommand: Command = {
      command,
      type,
      timestamp: Timestamp.now(),
      ...(response && { response }), // Only include response if it exists
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

// Create a unique hash for URL that avoids collisions
function createUrlHash(url: string): string {
  // Simple hash function to create a unique identifier
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Convert to positive number and then to base36 for shorter string
  const hashStr = Math.abs(hash).toString(36);

  // Fallback: if hash collision is still possible, append URL length
  return `url_${hashStr}_${url.length}`;
}

// External link tracking for interactionv2 - stored within user document
export const trackExternalLinkClick = async (url: string, title: string) => {
  const userId = getUserId();
  if (!userId || !db) return;

  const userRef = doc(db, USERS_COLLECTION, userId);

  try {
    // Create a unique hash of the URL for use as field key
    // Using a simple hash function to avoid collisions from truncation
    const urlHash = createUrlHash(url);
    const now = new Date().toISOString();

    // Get current user document
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      console.error('User document not found for external link tracking');
      return;
    }

    const userData = userDoc.data() as UserData;
    const currentInteractions = userData.interactionv2 || {};

    if (currentInteractions[urlHash]) {
      // Existing URL - increment count
      const updatedInteraction: ExternalLinkClick = {
        ...currentInteractions[urlHash],
        count: currentInteractions[urlHash].count + 1,
        lastClick: now,
        title, // Update title in case it changed
      };

      await updateDoc(userRef, {
        [`interactionv2.${urlHash}`]: updatedInteraction,
      });
    } else {
      // New URL - create first entry
      const newInteraction: ExternalLinkClick = {
        url,
        title,
        count: 1,
        firstClick: now,
        lastClick: now,
      };

      await updateDoc(userRef, {
        [`interactionv2.${urlHash}`]: newInteraction,
      });
    }
  } catch (error) {
    console.error('External link tracking error:', error);
  }
};
