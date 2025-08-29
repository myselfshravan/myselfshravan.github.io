// Vercel serverless function for external link tracking
import admin from 'firebase-admin';

// Simple LRU cache for user documents with size limits
class LRUCache {
  constructor(maxSize = 1000, ttl = 5 * 60 * 1000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    // Check TTL
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, item);
    return item;
  }

  set(key, value) {
    // Remove oldest items if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, {
      ...value,
      timestamp: Date.now()
    });
  }

  size() {
    return this.cache.size;
  }

  clear() {
    this.cache.clear();
  }
}

const userCache = new LRUCache(1000, 5 * 60 * 1000); // 1000 items, 5 minutes TTL

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
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
  const requestStartTime = Date.now();
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

  // Add request timeout
  const timeout = setTimeout(() => {
    res.status(408).json({ error: 'Request timeout' });
  }, 10000); // 10 second timeout

  try {
    const rawBody = await new Promise((resolve, reject) => {
      let data = '';
      req.on('data', (chunk) => (data += chunk));
      req.on('end', () => resolve(data));
      req.on('error', reject);
    });
    
    clearTimeout(timeout);
    
    // Parse JSON with proper error handling
    let parsedBody;
    try {
      parsedBody = JSON.parse(rawBody);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return res.status(400).json({ error: 'Invalid JSON format' });
    }
    
    const { userId, url, title } = parsedBody;

    if (!userId || !url || !title) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create URL hash
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
    // Check [userDoc] cache first
    const userRef = db.collection('portfolio_users_prod').doc(userId);
    let userDoc;
    const cacheKey = userId;
    const cachedUser = userCache.get(cacheKey);
    if (cachedUser) {
      console.log('Using cached user document');
      userDoc = cachedUser.doc;
    } else {
      userDoc = await userRef.get();
      userCache.set(cacheKey, {
        doc: userDoc
      });
    }

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    const currentInteractions = userData.interactionv2 || {};
    const serverTimestamp = admin.firestore.FieldValue.serverTimestamp();

    // Check if this is a new user for this URL (for unique user count)
    const isNewUser = !currentInteractions[urlHash];

    // Prepare updated user interaction
    let updatedInteraction;
    if (currentInteractions[urlHash]) {
      updatedInteraction = {
        ...currentInteractions[urlHash],
        count: currentInteractions[urlHash].count + 1,
        lastClick: serverTimestamp,
        title,
      };
    } else {
      updatedInteraction = {
        url,
        title,
        count: 1,
        firstClick: serverTimestamp,
        lastClick: serverTimestamp,
      };
    }
    const batch = db.batch();
    // 1. Update user document
    batch.update(userRef, {
      [`interactionv2.${urlHash}`]: updatedInteraction,
    });
    // 2. Update url_insights using merge write (no need to fetch first)
    const urlInsightRef = db.collection('url_insights').doc(urlHash);
    const updates = {
      urlHash,
      url,
      title,
      totalClicks: admin.firestore.FieldValue.increment(1),
      lastClick: serverTimestamp,
      updatedAt: serverTimestamp,
    };
    // Set these fields only on first creation
    const createOnlyFields = {
      firstClick: serverTimestamp,
      createdAt: serverTimestamp,
    };
    // Only increment unique users if this is a new user for this URL
    if (isNewUser) {
      updates.uniqueUsers = admin.firestore.FieldValue.increment(1);
      updates.userIds = admin.firestore.FieldValue.arrayUnion(userId);
    }
    // Use set with merge to handle both create and update cases
    batch.set(
      urlInsightRef,
      {
        ...updates,
        ...createOnlyFields,
      },
      { merge: true },
    );
    await batch.commit();

    // Performance and cache metrics
    const responseTime = Date.now() - requestStartTime;
    console.log(
      JSON.stringify({
        type: 'track_metrics',
        urlHash,
        userId,
        isNewUser,
        isCacheHit: !!cachedUser,
        cacheSize: userCache.size(),
        responseTime,
        memoryUsage: process.memoryUsage(),
        interaction: updatedInteraction,
        timestamp: new Date().toISOString(),
      }),
    );
    res.status(200).json({ success: true });
  } catch (error) {
    clearTimeout(timeout);
    const responseTime = Date.now() - requestStartTime;
    console.error('Tracking error:', {
      error: error.message,
      stack: error.stack,
      responseTime,
      memoryUsage: process.memoryUsage(),
      timestamp: new Date().toISOString()
    });
    
    // Return appropriate error status
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      res.status(503).json({ error: 'Service temporarily unavailable' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
