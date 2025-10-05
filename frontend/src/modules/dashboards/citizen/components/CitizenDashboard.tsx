'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WalletBalance } from '@/modules/wallet';
import { useAuth } from '@/modules/auth';
import { useWallet } from '@/modules/wallet';
import { useCarbonLogs } from '@/modules/trackers';
import { citizenAnalytics } from '@/lib/data/analytics';

export function CitizenDashboard() {
  const { user } = useAuth();
  const { wallet, loading: walletLoading } = useWallet();
  const { logs, getTotalCarbonFootprint, loading: logsLoading } = useCarbonLogs();
  const [refreshing, setRefreshing] = useState(false);

  const weeklyFootprint = getTotalCarbonFootprint('week');
  const monthlyFootprint = getTotalCarbonFootprint('month');

  const refreshData = async () => {
    try {
      setRefreshing(true);
      const userId = (user as any)?.userId || (user as any)?.uid || 'demo-user-1';
      
      // Refresh analytics data
      const activities = await citizenAnalytics.getUserActivities(userId);
      console.log('Refreshed activities:', activities);
      
      // Trigger re-fetch of other data by calling hooks
      // The hooks should handle their own refresh logic
      
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>
            Welcome back, {user?.displayName}! 👋
          </h1>
          <p className='text-gray-600 mt-1'>Track your environmental impact and earn rewards</p>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        {/* Carbon Footprint Cards */}
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-gray-600'>Weekly CO₂</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-red-600'>{weeklyFootprint.toFixed(1)} kg</div>
            <p className='text-xs text-gray-500 mt-1'>Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-gray-600'>Monthly CO₂</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-orange-600'>
              {monthlyFootprint.toFixed(1)} kg
            </div>
            <p className='text-xs text-gray-500 mt-1'>Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-gray-600'>Activities Logged</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-blue-600'>{logs.length}</div>
            <p className='text-xs text-gray-500 mt-1'>Total entries</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-gray-600'>Eco Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-[#2E7D32]'>
              {Math.max(0, 100 - Math.round(monthlyFootprint)).toString()}
            </div>
            <p className='text-xs text-gray-500 mt-1'>Out of 100</p>
          </CardContent>
        </Card>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Wallet Section */}
        <WalletBalance wallet={wallet} loading={walletLoading} />

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Your latest environmental actions</CardDescription>
          </CardHeader>
          <CardContent>
            {logsLoading ? (
              <div className='space-y-3'>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className='animate-pulse'>
                    <div className='h-4 bg-gray-200 rounded w-3/4 mb-2'></div>
                    <div className='h-3 bg-gray-200 rounded w-1/2'></div>
                  </div>
                ))}
              </div>
            ) : logs.length > 0 ? (
              <div className='space-y-3'>
                {logs.slice(0, 5).map(log => (
                  <div
                    key={log.logId}
                    className='flex justify-between items-center py-2 border-b last:border-b-0'
                  >
                    <div>
                      <p className='font-medium text-sm'>{log.transportMode}</p>
                      <p className='text-xs text-gray-500'>
                        {new Date(log.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className='text-right'>
                      <p className='text-sm font-medium text-red-600'>
                        {log.co2Saved?.toFixed(1)} kg CO₂
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className='text-gray-500 text-center py-4'>
                No activities logged yet. Start tracking your environmental impact!
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks to get you started</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <a
              href='/trackers/carbon'
              className='flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors'
            >
              <span className='text-2xl mb-2'>🚗</span>
              <span className='text-sm font-medium'>Log Transport</span>
            </a>
            <a
              href='/trackers/mentalHealth'
              className='flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors'
            >
              <span className='text-2xl mb-2'>🧠</span>
              <span className='text-sm font-medium'>Mood Check</span>
            </a>
            <a
              href='/trackers/animalWelfare'
              className='flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors'
            >
              <span className='text-2xl mb-2'>🐾</span>
              <span className='text-sm font-medium'>Log Kindness</span>
            </a>
            <a
              href='/games'
              className='flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors'
            >
              <span className='text-2xl mb-2'>🎮</span>
              <span className='text-sm font-medium'>Play Games</span>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
