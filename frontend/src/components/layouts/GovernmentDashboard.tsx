'use client';

import React, { useState, useEffect } from 'react';
import { ZPCard } from '@/components/ZPCard';
import { ZPButton } from '@/components/ZPButton';
import { ZPBadge } from '@/components/ZPBadge';
import { LeaderboardList } from '@/components/ui/LeaderboardList';
import { TrackerCard } from '@/components/ui/TrackerCard';
import { InteractiveMap } from '@/components/ui/InteractiveMap';
import { ScenarioSimulation } from '@/components/ui/ScenarioSimulation';
import { WardSelection } from '@/components/ui/WardSelection';
import { ExportButton } from '@/components/ui/ExportButton';
import { AccessibilityChecker } from '@/components/ui/AccessibilityChecker';
import { GovernmentDigitalTwin } from '@/components/ui/GovernmentDigitalTwin';
import { Users, TrendingUp, Leaf, Building, Map, Microscope, Home, BarChart3, Plus, Eye, Download } from 'lucide-react';
import { useOptimisticUpdate } from '@/hooks/useOptimisticUpdate';

interface GovernmentDashboardProps {
  user: {
    id: string;
    displayName?: string;
    email?: string;
    role: string;
    department?: string;
    level?: 'municipal' | 'state' | 'federal';
    healCoins?: number;
  };
  data: {
    cityMetrics: {
      totalCarbonReduction: number;
      airQualityIndex: number;
      greenSpacePercentage: number;
      renewableEnergyPercentage: number;
      wasteRecyclingRate: number;
      publicTransportUsage: number;
    };
    districts: Array<{
      id: string;
      name: string;
      population: number;
      ecoScore: number;
      carbonReduction: number;
      participationRate: number;
    }>;
    policies: Array<{
      id: string;
      title: string;
      description: string;
      status: 'draft' | 'active' | 'completed' | 'suspended';
      impact: number;
      citizenSupport: number;
      implementationDate: Date;
    }>;
    topDistricts: Array<{
      id: string;
      name: string;
      score: number;
      rank: number;
      category: 'carbon' | 'mental' | 'animal' | 'overall';
      change: number;
    }>;
    recentActivities: Array<{
      action: string;
      user: string;
      impact: string;
      timestamp: Date;
      userType: 'government';
    }>;
  };
}

export function GovernmentDashboard({ user, data }: GovernmentDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'map' | 'scenarios' | 'wards'>('overview');
  const [selectedWardId, setSelectedWardId] = useState<string>('');
  
  // Use the optimistic update hook
  const updateDataFn = async (newData: GovernmentDashboardProps['data']) => {
    // Simulate API call to update data
    const api = {
      update: async (data: GovernmentDashboardProps['data']) => {
        // In a real implementation, this would be an actual API call
        return new Promise(resolve => setTimeout(() => resolve(data), 1000));
      }
    };
    await api.update(newData);
  };
  
  const {
    data: realtimeData,
    optimisticData,
    update: updateData,
    isUpdating,
    hasOptimisticChanges
  } = useOptimisticUpdate(data, updateDataFn);
  
  // Use data from props or optimistic data if available
  const displayData = hasOptimisticChanges ? optimisticData : data;

  const handleWardSelect = (wardId: string) => {
    setSelectedWardId(wardId);
  };

  const handleWardAnalyze = (wardId: string) => {
    console.log('Analyzing ward:', wardId);
    // Add analytics logic here
  };

  const handleScenarioRun = (scenarioId: string) => {
    console.log('Running scenario:', scenarioId);
    // Add scenario execution logic here
  };

  const handleScenarioSave = (scenario: any) => {
    console.log('Saving scenario:', scenario);
    // Add scenario saving logic here
  };

  if (activeTab !== 'overview') {
    return (
      <div className='min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          {/* Navigation Tabs */}
          <div className='mb-8'>
            <div className='border-b border-gray-200'>
              <nav className='-mb-px flex space-x-8'>
                {[
                  { id: 'overview', label: 'Overview', icon: BarChart3 },
                  { id: 'map', label: 'Interactive Map', icon: Map },
                  { id: 'scenarios', label: 'Scenario Simulation', icon: Microscope },
                  { id: 'wards', label: 'Ward Analytics', icon: Home }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-blue-700 hover:border-gray-300'
                    }`}
                  >
                    {React.createElement(tab.icon, { className: "h-4 w-4" })}
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'map' && (
            <div className='bg-white rounded-xl shadow-lg p-6 border border-blue-100'>
              <div className='flex items-center justify-between mb-6'>
                <h2 className='text-2xl font-bold text-gray-900 flex items-center'>
                  <Map className='h-6 w-6 mr-2 text-blue-600' />
                  Interactive Map
                </h2>
                <ZPButton variant='outline' className='bg-blue-50 hover:bg-blue-100 border-blue-200'>
                  <Download className='h-4 w-4 mr-2' />
                  Export Map
                </ZPButton>
              </div>
              <InteractiveMap
                onWardSelect={handleWardSelect}
                selectedWardId={selectedWardId}
                className="mb-8 rounded-lg border border-gray-200" 
                wards={[]}            
              />
              <div className='mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200'>
                <h3 className='font-semibold text-gray-900 mb-2'>Map Legend</h3>
                <div className='flex flex-wrap gap-4'>
                  <div className='flex items-center'>
                    <div className='w-4 h-4 bg-green-500 rounded mr-2'></div>
                    <span className='text-sm text-gray-600'>High Eco Score</span>
                  </div>
                  <div className='flex items-center'>
                    <div className='w-4 h-4 bg-yellow-500 rounded mr-2'></div>
                    <span className='text-sm text-gray-600'>Medium Eco Score</span>
                  </div>
                  <div className='flex items-center'>
                    <div className='w-4 h-4 bg-red-500 rounded mr-2'></div>
                    <span className='text-sm text-gray-600'>Low Eco Score</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'scenarios' && (
            <div className='bg-white rounded-xl shadow-lg p-6 border border-blue-100'>
              <div className='flex items-center justify-between mb-6'>
                <h2 className='text-2xl font-bold text-gray-900 flex items-center'>
                  <Microscope className='h-6 w-6 mr-2 text-blue-600' />
                  Scenario Simulation
                </h2>
                <ZPButton variant='outline' className='bg-blue-50 hover:bg-blue-100 border-blue-200'>
                  <Plus className='h-4 w-4 mr-2' />
                  New Scenario
                </ZPButton>
              </div>
              <ScenarioSimulation
                scenarios={[]}
                onScenarioRun={handleScenarioRun}
                onScenarioSave={handleScenarioSave}
                className="mb-8"
              />
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mt-6'>
                <ZPCard className='border-blue-100'>
                  <h3 className='font-semibold text-gray-900 mb-2'>Simulation Tips</h3>
                  <ul className='text-sm text-gray-600 space-y-1'>
                    <li>• Adjust parameters to see impact</li>
                    <li>• Compare multiple scenarios</li>
                    <li>• Export results for reporting</li>
                  </ul>
                </ZPCard>
                <ZPCard className='border-blue-100'>
                  <h3 className='font-semibold text-gray-900 mb-2'>Common Scenarios</h3>
                  <ul className='text-sm text-gray-600 space-y-1'>
                    <li>• Carbon reduction targets</li>
                    <li>• Green space expansion</li>
                    <li>• Public transport improvements</li>
                  </ul>
                </ZPCard>
                <ZPCard className='border-blue-100'>
                  <h3 className='font-semibold text-gray-900 mb-2'>Results</h3>
                  <p className='text-sm text-gray-600'>Run a scenario to see projected outcomes</p>
                </ZPCard>
              </div>
            </div>
          )}

          {activeTab === 'wards' && (
            <div className='bg-white rounded-xl shadow-lg p-6 border border-blue-100'>
              <div className='flex items-center justify-between mb-6'>
                <h2 className='text-2xl font-bold text-gray-900 flex items-center'>
                  <Home className='h-6 w-6 mr-2 text-blue-600' />
                  Ward Analytics
                </h2>
                <ZPButton variant='outline' className='bg-blue-50 hover:bg-blue-100 border-blue-200'>
                  <Download className='h-4 w-4 mr-2' />
                  Export Data
                </ZPButton>
              </div>
              <WardSelection
                wards={[]}
                selectedWardId={selectedWardId}
                onWardSelect={handleWardSelect}
                onWardAnalyze={handleWardAnalyze}
                className="mb-8"
              />
              <div className='mt-6 grid grid-cols-1 md:grid-cols-2 gap-6'>
                <ZPCard className='border-blue-100'>
                  <h3 className='font-semibold text-gray-900 mb-4'>Ward Performance Metrics</h3>
                  <div className='space-y-4'>
                    <div className='flex justify-between items-center p-3 bg-blue-50 rounded-lg'>
                      <span className='text-gray-600'>Average Eco Score</span>
                      <span className='font-semibold text-blue-700'>78/100</span>
                    </div>
                    <div className='flex justify-between items-center p-3 bg-blue-50 rounded-lg'>
                      <span className='text-gray-600'>Carbon Reduction</span>
                      <span className='font-semibold text-green-600'>-12%</span>
                    </div>
                    <div className='flex justify-between items-center p-3 bg-blue-50 rounded-lg'>
                      <span className='text-gray-600'>Participation Rate</span>
                      <span className='font-semibold text-blue-700'>64%</span>
                    </div>
                  </div>
                </ZPCard>
                <ZPCard className='border-blue-100'>
                  <h3 className='font-semibold text-gray-900 mb-4'>Top Performing Wards</h3>
                  <div className='space-y-3'>
                    {['Ward 5', 'Ward 12', 'Ward 3'].map((ward, index) => (
                      <div key={index} className='flex items-center justify-between p-2 hover:bg-blue-50 rounded'>
                        <div className='flex items-center'>
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                            index === 0 ? 'bg-yellow-100 text-yellow-800' : 
                            index === 1 ? 'bg-gray-100 text-gray-800' : 'bg-orange-100 text-orange-800'
                          }`}>
                            {index + 1}
                          </div>
                          <span className='font-medium text-gray-900'>{ward}</span>
                        </div>
                        <ZPBadge variant={index === 0 ? 'warning' : index === 1 ? 'secondary' : 'default'}>
                          {95 - index * 5}/100
                        </ZPBadge>
                      </div>
                    ))}
                  </div>
                </ZPCard>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50">
      {/* Removed Navigation Header */}

      <div className='container mx-auto p-6 space-y-8'>
        {/* Header */}
        <div className='mb-8 text-center'>
          <h1 className='text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-4'>
            Welcome back, {user.displayName || 'Government Official'}! 🏛️
          </h1>
          <p className='text-gray-600 text-lg'>Leading sustainable policy and environmental governance</p>
          <div className='mt-6 flex flex-col items-center gap-4'>
            <div className='bg-white rounded-full px-6 py-2 shadow-sm border border-gray-200'>
              <span className='text-sm text-gray-600 font-medium'>
                {user.level === 'federal' ? 'Federal Administrator' : 
                (user.level === 'state' ? 'State Administrator' : 'Municipal Administrator')}
              </span>
            </div>
            <ExportButton 
              dashboardType="government"
              id={selectedWardId || 'all'}
              data={data}
              timeframe="monthly"
              variant="outline"
              size="sm"
            />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className='mb-8'>
          <div className='border-b border-gray-200'>
            <nav className='-mb-px flex space-x-8 justify-center'>
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'map', label: 'Interactive Map', icon: Map },
                { id: 'scenarios', label: 'Scenario Simulation', icon: Microscope },
                { id: 'wards', label: 'Ward Analytics', icon: Home }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-blue-700 hover:border-gray-300'
                  }`}
                >
                  {React.createElement(tab.icon, { className: "h-4 w-4" })}
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Top Row - Jurisdiction Overview */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          <div className='bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] transform'>
            <div className='flex items-center justify-between'>
              <div>
                <div className='text-3xl font-bold mb-1'>
                  {data.districts.length > 0 ? (
                    (data.districts.reduce((total, district) => total + district.population, 0) / 1000).toFixed(0)
                  ) : '0'}K
                </div>
                <div className='text-sm opacity-90'>Total Population</div>
              </div>
              <div className='p-3 bg-white bg-opacity-20 rounded-full'>
                <Users className='h-6 w-6' />
              </div>
            </div>
            <div className='mt-4 bg-white bg-opacity-20 rounded-full px-3 py-1 text-xs font-medium inline-flex items-center'>
              {data.districts.length} districts 🏘️
            </div>
          </div>

          <div className='bg-gradient-to-br from-cyan-500 to-cyan-700 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] transform'>
            <div className='flex items-center justify-between'>
              <div>
                <div className='text-3xl font-bold mb-1'>
                  {data.districts.length > 0 ? Math.round(
                    data.districts.reduce((total, district) => total + district.ecoScore, 0) /
                      data.districts.length
                  ) : 0}
                </div>
                <div className='text-sm opacity-90'>Avg Eco Score</div>
              </div>
              <div className='p-3 bg-white bg-opacity-20 rounded-full'>
                <TrendingUp className='h-6 w-6' />
              </div>
            </div>
            <div className='mt-4 bg-white bg-opacity-20 rounded-full px-3 py-1 text-xs font-medium inline-flex items-center'>
              +12 this quarter 📈
            </div>
          </div>

          <div className='bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] transform'>
            <div className='flex items-center justify-between'>
              <div>
                <div className='text-3xl font-bold mb-1'>
                  {data.cityMetrics.totalCarbonReduction || 0}%
                </div>
                <div className='text-sm opacity-90'>Carbon Reduction</div>
              </div>
              <div className='p-3 bg-white bg-opacity-20 rounded-full'>
                <Leaf className='h-6 w-6' />
              </div>
            </div>
            <div className='mt-4 bg-white bg-opacity-20 rounded-full px-3 py-1 text-xs font-medium inline-flex items-center'>
              vs 2020 baseline 🌱
            </div>
          </div>

          <div className='bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] transform'>
            <div className='flex items-center justify-between'>
              <div>
                <div className='text-3xl font-bold mb-1'>#12</div>
                <div className='text-sm opacity-90'>National Ranking</div>
              </div>
              <div className='p-3 bg-white bg-opacity-20 rounded-full'>
                <Building className='h-6 w-6' />
              </div>
            </div>
            <div className='mt-4 bg-white bg-opacity-20 rounded-full px-3 py-1 text-xs font-medium inline-flex items-center'>
              Sustainable Cities 🏆
            </div>
          </div>
        </div>

        {/* Second Row - Environmental Metrics */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <TrackerCard
            type='carbon'
            title='Air Quality & Emissions'
            metrics={[
              { label: 'Air Quality Index', value: data.cityMetrics.airQualityIndex || 0, unit: 'AQI' },
              {
                label: 'Carbon Reduction',
                value: data.cityMetrics.totalCarbonReduction || 0,
                unit: '% vs baseline',
              },
              {
                label: 'Renewable Energy',
                value: data.cityMetrics.renewableEnergyPercentage || 0,
                unit: '% of total',
              },
            ]}
            trend='declining'
            lastUpdated={new Date()}
            onViewDetails={() => console.log('View air quality details')}
          />

          <TrackerCard
            type='mental-health'
            title='Urban Wellness'
            metrics={[
              {
                label: 'Green Space',
                value: data.cityMetrics.greenSpacePercentage || 0,
                unit: '% of city area',
              },
              {
                label: 'Public Transport',
                value: data.cityMetrics.publicTransportUsage || 0,
                unit: '% usage rate',
              },
              { label: 'Citizen Satisfaction', value: 78, unit: '% approval' },
            ]}
            trend='improving'
            lastUpdated={new Date()}
            onViewDetails={() => console.log('View urban wellness details')}
          />

          <TrackerCard
            type='animal-welfare'
            title='Biodiversity & Conservation'
            metrics={[
              { label: 'Protected Areas', value: 24, unit: 'zones' },
              { label: 'Wildlife Corridors', value: 8, unit: 'active' },
              { label: 'Conservation Budget', value: 2.4, unit: 'M USD allocated' },
            ]}
            trend='improving'
            lastUpdated={new Date()}
            onViewDetails={() => console.log('View conservation details')}
          />
        </div>

        {/* Digital Twin for Policy Simulations */}
        <GovernmentDigitalTwin 
          userId={user.id}
          className="col-span-full"
        />

        {/* Third Row - Districts & Policies */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* Policy Management */}
          <ZPCard 
            title='Active Policies' 
            description='Current environmental and sustainability policies'
            className='border-blue-100 shadow-md hover:shadow-lg transition-shadow'
            headerAction={
              <ZPButton variant='outline' size='sm' className='bg-blue-50 hover:bg-blue-100 border-blue-200'>
                <Plus className='h-4 w-4 mr-1' />
                New Policy
              </ZPButton>
            }
          >
            <div className='space-y-4'>
              {data.policies && data.policies.map(policy => (
                <div key={policy.id} className='border-l-4 border-blue-500 pl-4 py-3 bg-blue-50 rounded-r hover:bg-blue-100 transition-colors'>
                  <div className='flex justify-between items-start'>
                    <div>
                      <h4 className='font-semibold text-gray-900'>{policy.title}</h4>
                      <p className='text-sm text-gray-600 mt-1'>{policy.description}</p>
                    </div>
                    <ZPBadge 
                      variant={policy.status === 'active' ? 'success' : policy.status === 'draft' ? 'warning' : 'default'}
                      className='text-xs'
                    >
                      {policy.status}
                    </ZPBadge>
                  </div>
                  <div className='flex items-center justify-between mt-3'>
                    <div className='flex items-center gap-4 text-sm'>
                      <span className='text-gray-600'>Impact: <span className='font-medium'>{policy.impact}%</span></span>
                      <span className='text-gray-600'>Support: <span className='font-medium'>{policy.citizenSupport}%</span></span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <span className='text-xs text-gray-500'>
                        {policy.implementationDate.toLocaleDateString()}
                      </span>
                      <ZPButton variant='ghost' size='sm' className='text-blue-600 hover:text-blue-800'>
                        <Eye className='h-4 w-4' />
                      </ZPButton>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className='mt-6'>
              <ZPButton variant='outline' className='w-full bg-blue-50 hover:bg-blue-100 border-blue-200'>
                View All Policies
              </ZPButton>
            </div>
          </ZPCard>

          {/* Top Performing Districts */}
          <ZPCard 
            title='Top Performing Districts' 
            description='District rankings by sustainability metrics'
            className='border-blue-100 shadow-md hover:shadow-lg transition-shadow'
          >
            <LeaderboardList
              title='District Rankings'
              entries={data.topDistricts && data.topDistricts.map(d => ({
                ...d,
                category:
                  d.category === 'mental'
                    ? 'mental-health'
                    : d.category === 'animal'
                      ? 'animal-welfare'
                      : d.category,
              })) || []}
              maxEntries={5}
            />
            <div className='mt-6'>
              <ZPButton variant='outline' className='w-full bg-blue-50 hover:bg-blue-100 border-blue-200'>
                View All Districts
              </ZPButton>
            </div>
          </ZPCard>
        </div>

        {/* Fourth Row - District Performance & Environmental Metrics */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* District Performance */}
          <ZPCard 
            title='District Performance' 
            description='Performance metrics by district'
            className='border-blue-100 shadow-md hover:shadow-lg transition-shadow'
          >
            <div className='space-y-4'>
              {data.districts && data.districts.map(district => (
                <div
                  key={district.id}
                  className='flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-100 hover:bg-blue-100 transition-all duration-200'
                >
                  <div>
                    <h4 className='font-semibold text-gray-900'>{district.name}</h4>
                    <p className='text-sm text-gray-600'>
                      Population: {district.population.toLocaleString()}
                    </p>
                  </div>
                  <div className='text-right'>
                    <div className='text-lg font-bold text-blue-700'>
                      {district.ecoScore}/100
                    </div>
                    <div className='text-sm text-gray-500'>Eco Score</div>
                    <div className='text-xs text-green-600 mt-1 flex items-center justify-end'>
                      <TrendingUp className='h-3 w-3 mr-1' />
                      {district.carbonReduction.toLocaleString()} kg CO₂
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ZPCard>

          {/* Environmental Metrics */}
          <ZPCard 
            title='Environmental Metrics' 
            description='Key environmental performance indicators'
            className='border-blue-100 shadow-md hover:shadow-lg transition-shadow'
          >
            <div className='space-y-4'>
              <TrackerCard
                title='Air Quality'
                metrics={[
                  {
                    label: 'Air Quality Index',
                    value: data.cityMetrics.airQualityIndex,
                    unit: 'AQI',
                  },
                  {
                    label: 'Carbon Reduction',
                    value: data.cityMetrics.totalCarbonReduction,
                    unit: '% vs baseline',
                  },
                ]}
                type='carbon'
                trend='improving'
                lastUpdated={new Date()}
                className='shadow-sm'
              />
              <TrackerCard
                title='Urban Development'
                metrics={[
                  {
                    label: 'Green Space',
                    value: data.cityMetrics.greenSpacePercentage,
                    unit: '% of city area',
                  },
                  {
                    label: 'Public Transport',
                    value: data.cityMetrics.publicTransportUsage,
                    unit: '% usage rate',
                  },
                ]}
                type='mental-health'
                trend='improving'
                lastUpdated={new Date()}
                className='shadow-sm'
              />
            </div>
          </ZPCard>
        </div>

        {/* Recent Activities */}
        <ZPCard 
          title='Recent Government Activities' 
          description='Latest administrative actions and updates'
          className='border-blue-100 shadow-md hover:shadow-lg transition-shadow'
        >
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {data.recentActivities && data.recentActivities.map((activity, index) => (
              <div key={index} className='p-4 border border-blue-200 rounded-lg bg-blue-50 hover:bg-blue-100 transition-all duration-200'>
                <h4 className='font-semibold text-gray-900 mb-2'>{activity.action}</h4>
                <p className='text-sm text-gray-600 mb-3'>{activity.impact}</p>
                <div className='flex items-center justify-between'>
                  <span className='text-sm font-medium text-blue-600'>{activity.user}</span>
                  <span className='text-sm text-gray-500'>
                    {activity.timestamp.toLocaleDateString()}
                  </span>
                </div>
              </div>
            )) || []}
          </div>
        </ZPCard>

        {/* Bottom Row - Administrative Tools */}
        <ZPCard 
          title='Government Tools' 
          description='Administrative and policy management resources'
          className='border-blue-100 shadow-md hover:shadow-lg transition-shadow'
        >
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <ZPButton variant='outline' className='h-24 flex-col bg-blue-50 hover:bg-blue-100 border-blue-200 transition-all duration-200 hover:scale-105'>
              <div className='flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 mb-2'>
                <span className='text-xl'>📋</span>
              </div>
              <span className='text-sm font-medium'>Policy Management</span>
            </ZPButton>
            <ZPButton variant='outline' className='h-24 flex-col bg-blue-50 hover:bg-blue-100 border-blue-200 transition-all duration-200 hover:scale-105'>
              <div className='flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 mb-2'>
                <span className='text-xl'>🏙️</span>
              </div>
              <span className='text-sm font-medium'>District Analytics</span>
            </ZPButton>
            <ZPButton variant='outline' className='h-24 flex-col bg-blue-50 hover:bg-blue-100 border-blue-200 transition-all duration-200 hover:scale-105'>
              <div className='flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 mb-2'>
                <span className='text-xl'>📊</span>
              </div>
              <span className='text-sm font-medium'>Environmental Reports</span>
              {hasOptimisticChanges && (
                <ZPBadge variant="warning" className="mt-1 animate-pulse text-xs">Syncing...</ZPBadge>
              )}
            </ZPButton>
            <ZPButton variant='outline' className='h-24 flex-col bg-blue-50 hover:bg-blue-100 border-blue-200 transition-all duration-200 hover:scale-105'>
              <div className='flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 mb-2'>
                <span className='text-xl'>👥</span>
              </div>
              <span className='text-sm font-medium'>Citizen Engagement</span>
            </ZPButton>
          </div>
        </ZPCard>
        
        {/* Accessibility Checker */}
        <AccessibilityChecker showOnLoad={false} autoRun={false} />
      </div>
    </div>
  );
}