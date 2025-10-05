'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ZPCard } from '@/components/ui/ZPCard';
import { ZPButton } from '@/components/ZPButton';
import { ZPBadge } from '@/components/ZPBadge';
import { CO2ProjectionChart, CO2ProjectionData } from '@/components/ui/CO2ProjectionChart';
import { 
  Cpu, 
  TrendingUp, 
  TrendingDown, 
  Leaf, 
  Zap, 
  Droplets, 
  Car, 
  Home, 
  Play, 
  Settings, 
  BarChart3,
  Clock,
  Target,
  Award,
  ChevronRight
} from 'lucide-react';

interface SimulationResult {
  id: string;
  name: string;
  type: 'carbon' | 'energy' | 'water' | 'transport' | 'lifestyle';
  status: 'completed' | 'running' | 'pending';
  progress: number;
  results?: {
    co2Saved: number;
    costSaved: number;
    efficiency: number;
    impact: 'high' | 'medium' | 'low';
  };
  createdAt: Date;
  estimatedCompletion?: Date;
}

interface DigitalTwinData {
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
  co2Projection: CO2ProjectionData;
  recentSimulations: SimulationResult[];
  recommendations: string[];
}

interface DigitalTwinPreviewProps {
  userId?: string;
  showRecommendations?: boolean;
  showSimulations?: boolean;
  className?: string;
}

export function DigitalTwinPreview({ 
  userId, 
  showRecommendations = true,
  showSimulations = true,
  className 
}: DigitalTwinPreviewProps) {
  const [twinData, setTwinData] = useState<DigitalTwinData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'simulations' | 'recommendations'>('overview');
  const router = useRouter();

  // Mock data
  const mockTwinData: DigitalTwinData = {
    id: 'twin-001',
    name: 'My Digital Twin',
    lastUpdated: new Date(),
    overallScore: 78,
    metrics: {
      carbonFootprint: { current: 2.3, target: 2.0, trend: 'down' },
      energyEfficiency: { current: 85, target: 90, trend: 'up' },
      waterUsage: { current: 150, target: 120, trend: 'down' },
      sustainabilityIndex: { current: 78, target: 85, trend: 'up' }
    },
    co2Projection: {
      current: 2.3,
      target: 2.0,
      projectedReduction: 0.4,
      monthlyData: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        actual: [2.8, 2.6, 2.5, 2.4, 2.3, 2.3],
        projected: [2.3, 2.25, 2.2, 2.1, 2.0, 1.9]
      }
    },
    recentSimulations: [
      {
        id: 'sim-1',
        name: 'Solar Panel Installation',
        type: 'energy',
        status: 'completed',
        progress: 100,
        results: { co2Saved: 1200, costSaved: 15000, efficiency: 92, impact: 'high' },
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2)
      },
      {
        id: 'sim-2',
        name: 'Electric Vehicle Adoption',
        type: 'transport',
        status: 'running',
        progress: 65,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
        estimatedCompletion: new Date(Date.now() + 1000 * 60 * 60 * 2)
      },
      {
        id: 'sim-3',
        name: 'Water Conservation System',
        type: 'water',
        status: 'pending',
        progress: 0,
        createdAt: new Date(Date.now() - 1000 * 60 * 30)
      }
    ],
    recommendations: [
      'Install smart thermostats to reduce energy consumption by 15%',
      'Switch to LED lighting for 30% energy savings',
      'Consider rainwater harvesting to reduce water usage',
      'Optimize transportation routes to reduce carbon emissions'
    ]
  };

  useEffect(() => {
    loadTwinData();
  }, [userId]);

  const loadTwinData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTwinData(mockTwinData);
    } catch (error) {
      console.error('Failed to load digital twin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSimulation = () => {
    router.push('/trackers/digital-twin?action=create');
  };

  const handleViewFullTwin = () => {
    router.push('/trackers/digital-twin');
  };

  const handleViewSimulation = (simulationId: string) => {
    router.push(`/trackers/digital-twin/simulation/${simulationId}`);
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
      case 'down': return <TrendingDown className="w-3 h-3 text-red-500" />;
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
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Cpu className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{twinData.name}</h3>
            <p className="text-sm text-gray-500">Updated {formatTimeAgo(twinData.lastUpdated)}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{twinData.overallScore}</div>
            <div className="text-xs text-gray-500">Overall Score</div>
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
          { id: 'recommendations', label: 'Tips', icon: Award }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
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
        <div className="space-y-4">
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-4">
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
          <div className="mt-6">
            <CO2ProjectionChart 
              data={twinData.co2Projection} 
              title="CO₂ Emission Projection"
            />
          </div>
        </div>
      )}

      {activeTab === 'simulations' && showSimulations && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">Recent Simulations</h4>
            <ZPButton variant="primary" size="sm" onClick={handleCreateSimulation}>
              <Play className="w-4 h-4 mr-1" />
              New Simulation
            </ZPButton>
          </div>
          
          <div className="space-y-3">
            {twinData.recentSimulations.slice(0, 3).map((simulation) => (
              <div 
                key={simulation.id} 
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                onClick={() => handleViewSimulation(simulation.id)}
              >
                <div className="flex items-center space-x-3">
                  {getSimulationIcon(simulation.type)}
                  <div>
                    <h5 className="font-medium text-gray-900 text-sm">{simulation.name}</h5>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <ZPBadge variant="secondary" className={getStatusColor(simulation.status)}>
                        {simulation.status}
                      </ZPBadge>
                      <span>{formatTimeAgo(simulation.createdAt)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
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
                      <div className="text-green-600 font-medium">
                        {simulation.results.co2Saved}kg CO₂
                      </div>
                      <div className="text-gray-500">
                        ₹{simulation.results.costSaved.toLocaleString()}
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

      {activeTab === 'recommendations' && showRecommendations && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">AI Recommendations</h4>
          
          <div className="space-y-3">
            {twinData.recommendations.slice(0, 3).map((recommendation, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-semibold">{index + 1}</span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{recommendation}</p>
              </div>
            ))}
          </div>
          
          <ZPButton variant="outline" onClick={handleViewFullTwin} className="w-full">
            View All Recommendations
          </ZPButton>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex space-x-2">
          <ZPButton 
            variant="primary" 
            size="sm" 
            onClick={handleCreateSimulation}
            className="flex-1"
          >
            <Play className="w-4 h-4 mr-1" />
            Run Simulation
          </ZPButton>
          
          <ZPButton 
            variant="outline" 
            size="sm" 
            onClick={handleViewFullTwin}
            className="flex-1"
          >
            <BarChart3 className="w-4 h-4 mr-1" />
            View Details
          </ZPButton>
        </div>
      </div>
    </ZPCard>
  );
}