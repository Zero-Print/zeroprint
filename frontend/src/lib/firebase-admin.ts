import { initializeApp, getApps, cert, ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

// Firebase Admin configuration
let adminApp: any = null;

export const getFirebaseAdminApp = () => {
  if (adminApp) return adminApp;

  try {
    // Check if Firebase Admin is already initialized
    if (getApps().length > 0) {
      adminApp = getApps()[0];
      return adminApp;
    }

    // Get service account key from environment variable
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    
    if (!serviceAccountKey) {
      console.error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set');
      throw new Error('Firebase Admin SDK requires service account key');
    }

    let serviceAccount: ServiceAccount;
    
    try {
      // Parse the service account key from environment variable
      serviceAccount = JSON.parse(serviceAccountKey);
    } catch (error) {
      console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:', error);
      throw new Error('Invalid service account key format');
    }

    // Initialize Firebase Admin
    adminApp = initializeApp({
      credential: cert(serviceAccount),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || serviceAccount.project_id,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });

    if (process.env.NODE_ENV === 'development') {
      console.log('🔥 Firebase Admin initialized for project:', adminApp.options.projectId);
    }

    return adminApp;
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
    throw error;
  }
};

// Admin Auth instance
export const adminAuth = () => {
  const app = getFirebaseAdminApp();
  return getAuth(app);
};

// Admin Firestore instance
export const adminDb = () => {
  const app = getFirebaseAdminApp();
  return getFirestore(app);
};

// Admin Storage instance
export const adminStorage = () => {
  const app = getFirebaseAdminApp();
  return getStorage(app);
};

// Utility function to verify Firebase Admin is properly configured
export const verifyFirebaseAdminConfig = () => {
  try {
    const app = getFirebaseAdminApp();
    return {
      success: true,
      projectId: app.options.projectId,
      message: 'Firebase Admin is properly configured'
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Firebase Admin configuration failed'
    };
  }
};
