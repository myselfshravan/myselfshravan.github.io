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
  // Set comprehensive CORS headers for all requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Max-Age', '86400'); // Cache preflight for 24 hours

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return res
      .status(204)
      .setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type')
      .end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const rawBody = await new Promise((resolve, reject) => {
      let data = '';
      req.on('data', (chunk) => (data += chunk));
      req.on('end', () => resolve(data));
      req.on('error', reject);
    });
    const { userId, url, title, timestamp } = JSON.parse(rawBody);

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

    // Check if this is a new user for this URL (for unique user count)
    const isNewUser = !currentInteractions[urlHash];

    // Prepare updated user interaction
    let updatedInteraction;
    if (currentInteractions[urlHash]) {
      updatedInteraction = {
        ...currentInteractions[urlHash],
        count: currentInteractions[urlHash].count + 1,
        lastClick: now,
        title, // Update title in case it changed
      };
    } else {
      updatedInteraction = {
        url,
        title,
        count: 1,
        firstClick: now,
        lastClick: now,
      };
    }

    // Use fast batch write instead of slow transaction
    const batch = db.batch();

    // 1. Update user document (same as before)
    batch.update(userRef, {
      [`interactionv2.${urlHash}`]: updatedInteraction,
    });

    // 2. Update or create url_insights with simple increments
    const urlInsightRef = db.collection('url_insights').doc(urlHash);
    const urlInsightDoc = await urlInsightRef.get();

    if (urlInsightDoc.exists) {
      // Existing URL - simple increments
      const updates = {
        totalClicks: admin.firestore.FieldValue.increment(1),
        lastClick: now,
        updatedAt: now,
        title, // Update title in case it changed
      };

      // Only increment unique users if this is a new user for this URL
      if (isNewUser) {
        updates.uniqueUsers = admin.firestore.FieldValue.increment(1);
        updates.userIds = admin.firestore.FieldValue.arrayUnion(userId);
      }

      batch.update(urlInsightRef, updates);
    } else {
      // New URL - create record
      batch.set(urlInsightRef, {
        urlHash,
        url,
        title,
        totalClicks: 1,
        uniqueUsers: 1,
        avgClicksPerUser: 1,
        firstClick: now,
        lastClick: now,
        createdAt: now,
        updatedAt: now,
        userIds: [userId],
      });
    }

    // Execute fast batch write
    await batch.commit();

    // Update avgClicksPerUser periodically (not in real-time for performance)
    // This could be moved to a background Cloud Function for even better performance
    if (Math.random() < 0.1) {
      // Update 10% of the time to reduce overhead
      const updatedDoc = await urlInsightRef.get();
      const data = updatedDoc.data();
      if (data && data.uniqueUsers > 0) {
        await urlInsightRef.update({
          avgClicksPerUser: parseFloat((data.totalClicks / data.uniqueUsers).toFixed(2)),
        });
      }
    }

    console.log(`✅ Successfully tracked URL interaction: ${urlHash} for user: ${userId}`);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Tracking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
