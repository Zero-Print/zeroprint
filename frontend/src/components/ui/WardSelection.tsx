'use client';

import React, { useState, useEffect } from 'react';
import { ZPCard } from '@/components/ui/ZPCard';
import { ZPButton } from '@/components/ZPButton';
import { ZPBadge } from '@/components/ZPBadge';
import { 
  MapPin, 
  Users, 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  PieChart,
  Activity,
  MessageSquare,
  Calendar,
  Award,
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  Search,
  Download,
  RefreshCw,
  Eye,
  ChevronRight,
  Building,
  Leaf,
  Zap,
  Car
} from 'lucide-react';

interface Ward {
  id: string;
  name: string;
  code: string;
  population: number;
  area: number; // in sq km
  coordinates: {
    lat: number;
    lng: number;
  };
  demographics: {
    households: number;
    averageIncome: number;
    educationLevel: 'low' | 'medium' | 'high';
    ageDistribution: {
      children: number;
      adults: number;
      seniors: number;
    };
  };
  environmental: {
    carbonFootprint: number;
    airQualityIndex: number;
    greenCoverage: number;
    wasteGeneration: number;
    energyConsumption: number;
  };
  engagement: {
    activeUsers: number;
    participationRate: number;
    feedbackScore: number;
    recentActivities: number;
    completedChallenges: number;
  };
  performance: {
    ecoScore: number;
    rank: number;
    trend: 'up' | 'down' | 'stable';
    monthlyChange: number;
  };
  issues: Array<{
    id: string;
    type: 'environmental' | 'infrastructure' | 'social';
    severity: 'low' | 'medium' | 'high';
    title: string;
    reportedDate: string;
    status: 'open' | 'in-progress' | 'resolved';
  }>;
}

interface WardSelectionProps {
  wards: Ward[];
  selectedWardId?: string;
  onWardSelect: (wardId: string) => void;
  onWardAnalyze: (wardId: string) => void;
  className?: string;
}

export function WardSelection({ 
  wards, 
  selectedWardId, 
  onWardSelect, 
  onWardAnalyze,
  className = '' 
}: WardSelectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'performance' | 'engagement' | 'issues'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'population' | 'ecoScore' | 'engagement'>('ecoScore');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedWard, setSelectedWard] = useState<Ward | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const filteredAndSortedWards = wards
    .filter(ward => {
      const matchesSearch = ward.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          ward.code.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchesSearch) return false;

      switch (filterBy) {
        case 'performance':
          return ward.performance.ecoScore >= 80;
        case 'engagement':
          return ward.engagement.participationRate >= 70;
        case 'issues':
          return ward.issues.some(issue => issue.status !== 'resolved');
        default:
          return true;
      }
    })
    .sort((a, b) => {
      let aValue: string | number, bValue: string | number;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'population':
          aValue = a.population;
          bValue = b.population;
          break;
        case 'ecoScore':
          aValue = a.performance.ecoScore;
          bValue = b.performance.ecoScore;
          break;
        case 'engagement':
          aValue = a.engagement.participationRate;
          bValue = b.engagement.participationRate;
          break;
        default:
          return 0;
      }

      if (typeof aValue === 'string') {
        return sortOrder === 'asc' 
          ? (aValue as string).localeCompare(bValue as string)
          : (bValue as string).localeCompare(aValue as string);
      } else {
        return sortOrder === 'asc' 
          ? (aValue as number) - (bValue as number)
          : (bValue as number) - (aValue as number);
      }
    });

  const handleWardClick = (ward: Ward) => {
    setSelectedWard(ward);
    setShowDetails(true);
    onWardSelect(ward.id);
  };

  const getPerformanceBadge = (score: number) => {
    if (score >= 85) return <ZPBadge className="bg-green-100 text-green-800">Excellent</ZPBadge>;
    if (score >= 70) return <ZPBadge className="bg-blue-100 text-blue-800">Good</ZPBadge>;
    if (score >= 55) return <ZPBadge className="bg-yellow-100 text-yellow-800">Average</ZPBadge>;
    return <ZPBadge className="bg-red-100 text-red-800">Needs Improvement</ZPBadge>;
  };

  const getTrendIcon = (trend: string, change: number) => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Activity className="h-4 w-4 text-gray-500" />;
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'environmental': return <Leaf className="h-4 w-4" />;
      case 'infrastructure': return <Building className="h-4 w-4" />;
      case 'social': return <Users className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getIssueColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const exportWardData = () => {
    const data = {
      wards: filteredAndSortedWards,
      filters: { searchTerm, filterBy, sortBy, sortOrder },
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ward-analytics-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Controls */}
      <ZPCard>
        <ZPCard.Header>
          <ZPCard.Title className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Ward Analytics & Selection
          </ZPCard.Title>
          <div className="flex items-center gap-2">
            <ZPButton
              variant="outline"
              size="sm"
              onClick={() => {
                const data = {
                  wards: filteredAndSortedWards,
                  filters: { searchTerm, filterBy, sortBy, sortOrder },
                  exportDate: new Date().toISOString()
                };
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `ward-analytics-${new Date().toISOString().split('T')[0]}.json`;
                link.click();
                URL.revokeObjectURL(url);
              }}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </ZPButton>
            <ZPButton
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </ZPButton>
          </div>
        </ZPCard.Header>

        <ZPCard.Body>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search wards by name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Wards</option>
                <option value="performance">High Performance</option>
                <option value="engagement">High Engagement</option>
                <option value="issues">With Issues</option>
              </select>

              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [sort, order] = e.target.value.split('-');
                  setSortBy(sort as any);
                  setSortOrder(order as any);
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="ecoScore-desc">Eco Score (High to Low)</option>
                <option value="ecoScore-asc">Eco Score (Low to High)</option>
                <option value="population-desc">Population (High to Low)</option>
                <option value="population-asc">Population (Low to High)</option>
                <option value="engagement-desc">Engagement (High to Low)</option>
                <option value="name-asc">Name (A to Z)</option>
              </select>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{filteredAndSortedWards.length}</div>
              <div className="text-sm text-gray-600">Total Wards</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {filteredAndSortedWards.reduce((sum, ward) => sum + ward.population, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Population</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {filteredAndSortedWards.length > 0
                  ? (filteredAndSortedWards.reduce((sum, ward) => sum + ward.performance.ecoScore, 0) / filteredAndSortedWards.length).toFixed(1)
                  : '0.0'}
              </div>
              <div className="text-sm text-gray-600">Avg Eco Score</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {filteredAndSortedWards.length > 0
                  ? (filteredAndSortedWards.reduce((sum, ward) => sum + ward.engagement.participationRate, 0) / filteredAndSortedWards.length).toFixed(1) + '%'
                  : '0.0%'}
              </div>
              <div className="text-sm text-gray-600">Avg Engagement</div>
            </div>
          </div>
        </ZPCard.Body>
      </ZPCard>

      {/* Ward List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ZPCard>
          <ZPCard.Header>
            <ZPCard.Title>Ward Directory</ZPCard.Title>
            <ZPCard.Description>
              {filteredAndSortedWards.length} wards found
            </ZPCard.Description>
          </ZPCard.Header>

          <ZPCard.Body>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredAndSortedWards.map(ward => (
                <div
                  key={ward.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedWardId === ward.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleWardClick(ward)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900">{ward.name}</h4>
                      <p className="text-sm text-gray-600">{ward.code}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getPerformanceBadge(ward.performance.ecoScore)}
                      {getTrendIcon(ward.performance.trend, ward.performance.monthlyChange)}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                    <div>
                      <span className="text-gray-500">Population:</span>
                      <span className="ml-1 font-medium">{ward.population.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Eco Score:</span>
                      <span className="ml-1 font-medium">{ward.performance.ecoScore}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Engagement:</span>
                      <span className="ml-1 font-medium">{ward.engagement.participationRate}%</span>
                    </div>
                  </div>

                  {ward.issues.filter(issue => issue.status !== 'resolved').length > 0 && (
                    <div className="flex items-center gap-1 text-xs text-orange-600">
                      <AlertTriangle className="h-3 w-3" />
                      <span>{ward.issues.filter(issue => issue.status !== 'resolved').length} active issues</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-gray-500">
                      Rank #{ward.performance.rank}
                    </span>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </ZPCard.Body>
        </ZPCard>

        {/* Ward Details */}
        {selectedWard && (
          <ZPCard>
            <ZPCard.Header>
              <ZPCard.Title className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                {selectedWard.name} Details
              </ZPCard.Title>
              <ZPButton
                onClick={() => onWardAnalyze(selectedWard.id)}
                className="flex items-center gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Analyze
              </ZPButton>
            </ZPCard.Header>

            <ZPCard.Body>
              <div className="space-y-6">
                {/* Basic Info */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Basic Information</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">Code:</span>
                      <span className="ml-2 font-medium">{selectedWard.code}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Area:</span>
                      <span className="ml-2 font-medium">{selectedWard.area} km²</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Population:</span>
                      <span className="ml-2 font-medium">{selectedWard.population.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Households:</span>
                      <span className="ml-2 font-medium">{selectedWard.demographics.households.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Environmental Metrics */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Environmental Metrics</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Air Quality Index</span>
                      <span className="font-medium">{selectedWard.environmental.airQualityIndex}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Green Coverage</span>
                      <span className="font-medium">{selectedWard.environmental.greenCoverage}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Carbon Footprint</span>
                      <span className="font-medium">{selectedWard.environmental.carbonFootprint} tons/capita</span>
                    </div>
                  </div>
                </div>

                {/* Engagement Stats */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Citizen Engagement</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Active Users</span>
                      <span className="font-medium">{selectedWard.engagement.activeUsers.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Participation Rate</span>
                      <span className="font-medium">{selectedWard.engagement.participationRate}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Feedback Score</span>
                      <span className="font-medium">{selectedWard.engagement.feedbackScore}/5</span>
                    </div>
                  </div>
                </div>

                {/* Active Issues */}
                {selectedWard.issues.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Active Issues</h4>
                    <div className="space-y-2">
                      {selectedWard.issues.map(issue => (
                        <div key={issue.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center gap-2">
                            {getIssueIcon(issue.type)}
                            <span className="text-sm">{issue.title}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ZPBadge className={getIssueColor(issue.severity)}>
                              {issue.severity}
                            </ZPBadge>
                            <ZPBadge className={
                              issue.status === 'resolved' ? 'bg-green-100 text-green-800' :
                              issue.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }>
                              {issue.status}
                            </ZPBadge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ZPCard.Body>
          </ZPCard>
        )}
      </div>
    </div>
  );
}

export default WardSelection;