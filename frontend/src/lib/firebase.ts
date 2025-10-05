'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, Firestore } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator, Functions } from 'firebase/functions';
import { getStorage, connectStorageEmulator, FirebaseStorage } from 'firebase/storage';

const isClient = typeof window !== 'undefined';
const useEmulators = process.env.NEXT_PUBLIC_FIREBASE_USE_EMULATORS === 'true';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Validate Firebase configuration
const validateFirebaseConfig = () => {
  const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  const missing = requiredKeys.filter(key => !firebaseConfig[key as keyof typeof firebaseConfig]);
  
  if (missing.length > 0) {
    console.error(`Missing Firebase config values: ${missing.join(', ')}`);
    return false;
  }
  return true;
};

// Get Firebase configuration with fallbacks
const getFirebaseConfig = () => {
  if (useEmulators) {
    return {
      apiKey: firebaseConfig.apiKey || 'demo-api-key',
      authDomain: firebaseConfig.authDomain || 'demo.firebaseapp.com',
      databaseURL: firebaseConfig.databaseURL || 'http://localhost:9000',
      projectId: firebaseConfig.projectId || 'demo-zeroprint',
      storageBucket: firebaseConfig.storageBucket || 'demo-zeroprint.appspot.com',
      messagingSenderId: firebaseConfig.messagingSenderId || 'demo-sender',
      appId: firebaseConfig.appId || 'demo-app-id',
      measurementId: firebaseConfig.measurementId || 'G-XXXXXXXXXX',
    };
  }

  if (!validateFirebaseConfig()) {
    console.warn('Invalid Firebase config, falling back to emulator mode');
    return {
      apiKey: 'demo-api-key',
      authDomain: 'demo.firebaseapp.com',
      databaseURL: 'http://localhost:9000',
      projectId: 'demo-zeroprint',
      storageBucket: 'demo-zeroprint.appspot.com',
      messagingSenderId: 'demo-sender',
      appId: 'demo-app-id',
      measurementId: 'G-XXXXXXXXXX',
    };
  }

  return firebaseConfig;
};

// Initialize Firebase app
let app: FirebaseApp | null = null;
export const getFirebaseApp = (): FirebaseApp | null => {
  if (!isClient) return null;
  if (app) return app;
  
  try {
    const config = getFirebaseConfig();
    app = getApps().length === 0 ? initializeApp(config) : getApp();
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔥 Firebase initialized:', {
        projectId: config.projectId,
        useEmulators,
        authDomain: config.authDomain,
      });
    }
    
    return app;
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
    return null;
  }
};

// Safe emulator connection helper
const safeConnect = (fn: () => void, label: string) => {
  try {
    fn();
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ Connected to ${label} emulator`);
    }
  } catch (error) {
    console.warn(`Failed to connect ${label} emulator:`, error);
  }
};

// Auth instance
export const auth = ((): Auth | undefined => {
  if (!isClient) return undefined;
  
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) return undefined;

  try {
    const authInstance = getAuth(firebaseApp);
    
    if (useEmulators) {
      safeConnect(
        () => connectAuthEmulator(
          authInstance,
          process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR ?? 'http://127.0.0.1:9099',
          { disableWarnings: true }
        ),
        'Auth'
      );
    }
    
    return authInstance;
  } catch (error) {
    console.error('Failed to initialize Auth:', error);
    return undefined;
  }
})();

// Firestore instance
export const db = ((): Firestore | undefined => {
  if (!isClient) return undefined;
  
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) return undefined;

  try {
    const firestore = getFirestore(firebaseApp);
    
    if (useEmulators) {
      safeConnect(
        () => {
          const host = process.env.NEXT_PUBLIC_FIREBASE_FIRESTORE_EMULATOR ?? 'localhost';
          const port = Number(process.env.NEXT_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_PORT ?? 8080);
          connectFirestoreEmulator(firestore, host, port);
        },
        'Firestore'
      );
    }
    
    return firestore;
  } catch (error) {
    console.error('Failed to initialize Firestore:', error);
    return undefined;
  }
})();

// Functions instance
export const functions = ((): Functions | undefined => {
  if (!isClient) return undefined;
  
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) return undefined;

  try {
    const region = process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_REGION ?? 'asia-south1';
    const functionsInstance = getFunctions(firebaseApp, region);

    if (useEmulators) {
      safeConnect(
        () => {
          const host = process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_EMULATOR ?? 'localhost';
          const port = Number(process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_EMULATOR_PORT ?? 5001);
          connectFunctionsEmulator(functionsInstance, host, port);
        },
        'Functions'
      );
    }
    
    return functionsInstance;
  } catch (error) {
    console.error('Failed to initialize Functions:', error);
    return undefined;
  }
})();

// Storage instance
export const storage = ((): FirebaseStorage | undefined => {
  if (!isClient) return undefined;
  
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) return undefined;

  try {
    const storageInstance = getStorage(firebaseApp);
    
    if (useEmulators) {
      safeConnect(
        () => {
          const host = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_EMULATOR ?? 'localhost';
          const port = Number(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_EMULATOR_PORT ?? 9199);
          connectStorageEmulator(storageInstance, host, port);
        },
        'Storage'
      );
    }
    
    return storageInstance;
  } catch (error) {
    console.error('Failed to initialize Storage:', error);
    return undefined;
  }
})();

// Google Auth Provider
export const googleAuthProvider = (() => {
  if (!isClient) return undefined as any;
  
  try {
    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');
    return provider;
  } catch (error) {
    console.error('Failed to create Google Auth Provider:', error);
    return undefined as any;
  }
})();

// Firestore converters
const passthroughConverter = {
  toFirestore: (data: any) => data,
  fromFirestore: (snapshot: any) => snapshot.data(),
};

export const carbonLogConverter = passthroughConverter;
export const walletConverter = passthroughConverter;
export const mentalHealthLogConverter = passthroughConverter;
export const animalWelfareLogConverter = passthroughConverter;
export const digitalTwinSimulationConverter = passthroughConverter;
export const msmeReportConverter = passthroughConverter;
export const gameScoreConverter = passthroughConverter;