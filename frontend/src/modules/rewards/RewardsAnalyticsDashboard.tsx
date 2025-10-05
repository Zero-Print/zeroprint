'use client';

import React, { useState, useEffect } from 'react';
import { ZPCard } from '@/components/ZPCard';
import { ZPButton } from '@/components/ZPButton';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Gift,
  Coins,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { getAnalyticsData, AnalyticsData } from './analyticsService';

interface RewardsAnalyticsDashboardProps {
  onRefresh?: () => void;
  isLoading?: boolean;
}

export function RewardsAnalyticsDashboard({ 
  onRefresh,
  isLoading = false
}: RewardsAnalyticsDashboardProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAnalyticsData();
      setAnalyticsData(data);
    } catch (err) {
      setError('Failed to load analytics data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const handleRefresh = () => {
    fetchAnalyticsData();
    if (onRefresh) onRefresh();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (error) {
    return (
      <ZPCard className="text-center py-12">
        <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Data</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <ZPButton variant="primary" onClick={handleRefresh}>
          Try Again
        </ZPButton>
      </ZPCard>
    );
  }

  if (!analyticsData) {
    return (
      <ZPCard className="text-center py-12">
        <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Analytics Data</h3>
        <p className="text-gray-500">Analytics data will appear once rewards are redeemed</p>
      </ZPCard>
    );
  }

  const { redemptionStats, topRewards, dailyTrends, stockOutAlerts, failureAlerts } = analyticsData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Rewards Analytics</h2>
          <p className="text-gray-600 mt-1">
            Monitor reward redemptions and system performance
          </p>
        </div>
        
        <ZPButton
          variant="outline"
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </ZPButton>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Redemptions */}
        <ZPCard className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">Total Redemptions</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">
                {redemptionStats.totalRedemptions}
              </p>
            </div>
            <Gift className="h-8 w-8 text-blue-500" />
          </div>
        </ZPCard>

        {/* Success Rate */}
        <ZPCard className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">Success Rate</p>
              <p className="text-2xl font-bold text-green-900 mt-1">
                {redemptionStats.successRate.toFixed(1)}%
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </ZPCard>

        {/* Failed Redemptions */}
        <ZPCard className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-700">Failed Redemptions</p>
              <p className="text-2xl font-bold text-red-900 mt-1">
                {redemptionStats.failedRedemptions}
              </p>
            </div>
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
        </ZPCard>

        {/* Pending Redemptions */}
        <ZPCard className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-700">Pending</p>
              <p className="text-2xl font-bold text-amber-900 mt-1">
                {redemptionStats.pendingRedemptions}
              </p>
            </div>
            <Clock className="h-8 w-8 text-amber-500" />
          </div>
        </ZPCard>
      </div>

      {/* Alerts */}
      {(stockOutAlerts.length > 0 || failureAlerts.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Stock Out Alerts */}
          {stockOutAlerts.length > 0 && (
            <ZPCard className="border-red-200 bg-red-50">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <h3 className="font-semibold text-red-800">Stock Alerts</h3>
              </div>
              <div className="space-y-2">
                {stockOutAlerts.slice(0, 3).map((alert, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-white rounded">
                    <span className="text-sm font-medium text-gray-900">{alert.rewardTitle}</span>
                    <span className="text-sm text-red-600 font-medium">Stock: {alert.stock}</span>
                  </div>
                ))}
                {stockOutAlerts.length > 3 && (
                  <p className="text-xs text-gray-500 text-center">
                    +{stockOutAlerts.length - 3} more alerts
                  </p>
                )}
              </div>
            </ZPCard>
          )}

          {/* Failure Alerts */}
          {failureAlerts.length > 0 && (
            <ZPCard className="border-red-200 bg-red-50">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <h3 className="font-semibold text-red-800">Failure Alerts</h3>
              </div>
              <div className="space-y-2">
                {failureAlerts.map((alert, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-white rounded">
                    <span className="text-sm font-medium text-gray-900">High Failure Rate</span>
                    <span className="text-sm text-red-600 font-medium">
                      {alert.failureRate.toFixed(1)}% at {alert.hour}
                    </span>
                  </div>
                ))}
              </div>
            </ZPCard>
          )}
        </div>
      )}

      {/* Top Rewards */}
      <ZPCard>
        <h3 className="font-semibold text-gray-900 mb-4">Top Redeemed Rewards</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reward
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Redemptions
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Coins Spent
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Coins
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topRewards.map((reward, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{reward.rewardTitle}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{reward.totalRedemptions}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center gap-1">
                        <Coins className="h-4 w-4 text-amber-500" />
                        {reward.totalCoinsSpent.toLocaleString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {reward.avgCoinsPerRedemption.toFixed(0)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ZPCard>

      {/* Daily Trends */}
      <ZPCard>
        <h3 className="font-semibold text-gray-900 mb-4">Daily Redemption Trends</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Redemptions
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Coins Spent
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dailyTrends.map((trend, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{trend.date}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{trend.redemptions}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center gap-1">
                        <Coins className="h-4 w-4 text-amber-500" />
                        {trend.coinsSpent.toLocaleString()}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ZPCard>
    </div>
  );
}