/**
 * Rewards Page
 * Displays the rewards marketplace
 */

'use client';

import React, { useState } from 'react';
import { RewardsMarketplace } from '@/components/ui/RewardsMarketplace';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Gift, 
  Star, 
  TrendingUp, 
  Users, 
  Coins,
  ShoppingCart,
  Award
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useWallet';

export default function RewardsPage() {
  const { isAuthenticated } = useAuth();
  const { wallet } = useWallet();
  const [redemptionSuccess, setRedemptionSuccess] = useState<any>(null);

  const handleRedemptionSuccess = (redemption: any) => {
    setRedemptionSuccess(redemption);
    // Clear success message after 5 seconds
    setTimeout(() => setRedemptionSuccess(null), 5000);
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Rewards Marketplace</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Redeem your HealCoins for amazing rewards and support sustainable businesses
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Coins className="h-5 w-5 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold">{wallet?.healCoins || 0}</div>
                <div className="text-sm text-muted-foreground">Your HealCoins</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Gift className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">50+</div>
                <div className="text-sm text-muted-foreground">Available Rewards</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">1,234</div>
                <div className="text-sm text-muted-foreground">Redemptions Today</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">₹50K+</div>
                <div className="text-sm text-muted-foreground">Value Redeemed</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Success Message */}
      {redemptionSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Award className="h-5 w-5 text-green-500" />
            <div>
              <h3 className="font-semibold text-green-800">Redemption Successful!</h3>
              <p className="text-green-600">
                You've successfully redeemed {redemptionSuccess.metadata?.rewardName} for {redemptionSuccess.coinCost} HealCoins.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="marketplace" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="how-it-works">How It Works</TabsTrigger>
        </TabsList>

        <TabsContent value="marketplace">
          <RewardsMarketplace onRedemptionSuccess={handleRedemptionSuccess} />
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ShoppingCart className="h-5 w-5 text-blue-500" />
                  <span>Shopping</span>
                </CardTitle>
                <CardDescription>
                  E-commerce vouchers and shopping rewards
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Available Rewards</span>
                    <span className="font-semibold">25</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Starting from</span>
                    <span className="font-semibold">50 HealCoins</span>
                  </div>
                  <Button className="w-full mt-4" variant="outline">
                    View Category
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span>Entertainment</span>
                </CardTitle>
                <CardDescription>
                  Movie tickets, streaming subscriptions, and more
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Available Rewards</span>
                    <span className="font-semibold">15</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Starting from</span>
                    <span className="font-semibold">100 HealCoins</span>
                  </div>
                  <Button className="w-full mt-4" variant="outline">
                    View Category
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Gift className="h-5 w-5 text-green-500" />
                  <span>Lifestyle</span>
                </CardTitle>
                <CardDescription>
                  Health, wellness, and lifestyle products
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Available Rewards</span>
                    <span className="font-semibold">10</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Starting from</span>
                    <span className="font-semibold">200 HealCoins</span>
                  </div>
                  <Button className="w-full mt-4" variant="outline">
                    View Category
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="how-it-works" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">1</div>
                  <CardTitle>Earn HealCoins</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Complete eco-friendly actions, play games, and participate in challenges to earn HealCoins.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">2</div>
                  <CardTitle>Browse Rewards</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Explore our marketplace of sustainable rewards from partner businesses and organizations.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold">3</div>
                  <CardTitle>Redeem & Enjoy</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Redeem your HealCoins for rewards and enjoy your sustainable lifestyle benefits.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">How do I earn HealCoins?</h4>
                <p className="text-sm text-muted-foreground">
                  You can earn HealCoins by completing carbon-saving actions, playing eco-games, 
                  participating in challenges, and engaging with sustainable content.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Are there any limits on redemptions?</h4>
                <p className="text-sm text-muted-foreground">
                  Yes, there are daily and monthly limits to prevent abuse. You can redeem up to 
                  10,000 HealCoins per day and 100,000 HealCoins per month.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">How long do rewards take to arrive?</h4>
                <p className="text-sm text-muted-foreground">
                  Digital rewards are delivered immediately. Physical rewards are processed within 
                  2-3 business days and shipped to your registered address.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Can I return or exchange rewards?</h4>
                <p className="text-sm text-muted-foreground">
                  Digital rewards are non-refundable. Physical rewards can be returned within 
                  7 days of delivery, subject to the partner's return policy.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Call to Action */}
      {!isAuthenticated && (
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Start Earning HealCoins Today!</h2>
            <p className="text-blue-100 mb-6">
              Join thousands of users who are making a difference while earning amazing rewards.
            </p>
            <Button size="lg" variant="secondary">
              Sign Up Now
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}