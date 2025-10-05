/**
 * Rewards Marketplace Component
 * Displays available rewards with redemption functionality
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ShoppingCart, 
  Coins, 
  Package, 
  AlertTriangle, 
  CheckCircle,
  Loader2,
  Search,
  Filter
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useWallet';
import api from '@/lib/apiClient';
import { Reward } from '@/types';

interface RewardsMarketplaceProps {
  onRedemptionSuccess?: (redemption: any) => void;
}

export function RewardsMarketplace({ onRedemptionSuccess }: RewardsMarketplaceProps) {
  const { isAuthenticated, user } = useAuth();
  const { wallet, refreshWallet } = useWallet();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<{ [key: string]: number }>({});

  // Load rewards
  const loadRewards = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.rewards.getRewards();
      if (response.success && response.data) {
        setRewards(response.data);
      } else {
        setError(response.error || 'Failed to load rewards');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load rewards');
    } finally {
      setLoading(false);
    }
  };

  // Redeem reward
  const handleRedeem = async (reward: Reward) => {
    if (!isAuthenticated || !user) {
      setError('Please log in to redeem rewards');
      return;
    }

    const qty = quantity[reward.id] || 1;
    const totalCost = reward.coinCost * qty;

    if (wallet && wallet.healCoins < totalCost) {
      setError('Insufficient coins');
      return;
    }

    setRedeeming(reward.id);
    setError(null);

    try {
      const response = await api.wallet.redeemCoins({ rewardId: reward.id, quantity: qty });
      if (response.success) {
        await refreshWallet();
        onRedemptionSuccess?.(response.data);
        setQuantity(prev => ({ ...prev, [reward.id]: 1 }));
      } else {
        setError(response.error || 'Failed to redeem reward');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to redeem reward');
    } finally {
      setRedeeming(null);
    }
  };

  // Filter rewards
  const filteredRewards = rewards.filter(reward => {
    const matchesSearch = reward.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reward.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || reward.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(rewards.map(r => r.category)))];

  useEffect(() => {
    loadRewards();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading rewards...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Rewards Marketplace</h2>
          <p className="text-muted-foreground">
            Redeem your HealCoins for amazing rewards
          </p>
        </div>
        {wallet && (
          <div className="flex items-center space-x-2">
            <Coins className="h-5 w-5 text-yellow-500" />
            <span className="text-lg font-semibold">{wallet.healCoins.toLocaleString()}</span>
            <span className="text-sm text-muted-foreground">HealCoins</span>
          </div>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search rewards..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRewards.map((reward) => {
          const qty = quantity[reward.id] || 1;
          const totalCost = reward.coinCost * qty;
          const canRedeem = wallet && wallet.healCoins >= totalCost && reward.stock >= qty;
          const isRedeeming = redeeming === reward.id;

          return (
            <Card key={reward.id} className="relative">
              {/* Stock Badge */}
              {reward.stock <= 5 && reward.stock > 0 && (
                <Badge variant="destructive" className="absolute top-2 right-2">
                  Only {reward.stock} left!
                </Badge>
              )}
              
              {/* Out of Stock Overlay */}
              {reward.stock === 0 && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                  <Badge variant="secondary" className="text-lg">
                    Out of Stock
                  </Badge>
                </div>
              )}

              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{reward.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {reward.description}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-yellow-600">
                      {reward.coinCost.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">HealCoins</div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Original Price */}
                {reward.originalPrice && (
                  <div className="text-sm text-muted-foreground">
                    Original: ₹{reward.originalPrice}
                  </div>
                )}

                {/* Stock Info */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Stock:</span>
                  <span className={reward.stock > 5 ? 'text-green-600' : 'text-orange-600'}>
                    {reward.stock} available
                  </span>
                </div>

                {/* Quantity Selector */}
                {reward.stock > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor={`qty-${reward.id}`}>Quantity</Label>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuantity(prev => ({
                          ...prev,
                          [reward.id]: Math.max(1, (prev[reward.id] || 1) - 1)
                        }))}
                        disabled={qty <= 1}
                      >
                        -
                      </Button>
                      <Input
                        id={`qty-${reward.id}`}
                        type="number"
                        min="1"
                        max={reward.stock}
                        value={qty}
                        onChange={(e) => setQuantity(prev => ({
                          ...prev,
                          [reward.id]: Math.max(1, Math.min(reward.stock, parseInt(e.target.value) || 1))
                        }))}
                        className="w-16 text-center"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuantity(prev => ({
                          ...prev,
                          [reward.id]: Math.min(reward.stock, (prev[reward.id] || 1) + 1)
                        }))}
                        disabled={qty >= reward.stock}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                )}

                {/* Total Cost */}
                {qty > 1 && (
                  <div className="text-sm font-medium">
                    Total: {totalCost.toLocaleString()} HealCoins
                  </div>
                )}

                {/* Redeem Button */}
                <Button
                  onClick={() => handleRedeem(reward)}
                  disabled={!canRedeem || isRedeeming}
                  className="w-full"
                  variant={canRedeem ? "default" : "secondary"}
                >
                  {isRedeeming ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Redeeming...
                    </>
                  ) : !canRedeem ? (
                    <>
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      {wallet && wallet.healCoins < totalCost ? 'Insufficient Coins' : 'Out of Stock'}
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Redeem Now
                    </>
                  )}
                </Button>

                {/* Success Message */}
                {reward.metadata?.recentlyRedeemed && (
                  <div className="flex items-center text-green-600 text-sm">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Successfully redeemed!
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredRewards.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No rewards found</h3>
          <p className="text-muted-foreground">
            {searchTerm || filterCategory !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'No rewards are currently available'
            }
          </p>
        </div>
      )}
    </div>
  );
}
