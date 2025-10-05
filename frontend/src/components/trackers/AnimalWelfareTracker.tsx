'use client';

import React, { useState } from 'react';
import { TrackerCard } from '../ui/TrackerCard';
import { ZPModal } from '../ui/ZPModal';
import { ZPButton } from '../ui/ZPButton';
import { ZPInput } from '../ui/ZPInput';
import { ZPCard } from '../ui/ZPCard';
import { ZPBadge } from '../ui/ZPBadge';

interface AnimalWelfareTrackerProps {
  data: {
    totalKindnessScore: number;
    totalCoinsEarned: number;
    totalActions: number;
    streakDays: number;
    lastActionDate: string;
    actionBreakdown: {
      fedStray: { count: number; kindnessScore: number };
      crueltyFree: { count: number; kindnessScore: number };
      noPlastic: { count: number; kindnessScore: number };
      adoption: { count: number; kindnessScore: number };
      rescue: { count: number; kindnessScore: number };
      donation: { count: number; kindnessScore: number };
    };
    monthlyStats: {
      month: string;
      kindnessScore: number;
      actions: number;
      coinsEarned: number;
    }[];
    animalTypes: {
      type: string;
      interactions: number;
      kindnessScore: number;
    }[];
  };
  onAddLog?: (log: any) => void;
  className?: string;
}

export const AnimalWelfareTracker: React.FC<AnimalWelfareTrackerProps> = ({
  data,
  onAddLog,
  className = '',
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [newLog, setNewLog] = useState({
    actions: [] as string[],
    animalType: 'dog',
    location: '',
    duration: '',
    cost: '',
    description: '',
    photos: [] as string[],
  });

  const metrics = [
    {
      label: 'Kindness Score',
      value: data.totalKindnessScore,
      unit: 'points',
      change: {
        value: data.monthlyStats[data.monthlyStats.length - 1]?.kindnessScore || 0,
        period: 'this month',
        isPositive: true,
      },
      target: 500, // Monthly target
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
      label: 'Kind Actions',
      value: data.totalActions,
      unit: 'actions',
    },
    {
      label: 'Kindness Streak',
      value: data.streakDays,
      unit: 'days',
    },
  ];

  const overallScore = {
    value: Math.min(data.totalKindnessScore, 1000),
    maxValue: 1000,
    label: 'Animal Kindness Score',
  };

  const getTrend = () => {
    const currentMonth = data.monthlyStats[data.monthlyStats.length - 1];
    const previousMonth = data.monthlyStats[data.monthlyStats.length - 2];

    if (!previousMonth) return 'stable';

    if (currentMonth.kindnessScore > previousMonth.kindnessScore) return 'improving';
    if (currentMonth.kindnessScore < previousMonth.kindnessScore) return 'declining';
    return 'stable';
  };

  const handleAddLog = () => {
    if (newLog.actions.length === 0) return;

    const logData = {
      actions: newLog.actions,
      details: {
        animalType: newLog.animalType,
        location: newLog.location || undefined,
        duration: newLog.duration ? parseInt(newLog.duration) : undefined,
        cost: newLog.cost ? parseFloat(newLog.cost) : undefined,
        description: newLog.description || undefined,
        photos: newLog.photos,
      },
      timestamp: new Date().toISOString(),
    };

    onAddLog?.(logData);
    setNewLog({
      actions: [],
      animalType: 'dog',
      location: '',
      duration: '',
      cost: '',
      description: '',
      photos: [],
    });
    setShowAddModal(false);
  };

  const actionOptions = [
    { id: 'fedStray', label: 'Fed Stray Animals', icon: '🍽️' },
    { id: 'crueltyFree', label: 'Chose Cruelty-Free Products', icon: '🚫' },
    { id: 'noPlastic', label: 'Avoided Plastic (Animal Safety)', icon: '♻️' },
    { id: 'adoption', label: 'Animal Adoption/Fostering', icon: '🏠' },
    { id: 'rescue', label: 'Animal Rescue', icon: '🚑' },
    { id: 'donation', label: 'Donated to Animal Welfare', icon: '💝' },
    { id: 'volunteer', label: 'Volunteered at Shelter', icon: '🤝' },
    { id: 'education', label: 'Animal Welfare Education', icon: '📚' },
  ];

  const animalTypes = [
    { id: 'dog', label: 'Dog', icon: '🐕' },
    { id: 'cat', label: 'Cat', icon: '🐱' },
    { id: 'bird', label: 'Bird', icon: '🐦' },
    { id: 'wildlife', label: 'Wildlife', icon: '🦌' },
    { id: 'farm', label: 'Farm Animal', icon: '🐄' },
    { id: 'marine', label: 'Marine Life', icon: '🐠' },
    { id: 'other', label: 'Other', icon: '🐾' },
  ];

  const toggleAction = (actionId: string) => {
    if (newLog.actions.includes(actionId)) {
      setNewLog({ ...newLog, actions: newLog.actions.filter(a => a !== actionId) });
    } else {
      setNewLog({ ...newLog, actions: [...newLog.actions, actionId] });
    }
  };

  const getActionIcon = (actionId: string) => {
    const action = actionOptions.find(a => a.id === actionId);
    return action?.icon || '🐾';
  };

  const getActionLabel = (actionId: string) => {
    const action = actionOptions.find(a => a.id === actionId);
    return action?.label || actionId;
  };

  const getAnimalIcon = (type: string) => {
    const animal = animalTypes.find(a => a.id === type);
    return animal?.icon || '🐾';
  };

  return (
    <>
      <TrackerCard
        type='animal-welfare'
        title='Animal Welfare Tracker'
        description='Track your kindness towards animals and wildlife protection efforts'
        metrics={metrics}
        overallScore={overallScore}
        trend={getTrend()}
        lastUpdated={data.lastActionDate ? new Date(data.lastActionDate) : new Date()}
        onViewDetails={() => setShowDetailsModal(true)}
        onAddEntry={() => setShowAddModal(true)}
        className={className}
      />

      {/* Add Log Modal */}
      <ZPModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title='Log Animal Welfare Action'
        size='lg'
      >
        <div className='space-y-6'>
          {/* Actions */}
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3'>
              What kind actions did you take? (Select all that apply)
            </label>
            <div className='grid grid-cols-2 gap-3'>
              {actionOptions.map(action => (
                <button
                  key={action.id}
                  onClick={() => toggleAction(action.id)}
                  className={`p-3 text-left rounded-lg border transition-all ${
                    newLog.actions.includes(action.id)
                      ? 'bg-purple-100 dark:bg-purple-900 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300'
                      : 'bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className='flex items-center gap-2'>
                    <span className='text-lg'>{action.icon}</span>
                    <span className='text-sm font-medium'>{action.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Animal Type */}
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              Animal Type
            </label>
            <div className='grid grid-cols-4 gap-2'>
              {animalTypes.map(animal => (
                <button
                  key={animal.id}
                  onClick={() => setNewLog({ ...newLog, animalType: animal.id })}
                  className={`p-2 text-center rounded-lg border transition-all ${
                    newLog.animalType === animal.id
                      ? 'bg-purple-100 dark:bg-purple-900 border-purple-300 dark:border-purple-700'
                      : 'bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className='text-lg'>{animal.icon}</div>
                  <div className='text-xs'>{animal.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Optional Details */}
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Location (Optional)
              </label>
              <ZPInput
                value={newLog.location}
                onChange={e => setNewLog({ ...newLog, location: e.target.value })}
                placeholder='Where did this happen?'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Duration (minutes)
              </label>
              <ZPInput
                type='number'
                value={newLog.duration}
                onChange={e => setNewLog({ ...newLog, duration: e.target.value })}
                placeholder='Time spent'
              />
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Cost (Optional)
              </label>
              <ZPInput
                type='number'
                step='0.01'
                value={newLog.cost}
                onChange={e => setNewLog({ ...newLog, cost: e.target.value })}
                placeholder='Amount spent'
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              Description (Optional)
            </label>
            <textarea
              value={newLog.description}
              onChange={e => setNewLog({ ...newLog, description: e.target.value })}
              placeholder='Tell us more about your kind action...'
              className='w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none'
              rows={3}
            />
          </div>

          <div className='flex gap-2 pt-4'>
            <ZPButton variant='outline' onClick={() => setShowAddModal(false)} className='flex-1'>
              Cancel
            </ZPButton>
            <ZPButton
              variant='primary'
              onClick={handleAddLog}
              disabled={newLog.actions.length === 0}
              className='flex-1'
            >
              Log Action
            </ZPButton>
          </div>
        </div>
      </ZPModal>

      {/* Details Modal */}
      <ZPModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title='Animal Welfare Insights'
        size='lg'
      >
        <div className='space-y-6'>
          {/* Action Breakdown */}
          <div>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
              Action Breakdown
            </h3>
            <div className='grid grid-cols-2 gap-4'>
              {Object.entries(data.actionBreakdown).map(([action, stats]) => (
                <ZPCard key={action} className='p-4'>
                  <div className='flex items-center gap-2 mb-2'>
                    <span className='text-xl'>{getActionIcon(action)}</span>
                    <span className='font-medium text-gray-900 dark:text-white'>
                      {getActionLabel(action)}
                    </span>
                  </div>
                  <div className='space-y-1'>
                    <div className='text-sm text-gray-600 dark:text-gray-400'>
                      Actions: <span className='font-medium'>{stats.count}</span>
                    </div>
                    <div className='text-sm text-gray-600 dark:text-gray-400'>
                      Kindness:{' '}
                      <span className='font-medium text-purple-600'>{stats.kindnessScore} pts</span>
                    </div>
                  </div>
                </ZPCard>
              ))}
            </div>
          </div>

          {/* Animal Types */}
          <div>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
              Animals Helped
            </h3>
            <div className='grid grid-cols-3 gap-4'>
              {data.animalTypes.map(animal => (
                <ZPCard key={animal.type} className='p-4 text-center'>
                  <div className='text-2xl mb-2'>{getAnimalIcon(animal.type)}</div>
                  <div className='font-medium text-gray-900 dark:text-white capitalize'>
                    {animal.type}
                  </div>
                  <div className='text-sm text-gray-600 dark:text-gray-400'>
                    {animal.interactions} interactions
                  </div>
                  <div className='text-sm text-purple-600 dark:text-purple-400'>
                    {animal.kindnessScore} kindness pts
                  </div>
                </ZPCard>
              ))}
            </div>
          </div>

          {/* Monthly Progress */}
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
                    <span className='text-purple-600 dark:text-purple-400'>
                      {month.kindnessScore} kindness
                    </span>
                    <span className='text-blue-600 dark:text-blue-400'>
                      {month.coinsEarned} coins
                    </span>
                    <ZPBadge variant='secondary'>{month.actions} actions</ZPBadge>
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
