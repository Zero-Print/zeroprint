/**
 * Shared Subscription & Payment Types
 * Used by both frontend and backend
 */

export type PlanId = "citizen" | "school" | "msme";
export type SubscriptionStatus = "active" | "expired" | "cancelled" | "pending";
export type PaymentStatus = "success" | "failed" | "pending" | "refunded";

export interface SubscriptionPlan {
  planId: PlanId;
  name: string;
  price: number;
  currency: string;
  interval: "month" | "year";
  features: string[];
  description: string;
  promoCoins?: number; // Bonus HealCoins on subscription
  color: string; // UI color theme
  popular?: boolean; // Mark as popular plan
}

export interface Subscription {
  subscriptionId: string;
  userId: string;
  planId: PlanId;
  status: SubscriptionStatus;
  startDate: string;
  renewalDate: string;
  endDate?: string; // For cancelled/expired subscriptions
  razorpaySubscriptionId?: string;
  autoRenewal: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  paymentId: string;
  userId: string;
  planId: PlanId;
  subscriptionId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  failureReason?: string;
  type: "subscription" | "renewal" | "upgrade" | "refund";
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface RazorpayWebhookPayload {
  entity: string;
  account_id: string;
  event: string;
  contains: string[];
  payload: {
    payment?: {
      entity: any;
    };
    subscription?: {
      entity: any;
    };
    order?: {
      entity: any;
    };
  };
  created_at: number;
}

export interface CreateSubscriptionRequest {
  planId: PlanId;
  autoRenewal?: boolean;
}

export interface CreateSubscriptionResponse {
  success: boolean;
  subscriptionId?: string;
  razorpayOrder?: {
    id: string;
    currency: string;
    amount: number;
  };
  error?: string;
}

export interface ProcessWebhookRequest {
  event: string;
  payload: any;
  signature: string;
}

export interface CancelSubscriptionRequest {
  subscriptionId: string;
  reason?: string;
}

// Predefined subscription plans
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    planId: "citizen",
    name: "Citizen Plan",
    price: 99,
    currency: "INR",
    interval: "month",
    features: [
      "Personal Wallet",
      "HealCoins Earning",
      "Eco Games Access",
      "Leaderboards",
      "Carbon Tracking",
      "Community Challenges",
    ],
    description: "Perfect for individuals who want to make a positive environmental impact",
    promoCoins: 100,
    color: "green",
    popular: true,
  },
  {
    planId: "school",
    name: "School Plan",
    price: 500,
    currency: "INR",
    interval: "month",
    features: [
      "All Games Access",
      "Class Leaderboards",
      "Student Reports",
      "Teacher Dashboard",
      "Educational Content",
      "Progress Tracking",
    ],
    description: "Engage students with interactive environmental education",
    promoCoins: 500,
    color: "blue",
  },
  {
    planId: "msme",
    name: "MSME Plan",
    price: 200,
    currency: "INR",
    interval: "month",
    features: [
      "ESG-lite Dashboard",
      "Sustainability Reports",
      "Carbon Footprint Analysis",
      "Compliance Tracking",
      "Business Insights",
      "Growth Recommendations",
    ],
    description: "Streamline your sustainability reporting and ESG compliance",
    promoCoins: 200,
    color: "purple",
  },
];
