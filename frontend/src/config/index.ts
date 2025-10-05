export const FEATURE_FLAGS = {
  useEmulators: process.env.NEXT_PUBLIC_FIREBASE_USE_EMULATORS === 'true',
};

export const ROUTES = {
  login: '/auth/login',
  dashboard: '/dashboard',
  subscriptions: '/subscriptions',
};

export const LIMITS = {
  dailyEarnCap: 500,
  monthlyRedeemCap: 1000,
};

export const PLAN_IDS = ['citizen', 'school', 'msme'] as const;


