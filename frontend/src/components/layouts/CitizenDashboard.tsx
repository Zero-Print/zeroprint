'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ZPCard } from '@/components/ZPCard';
import { ZPButton } from '@/components/ZPButton';
import { ZPBadge } from '@/components/ZPBadge';
import { WalletCard } from '@/components/ui/WalletCard';
import { TrackerCard } from '@/components/ui/TrackerCard';
import { GameCard } from '@/components/ui/GameCard';
import { LeaderboardList } from '@/components/ui/LeaderboardList';
import { QuickActions } from '@/components/ui/QuickActions';
import { ActivityFeed } from '@/components/ui/ActivityFeed';
import { GamesCarousel } from '@/components/ui/GamesCarousel';
import { ExportButton } from '@/components/ui/ExportButton';
import { AccessibilityChecker } from '@/components/ui/AccessibilityChecker';
import { ZeroPrintDataLayer } from '@/lib/data';
import { useAuth } from '@/modules/auth';
import { useOptimisticUpdate } from '@/hooks/useOptimisticUpdate';
import { Wallet, Send, Download, RefreshCw, TrendingUp, Award, Users, Leaf, Trophy } from 'lucide-react';
import { MiniLineChart } from '@/components/ui/MiniLineChart';

interface CitizenDashboardProps {
  user: {
    displayName: string;
    walletAddress?: string;
    ecoScore: number;
    healCoins: number;
    rank: number;
  };
  data: {
    carbonFootprint: number;
    mentalHealthScore: number;
    animalWelfareScore: number;
    treesPlanted: number;
    wasteRecycled: number;
    carbonSaved: number;
    monthlyEarnings: number;
    friends: number;
    localRank: number;
    challengesWon: number;
    recentActivities: Array<{
      action: string;
      points: number;
      date: Date;
    }>;
    leaderboard: Array<{
      id: string;
      name: string;
      score: number;
      rank: number;
      category: 'carbon' | 'mental' | 'animal' | 'overall';
      change: number;
    }>;
    challenges: Array<{
      id: string;
      title: string;
      description: string;
      progress: number;
      reward: number;
      difficulty: 'easy' | 'medium' | 'hard';
      timeLimit: string;
      status: 'active' | 'completed' | 'locked';
    }>;
  };
  onWalletConnect?: () => void;
  onWalletDisconnect?: () => void;
  onSendTokens?: () => void;
  onReceiveTokens?: () => void;
}

export function CitizenDashboard({
  user,
  data,
  onWalletConnect,
  onWalletDisconnect,
  onSendTokens,
  onReceiveTokens,
}: CitizenDashboardProps) {
  const router = useRouter();
  const { user: authUser } = useAuth();
  const [walletConnected, setWalletConnected] = useState(!!user.walletAddress);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Use the optimistic update hook
  const updateUserData = async (newData: any) => {
    const dataLayer = new ZeroPrintDataLayer();
    const userId = (authUser as any)?.uid;
    if (userId) {
      await dataLayer.updateUserData(userId, newData);
    }
  };
  
  const {
    data: realtimeData,
    optimisticData,
    update: updateData,
    isUpdating,
    hasOptimisticChanges
  } = useOptimisticUpdate(data, updateUserData);

  // Real-time data refresh
  useEffect(() => {
    const refreshData = async () => {
      if (!authUser || isRefreshing) return;
      
      setIsRefreshing(true);
      try {
        // Refresh data every 30 seconds
        const dataLayer = new ZeroPrintDataLayer();
        const userId = (authUser as any).uid;
        
        // Get latest activities
        const latestActivities = await dataLayer.activityLogs.getUserActivities(userId, 5);
        
        const updatedData = {
          ...realtimeData,
          recentActivities: latestActivities.map(activity => ({
            action: activity.action,
            points: activity.metadata?.pointsEarned || 0,
            date: new Date(activity.timestamp)
          }))
        };
        
        // Use the update function from the hook
        updateData(updatedData);
      } catch (error) {
        console.error('Error refreshing data:', error);
      } finally {
        setIsRefreshing(false);
      }
    };

    const interval = setInterval(refreshData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [authUser, isRefreshing, realtimeData, updateData]);

  const handleWalletConnect = async () => {
    try {
      if (onWalletConnect) {
        await onWalletConnect();
        setWalletConnected(true);
        
        // Log wallet connection
        if (authUser) {
          const dataLayer = new ZeroPrintDataLayer();
          await dataLayer.auditLogs.logWalletTransaction(
            (authUser as any).uid,
            'connect',
            { walletAddress: user.walletAddress }
          );
        }
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const handleWalletDisconnect = async () => {
    try {
      if (onWalletDisconnect) {
        await onWalletDisconnect();
        setWalletConnected(false);
        
        // Log wallet disconnection
        if (authUser) {
          const dataLayer = new ZeroPrintDataLayer();
          await dataLayer.auditLogs.logWalletTransaction(
            (authUser as any).uid,
            'disconnect',
            { walletAddress: user.walletAddress }
          );
        }
      }
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };

  const handleSendTokens = async () => {
    try {
      if (onSendTokens) {
        await onSendTokens();
        
        // Log token send
        if (authUser) {
          const dataLayer = new ZeroPrintDataLayer();
          await dataLayer.auditLogs.logWalletTransaction(
            (authUser as any).uid,
            'send',
            { amount: 0, recipient: 'unknown' } // TODO: Get actual values
          );
        }
      }
    } catch (error) {
      console.error('Error sending tokens:', error);
    }
  };

  const handleReceiveTokens = async () => {
    try {
      if (onReceiveTokens) {
        await onReceiveTokens();
        
        // Log token receive
        if (authUser) {
          const dataLayer = new ZeroPrintDataLayer();
          await dataLayer.auditLogs.logWalletTransaction(
            (authUser as any).uid,
            'receive',
            { amount: 0, sender: 'unknown' } // TODO: Get actual values
          );
        }
      }
    } catch (error) {
      console.error('Error receiving tokens:', error);
    }
  };
  return (
    <div className='min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50'>

      <div className='container mx-auto p-6 space-y-8'>
        {/* Header */}
        <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>Welcome, {user.displayName}</h1>
            <p className='text-gray-600'>Track your eco-journey and rewards</p>
          </div>
          <div className='flex flex-wrap gap-3'>
            <ZPButton variant='outline' size='sm' onClick={() => router.push('/rewards')}>Rewards</ZPButton>
            <ZPButton variant='outline' size='sm' onClick={() => router.push('/games')}>Games</ZPButton>
            <ZPButton
              variant='outline'
              size='sm'
              onClick={async () => {
                try {
                  const { httpsCallable } = await import('firebase/functions');
                  const { functions } = await import('@/lib/firebase');
                  const fn: any = httpsCallable(functions as any, 'exportUserData');
                  const userId = (authUser as any)?.uid;
                  const res: any = await fn({ userId });
                  console.log('Export data', res?.data);
                  alert('Your data export has been generated.');
                } catch (e) {
                  console.error('Export failed', e);
                  alert('Failed to export.');
                }
              }}
            >
              Export My Data
            </ZPButton>
            <ZPButton
              variant='destructive'
              size='sm'
              onClick={async () => {
                if (!confirm('This will anonymize your account and reset your wallet. Continue?')) return;
                try {
                  const { httpsCallable } = await import('firebase/functions');
                  const { functions } = await import('@/lib/firebase');
                  const fn: any = httpsCallable(functions as any, 'deleteUserAccount');
                  const userId = (authUser as any)?.uid;
                  await fn({ userId });
                  alert('Account deletion requested.');
                } catch (e) {
                  console.error('Delete failed', e);
                  alert('Failed to delete.');
                }
              }}
            >
              Delete My Account
            </ZPButton>
          </div>
        </div>

        {/* Top Row - Key Metrics */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          <div className='bg-gradient-to-br from-green-400 to-green-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105'>
            <div className='text-center'>
              <div className='text-4xl font-bold mb-2'>{user.ecoScore}</div>
              <div className='text-sm opacity-90 mb-3'>Eco Score</div>
              <div className='bg-white bg-opacity-20 rounded-full px-3 py-1 text-xs font-medium'>
                +5 this week 📈
              </div>
              <div className='mt-3 flex justify-center'>
                <MiniLineChart data={[62, 65, 68, 66, 70, 73, user.ecoScore]} width={220} height={56} stroke="#fff" fill="rgba(255,255,255,0.25)" />
              </div>
            </div>
          </div>

          <div className='bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105'>
            <div className='text-center'>
              <div className='text-4xl font-bold mb-2'>{user.healCoins}</div>
              <div className='text-sm opacity-90 mb-3'>HealCoins</div>
              <div className='bg-white bg-opacity-20 rounded-full px-3 py-1 text-xs font-medium'>
                +50 today 🪙
              </div>
            </div>
          </div>

          <div className='bg-gradient-to-br from-orange-400 to-red-500 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105'>
            <div className='text-center'>
              <div className='text-4xl font-bold mb-2'>{data.carbonFootprint}kg</div>
              <div className='text-sm opacity-90 mb-3'>Carbon Footprint</div>
              <div className='bg-white bg-opacity-20 rounded-full px-3 py-1 text-xs font-medium'>
                -2kg this week 🌱
              </div>
              <div className='mt-3 flex justify-center'>
                <MiniLineChart data={[18, 17, 16, 17, 15, 14, data.carbonFootprint]} width={220} height={56} stroke="#fff" fill="rgba(255,255,255,0.25)" />
              </div>
            </div>
          </div>

          <div className='bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105'>
            <div className='text-center'>
              <div className='text-4xl font-bold mb-2'>#{user.rank}</div>
              <div className='text-sm opacity-90 mb-3'>Global Rank</div>
              <div className='bg-white bg-opacity-20 rounded-full px-3 py-1 text-xs font-medium'>
                +3 positions 🚀
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Wallet Section */}
        <div className='bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300'>
          <div className='flex items-center justify-between mb-6'>
            <div className='flex items-center'>
              <div className='w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3'>
                <Wallet className='text-white' size={20} />
              </div>
              <h3 className='text-xl font-bold text-gray-800'>HealCoin Wallet</h3>
            </div>
            <div className='flex items-center space-x-2'>
              <div className={`w-3 h-3 rounded-full ${walletConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className='text-sm text-gray-600'>
                {walletConnected ? 'Connected' : 'Disconnected'}
              </span>
              <button
                onClick={() => setIsRefreshing(true)}
                disabled={isRefreshing}
                className='p-1 hover:bg-gray-100 rounded-full transition-colors'
              >
                <RefreshCw className={`w-4 h-4 text-gray-500 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
          
          <WalletCard
            walletAddress={user.walletAddress}
            balance={user.healCoins}
            isConnected={walletConnected}
            onConnect={handleWalletConnect}
            onDisconnect={handleWalletDisconnect}
            onAddFunds={handleReceiveTokens}
          />
          
          {/* Wallet Actions */}
          <div className='grid grid-cols-2 gap-4 mt-6'>
            <button
              onClick={handleSendTokens}
              disabled={!walletConnected}
              className='flex items-center justify-center space-x-2 p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300'
            >
              <Send size={16} />
              <span>Send Tokens</span>
            </button>
            <button
              onClick={handleReceiveTokens}
              disabled={!walletConnected}
              className='flex items-center justify-center space-x-2 p-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300'
            >
              <Download size={16} />
              <span>Receive Tokens</span>
            </button>
          </div>
        </div>

        {/* Environmental Tracking Section */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          <TrackerCard
            type='carbon'
            title='Carbon Footprint'
            description='Track your daily carbon emissions'
            metrics={[
              {
                label: 'Daily Emissions',
                value: realtimeData.carbonFootprint,
                unit: 'kg CO₂',
                change: { value: -2.3, period: 'vs yesterday', isPositive: true },
                target: 40,
              },
              {
                label: 'Carbon Saved',
                value: realtimeData.carbonSaved,
                unit: 'kg CO₂',
                change: { value: 15.2, period: 'this month', isPositive: true },
              },
            ]}
            trend='improving'
            lastUpdated={new Date()}
            onViewDetails={() => router.push('/trackers/carbon')}
            onAddEntry={() => router.push('/trackers/carbon/log')}
          />

          <TrackerCard
            type='mental-health'
            title='Mental Wellness'
            description='Track your eco-anxiety and nature connection'
            metrics={[
              {
                label: 'Wellness Score',
                value: realtimeData.mentalHealthScore,
                unit: '/100',
                change: { value: 5, period: 'this week', isPositive: true },
                target: 80,
              },
              {
                label: 'Nature Time',
                value: 45,
                unit: 'minutes',
                change: { value: 10, period: 'vs yesterday', isPositive: true },
              },
            ]}
            trend='improving'
            lastUpdated={new Date()}
            onViewDetails={() => router.push('/trackers/mental-health')}
            onAddEntry={() => router.push('/trackers/mental-health/log')}
          />

          <TrackerCard
            type='animal-welfare'
            title='Animal Welfare'
            description='Track wildlife sightings and conservation actions'
            metrics={[
              {
                label: 'Welfare Score',
                value: realtimeData.animalWelfareScore,
                unit: '/100',
                change: { value: 3, period: 'this week', isPositive: true },
                target: 85,
              },
              {
                label: 'Wildlife Spotted',
                value: 12,
                unit: 'species',
                change: { value: 2, period: 'this month', isPositive: true },
              },
            ]}
            trend='stable'
            lastUpdated={new Date()}
            onViewDetails={() => router.push('/trackers/animal-welfare')}
            onAddEntry={() => router.push('/trackers/animal-welfare/log')}
          />
        </div>

        {/* Environmental Impact Summary */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <div className='bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300'>
            <div className='flex items-center mb-4'>
              <div className='w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-3'>
                <span className='text-white text-lg'>🌳</span>
              </div>
              <h3 className='text-xl font-bold text-gray-800'>Trees Planted</h3>
            </div>
            <div className='text-3xl font-bold text-green-600 mb-2'>{realtimeData.treesPlanted}</div>
            <p className='text-gray-600 text-sm'>Contributing to reforestation</p>
            <div className='mt-4'>
              <div className='flex justify-between text-sm text-gray-600 mb-1'>
                <span>Goal: 20 trees</span>
                <span>{Math.round((realtimeData.treesPlanted / 20) * 100)}%</span>
              </div>
              <div className='w-full bg-gray-200 rounded-full h-2'>
                <div 
                  className='bg-green-600 h-2 rounded-full transition-all duration-300' 
                  style={{ width: `${Math.min((realtimeData.treesPlanted / 20) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300'>
            <div className='flex items-center mb-4'>
              <div className='w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center mr-3'>
                <span className='text-white text-lg'>♻️</span>
              </div>
              <h3 className='text-xl font-bold text-gray-800'>Waste Recycled</h3>
            </div>
            <div className='text-3xl font-bold text-blue-600 mb-2'>{realtimeData.wasteRecycled}kg</div>
            <p className='text-gray-600 text-sm'>Diverted from landfills</p>
            <div className='mt-4'>
              <div className='flex justify-between text-sm text-gray-600 mb-1'>
                <span>Monthly Goal: 200kg</span>
                <span>{Math.round((realtimeData.wasteRecycled / 200) * 100)}%</span>
              </div>
              <div className='w-full bg-gray-200 rounded-full h-2'>
                <div 
                  className='bg-blue-600 h-2 rounded-full transition-all duration-300' 
                  style={{ width: `${Math.min((realtimeData.wasteRecycled / 200) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300'>
            <div className='flex items-center mb-4'>
              <div className='w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mr-3'>
                <span className='text-white text-lg'>🌍</span>
              </div>
              <h3 className='text-xl font-bold text-gray-800'>Carbon Saved</h3>
            </div>
            <div className='text-3xl font-bold text-purple-600 mb-2'>{realtimeData.carbonSaved}kg</div>
            <p className='text-gray-600 text-sm'>CO₂ emissions prevented</p>
            <div className='mt-4'>
              <div className='flex justify-between text-sm text-gray-600 mb-1'>
                <span>Annual Goal: 1000kg</span>
                <span>{Math.round((realtimeData.carbonSaved / 1000) * 100)}%</span>
              </div>
              <div className='w-full bg-gray-200 rounded-full h-2'>
                <div 
                  className='bg-purple-600 h-2 rounded-full transition-all duration-300' 
                  style={{ width: `${Math.min((realtimeData.carbonSaved / 1000) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Games & Challenges Carousel */}
        <GamesCarousel 
          challenges={realtimeData.challenges}
          onGameSelect={(gameId) => router.push(`/games/${gameId}`)}
          onChallengeSelect={(challengeId) => router.push(`/games/challenge/${challengeId}`)}
          autoPlay={true}
          showProgress={true}
        />

        {/* Gamification and Social Features */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          <div className='bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300'>
            <div className='flex items-center mb-6'>
              <div className='w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center mr-3'>
                <TrendingUp className='text-white' size={20} />
              </div>
              <h3 className='text-xl font-bold text-gray-800'>Gaming Stats</h3>
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div className='text-center p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg'>
                <div className='text-2xl font-bold text-yellow-600'>{realtimeData.monthlyEarnings} HC</div>
                <div className='text-sm text-gray-600'>Monthly Earnings</div>
              </div>
              <div className='text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg'>
                <div className='text-2xl font-bold text-green-600'>{realtimeData.challengesWon}</div>
                <div className='text-sm text-gray-600'>Challenges Won</div>
              </div>
            </div>
            <div className='mt-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg'>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-gray-600'>Level Progress</span>
                <span className='text-sm font-semibold text-purple-600'>Level 5</span>
              </div>
              <div className='mt-2 w-full bg-gray-200 rounded-full h-2'>
                <div className='bg-purple-600 h-2 rounded-full transition-all duration-300' style={{ width: '75%' }}></div>
              </div>
              <div className='mt-1 text-xs text-gray-500'>750/1000 XP to Level 6</div>
            </div>
          </div>

          <div className='bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300'>
            <div className='flex items-center mb-6'>
              <div className='w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mr-3'>
                <Users className='text-white' size={20} />
              </div>
              <h3 className='text-xl font-bold text-gray-800'>Social Impact</h3>
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div className='text-center p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg'>
                <div className='text-2xl font-bold text-indigo-600'>{data.friends}</div>
                <div className='text-sm text-gray-600'>Friends</div>
              </div>
              <div className='text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg'>
                <div className='text-2xl font-bold text-purple-600'>#{data.localRank}</div>
                <div className='text-sm text-gray-600'>Local Rank</div>
              </div>
            </div>
            <div className='mt-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg'>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-gray-600'>Community Impact</span>
                <span className='text-sm font-semibold text-green-600'>+15 this week</span>
              </div>
              <div className='mt-2 text-xs text-gray-500'>You've inspired 15 eco-actions in your network</div>
            </div>
          </div>
        </div>

        {/* Activity Feed & Leaderboard */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          <ActivityFeed 
            userId={user.displayName}
            showSocialInteractions={true}
            showAchievements={true}
            maxItems={5}
            className="h-fit"
          />

          <div className='bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300'>
            <div className='flex items-center justify-between mb-6'>
              <div className='flex items-center'>
                <div className='w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center mr-3'>
                  <Trophy className='text-white' size={20} />
                </div>
                <h3 className='text-xl font-bold text-gray-800'>Community Leaderboard</h3>
              </div>
              <div className='flex space-x-2'>
                <button className='px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full'>Local</button>
                <button className='px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full'>Global</button>
              </div>
            </div>
            <LeaderboardList
              entries={realtimeData.leaderboard}
              title=''
              maxEntries={5}
              currentUserId={user.displayName}
              showViewAll={true}
            />
            <div className='mt-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg'>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-gray-600'>Your Position</span>
                <span className='text-sm font-semibold text-orange-600'>#{user.rank} in your area</span>
              </div>
              <div className='mt-2 text-xs text-gray-500'>You're ahead of {Math.max(0, 100 - user.rank)}% of local users!</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <QuickActions />
      </div>
      
      {/* Accessibility Checker */}
      <AccessibilityChecker showOnLoad={false} autoRun={false} />
    </div>
  );
}
