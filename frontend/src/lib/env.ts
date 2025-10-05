/**
 * Environment Configuration
 * Single source for API base URL and environment settings
 */

// API Base URL Configuration
export const getApiBaseUrl = (): string => {
  // Check for explicit API base URL
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }

  // Production URL
  if (process.env.NODE_ENV === 'production') {
    return 'https://us-central1-zeroprint-49afb.cloudfunctions.net/api';
  }

  // Development - Firebase Functions emulator
  return 'http://127.0.0.1:5000/zeroprint-49afb/asia-south1/api';
};

// Firebase Emulator Configuration
export const getFirebaseEmulatorConfig = () => {
  const useEmulators = process.env.NEXT_PUBLIC_FIREBASE_USE_EMULATORS === 'true';
  
  if (!useEmulators) return null;

  return {
    functions: {
      port: parseInt(process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_EMULATOR_PORT || '5000'),
    },
    firestore: {
      port: parseInt(process.env.NEXT_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_PORT || '8080'),
    },
    auth: {
      port: parseInt(process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_PORT || '9099'),
    },
    storage: {
      port: parseInt(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_EMULATOR_PORT || '9199'),
    },
  };
};

// Feature Flags from Environment
export const getFeatureFlags = () => ({
  notificationsEmail: process.env.NEXT_PUBLIC_FEATURE_NOTIFICATIONS_EMAIL === 'true',
  notificationsSMS: process.env.NEXT_PUBLIC_FEATURE_NOTIFICATIONS_SMS === 'true',
  notificationsPush: process.env.NEXT_PUBLIC_FEATURE_NOTIFICATIONS_PUSH === 'true',
  csrPartners: process.env.NEXT_PUBLIC_FEATURE_CSR_PARTNERS === 'true',
  geoServices: process.env.NEXT_PUBLIC_FEATURE_GEO_SERVICES === 'true',
  advancedAnalytics: process.env.NEXT_PUBLIC_FEATURE_ADVANCED_ANALYTICS === 'true',
  fraudDetection: process.env.NEXT_PUBLIC_FEATURE_FRAUD_DETECTION === 'true',
  dpdpCompliance: process.env.NEXT_PUBLIC_FEATURE_DPDP_COMPLIANCE === 'true',
});

// Environment Detection
export const isDevelopment = (): boolean => {
  return process.env.NODE_ENV === 'development';
};

export const isProduction = (): boolean => {
  return process.env.NODE_ENV === 'production';
};

export const isEmulatorMode = (): boolean => {
  return process.env.NEXT_PUBLIC_FIREBASE_USE_EMULATORS === 'true';
};
