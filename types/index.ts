export interface User {
  userId: string;
  email: string;
  name: string;
  role: 'citizen' | 'school' | 'msme' | 'govt' | 'admin';
  wardId?: string;
  orgId?: string;
  createdAt: string;
}

export interface Wallet {
  walletId: string;
  entityId: string; // maps to userId or orgId
  inrBalance: number;
  healCoins: number;
  lastUpdated: string;
}

export interface Payment {
  paymentId: string;
  userId: string;
  amount: number;
  currency: 'INR';
  status: 'success' | 'failed' | 'pending';
  planId?: string;
  createdAt: string;
}

export interface Subscription {
  subscriptionId: string;
  userId: string;
  plan: 'citizen' | 'school' | 'msme';
  status: 'active' | 'expired' | 'canceled';
  startDate: string;
  endDate: string;
}

export interface Game {
  gameId: string;
  type: 'quiz' | 'dragdrop' | 'simulation';
  title: string;
  description: string;
  category: 'city' | 'solar' | 'waste' | 'energy' | 'oil' | 'transport' | 'housing';
}

export interface GameScore {
  scoreId: string;
  userId: string;
  gameId: string;
  score: number;
  coinsEarned: number;
  createdAt: string;
}

export interface LeaderboardEntry {
  entryId: string;
  userId: string;
  score: number;
  rank: number;
  context: 'citizen' | 'school' | 'msme' | 'ward' | 'govt';
}

export interface AuditLog {
  logId: string;
  type: 'wallet' | 'payment' | 'subscription' | 'game' | 'tracker';
  action: string;
  userId: string;
  data: any;
  createdAt: string;
}

export interface ActivityLog {
  logId: string;
  userId: string;
  action: string; // e.g. "logCarbonAction", "logMoodCheckin"
  details: any;
  timestamp: string;
}


