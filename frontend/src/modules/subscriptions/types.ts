export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'canceled' | 'expired' | 'pending';
  startDate: string;
  endDate: string;
  renewalDate?: string;
  paymentMethod: string;
  amount: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  features: string[];
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'quarterly' | 'annual';
  isActive: boolean;
}