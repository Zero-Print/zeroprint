/**
 * Frontend Subscription Types
 * Mirrors backend types for consistency
 */

export type PlanId = 'citizen' | 'school' | 'msme';
export type SubscriptionStatus = 'active' | 'expired' | 'cancelled' | 'pending';
export type PaymentStatus = 'success' | 'failed' | 'pending' | 'refunded' | 'completed';

export interface SubscriptionPlan {
  planId: PlanId;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  description: string;
  promoCoins?: number;
  color: string;
  popular?: boolean;
}

export interface Subscription {
  subscriptionId: string;
  userId: string;
  planId: PlanId;
  status: SubscriptionStatus;
  startDate: string;
  renewalDate: string;
  endDate?: string;
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
  type: 'subscription' | 'renewal' | 'upgrade' | 'refund';
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
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

export interface CancelSubscriptionRequest {
  subscriptionId: string;
  reason?: string;
}

// Razorpay types for frontend
export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => {
      open: () => void;
    };
  }
}
