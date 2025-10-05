'use client';

import React, { useState, useEffect } from 'react';
import { ZPCard } from '@/components/ZPCard';
import { ZPButton } from '@/components/ZPButton';
import { ZPBadge } from '@/components/ZPBadge';
import { TrackerCard } from '@/components/ui/TrackerCard';
import { LeaderboardList } from '@/components/ui/LeaderboardList';
import { WalletCard } from '@/components/ui/WalletCard';
import { GameCard } from '@/components/ui/GameCard';
import { ZeroPrintDataLayer, entityAnalytics, exportAnalytics } from '@/lib/data';
import { useOptimisticUpdate } from '@/hooks/useOptimisticUpdate';
import { useAuth } from '@/modules/auth';
import {
  Building2,
  Users,
  TrendingUp,
  Award,
  FileText,
  Download,
  Settings,
  Plus,
  BarChart3,
  Leaf,
  Heart,
  Coins,
  Target,
  Calendar,
  MapPin,
  BookOpen,
  Factory,
  Shield,
  Globe,
  Zap,
  Loader2,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  Upload,
  Activity,
  TreePine,
  Brain,
  PawPrint,
  GraduationCap
} from 'lucide-react';
import { 
  type EntityStats, 
  type GroupImpactMetrics,
  type DepartmentAnalytics 
} from '@/lib/data/analytics';
import { ESGReportingModule } from '@/components/ui/ESGReportingModule';
import { ESGReportGenerator } from '@/components/esg/ESGReportGenerator';

// ============================================================================
// INTERFACES
// ============================================================================

export interface EntityUser {
  id: string;
  displayName: string;
  email: string;
  role: 'school' | 'msme';
  entityId?: string;
  entityName?: string;
  department?: string;
  joinedAt: string;
  isActive: boolean;
  ecoScore: number;
  healCoins: number;
  lastActivity?: string;
}

export interface EntityData {
  entityId: string;
  entityName: string;
  entityType: 'school' | 'msme';
  totalMembers: number;
  activeMembers: number;
  totalCO2Saved: number;
  totalHealCoins: number;
  esgScore?: number;
  monthlyGrowth: number;
  departments: string[];
  recentActivities: Array<{
    id: string;
    userId: string;
    userName: string;
    action: string;
    timestamp: string;
    impact: number;
  }>;
  topPerformers: Array<{
    id: string;
    name: string;
    score: number;
    rank: number;
    change: number;
    department?: string;
  }>;
  challenges: Array<{
    id: string;
    title: string;
    description: string;
    participants: number;
    endDate: string;
    reward: number;
    status: 'active' | 'upcoming' | 'completed';
  }>;
  esgMetrics?: {
    environmental: {
      carbonFootprint: number;
      energyConsumption: number;
      wasteReduction: number;
      renewableEnergy: number;
    };
    social: {
      employeeWellbeing: number;
      communityEngagement: number;
      diversityIndex: number;
      trainingHours: number;
    };
    governance: {
      complianceScore: number;
      transparencyIndex: number;
      ethicsRating: number;
      reportingQuality: number;
    };
  };
}

export interface EntityDashboardProps {
  user: EntityUser;
  data: EntityData;
  hideHeader?: boolean;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function EntityDashboard({ user, data, hideHeader = false }: EntityDashboardProps) {
  const { user: authUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'members' | 'esg' | 'reports'>('overview');
  const [entityStats, setEntityStats] = useState<any>(null);
  const [groupMetrics, setGroupMetrics] = useState<GroupImpactMetrics | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [departmentAnalytics, setDepartmentAnalytics] = useState<DepartmentAnalytics | null>(null);
  const [showBulkActions, setShowBulkActions] = useState(false);
  
  // Use the optimistic update hook for real-time updates
  const updateEntityData = async (newData: any) => {
    const dataLayer = new ZeroPrintDataLayer();
    await dataLayer.updateEntityData(user.entityId, newData);
    return newData;
  };
  
  const {
    data: optimisticData,
    update: updateData,
    isUpdating,
    hasOptimisticChanges
  } = useOptimisticUpdate(data, updateEntityData);
  
  // Update state when optimistic data changes
  useEffect(() => {
    if (optimisticData) {
      if (optimisticData.stats) setEntityStats(optimisticData.stats);
      if (optimisticData.metrics) setGroupMetrics(optimisticData.metrics);
      if (optimisticData.departmentAnalytics) setDepartmentAnalytics(optimisticData.departmentAnalytics);
    }
  }, [optimisticData]);

  // Load real-time entity analytics
  useEffect(() => {
    const loadEntityData = async () => {
      if (!authUser?.userId || !data.entityId) return;
      
      setIsLoading(true);
      try {
        const [stats, groupImpactMetrics] = await Promise.all([
          entityAnalytics.getEntityStats(data.entityId, data.entityType),
          entityAnalytics.getGroupImpactMetrics(data.entityId, data.entityType)
        ]);
        setEntityStats(stats);
        setGroupMetrics(groupImpactMetrics);
        setLastUpdated(new Date());
      } catch (error) {
        console.error('Failed to load entity analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadEntityData();
    const interval = setInterval(loadEntityData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [authUser?.userId, data.entityId, data.entityType]);

  // Load department analytics when a department is selected
  useEffect(() => {
    const loadDepartmentData = async () => {
      if (selectedDepartment) {
        try {
          const deptAnalytics = await entityAnalytics.getDepartmentAnalytics(
            data.entityId, 
            data.entityType, 
            selectedDepartment
          );
          setDepartmentAnalytics(deptAnalytics);
        } catch (error) {
          console.error('Error loading department data:', error);
        }
      }
    };

    loadDepartmentData();
  }, [selectedDepartment, data.entityId, data.entityType]);

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const stats = await entityAnalytics.getEntityStats(data.entityId, data.entityType);
      setEntityStats(stats);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      const exportData = await exportAnalytics.getEntityExportData(data.entityId, data.entityType);
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${data.entityName}-sustainability-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export data:', error);
    }
  };

  const entityIcon = data.entityType === 'school' ? BookOpen : Factory;
  const entityEmoji = data.entityType === 'school' ? '🏫' : '🏭';
  const entityLabel = data.entityType === 'school' ? 'School' : 'MSME';

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Header */}
      {!hideHeader && (
        <div className={`rounded-2xl border p-5 md:p-6 shadow-sm ${
          data.entityType === 'school'
            ? 'bg-gradient-to-r from-orange-100 via-rose-100 to-red-100 border-red-200'
            : 'bg-gradient-to-r from-green-100 via-blue-100 to-yellow-100 border-gray-200'
        }`}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`h-12 w-12 rounded-xl text-white flex items-center justify-center shadow ${
                data.entityType === 'school'
                  ? 'bg-gradient-to-br from-orange-500 to-red-500'
                  : 'bg-gradient-to-br from-green-500 to-blue-500'
              }`}>
                {data.entityType === 'school' ? <GraduationCap className="h-6 w-6" /> : <Factory className="h-6 w-6" />}
              </div>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
                  {data.entityName}
                </h1>
                <p className="text-gray-700 text-sm">
                  {entityLabel} Sustainability Dashboard • {data.totalMembers} members
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <ZPButton variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" /> Refresh
              </ZPButton>
              <ZPButton variant="outline" size="sm" onClick={handleExportData}>
                <Download className="h-4 w-4 mr-2" /> Export
              </ZPButton>
              <ZPButton variant="secondary" size="sm">
                <Settings className="h-4 w-4 mr-2" /> Settings
              </ZPButton>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-6 mt-6 border-b border-transparent">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'analytics', label: 'Analytics', icon: Activity },
              { id: 'members', label: 'Members', icon: Users },
              { id: 'esg', label: 'ESG Metrics', icon: Shield },
              { id: 'reports', label: 'Reports', icon: FileText }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`-mb-px pb-3 inline-flex items-center gap-2 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? data.entityType === 'school' ? 'border-red-600 text-red-700' : 'border-green-600 text-green-700'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? (data.entityType === 'school' ? 'text-red-700' : 'text-green-700') : 'text-gray-500'}`} />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Key Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <ZPCard
                title={
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-green-100 text-green-700">
                      <Users className="h-4 w-4" />
                    </span>
                    <span>Total Members</span>
                  </div>
                }
                description="Active community members"
                className="bg-gradient-to-br from-green-50 to-white border-green-100"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Active</span>
                    <span className="font-semibold text-gray-900">{entityStats?.activeUsers || data.activeMembers}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total</span>
                    <span className="font-semibold text-gray-900">{entityStats?.totalStudents || entityStats?.totalEmployees || data.totalMembers}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Growth</span>
                    <span className={`font-semibold ${data.monthlyGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {data.monthlyGrowth > 0 ? '+' : ''}{data.monthlyGrowth}%
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>Participation</span>
                      <span className="font-medium text-gray-700">{
                        Math.max(0, Math.min(100, Math.round(((entityStats?.activeUsers || data.activeMembers) / (entityStats?.totalStudents || entityStats?.totalEmployees || data.totalMembers)) * 100)))
                      }%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-green-200/60">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500"
                        style={{ width: `${Math.max(0, Math.min(100, Math.round(((entityStats?.activeUsers || data.activeMembers) / (entityStats?.totalStudents || entityStats?.totalEmployees || data.totalMembers)) * 100)))}%` }}
                      />
                    </div>
                  </div>
                  <ZPButton variant="outline" size="sm" className="w-full mt-3" onClick={() => setActiveTab('members')}>
                    View Details
                  </ZPButton>
                </div>
              </ZPCard>

              <ZPCard
                title={
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-blue-100 text-blue-700">
                      <Leaf className="h-4 w-4" />
                    </span>
                    <span>Carbon Impact</span>
                  </div>
                }
                description="Environmental sustainability metrics"
                className="bg-gradient-to-br from-blue-50 to-white border-blue-100"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">CO₂ Saved</span>
                    <span className="font-semibold text-gray-900">{entityStats?.totalCO2Saved || data.totalCO2Saved} kg</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Per Member</span>
                    <span className="font-semibold text-gray-900">{Math.round((entityStats?.totalCO2Saved || data.totalCO2Saved) / data.totalMembers)} kg</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">This Month</span>
                    <span className="font-semibold text-blue-700">{Math.round((entityStats?.totalCO2Saved || data.totalCO2Saved) * 0.3)} kg</span>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>Monthly Progress</span>
                      <span className="font-medium text-gray-700">{
                        (() => { const t=(entityStats?.totalCO2Saved||data.totalCO2Saved)||1; const m=Math.max(0,(entityStats?.totalCO2Saved||data.totalCO2Saved)*0.3); return Math.max(0, Math.min(100, Math.round((m/t)*100))); })()
                      }%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-blue-200/60">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-sky-500 to-blue-600"
                        style={{ width: `${(() => { const t=(entityStats?.totalCO2Saved||data.totalCO2Saved)||1; const m=Math.max(0,(entityStats?.totalCO2Saved||data.totalCO2Saved)*0.3); return Math.max(0, Math.min(100, Math.round((m/t)*100))); })()}%` }}
                      />
                    </div>
                  </div>
                  <ZPButton variant="outline" size="sm" className="w-full mt-3" onClick={() => setActiveTab('esg')}>
                    View Details
                  </ZPButton>
                </div>
              </ZPCard>

              <ZPCard
                title={
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-yellow-100 text-yellow-700">
                      <Coins className="h-4 w-4" />
                    </span>
                    <span>HealCoins Economy</span>
                  </div>
                }
                description="Reward system performance"
                className="bg-gradient-to-br from-yellow-50 to-white border-yellow-100"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Earned</span>
                    <span className="font-semibold text-gray-900">{entityStats?.totalHealCoins || data.totalHealCoins} HC</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Per Member</span>
                    <span className="font-semibold text-gray-900">{Math.round((entityStats?.totalHealCoins || data.totalHealCoins) / data.totalMembers)} HC</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">This Week</span>
                    <span className="font-semibold text-yellow-700">{Math.round((entityStats?.totalHealCoins || data.totalHealCoins) * 0.1)} HC</span>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>Weekly Share</span>
                      <span className="font-medium text-gray-700">{
                        (() => { const t=(entityStats?.totalHealCoins||data.totalHealCoins)||1; const w=Math.max(0,(entityStats?.totalHealCoins||data.totalHealCoins)*0.1); return Math.max(0, Math.min(100, Math.round((w/t)*100))); })()
                      }%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-yellow-200/60">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-amber-500 to-yellow-600"
                        style={{ width: `${(() => { const t=(entityStats?.totalHealCoins||data.totalHealCoins)||1; const w=Math.max(0,(entityStats?.totalHealCoins||data.totalHealCoins)*0.1); return Math.max(0, Math.min(100, Math.round((w/t)*100))); })()}%` }}
                      />
                    </div>
                  </div>
                  <ZPButton variant="outline" size="sm" className="w-full mt-3" onClick={() => console.log('View wallet details')}>
                    View Details
                  </ZPButton>
                </div>
              </ZPCard>

              {data.esgScore && (
                <ZPCard title="ESG Performance" description="Sustainability scoring" className="bg-gradient-to-br from-purple-50 to-white border-purple-100">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Overall Score</span>
                      <span className="font-semibold text-gray-900">{entityStats?.esgScore || data.esgScore}/100</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Environmental</span>
                      <span className="font-semibold text-gray-900">{data.esgMetrics?.environmental ? Math.round(Object.values(data.esgMetrics.environmental).reduce((a, b) => a + b, 0) / 4) : 85}/100</span>
                    </div>
                    <ZPButton variant="outline" size="sm" className="w-full mt-3" onClick={() => setActiveTab('esg')}>
                      View Details
                    </ZPButton>
                  </div>
                </ZPCard>
              )}
            </div>

            {/* Second Row - Tracking and Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TrackerCard
                title="Group Impact Tracking"
                description="Real-time sustainability metrics for your organization"
                metrics={[
                  {
                    label: 'Carbon Footprint',
                    value: entityStats?.totalCO2Saved || data.totalCO2Saved,
                    unit: 'kg CO₂ saved',
                    trend: 15,
                    icon: Leaf,
                    color: 'green'
                  },
                  {
                    label: 'Active Participants',
                    value: entityStats?.activeUsers || data.activeMembers,
                    unit: 'members',
                    trend: 8,
                    icon: Users,
                    color: 'blue'
                  },
                  {
                    label: 'Wellness Score',
                    value: 82,
                    unit: '/100',
                    trend: 5,
                    icon: Heart,
                    color: 'pink'
                  }
                ]}
                onTrack={() => console.log('Track group metrics')}
                onViewHistory={() => console.log('View history')}
              />

              <ZPCard title="Active Challenges" description="Engage your community in sustainability">
                <div className="space-y-4">
                  {data.challenges.slice(0, 3).map((challenge) => (
                    <div key={challenge.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-900">{challenge.title}</h4>
                        <ZPBadge 
                          variant={challenge.status === 'active' ? 'success' : challenge.status === 'upcoming' ? 'warning' : 'secondary'}
                        >
                          {challenge.status}
                        </ZPBadge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{challenge.description}</p>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">
                          {challenge.participants} participants
                        </span>
                        <span className="font-medium text-green-600">
                          {challenge.reward} HC reward
                        </span>
                      </div>
                    </div>
                  ))}
                  <ZPButton variant="outline" className="w-full mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Challenge
                  </ZPButton>
                </div>
              </ZPCard>
            </div>

            {/* Third Row - Leaderboard and Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LeaderboardList
                title="Top Performers"
                description="Leading sustainability champions in your organization"
                entries={data.topPerformers.map(performer => ({
                  id: performer.id,
                  name: performer.name,
                  score: performer.score,
                  rank: performer.rank,
                  change: performer.change,
                  category: 'overall' as const,
                  metadata: performer.department ? { department: performer.department } : undefined
                }))}
                showChange={true}
                maxEntries={5}
                onViewAll={() => setActiveTab('members')}
              />

              <ZPCard title="Quick Actions" description="Manage your organization efficiently">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div 
                    className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => console.log('Add member')}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <UserPlus className="h-4 w-4 text-blue-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900">Add New Member</h4>
                    </div>
                    <p className="text-sm text-gray-600">Invite new team members to join</p>
                  </div>
                  
                  <div 
                    className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setShowBulkActions(true)}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <Upload className="h-4 w-4 text-green-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900">Bulk Upload</h4>
                    </div>
                    <p className="text-sm text-gray-600">Upload member data via CSV</p>
                  </div>
                  
                  <div 
                    className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setActiveTab('reports')}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <FileText className="h-4 w-4 text-purple-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900">Generate Report</h4>
                    </div>
                    <p className="text-sm text-gray-600">Create sustainability report</p>
                  </div>
                  
                  <div 
                    className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setActiveTab('esg')}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                        <BarChart3 className="h-4 w-4 text-orange-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900">View Analytics</h4>
                    </div>
                    <p className="text-sm text-gray-600">Detailed performance insights</p>
                  </div>
                </div>
              </ZPCard>
            </div>

            {/* Fourth Row - Recent Activity */}
            <ZPCard title="Recent Activity" description="Latest sustainability actions from your team">
              <div className="space-y-4">
                {data.recentActivities.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Leaf className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {activity.userName} {activity.action}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-600">
                        +{activity.impact} kg CO₂
                      </p>
                    </div>
                  </div>
                ))}
                {data.recentActivities.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No recent activities</p>
                  </div>
                )}
              </div>
            </ZPCard>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Group Impact Analytics</h2>
              <div className="flex gap-3">
                <ZPButton variant="outline" size="sm" onClick={handleRefresh}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Data
                </ZPButton>
                <ZPButton variant="outline" size="sm" onClick={handleExportData}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Analytics
                </ZPButton>
              </div>
            </div>

            {/* Department Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <ZPCard title="Department Performance" description="Compare sustainability metrics across departments">
                <div className="space-y-4">
                  {data.departments.map((dept) => (
                    <div 
                      key={dept}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedDepartment === dept ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedDepartment(dept)}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{dept}</span>
                        <span className="text-sm text-gray-500">
                          {Math.floor(Math.random() * 50) + 10} members
                        </span>
                      </div>
                      <div className="mt-2 text-sm text-green-600">
                        {Math.floor(Math.random() * 500) + 100} kg CO₂ saved
                      </div>
                    </div>
                  ))}
                </div>
              </ZPCard>

              <ZPCard title="Real-time Metrics" description="Live sustainability tracking">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <TreePine className="h-5 w-5 text-green-600" />
                      <span className="font-medium">Carbon Impact</span>
                    </div>
                    <span className="text-green-600 font-bold">
                      {entityStats?.totalCO2Saved || data.totalCO2Saved} kg
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-blue-600" />
                      <span className="font-medium">Engagement</span>
                    </div>
                    <span className="text-blue-600 font-bold">
                      {Math.round((data.activeMembers / data.totalMembers) * 100)}%
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <PawPrint className="h-5 w-5 text-purple-600" />
                      <span className="font-medium">Wellness Score</span>
                    </div>
                    <span className="text-purple-600 font-bold">82/100</span>
                  </div>
                </div>
              </ZPCard>

              <ZPCard title="Trend Analysis" description="Performance over time">
                <div className="space-y-4">
                  <div className="text-center py-4">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <p className="font-medium">Monthly Growth</p>
                    <p className="text-2xl font-bold text-green-600">+{data.monthlyGrowth}%</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>This Week</span>
                      <span className="text-green-600">+12%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>This Month</span>
                      <span className="text-green-600">+{data.monthlyGrowth}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>This Quarter</span>
                      <span className="text-green-600">+{Math.round(data.monthlyGrowth * 2.5)}%</span>
                    </div>
                  </div>
                </div>
              </ZPCard>
            </div>

            {/* Group Impact Tracking */}
            <TrackerCard
              title="Comprehensive Group Impact Tracking"
              description="Monitor your organization's collective sustainability journey"
              metrics={[
                {
                  label: 'Total Carbon Saved',
                  value: entityStats?.totalCO2Saved || data.totalCO2Saved,
                  unit: 'kg CO₂',
                  trend: 15,
                  icon: TreePine,
                  color: 'green'
                },
                {
                  label: 'Active Participants',
                  value: entityStats?.activeUsers || data.activeMembers,
                  unit: 'members',
                  trend: 8,
                  icon: Users,
                  color: 'blue'
                },
                {
                  label: 'HealCoins Earned',
                  value: entityStats?.totalHealCoins || data.totalHealCoins,
                  unit: 'HC',
                  trend: 12,
                  icon: Coins,
                  color: 'yellow'
                },
                {
                  label: 'Wellness Score',
                  value: 82,
                  unit: '/100',
                  trend: 5,
                  icon: Heart,
                  color: 'pink'
                },
                {
                  label: 'Challenge Completion',
                  value: Math.round((data.challenges.filter(c => c.status === 'completed').length / data.challenges.length) * 100),
                  unit: '%',
                  trend: 10,
                  icon: Target,
                  color: 'purple'
                },
                {
                  label: 'ESG Score',
                  value: data.esgScore || 85,
                  unit: '/100',
                  trend: 3,
                  icon: Shield,
                  color: 'indigo'
                }
              ]}
              onTrack={() => console.log('Track comprehensive metrics')}
              onViewHistory={() => console.log('View detailed history')}
            />

            {/* Department Comparison */}
            {selectedDepartment && departmentAnalytics && (
              <ZPCard title={`${selectedDepartment} Department Analytics`} description="Detailed performance metrics for selected department">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-800">Carbon Impact</h4>
                    <p className="text-2xl font-bold text-green-600">
                      {departmentAnalytics.carbonSaved} kg
                    </p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-800">Active Members</h4>
                    <p className="text-2xl font-bold text-blue-600">
                      {departmentAnalytics.activeMembers}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-purple-800">Avg Score</h4>
                    <p className="text-2xl font-bold text-purple-600">
                      {departmentAnalytics.averageScore}
                    </p>
                  </div>
                </div>
              </ZPCard>
            )}
          </div>
        )}

        {activeTab === 'members' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Member Management</h2>
              <div className="flex gap-3">
                <ZPButton variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Bulk Import
                </ZPButton>
                <ZPButton size="sm">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Member
                </ZPButton>
              </div>
            </div>

            <ZPCard title="Member Directory" description="Manage your organization's sustainability team">
              <div className="space-y-4">
                {/* This would be populated with real member data */}
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Member management interface coming soon</p>
                  <p className="text-sm">Connect with your team and track collective impact</p>
                </div>
              </div>
            </ZPCard>
          </div>
        )}

        {activeTab === 'esg' && (
          <ESGReportingModule
            entityId={data.entityId}
            entityType={data.entityType}
            reportingPeriod="quarterly"
            onExportReport={(format) => {
              console.log(`Exporting ESG report as ${format}`);
              // Integrate with existing export functionality
              handleExportData();
            }}
          />
        )}

        {activeTab === 'reports' && (
          <ESGReportGenerator
            entityId={data.entityId}
            entityType={data.entityType}
            entityName={data.entityName}
            onReportGenerated={(reportUrl) => {
              console.log(`ESG report generated: ${reportUrl}`);
            }}
          />
        )}
      </div>

      {/* Last Updated Footer */}
      <div className="bg-white border-t border-gray-200 px-6 py-3">
        <div className="container mx-auto flex justify-between items-center text-sm text-gray-500">
          <span>
            Last updated: {lastUpdated.toLocaleString()}
          </span>
          <span>
            {data.entityType === 'school' ? '🏫' : '🏭'} {entityLabel} Dashboard v2.0
          </span>
        </div>
      </div>
    </div>
  );
}

export default EntityDashboard;