'use client';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

const useEmulators = process.env.NEXT_PUBLIC_FIREBASE_USE_EMULATORS === 'true';
// Avoid implicit emulator to prevent 9099 errors; only use when explicitly enabled
const effectiveUseEmulators = useEmulators;
const isClient = typeof window !== 'undefined';

// Base Firebase configuration from environment variables
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

// Debug logging for Firebase config
if (isClient) {
  console.log('🔧 Firebase Config Debug:', {
    useEmulators,
    effectiveUseEmulators,
    env_use_emulators: process.env.NEXT_PUBLIC_FIREBASE_USE_EMULATORS,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

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

  // Check for required config values (databaseURL is optional)
  const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  const missing = requiredKeys.filter(key => !firebaseConfig[key as keyof typeof firebaseConfig]);

  if (missing.length > 0) {
    console.warn(`Missing Firebase config values: ${missing.join(', ')}`);
    console.warn('Falling back to emulator mode...');
    // Fall back to emulator configuration
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

let app: ReturnType<typeof initializeApp> | null = null;
export const getFirebaseApp = () => {
  if (!isClient) return null;
  if (app) return app;
  const cfg = getFirebaseConfig();
  app = getApps().length === 0 ? initializeApp(cfg) : getApp();
  return app;
};

// --- Helpers for emulator connection ---
const safeConnect = (fn: () => void, label: string) => {
  try {
    fn();
  } catch (error) {
    console.warn(`Failed to connect ${label} emulator`, error);
  }
};

// --- Auth ---
export const auth = (() => {
  if (!isClient) return undefined as any;
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) return undefined as any;

  const authInstance = getAuth(firebaseApp);
  if (effectiveUseEmulators) {
    safeConnect(
      () =>
        connectAuthEmulator(
          authInstance,
          process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR ?? 'http://127.0.0.1:9099',
          { disableWarnings: true }
        ),
      'Auth'
    );
  }
  return authInstance;
})();

// --- Firestore ---
export const db = (() => {
  if (!isClient) return undefined as any;
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) return undefined as any;

  const firestore = getFirestore(firebaseApp);
  if (effectiveUseEmulators) {
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
})();

// --- Functions ---
export const functions = (() => {
  if (!isClient) return undefined as any;
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) return undefined as any;

  const region = process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_REGION ?? 'asia-south1';
  const functionsInstance = getFunctions(firebaseApp, region);

  if (effectiveUseEmulators) {
    console.log('🔧 Connecting to Functions Emulator...');
    safeConnect(
      () => {
        const host = process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_EMULATOR ?? 'localhost';
        const port = Number(process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_EMULATOR_PORT ?? 5001);
        console.log(`🔧 Functions Emulator: ${host}:${port}`);
        connectFunctionsEmulator(functionsInstance, host, port);
      },
      'Functions'
    );
  } else {
    console.log('🔧 Using production Firebase Functions');
  }
  return functionsInstance;
})();

// --- Storage ---
export const storage = (() => {
  if (!isClient) return undefined as any;
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) return undefined as any;

  const storageInstance = getStorage(firebaseApp);
  if (effectiveUseEmulators) {
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
})();

// --- Providers ---
export const googleAuthProvider = (() => {
  if (!isClient) return undefined as any;
  return new GoogleAuthProvider();
})();

// --- Generic pass-through Firestore converter ---
const passthroughConverter = {
  toFirestore: (data: any) => data,
  fromFirestore: (snapshot: any) => snapshot.data(),
};

// Reuse the same converter everywhere
    export const carbonLogConverter = passthroughConverter;
export const walletConverter = passthroughConverter;
export const mentalHealthLogConverter = passthroughConverter;
export const animalWelfareLogConverter = passthroughConverter;
export const digitalTwinSimulationConverter = passthroughConverter;
export const msmeReportConverter = passthroughConverter;
    export const gameScoreConverter = passthroughConverter;
