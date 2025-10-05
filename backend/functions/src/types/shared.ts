export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// User types
export interface User extends BaseEntity {
  id: string;
  email: string;
  name: string;
  role: "citizen" | "school" | "msme" | "government" | "admin";
  profile: UserProfile;
  notifications: NotificationPreferences;
  isActive: boolean;
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
    theme: "light" | "dark" | "system";
    language: "en" | "hi";
    units: "metric" | "imperial";
  };
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
}

// Wallet types
export interface Wallet extends BaseEntity {
  id: string;
  userId: string;
  inrBalance: number;
  healCoins: number;
  totalEarned: number;
  totalRedeemed: number;
  lastTransactionAt?: string;
}

export interface WalletTransaction extends BaseEntity {
  id: string;
  walletId: string;
  type: "earn" | "redeem" | "refund" | "bonus";
  amount: number;
  source: string;
  description: string;
  metadata?: any;
  auditLogId: string;
}

// Tracker types
export interface CarbonLog extends BaseEntity {
  id: string;
  userId: string;
  categoryId: string;
  action: string;
  co2Saved: number;
  quantity: number;
  unit: string;
  timestamp: string;
  metadata?: any;
}

export interface MoodLog extends BaseEntity {
  id: string;
  userId: string;
  mood: number;
  energy: number;
  stress: number;
  notes?: string;
  timestamp: string;
  metadata?: any;
}

export interface MentalHealthLog extends BaseEntity {
  userId: string;
  mood: "excellent" | "good" | "neutral" | "poor" | "terrible";
  score: number;
  note?: string;
  factors?: string[];
  coinsEarned: number;
}

export interface AnimalWelfareLog extends BaseEntity {
  id: string;
  userId: string;
  action: string;
  category: string;
  impact: number;
  description: string;
  timestamp: string;
  metadata?: any;
}

export interface AnimalAction {
  type: "rescue" | "adoption" | "volunteer" | "donation" | "education";
  description: string;
  impact: number;
}

export interface DigitalTwinSimulation extends BaseEntity {
  id: string;
  userId: string;
  scenario: string;
  inputConfig: any;
  results: any;
  parameters: any;
  metadata?: any;
}

export interface SimulationResults {
  co2Reduction: number;
  costSavings: number;
  recommendations: string[];
  confidence: number;
}

export interface MSMEReport extends BaseEntity {
  id: string;
  userId: string;
  reportType: string;
  reportData: any;
  data: any;
  esgScore: number;
  metadata?: any;
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
  id: string;
  title: string;
  name: string;
  description: string;
  type: "quiz" | "dragdrop" | "simulation";
  config: GameConfig;
  coinsReward: number;
  maxCoins: number;
  isActive: boolean;
  difficulty: "easy" | "medium" | "hard";
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
  type: "number" | "boolean" | "select";
  min?: number;
  max?: number;
  options?: string[];
  defaultValue: any;
}

export interface GameScore extends BaseEntity {
  id: string;
  userId: string;
  gameId: string;
  gameName: string;
  score: number;
  maxScore: number;
  timeSpent: number;
  attempts: number;
  coinsEarned: number;
  completedAt: string;
}

// Subscription types
export interface SubscriptionPlan extends BaseEntity {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: "INR";
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
  id: string;
  userId: string;
  planId: string;
  planName: string;
  amount: number;
  currency: string;
  status: "active" | "expired" | "cancelled" | "pending";
  startDate: string | null;
  endDate: string | null;
  autoRenew: boolean;
  paymentId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string | null;
  razorpaySignature?: string | null;
  metadata?: any;
}

// Payment types
export interface Payment extends BaseEntity {
  id: string;
  userId: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: "completed" | "pending" | "failed" | "refunded";
  paymentMethod: "razorpay" | "stripe" | "paypal";
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  metadata?: any;
}

// Reward types
export interface Reward extends BaseEntity {
  id: string;
  title: string;
  name: string;
  description: string;
  category: string;
  cost: number;
  healCoinsCost: number;
  inrValue?: number;
  partnerId?: string;
  stock: number | null;
  isActive: boolean;
  imageUrl?: string;
  metadata?: any;
  redemptionInstructions?: string;
}

export interface Redemption extends BaseEntity {
  id: string;
  userId: string;
  rewardId: string;
  rewardName: string;
  cost: number;
  quantity: number;
  status: "pending" | "success" | "failed";
  notes?: string;
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
    type: "school" | "msme";
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

export interface SystemAlert {
  id: string;
  type: "compliance" | "policy" | "performance";
  message: string;
  severity: "low" | "medium" | "high";
  timestamp: Date;
  entityId?: string;
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
  id: string;
  branch: string;
  actor: string;
  status: "success" | "failed" | "in_progress";
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
  id: string;
  userId: string;
  action: string;
  reason: string;
  severity: "low" | "medium" | "high";
  status: "open" | "investigating" | "resolved" | "false_positive";
  adminNotes?: string;
}

// Activity and monitoring types
export interface ActivityLog extends BaseEntity {
  id: string;
  userId: string;
  action: string;
  details: any;
  module: string;
  coinsEarned?: number;
  co2Saved?: number;
}

export interface AuditLog extends BaseEntity {
  id: string;
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
  id: string;
  userId?: string;
  module: string;
  errorType: "runtime" | "build" | "api" | "database" | "auth";
  message: string;
  stackTrace?: string;
  severity: "low" | "medium" | "high" | "critical";
  resolved: boolean;
}

export interface PerformanceMetric extends BaseEntity {
  id: string;
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
  type: "citizen" | "school" | "msme" | "government";
  entries: LeaderboardEntry[];
  lastUpdated: string;
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
  rarity: "common" | "rare" | "epic" | "legendary";
}

// Notification types
export interface NotificationTemplate extends BaseEntity {
  templateId: string;
  channel: "email" | "sms" | "push";
  subject: string;
  body: string;
  variables: string[];
  isActive: boolean;
}

export interface NotificationLog extends BaseEntity {
  userId: string;
  channel: "email" | "sms" | "push";
  templateId: string;
  status: "sent" | "failed" | "pending";
  sentAt?: Date;
  response?: any;
  errorMessage?: string;
}

// Integration types
export interface PartnerConfig extends BaseEntity {
  partnerId: string;
  name: string;
  apiUrl: string;
  authType: "apiKey" | "oauth" | "basic";
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
export type UserRole = "citizen" | "school" | "msme" | "government" | "admin";
export type GameType = "quiz" | "dragdrop" | "simulation";
export type SubscriptionStatus = "active" | "expired" | "cancelled" | "pending";
export type RedemptionStatus = "pending" | "fulfilled" | "failed" | "cancelled";
export type NotificationChannel = "email" | "sms" | "push";
export type TimeRange = "24h" | "7d" | "30d" | "90d";
export type ExportFormat = "csv" | "pdf" | "json";

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
