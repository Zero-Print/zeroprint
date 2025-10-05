'use client';

import React, { useState } from 'react';
import { ZPCard } from '@/components/ZPCard';
import { ZPButton } from '@/components/ZPButton';
import { ZPBadge } from '@/components/ZPBadge';
import {
    Cpu,
    TrendingUp,
    Leaf,
    Zap,
    Droplets,
    Car,
    Home,
    Play,
    Settings,
    BarChart3,
    Target,
    Award,
    ChevronRight,
    MapPin,
    Building,
    Users
} from 'lucide-react';
import { CO2ProjectionChart } from '@/components/ui/CO2ProjectionChart';

interface SimulationResult {
    id: string;
    name: string;
    type: 'carbon' | 'energy' | 'water' | 'transport' | 'lifestyle' | 'ward' | 'city';
    status: 'completed' | 'running' | 'pending';
    progress: number;
    wardId?: string;
    wardName?: string;
    results?: {
        co2Saved: number;
        costSaved: number;
        efficiency: number;
        impact: 'high' | 'medium' | 'low';
        healCoinsEarned: number;
    };
    createdAt: Date;
    estimatedCompletion?: Date;
}

interface GovernmentDigitalTwinData {
    id: string;
    name: string;
    lastUpdated: Date;
    overallScore: number;
    metrics: {
        carbonFootprint: { current: number; target: number; trend: 'up' | 'down' | 'stable' };
        energyEfficiency: { current: number; target: number; trend: 'up' | 'down' | 'stable' };
        waterUsage: { current: number; target: number; trend: 'up' | 'down' | 'stable' };
        sustainabilityIndex: { current: number; target: number; trend: 'up' | 'down' | 'stable' };
    };
    co2Projection: any;
    recentSimulations: SimulationResult[];
    recommendations: string[];
    wards: Array<{
        id: string;
        name: string;
        ecoScore: number;
        carbonReduction: number;
        population: number;
    }>;
}

interface GovernmentDigitalTwinProps {
    userId?: string;
    className?: string;
    onRunSimulation?: (simulationType: string) => void;
    onViewSimulation?: (simulationId: string) => void;
    onViewWardSimulation?: (wardId: string) => void;
}

export function GovernmentDigitalTwin({
    userId,
    className,
    onRunSimulation,
    onViewSimulation,
    onViewWardSimulation
}: GovernmentDigitalTwinProps) {
    const [twinData, setTwinData] = useState<GovernmentDigitalTwinData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'simulations' | 'recommendations' | 'wards'>('overview');

    // Mock data for government digital twin
    const mockTwinData: GovernmentDigitalTwinData = {
        id: 'gov-twin-001',
        name: 'City Digital Twin',
        lastUpdated: new Date(),
        overallScore: 82,
        metrics: {
            carbonFootprint: { current: 1.8, target: 1.5, trend: 'down' },
            energyEfficiency: { current: 88, target: 92, trend: 'up' },
            waterUsage: { current: 140, target: 110, trend: 'down' },
            sustainabilityIndex: { current: 82, target: 88, trend: 'up' }
        },
        co2Projection: {
            current: 1.8,
            target: 1.5,
            projectedReduction: 0.5,
            monthlyData: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                actual: [2.3, 2.1, 2.0, 1.9, 1.8, 1.8],
                projected: [1.8, 1.75, 1.7, 1.65, 1.6, 1.5]
            }
        },
        recentSimulations: [
            {
                id: 'sim-1',
                name: 'City-wide Solar Installation',
                type: 'energy',
                status: 'completed',
                progress: 100,
                results: { co2Saved: 15000, costSaved: 200000, efficiency: 95, impact: 'high', healCoinsEarned: 500 },
                createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3)
            },
            {
                id: 'sim-2',
                name: 'EV Adoption in Ward 5',
                type: 'ward',
                wardId: 'ward-5',
                wardName: 'Ward 5',
                status: 'running',
                progress: 75,
                createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
                estimatedCompletion: new Date(Date.now() + 1000 * 60 * 60 * 4)
            },
            {
                id: 'sim-3',
                name: 'Public Transport Expansion',
                type: 'transport',
                status: 'pending',
                progress: 0,
                createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24)
            }
        ],
        recommendations: [
            'Implement city-wide smart grid to reduce energy consumption by 20%',
            'Expand public transportation network to reduce private vehicle usage',
            'Introduce green building standards for new constructions',
            'Develop urban forestry program to increase green spaces by 15%'
        ],
        wards: [
            { id: 'ward-1', name: 'Ward 1', ecoScore: 85, carbonReduction: 1200, population: 15000 },
            { id: 'ward-2', name: 'Ward 2', ecoScore: 78, carbonReduction: 950, population: 12500 },
            { id: 'ward-3', name: 'Ward 3', ecoScore: 92, carbonReduction: 1500, population: 18000 },
            { id: 'ward-4', name: 'Ward 4', ecoScore: 71, carbonReduction: 800, population: 11000 },
            { id: 'ward-5', name: 'Ward 5', ecoScore: 88, carbonReduction: 1350, population: 16500 }
        ]
    };

    // Initialize with mock data
    React.useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 800));
            setTwinData(mockTwinData);
            setLoading(false);
        };

        loadData();
    }, [userId]);

    const handleCreateSimulation = () => {
        if (onRunSimulation) {
            onRunSimulation('new');
        }
    };

    const handleViewFullTwin = () => {
        // Navigate to full digital twin page
        console.log('View full digital twin');
    };

    const handleViewSimulation = (simulationId: string) => {
        if (onViewSimulation) {
            onViewSimulation(simulationId);
        }
    };

    const handleViewWardSimulation = (wardId: string) => {
        if (onViewWardSimulation) {
            onViewWardSimulation(wardId);
        }
    };

    const getMetricIcon = (type: string) => {
        switch (type) {
            case 'carbonFootprint': return <Leaf className="w-4 h-4" />;
            case 'energyEfficiency': return <Zap className="w-4 h-4" />;
            case 'waterUsage': return <Droplets className="w-4 h-4" />;
            case 'sustainabilityIndex': return <Target className="w-4 h-4" />;
            default: return <BarChart3 className="w-4 h-4" />;
        }
    };

    const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
        switch (trend) {
            case 'up': return <TrendingUp className="w-3 h-3 text-green-500" />;
            case 'down': return <TrendingUp className="w-3 h-3 text-red-500 rotate-180" />;
            case 'stable': return <div className="w-3 h-0.5 bg-gray-400" />;
        }
    };

    const getSimulationIcon = (type: SimulationResult['type']) => {
        switch (type) {
            case 'carbon': return <Leaf className="w-4 h-4 text-green-500" />;
            case 'energy': return <Zap className="w-4 h-4 text-yellow-500" />;
            case 'water': return <Droplets className="w-4 h-4 text-blue-500" />;
            case 'transport': return <Car className="w-4 h-4 text-purple-500" />;
            case 'lifestyle': return <Home className="w-4 h-4 text-orange-500" />;
            case 'ward': return <MapPin className="w-4 h-4 text-indigo-500" />;
            case 'city': return <Building className="w-4 h-4 text-cyan-500" />;
            default: return <Cpu className="w-4 h-4 text-gray-500" />;
        }
    };

    const getStatusColor = (status: SimulationResult['status']) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800';
            case 'running': return 'bg-blue-100 text-blue-800';
            case 'pending': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatTimeAgo = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };

    if (loading) {
        return (
            <ZPCard className={`p-6 ${className}`}>
                <div className="animate-pulse space-y-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                        <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-6 bg-gray-200 rounded"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </ZPCard>
        );
    }

    if (!twinData) {
        return (
            <ZPCard className={`p-6 text-center ${className}`}>
                <Cpu className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Digital Twin Found</h3>
                <p className="text-gray-600 mb-4">Create your digital twin to start simulating sustainable scenarios</p>
                <ZPButton variant="primary" onClick={handleCreateSimulation}>
                    Create Digital Twin
                </ZPButton>
            </ZPCard>
        );
    }

    return (
        <ZPCard className={`p-6 ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <Cpu className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">{twinData.name}</h3>
                        <p className="text-sm text-gray-500">Updated {formatTimeAgo(twinData.lastUpdated)}</p>
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">{twinData.overallScore}</div>
                        <div className="text-xs text-gray-500">Sustainability Score</div>
                    </div>
                    <ZPButton variant="outline" size="sm" onClick={handleViewFullTwin}>
                        <Settings className="w-4 h-4" />
                    </ZPButton>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
                {[
                    { id: 'overview', label: 'Overview', icon: BarChart3 },
                    { id: 'simulations', label: 'Simulations', icon: Play },
                    { id: 'recommendations', label: 'Policy Tips', icon: Award },
                    { id: 'wards', label: 'Ward Analytics', icon: MapPin }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${activeTab === tab.id
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Content */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    {/* Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(twinData.metrics).map(([key, metric]) => (
                            <div key={key} className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                        {getMetricIcon(key)}
                                        <span className="text-sm font-medium text-gray-700 capitalize">
                                            {key.replace(/([A-Z])/g, ' $1').trim()}
                                        </span>
                                    </div>
                                    {getTrendIcon(metric.trend)}
                                </div>

                                <div className="flex items-baseline space-x-2">
                                    <span className="text-lg font-semibold text-gray-900">{metric.current}</span>
                                    <span className="text-sm text-gray-500">/ {metric.target}</span>
                                </div>

                                <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                                    <div
                                        className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                                        style={{ width: `${Math.min((metric.current / metric.target) * 100, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* CO₂ Projection Chart */}
                    <div className="mt-2">
                        <CO2ProjectionChart
                            data={twinData.co2Projection}
                            title="City CO₂ Emission Projection"
                        />
                    </div>
                </div>
            )}

            {activeTab === 'simulations' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">Recent Simulations</h4>
                        <ZPButton variant="primary" size="sm" onClick={handleCreateSimulation}>
                            <Play className="w-4 h-4 mr-1" />
                            New Simulation
                        </ZPButton>
                    </div>

                    <div className="space-y-3">
                        {twinData.recentSimulations.map((simulation) => (
                            <div
                                key={simulation.id}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                                onClick={() => handleViewSimulation(simulation.id)}
                            >
                                <div className="flex items-center space-x-3">
                                    {getSimulationIcon(simulation.type)}
                                    <div>
                                        <h5 className="font-medium text-gray-900 text-sm">{simulation.name}</h5>
                                        <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                                            <ZPBadge variant="secondary" className={getStatusColor(simulation.status)}>
                                                {simulation.status}
                                            </ZPBadge>
                                            {simulation.wardName && (
                                                <span className="flex items-center">
                                                    <MapPin className="w-3 h-3 mr-1" />
                                                    {simulation.wardName}
                                                </span>
                                            )}
                                            <span>{formatTimeAgo(simulation.createdAt)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3">
                                    {simulation.status === 'running' && (
                                        <div className="text-right text-xs">
                                            <div className="text-gray-900 font-medium">{simulation.progress}%</div>
                                            <div className="w-16 bg-gray-200 rounded-full h-1">
                                                <div
                                                    className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                                                    style={{ width: `${simulation.progress}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    )}

                                    {simulation.results && (
                                        <div className="text-right text-xs">
                                            <div className="text-green-600 font-medium flex items-center">
                                                <Leaf className="w-3 h-3 mr-1" />
                                                {simulation.results.co2Saved.toLocaleString()}kg
                                            </div>
                                            <div className="text-gray-500 flex items-center">
                                                <Zap className="w-3 h-3 mr-1" />
                                                {simulation.results.healCoinsEarned} HC
                                            </div>
                                        </div>
                                    )}

                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'recommendations' && (
                <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Policy Recommendations</h4>

                    <div className="space-y-3">
                        {twinData.recommendations.map((recommendation, index) => (
                            <div key={index} className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
                                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-white text-xs font-semibold">{index + 1}</span>
                                </div>
                                <p className="text-sm text-gray-700 leading-relaxed">{recommendation}</p>
                            </div>
                        ))}
                    </div>

                    <ZPButton variant="outline" onClick={handleViewFullTwin} className="w-full">
                        View Detailed Policy Analysis
                    </ZPButton>
                </div>
            )}

            {activeTab === 'wards' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">Ward Performance</h4>
                        <ZPButton variant="primary" size="sm" onClick={() => console.log('Compare wards')}>
                            <BarChart3 className="w-4 h-4 mr-1" />
                            Compare Wards
                        </ZPButton>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {twinData.wards.map((ward) => (
                            <div
                                key={ward.id}
                                className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                                onClick={() => handleViewWardSimulation(ward.id)}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <h5 className="font-medium text-gray-900 flex items-center">
                                        <MapPin className="w-4 h-4 mr-2 text-indigo-500" />
                                        {ward.name}
                                    </h5>
                                    <ZPBadge variant="secondary" className="bg-indigo-100 text-indigo-800">
                                        {ward.population.toLocaleString()} residents
                                    </ZPBadge>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Eco Score</span>
                                        <span className="font-medium text-gray-900">{ward.ecoScore}/100</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Carbon Reduction</span>
                                        <span className="font-medium text-green-600">{ward.carbonReduction.toLocaleString()} kg</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                                        <div
                                            className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                                            style={{ width: `${ward.ecoScore}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-3">
                    <ZPButton
                        variant="primary"
                        size="sm"
                        onClick={handleCreateSimulation}
                        className="flex items-center justify-center"
                    >
                        <Play className="w-4 h-4 mr-1" />
                        Run Simulation
                    </ZPButton>

                    <ZPButton
                        variant="outline"
                        size="sm"
                        onClick={handleViewFullTwin}
                        className="flex items-center justify-center"
                    >
                        <BarChart3 className="w-4 h-4 mr-1" />
                        Full Analysis
                    </ZPButton>
                </div>
            </div>
        </ZPCard>
    );
}