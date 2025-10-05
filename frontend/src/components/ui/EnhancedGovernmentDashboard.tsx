'use client';

import React, { useState } from 'react';
import { ZPCard } from '@/components/ZPCard';
import { ZPButton } from '@/components/ZPButton';
import { ZPBadge } from '@/components/ZPBadge';
import { TrackerCard } from '@/components/ui/TrackerCard';
import { LeaderboardList } from '@/components/ui/LeaderboardList';
import { BarChart3, Users, TrendingUp, Leaf, Building, Eye, Download, AlertTriangle, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { MiniLineChart } from '@/components/ui/MiniLineChart';

interface EnhancedGovernmentDashboardProps {
  user: {
    id: string;
    displayName?: string;
    email?: string;
    role: string;
    department?: string;
    level?: 'municipal' | 'state' | 'federal';
    healCoins?: number;
  };
}

export const EnhancedGovernmentDashboard: React.FC<EnhancedGovernmentDashboardProps> = ({ user }) => {
  // Mock data for admin-focused government dashboard
  const mockData = {
    overviewStats: {
      totalGovernments: 142,
      activePolicies: 87,
      pendingReviews: 23,
      complianceRate: 92,
    },
    governmentPerformance: [
      {
        id: 'gov-1',
        name: 'Mumbai Municipal Corporation',
        level: 'municipal',
        ecoScore: 85,
        policiesImplemented: 12,
        lastActivity: new Date('2024-03-15'),
        status: 'active',
      },
      {
        id: 'gov-2',
        name: 'Delhi State Environmental Agency',
        level: 'state',
        ecoScore: 78,
        policiesImplemented: 8,
        lastActivity: new Date('2024-03-14'),
        status: 'active',
      },
      {
        id: 'gov-3',
        name: 'Karnataka Green Initiative',
        level: 'state',
        ecoScore: 92,
        policiesImplemented: 15,
        lastActivity: new Date('2024-03-12'),
        status: 'active',
      },
      {
        id: 'gov-4',
        name: 'Central Pollution Board',
        level: 'federal',
        ecoScore: 76,
        policiesImplemented: 5,
        lastActivity: new Date('2024-03-10'),
        status: 'review',
      },
    ],
    policyMetrics: {
      draft: 12,
      active: 68,
      completed: 35,
      suspended: 5,
    },
    recentActivities: [
      {
        id: 'act-1',
        action: 'New Policy Submission',
        government: 'Bangalore Municipal Corp',
        description: 'Submitted Green Building Initiative for review',
        timestamp: new Date('2024-03-15T10:30:00'),
        status: 'pending',
      },
      {
        id: 'act-2',
        action: 'Policy Approved',
        government: 'Hyderabad Environmental Dept',
        description: 'Solar Energy Subsidy program approved',
        timestamp: new Date('2024-03-14T15:45:00'),
        status: 'completed',
      },
      {
        id: 'act-3',
        action: 'Compliance Review',
        government: 'Chennai Corporation',
        description: 'Quarterly compliance assessment initiated',
        timestamp: new Date('2024-03-14T09:15:00'),
        status: 'in-progress',
      },
      {
        id: 'act-4',
        action: 'Policy Update',
        government: 'Goa Tourism Board',
        description: 'Updated coastal protection regulations',
        timestamp: new Date('2024-03-13T14:20:00'),
        status: 'completed',
      },
    ],
    systemAlerts: [
      {
        id: 'alert-1',
        type: 'compliance',
        message: 'Pending compliance review for 3 government entities',
        severity: 'medium',
        timestamp: new Date('2024-03-15T08:30:00'),
      },
      {
        id: 'alert-2',
        type: 'policy',
        message: 'New policy submission requires admin review',
        severity: 'low',
        timestamp: new Date('2024-03-15T10:30:00'),
      },
      {
        id: 'alert-3',
        type: 'performance',
        message: 'Kerala State showing below average performance',
        severity: 'high',
        timestamp: new Date('2024-03-14T16:45:00'),
      },
    ],
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'review': return 'warning';
      case 'pending': return 'warning';
      case 'in-progress': return 'info';
      case 'completed': return 'success';
      default: return 'default';
    }
  };

  const getLevelBadgeVariant = (level: string) => {
    switch (level) {
      case 'federal': return 'default';
      case 'state': return 'info';
      case 'municipal': return 'success';
      default: return 'default';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'low': return <Clock className="h-4 w-4 text-blue-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-zinc-50">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Government Oversight Dashboard</h1>
          <p className="text-gray-600">Monitor and manage government environmental initiatives across all levels</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ZPCard className="border-blue-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Governments</p>
                <p className="text-2xl font-bold text-gray-900">{mockData.overviewStats.totalGovernments}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Building className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-3">
              <MiniLineChart data={[120, 128, 131, 135, 138, 140, mockData.overviewStats.totalGovernments]} width={260} height={56} stroke="#3B82F6" />
            </div>
          </ZPCard>

          <ZPCard className="border-green-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Policies</p>
                <p className="text-2xl font-bold text-gray-900">{mockData.overviewStats.activePolicies}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-3">
              <MiniLineChart data={[60, 64, 70, 72, 75, 80, mockData.overviewStats.activePolicies]} width={260} height={56} stroke="#10B981" />
            </div>
          </ZPCard>

          <ZPCard className="border-yellow-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
                <p className="text-2xl font-bold text-gray-900">{mockData.overviewStats.pendingReviews}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-3">
              <MiniLineChart data={[30, 28, 24, 26, 25, 22, mockData.overviewStats.pendingReviews]} width={260} height={56} stroke="#F59E0B" />
            </div>
          </ZPCard>

          <ZPCard className="border-purple-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Compliance Rate</p>
                <p className="text-2xl font-bold text-gray-900">{mockData.overviewStats.complianceRate}%</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-3">
              <MiniLineChart data={[86, 88, 90, 91, 92, 93, mockData.overviewStats.complianceRate]} width={260} height={56} stroke="#8B5CF6" />
            </div>
          </ZPCard>
        </div>

        {/* Government Performance & Policy Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Government Performance */}
          <ZPCard 
            title="Government Performance" 
            description="Eco-scores and activity levels by government entity"
            className="border-gray-100"
          >
            <div className="space-y-4">
              {mockData.governmentPerformance.map((gov) => (
                <div key={gov.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900">{gov.name}</h4>
                      <ZPBadge variant={getLevelBadgeVariant(gov.level)} size="sm">
                        {gov.level}
                      </ZPBadge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Eco Score: {gov.ecoScore}/100</span>
                      <span>Policies: {gov.policiesImplemented}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {gov.lastActivity.toLocaleDateString()}
                    </span>
                    <ZPBadge variant={getStatusBadgeVariant(gov.status)}>
                      {gov.status}
                    </ZPBadge>
                    <ZPButton variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </ZPButton>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <ZPButton variant="outline" className="w-full">
                View All Governments
              </ZPButton>
            </div>
          </ZPCard>

          {/* Policy Metrics */}
          <ZPCard 
            title="Policy Metrics" 
            description="Distribution of policies by status"
            className="border-gray-100"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-700">{mockData.policyMetrics.draft}</p>
                <p className="text-sm text-gray-600">Draft</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-700">{mockData.policyMetrics.active}</p>
                <p className="text-sm text-gray-600">Active</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-purple-700">{mockData.policyMetrics.completed}</p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-yellow-700">{mockData.policyMetrics.suspended}</p>
                <p className="text-sm text-gray-600">Suspended</p>
              </div>
            </div>
            
            <div className="mt-6">
              <TrackerCard
                title="Policy Trends"
                metrics={[
                  { label: 'New This Month', value: 8, unit: 'policies' },
                  { label: 'Avg Implementation Time', value: 45, unit: 'days' },
                  { label: 'Approval Rate', value: 87, unit: '%' },
                ]}
                type="carbon"
                trend="improving"
                lastUpdated={new Date()}
              />
            </div>
          </ZPCard>
        </div>

        {/* Recent Activities & System Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activities */}
          <ZPCard 
            title="Recent Activities" 
            description="Latest government actions requiring admin attention"
            className="border-gray-100"
          >
            <div className="space-y-4">
              {mockData.recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900">{activity.action}</h4>
                      <ZPBadge variant={getStatusBadgeVariant(activity.status)} size="sm">
                        {activity.status}
                      </ZPBadge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{activity.government}</span>
                      <span className="text-xs text-gray-500">
                        {activity.timestamp.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ZPCard>

          {/* System Alerts */}
          <ZPCard 
            title="System Alerts" 
            description="Important notifications requiring attention"
            className="border-gray-100"
          >
            <div className="space-y-4">
              {mockData.systemAlerts.map((alert) => (
                <div key={alert.id} className="flex items-start p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="mr-3 mt-0.5">
                    {getSeverityIcon(alert.severity)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">{alert.message}</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 capitalize">{alert.type} alert</span>
                      <span className="text-xs text-gray-500">
                        {alert.timestamp.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ZPCard>
        </div>

        {/* Administrative Actions */}
        <ZPCard 
          title="Administrative Actions" 
          description="Tools for managing government entities and policies"
          className="border-gray-100"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ZPButton variant="outline" className="h-24 flex-col bg-blue-50 hover:bg-blue-100 border-blue-200">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 mb-2">
                <Users className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium">Manage Governments</span>
            </ZPButton>
            <ZPButton variant="outline" className="h-24 flex-col bg-green-50 hover:bg-green-100 border-green-200">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 text-green-600 mb-2">
                <Leaf className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium">Review Policies</span>
            </ZPButton>
            <ZPButton variant="outline" className="h-24 flex-col bg-purple-50 hover:bg-purple-100 border-purple-200">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 text-purple-600 mb-2">
                <BarChart3 className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium">Compliance Reports</span>
            </ZPButton>
            <ZPButton variant="outline" className="h-24 flex-col bg-yellow-50 hover:bg-yellow-100 border-yellow-200">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-100 text-yellow-600 mb-2">
                <Download className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium">Export Data</span>
            </ZPButton>
          </div>
        </ZPCard>
      </div>
    </div>
  );
};