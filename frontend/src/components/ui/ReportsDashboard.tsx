'use client';

import React, { useState } from 'react';
import { ZPCard } from '@/components/ZPCard';
import { ZPButton } from '@/components/ZPButton';
import { ZPBadge } from '@/components/ZPBadge';
import { TrackerCard } from '@/components/ui/TrackerCard';

export function ReportsDashboard() {
  const [reportType, setReportType] = useState<'usage' | 'performance' | 'financial' | 'user'>('usage');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  // Mock report data
  const reportData = {
    usage: {
      totalUsers: 1248,
      activeUsers: 876,
      newUsers: 42,
      engagementRate: 72.3,
      avgSessionDuration: 18.4,
    },
    performance: {
      uptime: 99.95,
      responseTime: 124,
      errorRate: 0.02,
      apiCalls: 24568,
      successRate: 99.8,
    },
    financial: {
      totalRevenue: 12500,
      healCoinsCirculated: 245680,
      transactions: 1248,
      avgTransactionValue: 10.02,
      subscriptionRevenue: 8500,
    },
    user: {
      userGrowth: 12.4,
      retentionRate: 84.2,
      churnRate: 8.6,
      avgUserValue: 24.5,
      supportTickets: 24,
    },
  };

  // Use a fixed date to avoid hydration mismatches
  const fixedDate = new Date('2023-01-01T00:00:00Z');

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports & Analytics</h1>
        <p className="text-gray-600">Comprehensive platform insights and performance metrics</p>
      </div>

      {/* Report Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'usage', label: 'Usage Analytics' },
            { id: 'performance', label: 'Performance' },
            { id: 'financial', label: 'Financial' },
            { id: 'user', label: 'User Metrics' },
          ].map((type) => (
            <ZPButton
              key={type.id}
              variant={reportType === type.id ? 'primary' : 'outline'}
              onClick={() => setReportType(type.id as any)}
            >
              {type.label}
            </ZPButton>
          ))}
        </div>
        
        <div className="flex gap-2">
          {(['7d', '30d', '90d', '1y'] as const).map((range) => (
            <ZPButton
              key={range}
              variant={timeRange === range ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range}
            </ZPButton>
          ))}
        </div>
      </div>

      {/* Report Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {reportType === 'usage' && (
          <>
            <ZPCard className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{reportData.usage.totalUsers}</div>
              <div className="text-gray-600">Total Users</div>
            </ZPCard>
            <ZPCard className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{reportData.usage.activeUsers}</div>
              <div className="text-gray-600">Active Users</div>
            </ZPCard>
            <ZPCard className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">{reportData.usage.newUsers}</div>
              <div className="text-gray-600">New Users</div>
            </ZPCard>
            <ZPCard className="text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-2">{reportData.usage.engagementRate}%</div>
              <div className="text-gray-600">Engagement Rate</div>
            </ZPCard>
          </>
        )}

        {reportType === 'performance' && (
          <>
            <ZPCard className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{reportData.performance.uptime}%</div>
              <div className="text-gray-600">Uptime</div>
            </ZPCard>
            <ZPCard className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{reportData.performance.responseTime}ms</div>
              <div className="text-gray-600">Response Time</div>
            </ZPCard>
            <ZPCard className="text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-2">{reportData.performance.errorRate}%</div>
              <div className="text-gray-600">Error Rate</div>
            </ZPCard>
            <ZPCard className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">{reportData.performance.apiCalls.toLocaleString()}</div>
              <div className="text-gray-600">API Calls</div>
            </ZPCard>
          </>
        )}

        {reportType === 'financial' && (
          <>
            <ZPCard className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">₹{reportData.financial.totalRevenue.toLocaleString()}</div>
              <div className="text-gray-600">Total Revenue</div>
            </ZPCard>
            <ZPCard className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{reportData.financial.healCoinsCirculated.toLocaleString()}</div>
              <div className="text-gray-600">HC Circulated</div>
            </ZPCard>
            <ZPCard className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">{reportData.financial.transactions.toLocaleString()}</div>
              <div className="text-gray-600">Transactions</div>
            </ZPCard>
            <ZPCard className="text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-2">₹{reportData.financial.subscriptionRevenue.toLocaleString()}</div>
              <div className="text-gray-600">Subscription Revenue</div>
            </ZPCard>
          </>
        )}

        {reportType === 'user' && (
          <>
            <ZPCard className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{reportData.user.userGrowth}%</div>
              <div className="text-gray-600">User Growth</div>
            </ZPCard>
            <ZPCard className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{reportData.user.retentionRate}%</div>
              <div className="text-gray-600">Retention Rate</div>
            </ZPCard>
            <ZPCard className="text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-2">{reportData.user.churnRate}%</div>
              <div className="text-gray-600">Churn Rate</div>
            </ZPCard>
            <ZPCard className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">{reportData.user.supportTickets}</div>
              <div className="text-gray-600">Support Tickets</div>
            </ZPCard>
          </>
        )}
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <TrackerCard
          type="carbon"
          title="Key Metrics"
          metrics={
            reportType === 'usage' ? [
              { label: 'Avg Session Duration', value: reportData.usage.avgSessionDuration, unit: 'min' },
              { label: 'Daily Active Users', value: 245, unit: 'users' },
              { label: 'Weekly Active Users', value: 687, unit: 'users' },
            ] : reportType === 'performance' ? [
              { label: 'Database Latency', value: 12, unit: 'ms' },
              { label: 'Cache Hit Rate', value: 92.4, unit: '%' },
              { label: 'Server Load', value: 42, unit: '%' },
            ] : reportType === 'financial' ? [
              { label: 'Avg Transaction Value', value: reportData.financial.avgTransactionValue, unit: 'HC' },
              { label: 'Monthly Recurring Revenue', value: 8500, unit: '₹' },
              { label: 'Conversion Rate', value: 3.2, unit: '%' },
            ] : [
              { label: 'Avg User Value', value: reportData.user.avgUserValue, unit: '₹' },
              { label: 'Customer Lifetime Value', value: 148.5, unit: '₹' },
              { label: 'Net Promoter Score', value: 78, unit: 'points' },
            ]
          }
          trend="improving"
          lastUpdated={fixedDate}
        />

        <ZPCard title="Report Summary" description="Key insights and recommendations">
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Insight</h4>
              <p className="text-sm text-blue-700">
                {reportType === 'usage' 
                  ? 'User engagement has increased by 12% this month, with peak activity during evening hours.'
                  : reportType === 'performance'
                  ? 'System performance is stable with 99.95% uptime. Response times are within acceptable limits.'
                  : reportType === 'financial'
                  ? 'Revenue growth is steady with a 8% increase in subscription revenue this quarter.'
                  : 'User retention remains strong at 84.2%, with churn rate decreasing month over month.'}
              </p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">Recommendation</h4>
              <p className="text-sm text-green-700">
                {reportType === 'usage'
                  ? 'Consider launching evening engagement campaigns to maximize user activity.'
                  : reportType === 'performance'
                  ? 'Monitor server load during peak hours and consider scaling resources if needed.'
                  : reportType === 'financial'
                  ? 'Explore premium feature upselling opportunities to increase average transaction value.'
                  : 'Implement a referral program to further reduce churn and increase user acquisition.'}
              </p>
            </div>
          </div>
        </ZPCard>
      </div>

      {/* Export Options */}
      <ZPCard title="Export Report" description="Download report in various formats">
        <div className="flex flex-wrap gap-3">
          <ZPButton variant="outline">
            Export as PDF
          </ZPButton>
          <ZPButton variant="outline">
            Export as CSV
          </ZPButton>
          <ZPButton variant="outline">
            Export as Excel
          </ZPButton>
          <ZPButton variant="outline">
            Schedule Report
          </ZPButton>
        </div>
      </ZPCard>
    </div>
  );
}