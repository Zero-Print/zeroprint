'use client';

import React, { useState } from 'react';
import { 
  Trophy, 
  Users, 
  School, 
  Factory, 
  Globe, 
  MapPin, 
  Calendar,
  TrendingUp,
  Award,
  Target
} from 'lucide-react';

// Import our new comprehensive leaderboard components
import { ComprehensiveLeaderboard } from '@/components/leaderboards/ComprehensiveLeaderboard';
import { LeaderboardWidget } from '@/components/leaderboards/LeaderboardWidget';
// Import types from LeaderboardEngine in a way that's safe for SSR
import type { EntityType, LeaderboardScope, MetricCategory, TimeFrame } from '@/lib/leaderboards/LeaderboardEngine';

// Import UI components
import { ZPButton } from '@/components/ui/ZPButton';
import { ZPCard } from '@/components/ui/ZPCard';
import { ZPBadge } from '@/components/ui/ZPBadge';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface TabConfig {
  id: string;
  label: string;
  icon: React.ReactNode;
  scope: LeaderboardScope;
  entityTypes: EntityType[];
  category: MetricCategory;
  description: string;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const leaderboardTabs: TabConfig[] = [
  {
    id: 'global-overall',
    label: 'Global Champions',
    icon: <Globe className="w-4 h-4" />,
    scope: 'global',
    entityTypes: ['citizen', 'school', 'msme', 'ward'],
    category: 'overall',
    description: 'Top performers across all categories worldwide'
  },
  {
    id: 'citizens',
    label: 'Citizens',
    icon: <Users className="w-4 h-4" />,
    scope: 'global',
    entityTypes: ['citizen'],
    category: 'overall',
    description: 'Individual environmental champions'
  },
  {
    id: 'schools',
    label: 'Schools',
    icon: <School className="w-4 h-4" />,
    scope: 'global',
    entityTypes: ['school'],
    category: 'environmental',
    description: 'Educational institutions leading sustainability'
  },
  {
    id: 'msmes',
    label: 'Businesses',
    icon: <Factory className="w-4 h-4" />,
    scope: 'global',
    entityTypes: ['msme'],
    category: 'overall',
    description: 'Small and medium enterprises driving green innovation'
  },
  {
    id: 'wards',
    label: 'Wards',
    icon: <MapPin className="w-4 h-4" />,
    scope: 'global',
    entityTypes: ['ward'],
    category: 'overall',
    description: 'Administrative regions with best environmental performance'
  },
  {
    id: 'environmental',
    label: 'Environmental',
    icon: <TrendingUp className="w-4 h-4" />,
    scope: 'global',
    entityTypes: ['citizen', 'school', 'msme', 'ward'],
    category: 'environmental',
    description: 'Leaders in carbon reduction and environmental impact'
  }
];

const timeFrameOptions = [
  { value: 'daily' as TimeFrame, label: 'Today' },
  { value: 'weekly' as TimeFrame, label: 'This Week' },
  { value: 'monthly' as TimeFrame, label: 'This Month' },
  { value: 'quarterly' as TimeFrame, label: 'This Quarter' },
  { value: 'yearly' as TimeFrame, label: 'This Year' },
  { value: 'all-time' as TimeFrame, label: 'All Time' }
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<string>('global-overall');
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('monthly');

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const getCurrentTabConfig = (): TabConfig => {
    return leaderboardTabs.find(tab => tab.id === activeTab) || leaderboardTabs[0];
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderHeader = () => (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        ZeroPrint Leaderboards
      </h1>
      <p className="text-gray-600">
        Celebrating our community&apos;s environmental champions and sustainable leaders across all sectors
      </p>
    </div>
  );

  const renderTabNavigation = () => (
    <div className="mb-6">
      <div className="flex flex-wrap gap-2 mb-4">
        {leaderboardTabs.map((tab) => (
          <ZPButton
            key={tab.id}
            variant={activeTab === tab.id ? 'primary' : 'outline'}
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-2"
          >
            {tab.icon}
            {tab.label}
          </ZPButton>
        ))}
      </div>

      {/* Time Frame Selection */}
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-gray-500" />
        <span className="text-sm text-gray-600 mr-2">Time Period:</span>
        {timeFrameOptions.map((option) => (
          <ZPButton
            key={option.value}
            variant={timeFrame === option.value ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setTimeFrame(option.value)}
          >
            {option.label}
          </ZPButton>
        ))}
      </div>
    </div>
  );

  const renderQuickStats = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <LeaderboardWidget
        title="Top Citizens"
        scope="global"
        entityTypes={['citizen']}
        category="overall"
        timeFrame={timeFrame}
        maxEntries={3}
        compact={true}
        showViewAll={false}
        showRefresh={false}
        className="h-auto"
      />
      
      <LeaderboardWidget
        title="Leading Schools"
        scope="global"
        entityTypes={['school']}
        category="environmental"
        timeFrame={timeFrame}
        maxEntries={3}
        compact={true}
        showViewAll={false}
        showRefresh={false}
        className="h-auto"
      />
      
      <LeaderboardWidget
        title="Top MSMEs"
        scope="global"
        entityTypes={['msme']}
        category="overall"
        timeFrame={timeFrame}
        maxEntries={3}
        compact={true}
        showViewAll={false}
        showRefresh={false}
        className="h-auto"
      />
      
      <LeaderboardWidget
        title="Best Wards"
        scope="global"
        entityTypes={['ward']}
        category="overall"
        timeFrame={timeFrame}
        maxEntries={3}
        compact={true}
        showViewAll={false}
        showRefresh={false}
        className="h-auto"
      />
    </div>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  const currentTab = getCurrentTabConfig();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {renderHeader()}
        {renderTabNavigation()}
        {renderQuickStats()}

        {/* Main Leaderboard */}
        <ComprehensiveLeaderboard
          defaultScope={currentTab.scope}
          defaultEntityTypes={currentTab.entityTypes}
          defaultCategory={currentTab.category}
          defaultTimeFrame={timeFrame}
          maxEntries={100}
          showFilters={true}
          showExport={true}
          autoRefresh={true}
          refreshInterval={60}
          className="mb-8"
        />

        {/* Additional Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ZPCard className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              How Rankings Work
            </h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <Trophy className="w-4 h-4 text-yellow-500 mt-0.5" />
                <div>
                  <strong>Overall Score:</strong> Combines environmental impact, social engagement, and governance metrics
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Users className="w-4 h-4 text-blue-500 mt-0.5" />
                <div>
                  <strong>Real-time Updates:</strong> Rankings refresh every minute with live activity data
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-green-500 mt-0.5" />
                <div>
                  <strong>Multi-scope:</strong> View global, regional, ward, or district-level competitions
                </div>
              </div>
            </div>
          </ZPCard>

          <ZPCard className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Recognition Badges
            </h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <ZPBadge variant="default" className="text-xs">Eco Champion</ZPBadge>
                <span>Top 1% environmental performers</span>
              </div>
              <div className="flex items-center gap-2">
                <ZPBadge variant="secondary" className="text-xs">Green School</ZPBadge>
                <span>Educational institutions leading sustainability</span>
              </div>
              <div className="flex items-center gap-2">
                <ZPBadge variant="outline" className="text-xs">Sustainable Business</ZPBadge>
                <span>MSMEs with exceptional green practices</span>
              </div>
              <div className="flex items-center gap-2">
                <ZPBadge variant="danger" className="text-xs">Rising Star</ZPBadge>
                <span>Fastest improving participants</span>
              </div>
            </div>
          </ZPCard>
        </div>
      </div>
    </div>
  );
}

export default LeaderboardPage;
