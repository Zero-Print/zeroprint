/**
 * Frontend Subscription Service
 * Handles subscription management and payment processing
 */

import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';
import { 
  SubscriptionPlan, 
  Subscription, 
  Payment,
  CreateSubscriptionRequest,
  CreateSubscriptionResponse,
  CancelSubscriptionRequest,
  PlanId,
  RazorpayOptions,
  RazorpayResponse
} from '@/types/subscriptions';

/**
 * Get all available subscription plans
 */
export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  try {
    if (!functions) {
      // Fallback to mock data
      return getMockPlans();
    }

    const callable = httpsCallable(functions, 'getSubscriptionPlans');
    const result = await callable();
    const response = result.data as { success: boolean; data: SubscriptionPlan[]; error?: string };

    if (!response.success) {
      throw new Error(response.error || 'Failed to get subscription plans');
    }

    return response.data;
  } catch (error) {
    console.warn('Error getting subscription plans, using mock data:', error);
    return getMockPlans();
  }
}

/**
 * Get user's current subscription
 */
export async function getUserSubscription(): Promise<Subscription | null> {
  try {
    if (!functions) {
      return null;
    }

    const callable = httpsCallable(functions, 'getUserSubscription');
    const result = await callable();
    const response = result.data as { success: boolean; data: Subscription | null; error?: string };

    if (!response.success) {
      throw new Error(response.error || 'Failed to get subscription');
    }

    return response.data;
  } catch (error) {
    console.error('Error getting user subscription:', error);
    return null;
  }
}

/**
 * Create a new subscription
 */
export async function createSubscription(
  planId: PlanId, 
  autoRenewal: boolean = true
): Promise<CreateSubscriptionResponse> {
  try {
    if (!functions) {
      throw new Error('Firebase functions not available');
    }

    const callable = httpsCallable(functions, 'createSubscription');
    const result = await callable({ planId, autoRenewal } as CreateSubscriptionRequest);
    
    return result.data as CreateSubscriptionResponse;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(
  subscriptionId: string, 
  reason?: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    if (!functions) {
      throw new Error('Firebase functions not available');
    }

    const callable = httpsCallable(functions, 'cancelSubscription');
    const result = await callable({ subscriptionId, reason } as CancelSubscriptionRequest);
    
    return result.data as { success: boolean; message?: string; error?: string };
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    throw error;
  }
}

/**
 * Process payment with Razorpay
 */
export async function processPayment(
  razorpayOrder: { id: string; currency: string; amount: number },
  userDetails: { name: string; email: string },
  onSuccess: (response: RazorpayResponse) => void,
  onFailure?: (error: any) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    // Load Razorpay script if not already loaded
    if (!window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => processRazorpayPayment();
      script.onerror = () => reject(new Error('Failed to load Razorpay script'));
      document.head.appendChild(script);
    } else {
      processRazorpayPayment();
    }

    function processRazorpayPayment() {
      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_dummy',
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'ZeroPrint',
        description: 'Subscription Payment',
        order_id: razorpayOrder.id,
        handler: (response: RazorpayResponse) => {
          onSuccess(response);
          resolve();
        },
        prefill: {
          name: userDetails.name,
          email: userDetails.email,
        },
        theme: {
          color: '#10B981' // Green theme
        },
        modal: {
          ondismiss: () => {
            const error = new Error('Payment cancelled by user');
            if (onFailure) {
              onFailure(error);
            }
            reject(error);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    }
  });
}

/**
 * Mock subscription plans for development
 */
function getMockPlans(): SubscriptionPlan[] {
  return [
    {
      planId: 'citizen',
      name: 'Citizen Plan',
      price: 99,
      currency: 'INR',
      interval: 'month',
      features: [
        'Personal Wallet',
        'HealCoins Earning',
        'Eco Games Access',
        'Leaderboards',
        'Carbon Tracking',
        'Community Challenges'
      ],
      description: 'Perfect for individuals who want to make a positive environmental impact',
      promoCoins: 100,
      color: 'green',
      popular: true
    },
    {
      planId: 'school',
      name: 'School Plan',
      price: 500,
      currency: 'INR',
      interval: 'month',
      features: [
        'All Games Access',
        'Class Leaderboards',
        'Student Reports',
        'Teacher Dashboard',
        'Educational Content',
        'Progress Tracking'
      ],
      description: 'Engage students with interactive environmental education',
      promoCoins: 500,
      color: 'blue'
    },
    {
      planId: 'msme',
      name: 'MSME Plan',
      price: 200,
      currency: 'INR',
      interval: 'month',
      features: [
        'ESG-lite Dashboard',
        'Sustainability Reports',
        'Carbon Footprint Analysis',
        'Compliance Tracking',
        'Business Insights',
        'Growth Recommendations'
      ],
      description: 'Streamline your sustainability reporting and ESG compliance',
      promoCoins: 200,
      color: 'purple'
    }
  ];
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number, currency: string = 'INR'): string {
  if (currency === 'INR') {
    return `₹${amount}`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
}

/**
 * Get plan color classes for UI
 */
export function getPlanColorClasses(color: string) {
  switch (color) {
    case 'green':
      return {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-700',
        button: 'bg-green-600 hover:bg-green-700',
        badge: 'bg-green-100 text-green-800'
      };
    case 'blue':
      return {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-700',
        button: 'bg-blue-600 hover:bg-blue-700',
        badge: 'bg-blue-100 text-blue-800'
      };
    case 'purple':
      return {
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        text: 'text-purple-700',
        button: 'bg-purple-600 hover:bg-purple-700',
        badge: 'bg-purple-100 text-purple-800'
      };
    default:
      return {
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        text: 'text-gray-700',
        button: 'bg-gray-600 hover:bg-gray-700',
        badge: 'bg-gray-100 text-gray-800'
      };
  }
}
