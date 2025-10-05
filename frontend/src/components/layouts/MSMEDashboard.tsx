'use client';

import React, { useState } from 'react';
import { ZPCard } from '@/components/ZPCard';
import { ZPButton } from '@/components/ZPButton';
import { ZPBadge } from '@/components/ZPBadge';
import { TrackerCard } from '@/components/ui/TrackerCard';
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
    Factory,
    Shield,
    Zap,
    Loader2,
    RefreshCw,
    Activity,
    DollarSign,
    Package,
    Truck,
    AwardIcon,
    TrendingDown,
    CheckCircle,
    AlertTriangle,
    Droplets,
    Sun,
    MapPin,
    TreePine,
    Car,
    Recycle,
    Lightbulb,
    CreditCard,
    Gift,
    Crown,
    Medal,
    Trophy,
    Star,
    Flame,
    Bike,
    Bus,
    Train,
    Plane,
    Wind,
    Waves,
    Mountain,
    Sprout,
    Gamepad2,
    Trash2
} from 'lucide-react';

interface EntityUser {
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

interface MSMEUser extends EntityUser {
    role: 'msme';
}

interface MSMEData {
    entityId: string;
    entityName: string;
    entityType: 'msme';
    totalMembers: number;
    activeMembers: number;
    totalCO2Saved: number;
    totalHealCoins: number;
    esgScore: number;
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
    // Additional MSME-specific data
    sustainabilityMetrics: {
        energyConsumption: number;
        wasteReduction: number;
        waterUsage: number;
        renewableEnergy: number;
    };
    financialMetrics: {
        revenue: number;
        costSavings: number;
        esgInvestment: number;
        greenCertifications: number;
    };
    supplyChainMetrics: {
        sustainableSuppliers: number;
        localSourcing: number;
        carbonFootprint: number;
        ethicalCompliance: number;
    };
    employeeMetrics: {
        trainingHours: number;
        wellnessPrograms: number;
        diversityScore: number;
        retentionRate: number;
    };
    // Advanced MSME metrics
    kpiMetrics: {
        healCoins30Days: number;
        totalCO2SavedTons: number;
        wasteDivertedPercent: number;
        activeEmployees: number;
        esgScoreAggregate: number;
    };
    ecoActionTracker: {
        energyConsumption: Array<{ date: string; grid: number; solar: number }>;
        wasteSegregation: Array<{ date: string; segregated: number; total: number }>;
        transportFootprint: Array<{ date: string; evAdoption: number; carpooling: number }>;
    };
    gamesEngagement: Array<{
        gameName: string;
        averageScore: number;
        correlation: string;
    }>;
    marketplace: {
        availableCoins: number;
        recentRedemptions: Array<{
            id: string;
            item: string;
            coins: number;
            date: string;
        }>;
    };
}

interface MSMEDashboardProps {
    user: EntityUser;
    data: MSMEData;
}

export function MSMEDashboard({ user, data }: MSMEDashboardProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [activeTab, setActiveTab] = useState<'overview' | 'kpi' | 'leaderboard' | 'eco-tracker' | 'games' | 'reports' | 'marketplace' | 'admin'>('overview');

    const handleRefresh = async () => {
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLastUpdated(new Date());
            setIsLoading(false);
        }, 1000);
    };

    const handleExportData = async (format: 'csv' | 'pdf') => {
        // Export functionality
        console.log(`Exporting data in ${format} format...`);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-lg border-b border-emerald-200/50 shadow-lg shadow-emerald-100/30 sticky top-0 z-10">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-md">
                                    <Factory className="h-8 w-8 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-700 to-teal-800 bg-clip-text text-transparent">
                                        {data.entityName} 🏭
                                    </h1>
                                    <p className="text-gray-600 font-medium">
                                        MSME Sustainability Dashboard • {data.totalMembers} members
                                    </p>
                                </div>
                            </div>
                            <ZPBadge variant="success" className="ml-auto lg:ml-0 px-4 py-2 text-lg font-bold shadow-md">
                                ESG Score: {data.esgScore}/100
                            </ZPBadge>
                        </div>

                        <div className="flex items-center gap-3">
                            <ZPButton
                                variant="outline"
                                size="sm"
                                onClick={handleRefresh}
                                disabled={isLoading}
                                className="flex items-center gap-2 bg-white hover:bg-emerald-50 border-emerald-200 shadow-sm hover:shadow-md transition-all duration-300"
                            >
                                {isLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                                ) : (
                                    <RefreshCw className="h-4 w-4 text-emerald-600" />
                                )}
                                Refresh
                            </ZPButton>

                            <ZPButton
                                variant="outline"
                                size="sm"
                                onClick={() => handleExportData('pdf')}
                                className="flex items-center gap-2 bg-white hover:bg-emerald-50 border-emerald-200 shadow-sm hover:shadow-md transition-all duration-300"
                            >
                                <Download className="h-4 w-4 text-emerald-600" />
                                Export
                            </ZPButton>

                            <ZPButton
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2 bg-white hover:bg-emerald-50 border-emerald-200 shadow-sm hover:shadow-md transition-all duration-300"
                            >
                                <Settings className="h-4 w-4 text-emerald-600" />
                                Settings
                            </ZPButton>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="container mx-auto px-6">
                    <div className="border-b border-emerald-200/30">
                        <nav className="-mb-px flex space-x-8 overflow-x-auto pb-2">
                            {[
                                { id: 'overview', label: 'Overview', icon: BarChart3 },
                                { id: 'kpi', label: 'KPIs', icon: Target },
                                { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
                                { id: 'eco-tracker', label: 'Eco Tracker', icon: Leaf },
                                { id: 'games', label: 'Games', icon: Gamepad2 },
                                { id: 'reports', label: 'Reports', icon: FileText },
                                { id: 'marketplace', label: 'Marketplace', icon: Gift },
                                { id: 'admin', label: 'Admin', icon: Settings },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`py-4 px-2 font-semibold text-sm flex items-center gap-2 transition-all duration-300 whitespace-nowrap relative group ${activeTab === tab.id
                                            ? 'text-emerald-700'
                                            : 'text-gray-500 hover:text-emerald-600'
                                        }`}
                                >
                                    {React.createElement(tab.icon, { className: "h-5 w-5" })}
                                    {tab.label}
                                    {activeTab === tab.id && (
                                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full"></div>
                                    )}
                                    {activeTab !== tab.id && (
                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-200/50 group-hover:bg-emerald-300/70 rounded-full"></div>
                                    )}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-6 py-8">
                <div className="space-y-8">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <>
                            {/* KPI Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                                <ZPCard className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-amber-800 font-medium">HealCoins (30 Days)</p>
                                            <p className="text-amber-600 text-sm">Earned in the last month</p>
                                        </div>
                                        <Coins className="h-10 w-10 text-amber-500" />
                                    </div>
                                    <div className="mt-4">
                                        <span className="text-3xl font-bold text-amber-700">{data.kpiMetrics.healCoins30Days}</span>
                                    </div>
                                </ZPCard>

                                <ZPCard className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-green-800 font-medium">CO₂ Saved</p>
                                            <p className="text-green-600 text-sm">Total tons saved</p>
                                        </div>
                                        <Leaf className="h-10 w-10 text-green-500" />
                                    </div>
                                    <div className="mt-4">
                                        <span className="text-3xl font-bold text-green-700">{data.kpiMetrics.totalCO2SavedTons} tons</span>
                                    </div>
                                </ZPCard>

                                <ZPCard className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-blue-800 font-medium">Waste Diverted</p>
                                            <p className="text-blue-600 text-sm">Percentage reduction</p>
                                        </div>
                                        <Recycle className="h-10 w-10 text-blue-500" />
                                    </div>
                                    <div className="mt-4">
                                        <span className="text-3xl font-bold text-blue-700">{data.kpiMetrics.wasteDivertedPercent}%</span>
                                    </div>
                                </ZPCard>

                                <ZPCard className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-purple-800 font-medium">Active Employees</p>
                                            <p className="text-purple-600 text-sm">Currently engaged</p>
                                        </div>
                                        <Users className="h-10 w-10 text-purple-500" />
                                    </div>
                                    <div className="mt-4">
                                        <span className="text-3xl font-bold text-purple-700">{data.kpiMetrics.activeEmployees}/{data.totalMembers}</span>
                                    </div>
                                </ZPCard>

                                <ZPCard className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-emerald-800 font-medium">ESG Score</p>
                                            <p className="text-emerald-600 text-sm">Aggregate sustainability score</p>
                                        </div>
                                        <Shield className="h-10 w-10 text-emerald-500" />
                                    </div>
                                    <div className="mt-4">
                                        <span className="text-3xl font-bold text-emerald-700">{data.kpiMetrics.esgScoreAggregate}/100</span>
                                    </div>
                                </ZPCard>
                            </div>

                            {/* Sustainability Impact and Challenges */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <TrackerCard
                                    type="carbon"
                                    title="Sustainability Impact"
                                    description="Your measurable environmental contributions"
                                    metrics={[
                                        {
                                            label: 'Carbon Footprint Reduction',
                                            value: data.totalCO2Saved,
                                            unit: 'kg CO₂ saved',
                                            change: { value: 15, period: 'this month', isPositive: true },
                                        },
                                        {
                                            label: 'Waste Diverted',
                                            value: data.sustainabilityMetrics.wasteReduction,
                                            unit: 'kg waste',
                                            change: { value: 25, period: 'this month', isPositive: true },
                                        },
                                        {
                                            label: 'Renewable Energy',
                                            value: data.sustainabilityMetrics.renewableEnergy,
                                            unit: '% adoption',
                                            change: { value: 8, period: 'this month', isPositive: true },
                                        }
                                    ]}
                                    overallScore={{ value: data.esgScore, maxValue: 100, label: 'ESG Score' }}
                                    trend="improving"
                                    lastUpdated={new Date()}
                                    onViewDetails={() => console.log('View details')}
                                    onAddEntry={() => console.log('Add entry')}
                                    className="shadow-lg hover:shadow-xl transition-shadow duration-300"
                                />

                                <ZPCard title="Active Eco-Challenges" description="Engage your team in sustainability" className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                                    <div className="space-y-4">
                                        {data.challenges.slice(0, 3).map((challenge) => (
                                            <div key={challenge.id} className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-all duration-300 bg-white/50 hover:bg-white">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="font-semibold text-gray-900">{challenge.title}</h4>
                                                    <ZPBadge
                                                        variant={challenge.status === 'active' ? 'success' : challenge.status === 'upcoming' ? 'warning' : 'secondary'}
                                                        className="px-3 py-1"
                                                    >
                                                        {challenge.status}
                                                    </ZPBadge>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-3">{challenge.description}</p>
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-gray-500">
                                                        {challenge.participants} participants
                                                    </span>
                                                    <span className="font-medium text-emerald-600">
                                                        {challenge.reward} HC reward
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                        <ZPButton variant="outline" className="w-full mt-4 bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Create New Challenge
                                        </ZPButton>
                                    </div>
                                </ZPCard>
                            </div>

                            {/* Recent Activity and Top Performers */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <ZPCard title="Recent Activity" description="Latest sustainability actions from your team" className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                                    <div className="space-y-4">
                                        {data.recentActivities.slice(0, 5).map((activity) => (
                                            <div key={activity.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-emerald-50/50 transition-colors duration-300">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center">
                                                        <Leaf className="h-5 w-5 text-emerald-600" />
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
                                                    <p className="text-sm font-medium text-emerald-600">
                                                        +{activity.impact} kg CO₂
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ZPCard>

                                <ZPCard title="Top Performers" description="Leading sustainability champions in your organization" className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                                    <div className="space-y-4">
                                        {data.topPerformers.map((performer) => (
                                            <div key={performer.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-emerald-50/50 transition-colors duration-300">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center">
                                                        <span className="text-emerald-600 font-medium">#{performer.rank}</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{performer.name}</p>
                                                        <p className="text-xs text-gray-500">{performer.department}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-medium text-emerald-600">{performer.score} pts</p>
                                                    <p className={`text-xs ${performer.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        {performer.change > 0 ? '↑' : '↓'} {Math.abs(performer.change)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ZPCard>
                            </div>
                        </>
                    )}

                    {/* KPI Tab */}
                    {activeTab === 'kpi' && (
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-700 to-teal-800 bg-clip-text text-transparent">Key Performance Indicators</h2>

                            {/* Main KPI Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                                <ZPCard className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                    <div className="text-center">
                                        <Coins className="h-12 w-12 text-amber-500 mx-auto mb-3" />
                                        <p className="text-amber-800 font-medium">HealCoins (30 Days)</p>
                                        <p className="text-amber-600 text-sm mb-3">Earned in the last month</p>
                                        <span className="text-4xl font-bold text-amber-700">{data.kpiMetrics.healCoins30Days}</span>
                                        <p className="text-sm text-amber-600 mt-2">+12% from last month</p>
                                    </div>
                                </ZPCard>

                                <ZPCard className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                    <div className="text-center">
                                        <Leaf className="h-12 w-12 text-green-500 mx-auto mb-3" />
                                        <p className="text-green-800 font-medium">CO₂ Saved</p>
                                        <p className="text-green-600 text-sm mb-3">Total tons saved</p>
                                        <span className="text-4xl font-bold text-green-700">{data.kpiMetrics.totalCO2SavedTons} tons</span>
                                        <p className="text-sm text-green-600 mt-2">+18% from last month</p>
                                    </div>
                                </ZPCard>

                                <ZPCard className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                    <div className="text-center">
                                        <Recycle className="h-12 w-12 text-blue-500 mx-auto mb-3" />
                                        <p className="text-blue-800 font-medium">Waste Diverted</p>
                                        <p className="text-blue-600 text-sm mb-3">Percentage reduction</p>
                                        <span className="text-4xl font-bold text-blue-700">{data.kpiMetrics.wasteDivertedPercent}%</span>
                                        <p className="text-sm text-blue-600 mt-2">+8% from last month</p>
                                    </div>
                                </ZPCard>

                                <ZPCard className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                    <div className="text-center">
                                        <Users className="h-12 w-12 text-purple-500 mx-auto mb-3" />
                                        <p className="text-purple-800 font-medium">Active Employees</p>
                                        <p className="text-purple-600 text-sm mb-3">Currently engaged</p>
                                        <span className="text-4xl font-bold text-purple-700">{data.kpiMetrics.activeEmployees}/{data.totalMembers}</span>
                                        <p className="text-sm text-purple-600 mt-2">{Math.round((data.kpiMetrics.activeEmployees / data.totalMembers) * 100)}% engagement</p>
                                    </div>
                                </ZPCard>

                                <ZPCard className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                    <div className="text-center">
                                        <Shield className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
                                        <p className="text-emerald-800 font-medium">ESG Score</p>
                                        <p className="text-emerald-600 text-sm mb-3">Aggregate sustainability score</p>
                                        <span className="text-4xl font-bold text-emerald-700">{data.kpiMetrics.esgScoreAggregate}/100</span>
                                        <p className="text-sm text-emerald-600 mt-2">Industry benchmark: 75</p>
                                    </div>
                                </ZPCard>
                            </div>

                            {/* Detailed KPI Charts */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <ZPCard title="Energy Consumption Trend" description="Grid vs Solar energy usage" className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                                    <div className="h-64 flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl">
                                        <div className="text-center">
                                            <Activity className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
                                            <p className="text-emerald-700 font-medium">Energy consumption chart visualization</p>
                                            <p className="text-sm text-emerald-600 mt-1">Solar adoption increased by 15% this quarter</p>
                                        </div>
                                    </div>
                                </ZPCard>

                                <ZPCard title="Waste Segregation Performance" description="Segregated vs total waste" className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                                    <div className="h-64 flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
                                        <div className="text-center">
                                            <Recycle className="h-12 w-12 text-blue-400 mx-auto mb-3" />
                                            <p className="text-blue-700 font-medium">Waste segregation chart visualization</p>
                                            <p className="text-sm text-blue-600 mt-1">85% waste properly segregated this month</p>
                                        </div>
                                    </div>
                                </ZPCard>
                            </div>

                            {/* Transport Footprint */}
                            <ZPCard title="Transport Footprint" description="EV adoption and carpooling trends" className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                                <div className="h-64 flex items-center justify-center bg-gradient-to-br from-purple-50 to-fuchsia-50 rounded-xl">
                                    <div className="text-center">
                                        <Car className="h-12 w-12 text-purple-400 mx-auto mb-3" />
                                        <p className="text-purple-700 font-medium">Transport footprint visualization</p>
                                        <p className="text-sm text-purple-600 mt-1">EV adoption increased by 22% this quarter</p>
                                    </div>
                                </div>
                            </ZPCard>
                        </div>
                    )}

                    {/* Leaderboard Tab */}
                    {activeTab === 'leaderboard' && (
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-700 to-teal-800 bg-clip-text text-transparent">Employee & Unit Leaderboards</h2>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Individual Leaderboard */}
                                <ZPCard title="Top Individual Performers" description="Employees with highest eco-scores" className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                                    <div className="space-y-4">
                                        {data.topPerformers.map((performer, index) => (
                                            <div key={performer.id} className="flex items-center justify-between p-4 border-b border-gray-100 last:border-0 hover:bg-emerald-50/30 rounded-xl transition-colors duration-300">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100">
                                                        {index === 0 && <Crown className="h-5 w-5 text-yellow-500" />}
                                                        {index === 1 && <Medal className="h-5 w-5 text-gray-400" />}
                                                        {index === 2 && <Medal className="h-5 w-5 text-amber-600" />}
                                                        {index > 2 && <span className="text-emerald-600 font-medium text-sm">#{performer.rank}</span>}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{performer.name}</p>
                                                        <p className="text-xs text-gray-500">{performer.department}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium text-emerald-600">{performer.score}</p>
                                                    <div className="flex items-center gap-1">
                                                        {performer.change > 0 ? (
                                                            <TrendingUp className="h-3 w-3 text-green-500" />
                                                        ) : (
                                                            <TrendingDown className="h-3 w-3 text-red-500" />
                                                        )}
                                                        <span className={`text-xs ${performer.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                            {Math.abs(performer.change)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ZPCard>

                                {/* Department Leaderboard */}
                                <ZPCard title="Department Rankings" description="Units ranked by sustainability performance" className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                                    <div className="space-y-4">
                                        {[
                                            { name: "Production", score: 92, employees: 24, change: 5 },
                                            { name: "R&D", score: 88, employees: 18, change: 3 },
                                            { name: "Quality", score: 85, employees: 15, change: -2 },
                                            { name: "Logistics", score: 82, employees: 20, change: 7 },
                                            { name: "HR", score: 78, employees: 12, change: 1 },
                                        ].map((dept, index) => (
                                            <div key={index} className="flex items-center justify-between p-4 border-b border-gray-100 last:border-0 hover:bg-emerald-50/30 rounded-xl transition-colors duration-300">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100">
                                                        {index === 0 && <Trophy className="h-5 w-5 text-yellow-500" />}
                                                        {index === 1 && <Medal className="h-5 w-5 text-gray-400" />}
                                                        {index === 2 && <Medal className="h-5 w-5 text-amber-600" />}
                                                        {index > 2 && <span className="text-blue-600 font-medium text-sm">#{index + 1}</span>}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{dept.name}</p>
                                                        <p className="text-xs text-gray-500">{dept.employees} employees</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium text-blue-600">{dept.score}</p>
                                                    <div className="flex items-center gap-1">
                                                        {dept.change > 0 ? (
                                                            <TrendingUp className="h-3 w-3 text-green-500" />
                                                        ) : (
                                                            <TrendingDown className="h-3 w-3 text-red-500" />
                                                        )}
                                                        <span className={`text-xs ${dept.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                            {Math.abs(dept.change)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ZPCard>

                                {/* Badges & Recognition */}
                                <ZPCard title="Badges & Recognition" description="Achievements and milestones" className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                                    <div className="space-y-4">
                                        <div className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border border-yellow-200 hover:shadow-md transition-shadow duration-300">
                                            <div className="flex items-center gap-3">
                                                <Star className="h-8 w-8 text-yellow-500" />
                                                <div>
                                                    <h4 className="font-medium text-gray-900">Top Energy Saver</h4>
                                                    <p className="text-sm text-gray-600">Awarded to John Smith</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 hover:shadow-md transition-shadow duration-300">
                                            <div className="flex items-center gap-3">
                                                <Leaf className="h-8 w-8 text-green-500" />
                                                <div>
                                                    <h4 className="font-medium text-gray-900">Zero Waste Champion</h4>
                                                    <p className="text-sm text-gray-600">Awarded to Sarah Johnson</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200 hover:shadow-md transition-shadow duration-300">
                                            <div className="flex items-center gap-3">
                                                <Flame className="h-8 w-8 text-blue-500" />
                                                <div>
                                                    <h4 className="font-medium text-gray-900">30-Day Streak</h4>
                                                    <p className="text-sm text-gray-600">Production Department</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl border border-purple-200 hover:shadow-md transition-shadow duration-300">
                                            <div className="flex items-center gap-3">
                                                <Bike className="h-8 w-8 text-purple-500" />
                                                <div>
                                                    <h4 className="font-medium text-gray-900">Green Commuter</h4>
                                                    <p className="text-sm text-gray-600">Awarded to 15 employees</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </ZPCard>
                            </div>
                        </div>
                    )}

                    {/* Eco Tracker Tab */}
                    {activeTab === 'eco-tracker' && (
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-700 to-teal-800 bg-clip-text text-transparent">Eco-Action Tracker Summary</h2>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Energy Consumption */}
                                <ZPCard title="Energy Consumption Trend" description="Grid vs Solar energy usage" className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                                    <div className="h-64 flex items-center justify-center bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl">
                                        <div className="text-center">
                                            <Zap className="h-12 w-12 text-amber-500 mx-auto mb-3" />
                                            <p className="text-amber-700 font-medium">Energy consumption chart visualization</p>
                                            <p className="text-sm text-amber-600 mt-1">Solar adoption increased by 15% this quarter</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 grid grid-cols-2 gap-4">
                                        <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl">
                                            <div className="flex justify-center gap-2 mb-1">
                                                <Zap className="h-5 w-5 text-yellow-500" />
                                                <Sun className="h-5 w-5 text-orange-500" />
                                            </div>
                                            <p className="text-xl font-bold text-amber-700">42%</p>
                                            <p className="text-xs text-amber-600">Solar energy</p>
                                        </div>
                                        <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl">
                                            <p className="text-xl font-bold text-emerald-700">15%</p>
                                            <p className="text-xs text-emerald-600">Reduction</p>
                                        </div>
                                    </div>
                                </ZPCard>

                                {/* Waste Segregation */}
                                <ZPCard title="Waste Segregation Performance" description="Segregated vs total waste" className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                                    <div className="h-64 flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
                                        <div className="text-center">
                                            <Recycle className="h-12 w-12 text-blue-500 mx-auto mb-3" />
                                            <p className="text-blue-700 font-medium">Waste segregation chart visualization</p>
                                            <p className="text-sm text-blue-600 mt-1">85% waste properly segregated this month</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 grid grid-cols-2 gap-4">
                                        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
                                            <div className="flex justify-center gap-2 mb-1">
                                                <Recycle className="h-5 w-5 text-blue-500" />
                                                <Trash2 className="h-5 w-5 text-gray-500" />
                                            </div>
                                            <p className="text-xl font-bold text-blue-700">85%</p>
                                            <p className="text-xs text-blue-600">Segregated</p>
                                        </div>
                                        <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl">
                                            <p className="text-xl font-bold text-emerald-700">25%</p>
                                            <p className="text-xs text-emerald-600">Reduction</p>
                                        </div>
                                    </div>
                                </ZPCard>

                                {/* Transport Footprint */}
                                <ZPCard title="Transport Footprint" description="EV adoption and carpooling trends" className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                                    <div className="h-64 flex items-center justify-center bg-gradient-to-br from-purple-50 to-fuchsia-50 rounded-xl">
                                        <div className="text-center">
                                            <Car className="h-12 w-12 text-purple-500 mx-auto mb-3" />
                                            <p className="text-purple-700 font-medium">Transport footprint visualization</p>
                                            <p className="text-sm text-purple-600 mt-1">EV adoption increased by 22% this quarter</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 grid grid-cols-2 gap-4">
                                        <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-fuchsia-50 rounded-xl">
                                            <div className="flex justify-center gap-1 mb-1">
                                                <Bus className="h-4 w-4 text-blue-500" />
                                                <Train className="h-4 w-4 text-green-500" />
                                                <Bike className="h-4 w-4 text-purple-500" />
                                            </div>
                                            <p className="text-xl font-bold text-purple-700">42%</p>
                                            <p className="text-xs text-purple-600">Green transport</p>
                                        </div>
                                        <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl">
                                            <p className="text-xl font-bold text-emerald-700">15%</p>
                                            <p className="text-xs text-emerald-600">Carpooling rate</p>
                                        </div>
                                    </div>
                                </ZPCard>
                            </div>

                            {/* Detailed Metrics */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="p-5 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200 shadow-md hover:shadow-lg transition-shadow duration-300">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Droplets className="h-6 w-6 text-blue-500" />
                                        <h3 className="font-medium text-gray-900">Water Usage</h3>
                                    </div>
                                    <p className="text-3xl font-bold text-blue-600">{data.sustainabilityMetrics.waterUsage} L</p>
                                    <p className="text-xs text-blue-500">-8% from last month</p>
                                </div>

                                <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 shadow-md hover:shadow-lg transition-shadow duration-300">
                                    <div className="flex items-center gap-2 mb-2">
                                        <TreePine className="h-6 w-6 text-green-500" />
                                        <h3 className="font-medium text-gray-900">Carbon Saved</h3>
                                    </div>
                                    <p className="text-3xl font-bold text-green-600">{data.totalCO2Saved} kg</p>
                                    <p className="text-xs text-green-500">+15% from last month</p>
                                </div>

                                <div className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200 shadow-md hover:shadow-lg transition-shadow duration-300">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Sprout className="h-6 w-6 text-emerald-500" />
                                        <h3 className="font-medium text-gray-900">Green Initiatives</h3>
                                    </div>
                                    <p className="text-3xl font-bold text-emerald-600">12</p>
                                    <p className="text-xs text-emerald-500">Active projects</p>
                                </div>

                                <div className="p-5 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl border border-purple-200 shadow-md hover:shadow-lg transition-shadow duration-300">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Award className="h-6 w-6 text-purple-500" />
                                        <h3 className="font-medium text-gray-900">Badges Earned</h3>
                                    </div>
                                    <p className="text-3xl font-bold text-purple-600">24</p>
                                    <p className="text-xs text-purple-500">By employees</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Games Tab */}
                    {activeTab === 'games' && (
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-700 to-teal-800 bg-clip-text text-transparent">Games & Learning Engagement</h2>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Top Games Played */}
                                <ZPCard title="Top Games Played" description="Most popular sustainability games" className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                                    <div className="space-y-4">
                                        {[
                                            { name: "Carbon Footprint Challenge", score: 85, players: 42, icon: Leaf },
                                            { name: "Waste Warrior", score: 78, players: 38, icon: Recycle },
                                            { name: "Energy Efficiency Master", score: 92, players: 35, icon: Zap },
                                            { name: "Water Conservation Quest", score: 76, players: 30, icon: Droplets },
                                            { name: "Green Transport Guru", score: 88, players: 28, icon: Bike },
                                        ].map((game, index) => {
                                            const Icon = game.icon;
                                            return (
                                                <div key={index} className="flex items-center justify-between p-4 border-b border-gray-100 last:border-0 hover:bg-emerald-50/30 rounded-xl transition-colors duration-300">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100">
                                                            <Icon className="h-6 w-6 text-emerald-600" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900">{game.name}</p>
                                                            <p className="text-xs text-gray-500">{game.players} players</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-medium text-emerald-600">{game.score}%</p>
                                                        <p className="text-xs text-gray-500">Avg. score</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </ZPCard>

                                {/* Game Correlations */}
                                <ZPCard title="Game Impact Correlations" description="How games influence real actions" className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                                    <div className="space-y-4">
                                        <div className="p-5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 hover:shadow-md transition-shadow duration-300">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-medium text-gray-900">Waste Game → Waste Segregation</h4>
                                                <ZPBadge variant="success" className="px-3 py-1">+25%</ZPBadge>
                                            </div>
                                            <p className="text-sm text-gray-600">Employees who played Waste Warrior showed 25% better waste segregation rates</p>
                                        </div>

                                        <div className="p-5 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200 hover:shadow-md transition-shadow duration-300">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-medium text-gray-900">Energy Game → Consumption</h4>
                                                <ZPBadge variant="success" className="px-3 py-1">-12%</ZPBadge>
                                            </div>
                                            <p className="text-sm text-gray-600">Energy Efficiency Master players reduced energy consumption by 12%</p>
                                        </div>

                                        <div className="p-5 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl border border-purple-200 hover:shadow-md transition-shadow duration-300">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-medium text-gray-900">Transport Game → Green Commuting</h4>
                                                <ZPBadge variant="success" className="px-3 py-1">+18%</ZPBadge>
                                            </div>
                                            <p className="text-sm text-gray-600">Green Transport Guru players are 18% more likely to use sustainable transport</p>
                                        </div>
                                    </div>
                                </ZPCard>
                            </div>

                            {/* Engagement Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <ZPCard title="Overall Engagement" description="Employee participation rates" className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                                    <div className="text-center py-6">
                                        <div className="relative w-40 h-40 mx-auto mb-6">
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="text-3xl font-bold text-emerald-600">78%</span>
                                            </div>
                                            <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 100 100">
                                                <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                                                <circle
                                                    cx="50"
                                                    cy="50"
                                                    r="45"
                                                    fill="none"
                                                    stroke="url(#gradient)"
                                                    strokeWidth="8"
                                                    strokeDasharray="283"
                                                    strokeDashoffset="62"
                                                    strokeLinecap="round"
                                                />
                                                <defs>
                                                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                        <stop offset="0%" stopColor="#10b981" />
                                                        <stop offset="100%" stopColor="#06b6d4" />
                                                    </linearGradient>
                                                </defs>
                                            </svg>
                                        </div>
                                        <p className="text-gray-700 font-medium">Active participation</p>
                                    </div>
                                </ZPCard>

                                <ZPCard title="Learning Progress" description="Skill development metrics" className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                                    <div className="space-y-5">
                                        <div>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="font-medium">Beginner</span>
                                                <span className="font-medium">42%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-3">
                                                <div className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full" style={{ width: '42%' }}></div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="font-medium">Intermediate</span>
                                                <span className="font-medium">35%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-3">
                                                <div className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-3 rounded-full" style={{ width: '35%' }}></div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="font-medium">Advanced</span>
                                                <span className="font-medium">23%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-3">
                                                <div className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full" style={{ width: '23%' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </ZPCard>

                                <ZPCard title="Completion Rates" description="Course and challenge completion" className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
                                            <span className="text-gray-700 font-medium">Sustainability 101</span>
                                            <span className="font-bold text-blue-600">92%</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg">
                                            <span className="text-gray-700 font-medium">Carbon Accounting</span>
                                            <span className="font-bold text-emerald-600">78%</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-lime-50 rounded-lg">
                                            <span className="text-gray-700 font-medium">Waste Management</span>
                                            <span className="font-bold text-green-600">85%</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-fuchsia-50 rounded-lg">
                                            <span className="text-gray-700 font-medium">Energy Efficiency</span>
                                            <span className="font-bold text-purple-600">71%</span>
                                        </div>
                                    </div>
                                </ZPCard>
                            </div>
                        </div>
                    )}

                    {/* Reports Tab */}
                    {activeTab === 'reports' && (
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-700 to-teal-800 bg-clip-text text-transparent">Reports & Exports</h2>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* ESG-Lite Reports */}
                                <ZPCard title="ESG-Lite Reports" description="Monthly and quarterly sustainability reports" className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                                    <div className="space-y-5">
                                        <div className="p-5 border border-gray-200 rounded-xl hover:shadow-md transition-shadow bg-gradient-to-br from-white to-gray-50">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h4 className="font-semibold text-gray-900 text-lg">September 2025 ESG Report</h4>
                                                    <p className="text-sm text-gray-500">Monthly report</p>
                                                </div>
                                                <ZPBadge variant="success" className="px-3 py-1">Ready</ZPBadge>
                                            </div>
                                            <div className="flex flex-wrap gap-3 mb-4">
                                                <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                                                    <Leaf className="h-4 w-4 text-green-500" />
                                                    <span>5.2 tons CO₂</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                                                    <Zap className="h-4 w-4 text-amber-500" />
                                                    <span>12,500 kWh</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                                                    <Droplets className="h-4 w-4 text-blue-500" />
                                                    <span>85,000 L</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-3">
                                                <ZPButton variant="outline" size="sm" onClick={() => handleExportData('pdf')} className="bg-emerald-50 hover:bg-emerald-100 border-emerald-200">
                                                    <Download className="h-4 w-4 mr-2" />
                                                    PDF
                                                </ZPButton>
                                                <ZPButton variant="outline" size="sm" onClick={() => handleExportData('csv')} className="bg-emerald-50 hover:bg-emerald-100 border-emerald-200">
                                                    <Download className="h-4 w-4 mr-2" />
                                                    CSV
                                                </ZPButton>
                                            </div>
                                        </div>

                                        <div className="p-5 border border-gray-200 rounded-xl hover:shadow-md transition-shadow bg-gradient-to-br from-white to-gray-50">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h4 className="font-semibold text-gray-900 text-lg">Q3 2025 ESG Report</h4>
                                                    <p className="text-sm text-gray-500">Quarterly report</p>
                                                </div>
                                                <ZPBadge variant="warning" className="px-3 py-1">Processing</ZPBadge>
                                            </div>
                                            <div className="flex flex-wrap gap-3 mb-4">
                                                <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                                                    <Leaf className="h-4 w-4 text-green-500" />
                                                    <span>15.8 tons CO₂</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                                                    <Zap className="h-4 w-4 text-amber-500" />
                                                    <span>38,200 kWh</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                                                    <Droplets className="h-4 w-4 text-blue-500" />
                                                    <span>255,000 L</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-3">
                                                <ZPButton variant="outline" size="sm" disabled className="bg-gray-100 border-gray-200">
                                                    <Download className="h-4 w-4 mr-2" />
                                                    PDF
                                                </ZPButton>
                                                <ZPButton variant="outline" size="sm" disabled className="bg-gray-100 border-gray-200">
                                                    <Download className="h-4 w-4 mr-2" />
                                                    CSV
                                                </ZPButton>
                                            </div>
                                        </div>
                                    </div>
                                </ZPCard>

                                {/* CSR Certificates */}
                                <ZPCard title="CSR Certificates" description="Auto-generated compliance certificates" className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                                    <div className="space-y-5">
                                        <div className="p-5 border border-gray-200 rounded-xl bg-gradient-to-br from-white to-gray-50">
                                            <div className="flex items-start gap-4 mb-4">
                                                <div className="p-3 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl">
                                                    <Shield className="h-10 w-10 text-emerald-500" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-gray-900 text-lg">CSR Compliance Certificate</h4>
                                                    <p className="text-sm text-gray-600 mt-1">This MSME saved 5.2 tons CO₂ in September 2025</p>
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-500 mb-4">Certificate ID: CSR-2025-09-MSME-12345</p>
                                            <ZPButton variant="outline" className="w-full bg-emerald-50 hover:bg-emerald-100 border-emerald-200">
                                                <Download className="h-4 w-4 mr-2" />
                                                Download PDF
                                            </ZPButton>
                                        </div>

                                        <div className="p-5 border border-gray-200 rounded-xl bg-gradient-to-br from-white to-gray-50">
                                            <div className="flex items-start gap-4 mb-4">
                                                <div className="p-3 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl">
                                                    <Award className="h-10 w-10 text-blue-500" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-gray-900 text-lg">Sustainability Excellence Award</h4>
                                                    <p className="text-sm text-gray-600 mt-1">Recognized for outstanding environmental performance</p>
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-500 mb-4">Awarded: October 15, 2025</p>
                                            <ZPButton variant="outline" className="w-full bg-emerald-50 hover:bg-emerald-100 border-emerald-200">
                                                <Download className="h-4 w-4 mr-2" />
                                                Download Certificate
                                            </ZPButton>
                                        </div>
                                    </div>
                                </ZPCard>
                            </div>

                            {/* Report History */}
                            <ZPCard title="Report History" description="Previously generated reports and certificates" className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            <tr className="hover:bg-emerald-50/30">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">August 2025 ESG Report</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2025-09-05</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Monthly</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <ZPBadge variant="success" className="px-2 py-1">Completed</ZPBadge>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <ZPButton variant="ghost" size="sm" className="text-emerald-600 hover:bg-emerald-100">
                                                        <Download className="h-4 w-4" />
                                                    </ZPButton>
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-emerald-50/30">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Q2 2025 ESG Report</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2025-07-15</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Quarterly</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <ZPBadge variant="success" className="px-2 py-1">Completed</ZPBadge>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <ZPButton variant="ghost" size="sm" className="text-emerald-600 hover:bg-emerald-100">
                                                        <Download className="h-4 w-4" />
                                                    </ZPButton>
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-emerald-50/30">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">CSR Certificate Q2</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2025-07-20</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Certificate</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <ZPBadge variant="success" className="px-2 py-1">Completed</ZPBadge>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <ZPButton variant="ghost" size="sm" className="text-emerald-600 hover:bg-emerald-100">
                                                        <Download className="h-4 w-4" />
                                                    </ZPButton>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </ZPCard>
                        </div>
                    )}

                    {/* Marketplace Tab */}
                    {activeTab === 'marketplace' && (
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-700 to-teal-800 bg-clip-text text-transparent">Green Marketplace</h2>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* HealCoins Balance */}
                                <ZPCard title="HealCoins Balance" description="Available coins for redemption" className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                                    <div className="text-center py-8">
                                        <div className="relative inline-block">
                                            <Coins className="h-20 w-20 text-amber-500 mx-auto" />
                                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center">
                                                <span className="text-white text-xs font-bold">HC</span>
                                            </div>
                                        </div>
                                        <p className="text-5xl font-bold bg-gradient-to-r from-amber-600 to-amber-800 bg-clip-text text-transparent mt-4">{data.marketplace.availableCoins}</p>
                                        <p className="text-gray-600 mt-2 font-medium">HealCoins available</p>
                                        <ZPButton variant="outline" className="mt-6 bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-700">
                                            <CreditCard className="h-5 w-5 mr-2" />
                                            View Transaction History
                                        </ZPButton>
                                    </div>
                                </ZPCard>

                                {/* Bulk Eco-Products */}
                                <ZPCard title="Bulk Eco-Products" description="Redeem coins for staff rewards" className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                                    <div className="space-y-5">
                                        <div className="p-5 border border-gray-200 rounded-xl hover:shadow-md transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50">
                                            <div className="flex items-center gap-4 mb-3">
                                                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100">
                                                    <Droplets className="h-6 w-6 text-blue-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-900">Steel Water Bottles</h4>
                                                    <p className="text-sm text-gray-500">Pack of 50</p>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center mt-3">
                                                <span className="font-bold text-amber-600 text-lg">2,500 HC</span>
                                                <ZPButton variant="outline" size="sm" className="bg-emerald-50 hover:bg-emerald-100 border-emerald-200">
                                                    Redeem
                                                </ZPButton>
                                            </div>
                                        </div>

                                        <div className="p-5 border border-gray-200 rounded-xl hover:shadow-md transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50">
                                            <div className="flex items-center gap-4 mb-3">
                                                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100">
                                                    <TreePine className="h-6 w-6 text-green-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-900">Tree Planting Credits</h4>
                                                    <p className="text-sm text-gray-500">1,000 saplings</p>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center mt-3">
                                                <span className="font-bold text-amber-600 text-lg">10,000 HC</span>
                                                <ZPButton variant="outline" size="sm" className="bg-emerald-50 hover:bg-emerald-100 border-emerald-200">
                                                    Redeem
                                                </ZPButton>
                                            </div>
                                        </div>

                                        <div className="p-5 border border-gray-200 rounded-xl hover:shadow-md transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50">
                                            <div className="flex items-center gap-4 mb-3">
                                                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-fuchsia-100">
                                                    <Zap className="h-6 w-6 text-purple-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-900">EV Charging Vouchers</h4>
                                                    <p className="text-sm text-gray-500">50 x $10 vouchers</p>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center mt-3">
                                                <span className="font-bold text-amber-600 text-lg">5,000 HC</span>
                                                <ZPButton variant="outline" size="sm" className="bg-emerald-50 hover:bg-emerald-100 border-emerald-200">
                                                    Redeem
                                                </ZPButton>
                                            </div>
                                        </div>
                                    </div>
                                </ZPCard>

                                {/* CSR Initiatives */}
                                <ZPCard title="CSR Initiatives" description="Sponsor ward-level eco-projects" className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                                    <div className="space-y-5">
                                        <div className="p-5 border border-gray-200 rounded-xl hover:shadow-md transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50">
                                            <div className="flex items-center gap-4 mb-3">
                                                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100">
                                                    <Leaf className="h-6 w-6 text-emerald-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-900">Public EV Charger</h4>
                                                    <p className="text-sm text-gray-500">Sponsor installation</p>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center mt-3">
                                                <span className="font-bold text-amber-600 text-lg">15,000 HC</span>
                                                <ZPButton variant="outline" size="sm" className="bg-emerald-50 hover:bg-emerald-100 border-emerald-200">
                                                    Sponsor
                                                </ZPButton>
                                            </div>
                                        </div>

                                        <div className="p-5 border border-gray-200 rounded-xl hover:shadow-md transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50">
                                            <div className="flex items-center gap-4 mb-3">
                                                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100">
                                                    <Droplets className="h-6 w-6 text-blue-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-900">Community Water Station</h4>
                                                    <p className="text-sm text-gray-500">Install in public park</p>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center mt-3">
                                                <span className="font-bold text-amber-600 text-lg">8,000 HC</span>
                                                <ZPButton variant="outline" size="sm" className="bg-emerald-50 hover:bg-emerald-100 border-emerald-200">
                                                    Sponsor
                                                </ZPButton>
                                            </div>
                                        </div>

                                        <div className="p-5 border border-gray-200 rounded-xl hover:shadow-md transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50">
                                            <div className="flex items-center gap-4 mb-3">
                                                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-yellow-100">
                                                    <Sun className="h-6 w-6 text-amber-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-900">Solar Panel Installation</h4>
                                                    <p className="text-sm text-gray-500">For community center</p>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center mt-3">
                                                <span className="font-bold text-amber-600 text-lg">25,000 HC</span>
                                                <ZPButton variant="outline" size="sm" className="bg-emerald-50 hover:bg-emerald-100 border-emerald-200">
                                                    Sponsor
                                                </ZPButton>
                                            </div>
                                        </div>
                                    </div>
                                </ZPCard>
                            </div>

                            {/* Recent Redemptions */}
                            <ZPCard title="Recent Redemptions" description="Your latest marketplace transactions" className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coins</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {data.marketplace.recentRedemptions.map((redemption) => (
                                                <tr key={redemption.id} className="hover:bg-emerald-50/30">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{redemption.item}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(redemption.date).toLocaleDateString()}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-amber-600">{redemption.coins} HC</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <ZPBadge variant="success" className="px-2 py-1">Completed</ZPBadge>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </ZPCard>
                        </div>
                    )}

                    {/* Admin Tab */}
                    {activeTab === 'admin' && (
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-700 to-teal-800 bg-clip-text text-transparent">Admin Tools</h2>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* User Management */}
                                <ZPCard title="Employee Management" description="Add, remove, and manage team members" className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                                    <div className="space-y-5">
                                        <ZPButton variant="outline" className="w-full bg-emerald-50 hover:bg-emerald-100 border-emerald-200">
                                            <Plus className="h-5 w-5 mr-2" />
                                            Invite New Employees
                                        </ZPButton>

                                        <div className="p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                                            <h4 className="font-medium text-gray-900 mb-3">Pending Invitations</h4>
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                                                    <span className="text-sm">john.doe@company.com</span>
                                                    <ZPBadge variant="warning" className="px-2 py-1">Pending</ZPBadge>
                                                </div>
                                                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                                                    <span className="text-sm">sarah.smith@company.com</span>
                                                    <ZPBadge variant="warning" className="px-2 py-1">Pending</ZPBadge>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-5 border border-gray-200 rounded-xl bg-gradient-to-br from-white to-gray-50">
                                            <h4 className="font-medium text-gray-900 mb-3">Recent Activity</h4>
                                            <div className="space-y-3">
                                                <div className="flex justify-between text-sm p-3 bg-emerald-50/50 rounded-lg">
                                                    <span>Added 3 new employees</span>
                                                    <span className="text-gray-500">2 hours ago</span>
                                                </div>
                                                <div className="flex justify-between text-sm p-3 bg-emerald-50/50 rounded-lg">
                                                    <span>Removed inactive account</span>
                                                    <span className="text-gray-500">1 day ago</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </ZPCard>

                                {/* Action Approval */}
                                <ZPCard title="Action Approval" description="Review and approve employee eco-actions" className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                                    <div className="space-y-5">
                                        <div className="p-5 border border-gray-200 rounded-xl bg-gradient-to-br from-white to-gray-50">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h4 className="font-medium text-gray-900">Solar Panel Installation</h4>
                                                    <p className="text-sm text-gray-600">Submitted by John Smith</p>
                                                </div>
                                                <ZPBadge variant="warning" className="px-2 py-1">Pending</ZPBadge>
                                            </div>
                                            <p className="text-sm text-gray-500 mb-4">Installed 2kW solar panels at home</p>
                                            <div className="flex gap-3">
                                                <ZPButton variant="outline" size="sm" className="bg-green-50 hover:bg-green-100 border-green-200 text-green-700">
                                                    Approve
                                                </ZPButton>
                                                <ZPButton variant="outline" size="sm" className="bg-red-50 hover:bg-red-100 border-red-200 text-red-700">
                                                    Reject
                                                </ZPButton>
                                            </div>
                                        </div>

                                        <div className="p-5 border border-gray-200 rounded-xl bg-gradient-to-br from-white to-gray-50">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h4 className="font-medium text-gray-900">Bicycle Commute</h4>
                                                    <p className="text-sm text-gray-600">Submitted by Sarah Johnson</p>
                                                </div>
                                                <ZPBadge variant="warning" className="px-2 py-1">Pending</ZPBadge>
                                            </div>
                                            <p className="text-sm text-gray-500 mb-4">Cycled to work for 20 days this month</p>
                                            <div className="flex gap-3">
                                                <ZPButton variant="outline" size="sm" className="bg-green-50 hover:bg-green-100 border-green-200 text-green-700">
                                                    Approve
                                                </ZPButton>
                                                <ZPButton variant="outline" size="sm" className="bg-red-50 hover:bg-red-100 border-red-200 text-red-700">
                                                    Reject
                                                </ZPButton>
                                            </div>
                                        </div>
                                    </div>
                                </ZPCard>
                            </div>

                            {/* Challenge Configuration */}
                            <ZPCard title="Internal Challenges" description="Create and manage eco-challenges for your team" className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                                <div className="space-y-6">
                                    <ZPButton variant="outline" className="bg-emerald-50 hover:bg-emerald-100 border-emerald-200">
                                        <Plus className="h-5 w-5 mr-2" />
                                        Create New Challenge
                                    </ZPButton>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="p-5 border border-gray-200 rounded-xl bg-gradient-to-br from-white to-gray-50 hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start mb-3">
                                                <h4 className="font-medium text-gray-900">Save 5000 Liters Water</h4>
                                                <ZPBadge variant="success" className="px-2 py-1">Active</ZPBadge>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-4">This month's water conservation challenge</p>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span>Progress</span>
                                                <span>65%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-3">
                                                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full" style={{ width: '65%' }}></div>
                                            </div>
                                            <div className="flex justify-between text-xs text-gray-500 mt-2">
                                                <span>3,250 L saved</span>
                                                <span>5,000 L goal</span>
                                            </div>
                                        </div>

                                        <div className="p-5 border border-gray-200 rounded-xl bg-gradient-to-br from-white to-gray-50 hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start mb-3">
                                                <h4 className="font-medium text-gray-900">Plastic-Free Week</h4>
                                                <ZPBadge variant="warning" className="px-2 py-1">Upcoming</ZPBadge>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-4">Eliminate single-use plastics for one week</p>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span>Starts in</span>
                                                <span>3 days</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-3">
                                                <div className="bg-gradient-to-r from-amber-500 to-yellow-500 h-3 rounded-full" style={{ width: '0%' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </ZPCard>
                        </div>
                    )}
                </div>
            </div>

            {/* Last Updated Footer */}
            <div className="bg-white/80 backdrop-blur-lg border-t border-emerald-200/50 px-6 py-4">
                <div className="container mx-auto flex justify-between items-center text-sm text-gray-600">
                    <span>
                        Last updated: {lastUpdated.toLocaleString()}
                    </span>
                    <span>
                        🏭 MSME Dashboard v2.0
                    </span>
                </div>
            </div>
        </div>
    );
}