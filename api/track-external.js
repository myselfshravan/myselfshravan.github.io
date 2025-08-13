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
      .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type')
      .end();
  }

  // Handle GET request to test Firebase connection
  if (req.method === 'GET') {
    try {
      // Try to get a document from Firestore to test connection
      const testDoc = await db.collection('url_insights').doc('url_ags5vy_19').get();
      return res.status(200).json({
        status: 'success',
        message: 'Firebase connection successful',
        dbInitialized: !!admin.apps.length,
        firestoreAccess: !!testDoc,
      });
    } catch (error) {
      console.error('Firebase connection test error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Firebase connection failed',
        error: error.message,
      });
    }
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
    const now = new Date(timestamp).toISOString();

    // Use Firestore transaction for atomic updates across collections
    await db.runTransaction(async (transaction) => {
      const urlInsightRef = db.collection('url_insights').doc(urlHash);
      const interactionRef = db.collection('url_user_interactions').doc(`${urlHash}_${userId}`);

      // Get current documents
      const [urlInsightDoc, interactionDoc] = await Promise.all([
        transaction.get(urlInsightRef),
        transaction.get(interactionRef),
      ]);

      // Update or create url_insights (aggregated data)
      if (urlInsightDoc.exists) {
        const urlData = urlInsightDoc.data();
        const newTotalClicks = urlData.totalClicks + 1;
        const avgClicksPerUser = parseFloat((newTotalClicks / urlData.uniqueUsers).toFixed(2));

        transaction.update(urlInsightRef, {
          totalClicks: newTotalClicks,
          lastClick: now,
          updatedAt: now,
          avgClicksPerUser,
          title, // Update title in case it changed
        });
      } else {
        // New URL - create aggregated record
        transaction.set(urlInsightRef, {
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
        });
      }

      // Update or create url_user_interactions (detailed tracking)
      if (interactionDoc.exists) {
        // Existing user interaction - increment count
        const interactionData = interactionDoc.data();
        transaction.update(interactionRef, {
          clickCount: interactionData.clickCount + 1,
          lastClick: now,
          updatedAt: now,
          title, // Update denormalized title
        });
      } else {
        // New user interaction - create record
        transaction.set(interactionRef, {
          urlHash,
          userId,
          url,
          title,
          clickCount: 1,
          firstClick: now,
          lastClick: now,
          createdAt: now,
          updatedAt: now,
        });

        // Increment unique users count in url_insights if this is a new user for this URL
        if (urlInsightDoc.exists) {
          const urlData = urlInsightDoc.data();
          const newUniqueUsers = urlData.uniqueUsers + 1;
          const newTotalClicks = urlData.totalClicks + 1;
          const avgClicksPerUser = parseFloat((newTotalClicks / newUniqueUsers).toFixed(2));

          transaction.update(urlInsightRef, {
            uniqueUsers: newUniqueUsers,
            avgClicksPerUser,
          });
        }
      }
    });

    console.log(`✅ Successfully tracked URL interaction: ${urlHash} for user: ${userId}`);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Tracking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
