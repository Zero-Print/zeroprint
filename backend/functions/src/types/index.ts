// Re-export shared types for backend consumers
export * from "./shared";

// Subscription & Payment types (with aliases to avoid conflicts)
export type {
  PlanId as SubscriptionPlanId,
  SubscriptionStatus as SubStatus,
  PaymentStatus as PayStatus,
  SubscriptionPlan as SubPlan,
  Subscription as UserSubscription,
  Payment as SubscriptionPayment,
  RazorpayWebhookPayload,
  CreateSubscriptionRequest,
  CreateSubscriptionResponse,
  ProcessWebhookRequest,
  CancelSubscriptionRequest,
} from "./shared/subscriptions";
export {SUBSCRIPTION_PLANS} from "./shared/subscriptions";

// Backend-specific User (superset for legacy compatibility)
export interface User {
  userId: string;
  email: string;
  displayName?: string;
  name?: string;
  role: UserRole;
  profilePicture?: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt?: string;
  healCoins?: number;
  wardId?: string;
  orgId?: string;
  phoneNumber?: string;
  preferences?: {
    notifications: boolean;
    dataSharing: boolean;
    language: string;
  };
}

export type UserRole = "citizen" | "school" | "msme" | "govt" | "admin";

// Carbon Tracking Types
// Import shared types
// TODO: Fix shared types path
// import { CarbonLog as SharedCarbonLog, BackendCarbonLog } from '../../../shared/types/carbon';

// Use shared tracker models (CarbonLog etc.) from @shared-trackers

// Remove the type alias that's causing errors
// export type CarbonLog = BackendCarbonLog;

export type CarbonCategory = "transport" | "energy" | "food" | "waste" | "water" | "other";

export interface CarbonLogFormData {
  activity: string;
  category: CarbonCategory;
  amount: number;
  unit: string;
  description?: string;
  date: string;
}

// Wallet Types
export interface Wallet {
  walletId: string;
  id: string;
  entityId: string; // maps to userId or orgId
  userId: string;
  inrBalance: number;
  healCoins: number;
  totalEarned: number;
  totalRedeemed: number;
  lastUpdated: string;
  lastTransactionAt?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  dailyEarnLimit?: number;
  monthlyEarnLimit?: number;
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  type: "earn" | "redeem" | "refund" | "bonus";
  amount: number;
  source: string;
  description: string;
  metadata?: any;
  auditLogId: string;
  createdAt: string;
  updatedAt: string;
}

// Subscription Types
export interface Subscription {
  subscriptionId: string;
  id: string;
  userId: string;
  planId: string;
  planType: SubscriptionPlanType;
  planName: string;
  plan?: any; // Added for compatibility
  status: SubscriptionStatus;
  startDate: string | null;
  endDate: string | null;
  paymentStatus: "pending" | "completed" | "failed";
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  amount: number;
  currency: string;
  features: string[];
  autoRenew?: boolean; // Added for compatibility
  paymentId?: string; // Added for compatibility
  createdAt: string;
  updatedAt: string;
}

export type SubscriptionPlanType = "basic" | "premium" | "enterprise";
export type SubscriptionStatus = "active" | "inactive" | "cancelled" | "expired" | "pending" | "created" | "failed";

export interface SubscriptionPlan {
  planId: string;
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  duration: string;
  features: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionPlanData {
  planId: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  duration: string;
  features: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Game Types
export interface Game {
  gameId: string;
  title: string;
  description: string;
  category: GameCategory;
  difficulty: GameDifficulty;
  type: GameType;
  config: GameConfig;
  coins: number;
  maxScore: number;
  estimatedTime: number; // in seconds
  tags: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Legacy compatibility
  rewardPoints?: number;
  coinsReward?: number;
  metadata?: any;
}

export type GameType = "quiz" | "dragdrop" | "simulation";

export type GameCategory =
  | "solar"
  | "city"
  | "waste"
  | "energy"
  | "housing"
  | "oil"
  | "transport"
  | "general";

export type GameDifficulty = "easy" | "medium" | "hard";

// Game Configuration Types
export interface GameConfig {
  [key: string]: any;
}

export interface QuizConfig extends GameConfig {
  questions: QuizQuestion[];
  timeLimit?: number;
  questionTimeLimit?: number;
  allowSkip: boolean;
  showCorrectAnswer: boolean;
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
}

export interface QuizQuestion {
  id: string;
  text: string;
  type: "single" | "multiple";
  options: QuizOption[];
  correctAnswer?: string; // for single choice
  correctAnswers?: string[]; // for multiple choice
  points: number;
  category?: string;
  explanation?: string;
  imageUrl?: string;
}

export interface QuizOption {
  id: string;
  text: string;
  imageUrl?: string;
}

export interface DragDropConfig extends GameConfig {
  mode: "sorting" | "matching" | "jigsaw";
  items: DragDropItem[];
  targets: DragDropTarget[];
  correctMapping: Record<string, string>;
  allowHints: boolean;
  requireAllItems: boolean;
  minRequiredItems?: number;
  timeLimit?: number;
}

export interface DragDropItem {
  id: string;
  name: string;
  imageUrl?: string;
  category?: string;
  points: number;
  description?: string;
}

export interface DragDropTarget {
  id: string;
  name: string;
  imageUrl?: string;
  category?: string;
  maxItems: number;
  description?: string;
}

export interface SimulationConfig extends GameConfig {
  inputs: SimulationInput[];
  formulas: SimulationFormula[];
  scenarios?: SimulationScenario[];
  charts?: SimulationChart[];
  autoCalculate: boolean;
  allowReset: boolean;
  timeLimit?: number;
}

export interface SimulationInput {
  id: string;
  label: string;
  type: "number" | "slider" | "select" | "toggle" | "text";
  defaultValue?: any;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  options?: Array<{ value: any; label: string }>;
  required: boolean;
  description?: string;
  maxLength?: number;
}

export interface SimulationFormula {
  id: string;
  name: string;
  expression: string;
  unit?: string;
  description?: string;
  insights?: Array<{ condition: string; message: string }>;
  recommendations?: Array<{ condition: string; message: string }>;
}

export interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  inputs: Record<string, any>;
}

export interface SimulationChart {
  id: string;
  type: "bar" | "line" | "pie" | "gauge";
  title: string;
  dataPoints: Array<{ label: string; formulaId: string }>;
}

export interface GameScore {
  scoreId: string;
  userId: string;
  gameId: string;
  gameType: GameType;
  gameName: string;
  score: number;
  maxScore: number;
  percentage: number;
  coinsEarned: number;
  completedAt: string;
  attempts: number;
  completionTime: number; // in seconds
  timeSpent: number;
  metadata: {
    answers?: Record<string, any>;
    achievements?: string[];
    analytics?: Record<string, any>;
  };
  createdAt: string;
}

export interface GameInstance {
  instanceId: string;
  gameId: string;
  userId: string;
  status: GameStatus;
  score?: number;
  completedAt?: string;
  rewardEarned?: number;
  createdAt: string;
  updatedAt: string;
}

export type GameStatus = "in_progress" | "completed" | "abandoned";

// Dashboard Types
export interface Dashboard {
  dashboardId: string;
  userId: string;
  widgets: DashboardWidget[];
  layout: DashboardLayout;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardWidget {
  widgetId: string;
  type: WidgetType;
  title: string;
  config: Record<string, any>;
  position: WidgetPosition;
}

export type WidgetType = "carbon_summary" | "recent_logs" | "wallet_balance" | "achievements" | "goals";

export interface WidgetPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DashboardLayout {
  columns: number;
  rowHeight: number;
}

// Audit Types
export interface AuditLog {
  auditId?: string;
  userId: string;
  action: AuditAction | string;
  resourceType?: string;
  resourceId?: string;
  details?: Record<string, any>;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  // Added for compatibility
  logId?: string;
  adminId?: string;
  type?: string;
  targetId?: string;
  data?: any;
  severity?: string;
  createdAt?: string;
}

export type AuditAction = string;

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form Data Types - CarbonLogFormData already exported above

export interface UserFormData {
  email: string;
  displayName: string;
  role: UserRole;
  profilePicture?: string;
}

export interface GameFormData {
  title: string;
  description: string;
  category: GameCategory;
  difficulty: GameDifficulty;
  rewardPoints: number;
}

// Utility Types
export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface FilterOptions {
  category?: CarbonCategory;
  dateRange?: DateRange;
  userId?: string;
  status?: string;
}

export interface SortOptions {
  field: string;
  direction: "asc" | "desc";
}

export interface QueryOptions {
  filters?: FilterOptions;
  sort?: SortOptions;
  pagination?: {
    page: number;
    limit: number;
  };
}

// Firebase Converter Types
export interface FirestoreConverter<T> {
  toFirestore: (data: T) => any;
  fromFirestore: (snapshot: any) => T;
}


export interface DeploymentLog {
  id: string;
  environment: "staging" | "production";
  service: "frontend" | "backend";
  version: string;
  status: "started" | "success" | "failed";
  branch: string;
  commitHash: string;
  deployedBy?: string;
  duration?: number;
  details?: any;
  timestamp: Date;
  createdAt: Date;
}

export interface ErrorLog {
  id: string;
  service: "frontend" | "backend";
  environment: string;
  errorType: "runtime" | "build" | "api" | "database" | "auth";
  message: string;
  stack?: string;
  userId?: string;
  requestId?: string;
  endpoint?: string;
  userAgent?: string;
  metadata?: any;
  timestamp: Date;
  createdAt: Date;
}

// Data Export Types
export interface DataExportRequest {
  requestId: string;
  userId: string;
  status: "pending" | "processing" | "completed" | "failed";
  requestedAt: string;
  completedAt?: string;
  downloadUrl?: string;
  expiresAt?: string;
  format: "json" | "csv" | "pdf";
  includeData: string[]; // array of data types to include
}

// Transaction Types
export type TransactionType = "credit" | "debit" | "inr_credit" | "inr_debit" | "healcoin_credit" | "healcoin_debit";

export interface Transaction {
  id: string;
  transactionId: string;
  userId: string;
  type: TransactionType;
  amount: number;
  currency: "INR" | "HEAL";
  description: string;
  status: "pending" | "completed" | "failed";
  createdAt: string;
  updatedAt: string;
}

// Auth Types
export interface CreateUserRequest {
  email: string;
  password: string;
  displayName: string;
  role?: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// Audit and Activity Types

export interface UserActivityLog {
  id?: string;
  logId?: string;
  userId: string;
  action: string;
  details?: Record<string, any>;
  timestamp: string;
  source?: "web" | "mobile" | "api";
  sessionId?: string;
}

// Export as ActivityLog for compatibility
export type ActivityLog = UserActivityLog;

// Account Deletion Types
export interface AccountDeletionRequest {
  requestId: string;
  userId: string;
  status: "pending" | "scheduled" | "completed" | "cancelled";
  requestedAt: string;
  scheduledAt: string; // 30 days from request
  completedAt?: string;
  cancelledAt?: string;
  reason?: string;
  dataRetention: {
    auditLogs: boolean;
    transactions: boolean;
    legalCompliance: boolean;
  };
}

// Payment Types
export interface Payment {
  paymentId: string;
  userId: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  metadata?: any;
  transactionId?: string;
  paymentMethod?: string;
  description?: string;
}

// Leaderboard Types
export interface LeaderboardEntry {
  entryId: string;
  userId: string;
  score: number;
  rank: number;
  category: string;
  context: string;
  period: string;
  createdAt: string;
  updatedAt?: string;
  metadata?: any;
}

// Rewards Types
export interface Reward {
  rewardId: string;
  title: string;
  name: string;
  description?: string;
  cost: number;
  coinCost: number;
  stock: number;
  type: "voucher" | "product" | "credit";
  imageUrl?: string;
  partnerId?: string;
  createdAt: string;
  createdBy: string;
  isActive: boolean;
  metadata?: any;
}

// Partners & Marketplace
export interface Partner {
  partnerId: string;
  name: string;
  type: "NGO" | "Brand";
  contactEmail?: string;
  contactPhone?: string;
  logoUrl?: string;
  websiteUrl?: string;
  isActive: boolean;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
}

// Content Library & AI
export interface ContentItem {
  contentId: string;
  title: string;
  type: "article" | "video" | "infographic";
  language: "en" | "hi" | string;
  category: "solar" | "water" | "waste" | "mental_health" | "animal_welfare" | string;
  body?: string;
  url?: string;
  tags?: string[];
  visibility: "public" | "school" | "msme" | "citizen";
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
}

export interface RecommendationItem {
  recommendationId: string;
  userId: string;
  message: string;
  language: "en" | "hi" | string;
  category?: string;
  createdAt: string;
}

// Competitions
export interface Competition {
  competitionId: string;
  name: string;
  type: "school" | "msme" | "ward";
  startDate: string;
  endDate: string;
  rewardPool?: number;
  isActive: boolean;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  participants?: string[]; // org/class/ward IDs
}

export interface CompetitionScore {
  id: string;
  competitionId: string;
  groupId: string; // classId, msmeId, wardId
  groupName?: string;
  totalPoints: number;
  healCoinsEarned?: number;
  lastUpdated: string;
}

export interface Redemption {
  redemptionId: string;
  userId: string;
  rewardId: string;
  rewardName: string;
  cost: number;
  quantity: number;
  coinsSpent: number;
  status: "success" | "failed" | "pending";
  notes?: string;
  voucherCode?: string;
  createdAt: string;
  updatedAt: string;
  processedBy: string;
  processedAt?: string;
  metadata?: any;
}

export interface Voucher {
  voucherId: string;
  code: string;
  rewardId: string;
  isRedeemed: boolean;
  redeemedBy?: string;
  redeemedAt?: string;
  createdAt: string;
  createdBy: string;
  expiresAt?: string;
  metadata?: any;
}

export interface FraudDetectionResult {
  isFraudulent: boolean;
  riskScore: number;
  reasons: string[];
  recommendedAction: "allow" | "review" | "block";
}

export interface UserRedemptionPattern {
  userId: string;
  dailyRedemptions: number;
  weeklyRedemptions: number;
  monthlyRedemptions: number;
  totalRedemptions: number;
  lastRedemptionDate: string;
}

// Validation functions
export function isValidUserRole(role: string): role is UserRole {
  return ["citizen", "school", "msme", "govt", "admin"].includes(role);
}

export function isValidPaymentStatus(status: string): boolean {
  return ["pending", "success", "failed", "refunded"].includes(status);
}
