import { db } from './firebase';
import { doc, getDoc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore';

const MAPPING_COLLECTION = 'portfolio_user_mapping';

export interface HashMapping {
  hash: string;
  name: string;
  createdAt: Date;
}

export const lookupHashMapping = async (
  hash: string,
  userId: string,
): Promise<HashMapping | null> => {
  if (!hash || !db) return null;

  try {
    const mappingRef = doc(db, MAPPING_COLLECTION, hash);
    const mappingDoc = await getDoc(mappingRef);

    if (!mappingDoc.exists()) {
      console.log('Hash mapping not found:', hash);
      return null;
    }

    const data = mappingDoc.data();
    
    // Ensure visits array exists
    if (!data.visits) {
      console.log('Initializing visits array for hash:', hash);
      await updateDoc(mappingRef, {
        visits: []
      });
    }
    
    // Record this visit
    const visit = {
      userId,
      timestamp: Timestamp.now()
    };
    
    try {
      console.log('Recording visit for hash:', hash, 'user:', userId);
      await updateDoc(mappingRef, {
        visits: arrayUnion(visit)
      });
      console.log('Successfully recorded visit');
    } catch (error) {
      console.error('Failed to record visit:', error);
      // Try to initialize and retry if array might not exist
      try {
        await updateDoc(mappingRef, {
          visits: [visit]
        });
        console.log('Successfully recorded visit after initialization');
      } catch (retryError) {
        console.error('Failed to record visit even after retry:', retryError);
      }
    }

    // Re-fetch to ensure we have latest data
    const updatedDoc = await getDoc(mappingRef);
    const updatedData = updatedDoc.data();
    return {
      hash,
      name: data.name,
      createdAt: data.createdAt?.toDate() || new Date(),
    };
  } catch (error) {
    console.error('Error looking up hash mapping:', error);
    return null;
  }
};

export const validateHash = (hash: string): boolean => {
  if (!hash || typeof hash !== 'string') return false;

  // Basic validation: hash should be alphanumeric and reasonable length
  const hashRegex = /^[a-zA-Z0-9]{3,20}$/;
  return hashRegex.test(hash);
};
