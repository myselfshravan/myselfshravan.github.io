// Vercel serverless function for external link tracking
import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  // Check if all required environment variables are present
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

  if (!projectId || !privateKey || !clientEmail) {
    console.error('Missing Firebase environment variables:', {
      hasProjectId: !!projectId,
      hasPrivateKey: !!privateKey,
      hasClientEmail: !!clientEmail,
    });
    throw new Error('Firebase environment variables not configured');
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      privateKey,
      clientEmail,
    }),
  });
}

const db = admin.firestore();

export default async function handler(req, res) {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, url, title, timestamp } = req.body;
    
    if (!userId || !url || !title) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create URL hash (same logic as client)
    const createUrlHash = (url) => {
      let hash = 0;
      for (let i = 0; i < url.length; i++) {
        const char = url.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
      }
      const hashStr = Math.abs(hash).toString(36);
      return `url_${hashStr}_${url.length}`;
    };

    const urlHash = createUrlHash(url);
    const userRef = db.collection('portfolio_users_prod').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    const currentInteractions = userData.interactionv2 || {};
    const now = new Date(timestamp).toISOString();

    let updatedInteraction;
    if (currentInteractions[urlHash]) {
      updatedInteraction = {
        ...currentInteractions[urlHash],
        count: currentInteractions[urlHash].count + 1,
        lastClick: now,
        title
      };
    } else {
      updatedInteraction = {
        url,
        title,
        count: 1,
        firstClick: now,
        lastClick: now
      };
    }

    await userRef.update({
      [`interactionv2.${urlHash}`]: updatedInteraction
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Tracking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}