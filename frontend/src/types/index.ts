/**
 * Shared types that mirror backend /types
 * All UI components and hooks import from here
 * 
 * NOTE: These types must match exactly with backend/functions/src/types/shared.ts
 * Any changes here must be reflected in the backend types file
 */

// Base types
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// User types
export interface User extends BaseEntity {
  email: string;
  name: string;
  displayName: string; // Alias for name
  userId: string; // Alias for id
  role: 'citizen' | 'school' | 'msme' | 'government' | 'admin';
  profile: UserProfile;
  notifications: NotificationPreferences;
  isActive: boolean;
  assignedWards?: string[]; // For government users
  entityId?: string; // For school/msme users
}

export interface UserProfile {
  avatar?: string;
  bio?: string;
  location?: {
    city: string;
    state: string;
    wardId?: string;
  };
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: 'en' | 'hi';
    units: 'metric' | 'imperial';
  };
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
}

// Wallet types
export interface Wallet extends BaseEntity {
  userId: string;
  walletId: string; // Alias for id
  inrBalance: number;
  healCoins: number;
  balance: number; // Alias for healCoins
  totalEarned: number;
  totalRedeemed: number;
  transactions: WalletTransaction[]; // Array of transactions
  recentTransactions: any[]; // Recent transactions for dashboard
  lastTransactionAt?: Date;
  lastUpdated: string; // Alias for updatedAt
  isActive: boolean;
  dailyEarnLimit: number;
  monthlyEarnLimit: number;
}

export interface WalletTransaction extends BaseEntity {
  walletId: string;
  transactionId: string; // Alias for id
  userId: string;
  type: 'earn' | 'redeem' | 'refund' | 'bonus' | 'spend' | 'transfer';
  amount: number;
  source: string;
  description: string;
  status: string;
  metadata?: any;
  auditLogId: string;
}

// Tracker types
export interface CarbonLog extends BaseEntity {
  userId: string;
  logId: string; // Alias for id for backward compatibility
  actionType: 'transport' | 'energy' | 'waste' | 'water' | 'food';
  action: string; // Alias for actionType
  categoryId: string;
  value: number;
  quantity: number; // Alias for value
  unit: string;
  transportMode?: string; // For transport-specific logs
  co2Saved: number;
  coinsEarned: number;
  carbonFootprint?: number; // Alternative name for co2Saved
  details?: any;
  metadata?: any;
  wardId?: string;
}

export interface MentalHealthLog extends BaseEntity {
  userId: string;
  mood: 'excellent' | 'good' | 'neutral' | 'poor' | 'terrible';
  score: number;
  note?: string;
  factors?: string[];
  coinsEarned: number;
}

export interface AnimalWelfareLog extends BaseEntity {
  userId: string;
  actions: AnimalAction[];
  kindnessScore: number;
  coinsEarned: number;
  details?: any;
}

export type AnimalAction = 'rescue' | 'adoption' | 'volunteer' | 'donation' | 'education';

export interface DigitalTwinSimulation extends BaseEntity {
  userId: string;
  inputConfig: any;
  results: SimulationResults;
  coinsEarned: number;
}

export interface SimulationResults {
  co2Reduction: number;
  costSavings: number;
  recommendations: string[];
  confidence: number;
}

export interface MSMEReport extends BaseEntity {
  orgId: string;
  month: string;
  year: number;
  data: MSMEData;
  esgScore: number;
  pdfUrl?: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
}

export interface MSMEData {
  environmental: {
    energyUsage: number;
    wasteReduction: number;
    waterConservation: number;
    renewableEnergy: number;
  };
  social: {
    employeeWellness: number;
    communityEngagement: number;
    diversity: number;
    safety: number;
  };
  governance: {
    transparency: number;
    ethics: number;
    compliance: number;
    innovation: number;
  };
}

// Game types
export interface Game extends BaseEntity {
  title: string;
  description: string;
  type: 'quiz' | 'dragdrop' | 'simulation';
  config: GameConfig;
  coinsReward: number;
  isActive: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  tags: string[];
}

export interface GameConfig {
  questions?: QuizQuestion[];
  dragItems?: DragItem[];
  simulation?: SimulationConfig;
  timeLimit?: number;
  maxAttempts?: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  points: number;
}

export interface DragItem {
  id: string;
  label: string;
  category: string;
  correctPosition: { x: number; y: number };
}

export interface SimulationConfig {
  scenario: string;
  variables: SimulationVariable[];
  objectives: string[];
  constraints: string[];
}

export interface SimulationVariable {
  name: string;
  type: 'number' | 'boolean' | 'select';
  min?: number;
  max?: number;
  options?: string[];
  defaultValue: any;
}

export interface GameScore extends BaseEntity {
  userId: string;
  gameId: string;
  score: number;
  maxScore: number;
  timeSpent: number;
  attempts: number;
  coinsEarned: number;
  completedAt: Date;
}

// Subscription types
export interface SubscriptionPlan extends BaseEntity {
  name: string;
  description: string;
  price: number;
  currency: 'INR';
  duration: number; // days
  features: string[];
  isActive: boolean;
  maxUsers?: number;
  benefits: {
    dailyCoinCap: number;
    monthlyRedeemCap: number;
    prioritySupport: boolean;
    advancedAnalytics: boolean;
  };
}

export interface Subscription extends BaseEntity {
  userId: string;
  planId: string;
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  startDate: Date;
  endDate: Date;
  expiresAt?: Date; // Alias for endDate
  autoRenew: boolean;
  paymentId?: string;
  razorpaySubscriptionId?: string;
  razorpayPaymentId?: string; // Additional payment ID
  amount?: number; // Subscription amount
  metadata?: any; // Additional metadata
}

// Reward types
export interface Reward extends BaseEntity {
  title: string;
  name: string; // Alias for title
  description: string;
  category: string;
  healCoinsCost: number;
  coinCost: number; // Alias for healCoinsCost
  inrValue?: number;
  originalPrice?: number; // Alternative name for inrValue
  partnerId?: string;
  stock: number;
  isActive: boolean;
  imageUrl?: string;
  metadata?: any;
  redemptionInstructions?: string;
}

export interface Redemption extends BaseEntity {
  userId: string;
  rewardId: string;
  status: 'pending' | 'fulfilled' | 'failed' | 'cancelled' | 'completed';
  healCoinsSpent: number;
  healCoins: number; // Alias for healCoinsSpent
  coinCost?: number; // Alias for healCoinsSpent
  quantity?: number; // Quantity redeemed
  voucherCode?: string;
  fulfillmentDetails?: any;
  partnerResponse?: any;
  auditLogId: string;
  metadata?: any; // Additional metadata
}

// Dashboard types
export interface CitizenDashboard {
  user: User;
  wallet: Wallet;
  ecoScore: number;
  co2Saved: number;
  moodTrend: MoodTrendData[];
  kindnessIndex: number;
  recentActivity: ActivityLog[];
  leaderboard: LeaderboardEntry[];
  achievements: Achievement[];
}

export interface EntityDashboard {
  entity: {
    id: string;
    name: string;
    type: 'school' | 'msme';
    memberCount: number;
    ecoScore: number;
  };
  metrics: EntityMetrics;
  leaderboard: LeaderboardEntry[];
  recentActivity: ActivityLog[];
  reports: MSMEReport[];
}

export interface GovernmentDashboard {
  overview: GovernmentOverview;
  wardData: WardData[];
  policyMetrics: PolicyMetrics;
  recentActivities: ActivityLog[];
  alerts: SystemAlert[];
}

export interface GovernmentOverview {
  totalGovernments: number;
  activePolicies: number;
  pendingReviews: number;
  complianceRate: number;
}

export interface WardData {
  wardId: string;
  name: string;
  co2Saved: number;
  citizenCount: number;
  ecoScore: number;
  geoJson?: any;
}

export interface PolicyMetrics {
  distribution: {
    draft: number;
    active: number;
    completed: number;
    suspended: number;
  };
  trends: {
    newThisMonth: number;
    avgImplementationTime: number;
    approvalRate: number;
  };
}


export interface AdminDashboard {
  users: UserStats;
  transactions: TransactionStats;
  systemHealth: SystemHealth;
  recentDeployments: DeploymentLog[];
  errorTrends: ErrorTrend[];
  fraudAlerts: FraudAlert[];
}

export interface UserStats {
  total: number;
  active: number;
  byRole: Record<string, number>;
  growth: number;
}

export interface TransactionStats {
  totalVolume: number;
  dailyEarnings: number;
  monthlyRedemptions: number;
  successRate: number;
}

export interface SystemHealth {
  uptime: number;
  errorRate: number;
  responseTime: number;
  activeConnections: number;
}

export interface DeploymentLog extends BaseEntity {
  branch: string;
  actor: string;
  status: 'success' | 'failed' | 'in_progress';
  commitHash: string;
  duration?: number;
  errorMessage?: string;
}

export interface ErrorTrend {
  module: string;
  errorType: string;
  count: number;
  lastOccurred: Date;
}

export interface FraudAlert extends BaseEntity {
  userId: string;
  action: string;
  reason: string;
  severity: 'low' | 'medium' | 'high';
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
  adminNotes?: string;
}

// Activity and monitoring types
export interface ActivityLog extends BaseEntity {
  userId: string;
  activityId: string; // Alias for id
  action: string;
  activityType: string; // Alias for action
  description: string;
  details: any;
  metadata: any; // Additional metadata
  module: string;
  timestamp: string; // Alias for createdAt
  coinsEarned?: number;
  co2Saved?: number;
}

export interface TrackerMetric {
  label: string;
  value: number | string;
  unit: string;
  trend: number;
  icon: any; // LucideIcon
  color: string;
}

export interface DepartmentAnalytics {
  departmentId: string;
  departmentName: string;
  totalUsers: number;
  activeUsers: number;
  carbonSaved: number;
  averageScore: number;
  participationRate: number;
  lastUpdated: string;
  metrics: {
    environmental: number;
    social: number;
    governance: number;
  };
}

export interface EntityData {
  id: string;
  name: string;
  type: string;
  stats: {
    totalUsers: number;
    activeUsers: number;
    carbonSaved: number;
    averageScore: number;
  };
  metrics: {
    environmental: number;
    social: number;
    governance: number;
  };
  departmentAnalytics: DepartmentAnalytics[];
  lastUpdated: string;
}

export interface AuthUser {
  id: string;
  userId: string; // Alias for id
  email: string;
  displayName?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog extends BaseEntity {
  actorId: string;
  actionType: string;
  entityId: string;
  before: any;
  after: any;
  source: string;
  hash?: string;
  previousHash?: string;
}

export interface ErrorLog extends BaseEntity {
  userId?: string;
  module: string;
  errorType: string;
  message: string;
  stackTrace?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
}

export interface PerformanceMetric extends BaseEntity {
  metricType: string;
  value: number;
  context: any;
  module: string;
  percentile?: number;
}

// Leaderboard types
export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  score: number;
  avatar?: string;
  change?: number;
}

export interface Leaderboard {
  id: string;
  title: string;
  type: 'citizen' | 'school' | 'msme' | 'government';
  entries: LeaderboardEntry[];
  lastUpdated: Date;
  totalParticipants: number;
}

// Achievement types
export interface Achievement extends BaseEntity {
  userId: string;
  type: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  coinsReward: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

// Notification types
export interface NotificationTemplate extends BaseEntity {
  templateId: string;
  channel: 'email' | 'sms' | 'push';
  subject: string;
  body: string;
  variables: string[];
  isActive: boolean;
}

export interface NotificationLog extends BaseEntity {
  userId: string;
  channel: 'email' | 'sms' | 'push';
  templateId: string;
  status: 'sent' | 'failed' | 'pending';
  sentAt?: Date;
  response?: any;
  errorMessage?: string;
}

// Integration types
export interface PartnerConfig extends BaseEntity {
  partnerId: string;
  name: string;
  apiUrl: string;
  authType: 'apiKey' | 'oauth' | 'basic';
  credentials: any;
  enabled: boolean;
  features: string[];
}

export interface WardGeoData extends BaseEntity {
  wardId: string;
  name: string;
  geoJson: any;
  simplified: boolean;
  lastUpdated: Date;
}

// Feature flag types
export interface FeatureFlag {
  name: string;
  enabled: boolean;
  description: string;
  modules: string[];
  conditions?: any;
}

// Monitoring types
export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  memory: {
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
  };
  cpu: {
    user: number;
    system: number;
  };
  uptime: number;
  performance: Record<string, {
    avg: number;
    p95: number;
    p99: number;
    count: number;
  }>;
}

export interface Analytics {
  dau: number;
  totalCoins: number;
  totalCo2Saved: number;
  ecoMindScore: number;
  kindnessIndex: number;
  errorCount: number;
  subscriptionCount: number;
  fraudAlerts: number;
  performance: {
    avgLatency: number;
    p95Latency: number;
    p99Latency: number;
  };
}

export interface SystemAlert {
  id: string;
  type: 'webhook_failure' | 'co2_drop' | 'downtime' | 'error_spike' | 'performance_degradation' | 'compliance' | 'policy' | 'performance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  data?: any;
  timestamp: string;
  resolved: boolean;
  resolvedAt?: string;
  entityId?: string;
  resolvedBy?: string;
}

export interface PerformanceMetrics {
  metrics: Record<string, {
    avg: number;
    p95: number;
    p99: number;
    count: number;
  }>;
  timestamp: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedApiResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Utility types
export type UserRole = 'citizen' | 'school' | 'msme' | 'government' | 'admin';
export type GameType = 'quiz' | 'dragdrop' | 'simulation';
export type SubscriptionStatus = 'active' | 'expired' | 'cancelled' | 'pending';
export type RedemptionStatus = 'pending' | 'fulfilled' | 'failed' | 'cancelled';
export type NotificationChannel = 'email' | 'sms' | 'push';
export type TimeRange = '24h' | '7d' | '30d' | '90d';
export type ExportFormat = 'csv' | 'pdf' | 'json';

// Form data types
export interface CarbonLogFormData {
  actionType: string; // Keep for backward compatibility
  activity: string; // Alias for actionType
  value: number; // Keep for backward compatibility
  amount: number; // Alias for value
  unit: string;
  categoryId?: string; // Keep for backward compatibility
  category: string; // Alias for categoryId
  description: string;
  date: string;
  location?: string; // Location where the activity took place
  metadata?: any;
}

// Additional missing types
export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: 'earn' | 'spend' | 'refund' | 'transfer';
  description: string;
  timestamp: string;
  metadata?: any;
}

export interface AdminConfig {
  id: string;
  key: string;
  value: any;
  description?: string;
  updatedAt: string;
}

export interface Ward {
  id: string;
  name: string;
  city: string;
  state: string;
  population: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface School {
  id: string;
  name: string;
  wardId: string;
  type: 'primary' | 'secondary' | 'college';
  studentCount: number;
  principalName: string;
  contactInfo: {
    email: string;
    phone: string;
  };
}

export interface MSME {
  id: string;
  name: string;
  wardId: string;
  type: 'manufacturing' | 'service' | 'retail';
  employeeCount: number;
  ownerName: string;
  contactInfo: {
    email: string;
    phone: string;
  };
}

export interface Payment {
  id: string;
  userId: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  paymentMethod: 'razorpay' | 'stripe' | 'paypal';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardFilters {
  dateRange?: {
    start: string;
    end: string;
  };
  entityType?: 'school' | 'msme';
  wardId?: string;
  status?: string;
  userId?: string;
  entityId?: string;
}

// Dashboard data types
export interface MoodTrendData {
  date: string;
  mood: number;
  note?: string;
}

export interface EntityMetrics {
  totalMembers: number;
  activeMembers: number;
  avgEcoScore: number;
  totalCo2Saved: number;
  totalCoinsEarned: number;
  engagementRate: number;
}

// Re-export game types
export * from './games';