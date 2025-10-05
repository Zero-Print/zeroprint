'use client';

import React, { useState } from 'react';
import { TrackerCard } from '../ui/TrackerCard';
import { ZPModal } from '../ui/ZPModal';
import { ZPButton } from '../ui/ZPButton';
import { ZPInput } from '../ui/ZPInput';
import { ZPCard } from '../ui/ZPCard';
import { ZPBadge } from '../ui/ZPBadge';

interface CarbonTrackerProps {
  data: {
    totalCo2Saved: number;
    totalCoinsEarned: number;
    totalLogs: number;
    streakDays: number;
    lastLogDate: string;
    categoryBreakdown: {
      transport: { co2Saved: number; logs: number };
      energy: { co2Saved: number; logs: number };
      waste: { co2Saved: number; logs: number };
      water: { co2Saved: number; logs: number };
    };
    monthlyStats: {
      month: string;
      co2Saved: number;
      logs: number;
      coinsEarned: number;
    }[];
  };
  onAddLog?: (log: any) => void;
  className?: string;
}

export const CarbonTracker: React.FC<CarbonTrackerProps> = ({ data, onAddLog, className = '' }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [newLog, setNewLog] = useState({
    actionType: 'transport' as 'transport' | 'energy' | 'waste' | 'water',
    value: '',
    transportMode: 'walk',
    energySource: 'solar',
    wasteType: 'plastic',
    waterAction: 'rainwater_harvest',
  });

  const metrics = [
    {
      label: 'CO₂ Saved',
      value: data.totalCo2Saved,
      unit: 'kg',
      change: {
        value: data.monthlyStats[data.monthlyStats.length - 1]?.co2Saved || 0,
        period: 'this month',
        isPositive: true,
      },
      target: 100, // Monthly target
    },
    {
      label: 'HealCoins Earned',
      value: data.totalCoinsEarned,
      unit: 'coins',
      change: {
        value: data.monthlyStats[data.monthlyStats.length - 1]?.coinsEarned || 0,
        period: 'this month',
        isPositive: true,
      },
    },
    {
      label: 'Total Actions',
      value: data.totalLogs,
      unit: 'actions',
    },
    {
      label: 'Current Streak',
      value: data.streakDays,
      unit: 'days',
    },
  ];

  const overallScore = {
    value: Math.min(data.totalCo2Saved, 1000),
    maxValue: 1000,
    label: 'Carbon Impact Score',
  };

  const getTrend = () => {
    const currentMonth = data.monthlyStats[data.monthlyStats.length - 1];
    const previousMonth = data.monthlyStats[data.monthlyStats.length - 2];

    if (!previousMonth) return 'stable';

    if (currentMonth.co2Saved > previousMonth.co2Saved) return 'improving';
    if (currentMonth.co2Saved < previousMonth.co2Saved) return 'declining';
    return 'stable';
  };

  const handleAddLog = () => {
    if (!newLog.value) return;

    const logData = {
      actionType: newLog.actionType,
      value: parseFloat(newLog.value),
      metadata: {
        ...(newLog.actionType === 'transport' && { transportMode: newLog.transportMode }),
        ...(newLog.actionType === 'energy' && { energySource: newLog.energySource }),
        ...(newLog.actionType === 'waste' && { wasteType: newLog.wasteType }),
        ...(newLog.actionType === 'water' && { waterAction: newLog.waterAction }),
      },
      timestamp: new Date().toISOString(),
    };

    onAddLog?.(logData);
    setNewLog({
      actionType: 'transport',
      value: '',
      transportMode: 'walk',
      energySource: 'solar',
      wasteType: 'plastic',
      waterAction: 'rainwater_harvest',
    });
    setShowAddModal(false);
  };

  const getActionTypeIcon = (type: string) => {
    switch (type) {
      case 'transport':
        return '🚶';
      case 'energy':
        return '⚡';
      case 'waste':
        return '♻️';
      case 'water':
        return '💧';
      default:
        return '🌱';
    }
  };

  const getActionTypeUnit = (type: string) => {
    switch (type) {
      case 'transport':
        return 'km';
      case 'energy':
        return 'kWh';
      case 'waste':
        return 'kg';
      case 'water':
        return 'L';
      default:
        return 'units';
    }
  };

  return (
    <>
      <TrackerCard
        type='carbon'
        title='Carbon Footprint Tracker'
        description='Track your eco-friendly actions and reduce your carbon footprint'
        metrics={metrics}
        overallScore={overallScore}
        trend={getTrend()}
        lastUpdated={data.lastLogDate ? new Date(data.lastLogDate) : new Date()}
        onViewDetails={() => setShowDetailsModal(true)}
        onAddEntry={() => setShowAddModal(true)}
        className={className}
      />

      {/* Add Log Modal */}
      <ZPModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title='Add Carbon Action'
        size='md'
      >
        <div className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              Action Type
            </label>
            <select
              value={newLog.actionType}
              onChange={e => setNewLog({ ...newLog, actionType: e.target.value as any })}
              className='w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
            >
              <option value='transport'>🚶 Transport</option>
              <option value='energy'>⚡ Energy</option>
              <option value='waste'>♻️ Waste</option>
              <option value='water'>💧 Water</option>
            </select>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              Value ({getActionTypeUnit(newLog.actionType)})
            </label>
            <ZPInput
              type='number'
              value={newLog.value}
              onChange={e => setNewLog({ ...newLog, value: e.target.value })}
              placeholder={`Enter ${getActionTypeUnit(newLog.actionType)}`}
            />
          </div>

          {newLog.actionType === 'transport' && (
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Transport Mode
              </label>
              <select
                value={newLog.transportMode}
                onChange={e => setNewLog({ ...newLog, transportMode: e.target.value })}
                className='w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
              >
                <option value='walk'>🚶 Walking</option>
                <option value='cycle'>🚴 Cycling</option>
                <option value='public_transport'>🚌 Public Transport</option>
                <option value='electric_vehicle'>🔋 Electric Vehicle</option>
              </select>
            </div>
          )}

          {newLog.actionType === 'energy' && (
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Energy Source
              </label>
              <select
                value={newLog.energySource}
                onChange={e => setNewLog({ ...newLog, energySource: e.target.value })}
                className='w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
              >
                <option value='solar'>☀️ Solar</option>
                <option value='wind'>💨 Wind</option>
                <option value='battery'>🔋 Battery</option>
                <option value='grid'>⚡ Grid (Renewable)</option>
              </select>
            </div>
          )}

          {newLog.actionType === 'waste' && (
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Waste Type
              </label>
              <select
                value={newLog.wasteType}
                onChange={e => setNewLog({ ...newLog, wasteType: e.target.value })}
                className='w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
              >
                <option value='plastic'>♻️ Plastic</option>
                <option value='organic'>🍃 Organic</option>
                <option value='electronic'>📱 Electronic</option>
                <option value='paper'>📄 Paper</option>
              </select>
            </div>
          )}

          {newLog.actionType === 'water' && (
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Water Action
              </label>
              <select
                value={newLog.waterAction}
                onChange={e => setNewLog({ ...newLog, waterAction: e.target.value })}
                className='w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
              >
                <option value='rainwater_harvest'>🌧️ Rainwater Harvest</option>
                <option value='greywater_reuse'>♻️ Greywater Reuse</option>
                <option value='conservation'>💧 Conservation</option>
              </select>
            </div>
          )}

          <div className='flex gap-2 pt-4'>
            <ZPButton variant='outline' onClick={() => setShowAddModal(false)} className='flex-1'>
              Cancel
            </ZPButton>
            <ZPButton
              variant='primary'
              onClick={handleAddLog}
              disabled={!newLog.value}
              className='flex-1'
            >
              Add Action
            </ZPButton>
          </div>
        </div>
      </ZPModal>

      {/* Details Modal */}
      <ZPModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title='Carbon Tracker Details'
        size='lg'
      >
        <div className='space-y-6'>
          {/* Category Breakdown */}
          <div>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
              Category Breakdown
            </h3>
            <div className='grid grid-cols-2 gap-4'>
              {Object.entries(data.categoryBreakdown).map(([category, stats]) => (
                <ZPCard key={category} className='p-4'>
                  <div className='flex items-center gap-2 mb-2'>
                    <span className='text-xl'>{getActionTypeIcon(category)}</span>
                    <span className='font-medium capitalize text-gray-900 dark:text-white'>
                      {category}
                    </span>
                  </div>
                  <div className='space-y-1'>
                    <div className='text-sm text-gray-600 dark:text-gray-400'>
                      CO₂ Saved:{' '}
                      <span className='font-medium text-green-600'>{stats.co2Saved} kg</span>
                    </div>
                    <div className='text-sm text-gray-600 dark:text-gray-400'>
                      Actions: <span className='font-medium'>{stats.logs}</span>
                    </div>
                  </div>
                </ZPCard>
              ))}
            </div>
          </div>

          {/* Monthly Trends */}
          <div>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
              Monthly Progress
            </h3>
            <div className='space-y-2'>
              {data.monthlyStats.slice(-6).map(month => (
                <div
                  key={month.month}
                  className='flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg'
                >
                  <span className='font-medium text-gray-900 dark:text-white'>
                    {new Date(month.month + '-01').toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                  <div className='flex gap-4 text-sm'>
                    <span className='text-green-600 dark:text-green-400'>
                      {month.co2Saved} kg CO₂
                    </span>
                    <span className='text-blue-600 dark:text-blue-400'>
                      {month.coinsEarned} coins
                    </span>
                    <ZPBadge variant='secondary'>{month.logs} actions</ZPBadge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ZPModal>
    </>
  );
};
