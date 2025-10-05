/**
 * Subscriptions Page
 * Displays subscription plans and checkout functionality
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Check, 
  Crown, 
  Star, 
  Zap, 
  Loader2,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/apiClient';
import { SubscriptionPlan, Subscription } from '@/types';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function SubscriptionsPage() {
  const { isAuthenticated, user } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  // Load plans and current subscription
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [plansResponse, subscriptionResponse] = await Promise.all([
        api.subscriptions.getPlans(),
        isAuthenticated ? api.subscriptions.getStatus() : Promise.resolve({ success: true, data: null })
      ]);

      if (plansResponse.success && plansResponse.data) {
        setPlans(plansResponse.data);
      } else {
        setError(plansResponse.error || 'Failed to load plans');
      }

      if (subscriptionResponse.success && subscriptionResponse.data) {
        setCurrentSubscription(subscriptionResponse.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  // Handle checkout
  const handleCheckout = async (planId: string) => {
    if (!isAuthenticated || !user) {
      setError('Please log in to subscribe');
      return;
    }

    setCheckoutLoading(planId);
    setError(null);

    try {
      const response = await api.subscriptions.checkout({
        planId,
        userEmail: user.email,
        userName: user.displayName || user.email,
      });

      if (response.success && response.data) {
        const { orderId, amount, currency, keyId, order } = response.data;

        // Load Razorpay script
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => {
          const options = {
            key: keyId,
            amount: Math.round(amount * 100), // Convert to paise
            currency,
            name: 'ZeroPrint',
            description: `Subscription Plan - ${plans.find(p => p.id === planId)?.name}`,
            order_id: order.id,
            handler: async (response: any) => {
              // Payment successful
              console.log('Payment successful:', response);
              await loadData(); // Refresh subscription status
            },
            prefill: {
              name: user.displayName || user.email,
              email: user.email,
            },
            theme: {
              color: '#3B82F6',
            },
            modal: {
              ondismiss: () => {
                setCheckoutLoading(null);
              },
            },
          };

          const rzp = new window.Razorpay(options);
          rzp.open();
        };
        document.body.appendChild(script);
      } else {
        setError(response.error || 'Failed to create checkout session');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to start checkout');
    } finally {
      setCheckoutLoading(null);
    }
  };

  // Cancel subscription
  const handleCancel = async () => {
    if (!currentSubscription) return;

    if (!confirm('Are you sure you want to cancel your subscription?')) {
      return;
    }

    try {
      const response = await api.subscriptions.cancel({
        subscriptionId: currentSubscription.id,
        reason: 'User requested cancellation',
      });

      if (response.success) {
        await loadData(); // Refresh subscription status
      } else {
        setError(response.error || 'Failed to cancel subscription');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to cancel subscription');
    }
  };

  useEffect(() => {
    loadData();
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading subscription plans...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Choose Your Plan</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Unlock premium features and support our mission to create a sustainable future
        </p>
      </div>

      {/* Current Subscription Alert */}
      {currentSubscription && (
        <Alert className="max-w-2xl mx-auto">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            You currently have an active subscription: <strong>{currentSubscription.metadata?.planName}</strong>
            {currentSubscription.status === 'active' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                className="ml-4"
              >
                Cancel Subscription
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan, index) => {
          const isPopular = index === 1; // Middle plan is popular
          const isCurrentPlan = currentSubscription?.planId === plan.id;
          const isCheckoutLoading = checkoutLoading === plan.id;

          return (
            <Card key={plan.id} className={`relative ${isPopular ? 'border-blue-500 shadow-lg scale-105' : ''}`}>
              {/* Popular Badge */}
              {isPopular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500">
                  Most Popular
                </Badge>
              )}

              {/* Current Plan Badge */}
              {isCurrentPlan && (
                <Badge className="absolute -top-3 right-4 bg-green-500">
                  Current Plan
                </Badge>
              )}

              <CardHeader className="text-center">
                <div className="flex justify-center mb-2">
                  {index === 0 && <Star className="h-8 w-8 text-yellow-500" />}
                  {index === 1 && <Crown className="h-8 w-8 text-blue-500" />}
                  {index === 2 && <Zap className="h-8 w-8 text-purple-500" />}
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="text-base">
                  {plan.description}
                </CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">₹{plan.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Features */}
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start space-x-3">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Action Button */}
                <Button
                  onClick={() => handleCheckout(plan.id)}
                  disabled={isCurrentPlan || isCheckoutLoading}
                  className={`w-full ${isPopular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                  variant={isCurrentPlan ? 'secondary' : 'default'}
                >
                  {isCheckoutLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : isCurrentPlan ? (
                    'Current Plan'
                  ) : (
                    'Subscribe Now'
                  )}
                </Button>

                {/* Additional Info */}
                {plan.metadata?.trialDays && (
                  <p className="text-xs text-center text-muted-foreground">
                    {plan.metadata.trialDays}-day free trial
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto space-y-6">
        <h2 className="text-2xl font-bold text-center">Frequently Asked Questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2">How does billing work?</h3>
            <p className="text-sm text-muted-foreground">
              You'll be charged monthly on the same date you subscribed. You can cancel anytime.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Can I change plans?</h3>
            <p className="text-sm text-muted-foreground">
              Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Is there a free trial?</h3>
            <p className="text-sm text-muted-foreground">
              Some plans offer a free trial period. Check the plan details for more information.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">How do I cancel?</h3>
            <p className="text-sm text-muted-foreground">
              You can cancel your subscription anytime from your account settings or by contacting support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}