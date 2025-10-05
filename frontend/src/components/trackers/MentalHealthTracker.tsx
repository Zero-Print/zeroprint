'use client';

import React, { useState } from 'react';
import { TrackerCard } from '../ui/TrackerCard';
import { ZPModal } from '../ui/ZPModal';
import { ZPButton } from '../ui/ZPButton';
import { ZPInput } from '../ui/ZPInput';
import { ZPCard } from '../ui/ZPCard';
import { ZPBadge } from '../ui/ZPBadge';

interface MentalHealthTrackerProps {
  data: {
    averageMood: number;
    averageEcoMindScore: number;
    moodTrend: 'improving' | 'stable' | 'declining';
    ecoAnxietyLevel: 'low' | 'moderate' | 'high';
    recommendations: string[];
    streakDays: number;
    totalLogs: number;
    lastLogDate: string;
    weeklyPatterns: {
      dayOfWeek: string;
      averageMood: number;
      averageEcoMindScore: number;
    }[];
    monthlyTrends: {
      month: string;
      averageMood: number;
      averageEcoMindScore: number;
      totalLogs: number;
    }[];
  };
  onAddLog?: (log: any) => void;
  className?: string;
}

export const MentalHealthTracker: React.FC<MentalHealthTrackerProps> = ({
  data,
  onAddLog,
  className = '',
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [newLog, setNewLog] = useState({
    mood: 3,
    note: '',
    factors: {
      stressLevel: 3,
      sleepQuality: 3,
      natureExposure: 30,
      socialConnection: 3,
      physicalActivity: 30,
      ecoAnxiety: 3,
    },
    activities: [] as string[],
    triggers: [] as string[],
    copingStrategies: [] as string[],
  });

  const metrics = [
    {
      label: 'Average Mood',
      value: data.averageMood,
      unit: '/5',
      change: {
        value:
          data.monthlyTrends[data.monthlyTrends.length - 1]?.averageMood -
          (data.monthlyTrends[data.monthlyTrends.length - 2]?.averageMood || data.averageMood),
        period: 'vs last month',
        isPositive: data.moodTrend === 'improving',
      },
      target: 4,
    },
    {
      label: 'EcoMind Score',
      value: data.averageEcoMindScore,
      unit: '/100',
      change: {
        value:
          data.monthlyTrends[data.monthlyTrends.length - 1]?.averageEcoMindScore -
          (data.monthlyTrends[data.monthlyTrends.length - 2]?.averageEcoMindScore ||
            data.averageEcoMindScore),
        period: 'vs last month',
        isPositive: data.moodTrend === 'improving',
      },
      target: 80,
    },
    {
      label: 'Check-ins',
      value: data.totalLogs,
      unit: 'entries',
    },
    {
      label: 'Streak',
      value: data.streakDays,
      unit: 'days',
    },
  ];

  const overallScore = {
    value: Math.round(data.averageEcoMindScore),
    maxValue: 100,
    label: 'Mental Wellness Score',
  };

  const handleAddLog = () => {
    const logData = {
      mood: newLog.mood,
      note: newLog.note,
      factors: newLog.factors,
      activities: newLog.activities,
      triggers: newLog.triggers,
      coping_strategies: newLog.copingStrategies,
      timestamp: new Date().toISOString(),
    };

    onAddLog?.(logData);
    setNewLog({
      mood: 3,
      note: '',
      factors: {
        stressLevel: 3,
        sleepQuality: 3,
        natureExposure: 30,
        socialConnection: 3,
        physicalActivity: 30,
        ecoAnxiety: 3,
      },
      activities: [],
      triggers: [],
      copingStrategies: [],
    });
    setShowAddModal(false);
  };

  const getMoodEmoji = (mood: number) => {
    const emojis = ['😢', '😕', '😐', '😊', '😄'];
    return emojis[mood - 1] || '😐';
  };

  const getAnxietyColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'text-green-600 dark:text-green-400';
      case 'moderate':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'high':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const activityOptions = [
    'meditation',
    'nature_walk',
    'journaling',
    'exercise',
    'breathing',
    'yoga',
    'reading',
    'music',
    'art',
    'gardening',
  ];

  const triggerOptions = [
    'climate_news',
    'pollution',
    'waste',
    'traffic',
    'work_stress',
    'social_media',
    'weather',
    'noise',
    'crowds',
    'deadlines',
  ];

  const copingOptions = [
    'breathing',
    'nature_sounds',
    'eco_action',
    'meditation',
    'exercise',
    'talking',
    'writing',
    'music',
    'art',
    'volunteering',
  ];

  const toggleArrayItem = (array: string[], item: string, setter: (arr: string[]) => void) => {
    if (array.includes(item)) {
      setter(array.filter(i => i !== item));
    } else {
      setter([...array, item]);
    }
  };

  return (
    <>
      <TrackerCard
        type='mental-health'
        title='Mental Health & Wellbeing'
        description='Track your mood, eco-anxiety, and mental wellness journey'
        metrics={metrics}
        overallScore={overallScore}
        trend={data.moodTrend}
        lastUpdated={data.lastLogDate ? new Date(data.lastLogDate) : new Date()}
        onViewDetails={() => setShowDetailsModal(true)}
        onAddEntry={() => setShowAddModal(true)}
        className={className}
      />

      {/* Add Log Modal */}
      <ZPModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title='Mental Health Check-in'
        size='lg'
      >
        <div className='space-y-6'>
          {/* Mood Rating */}
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3'>
              How are you feeling today?
            </label>
            <div className='flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg'>
              {[1, 2, 3, 4, 5].map(mood => (
                <button
                  key={mood}
                  onClick={() => setNewLog({ ...newLog, mood })}
                  className={`text-4xl p-2 rounded-lg transition-all ${
                    newLog.mood === mood
                      ? 'bg-blue-100 dark:bg-blue-900 scale-110'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {getMoodEmoji(mood)}
                </button>
              ))}
            </div>
            <div className='flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1'>
              <span>Very Low</span>
              <span>Low</span>
              <span>Neutral</span>
              <span>Good</span>
              <span>Excellent</span>
            </div>
          </div>

          {/* Note */}
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              Notes (Optional)
            </label>
            <textarea
              value={newLog.note}
              onChange={e => setNewLog({ ...newLog, note: e.target.value })}
              placeholder="How are you feeling? What's on your mind?"
              className='w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none'
              rows={3}
            />
          </div>

          {/* Factors */}
          <div>
            <h4 className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-3'>
              Wellness Factors
            </h4>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-xs text-gray-600 dark:text-gray-400 mb-1'>
                  Stress Level (1-5)
                </label>
                <input
                  type='range'
                  min='1'
                  max='5'
                  value={newLog.factors.stressLevel}
                  onChange={e =>
                    setNewLog({
                      ...newLog,
                      factors: { ...newLog.factors, stressLevel: parseInt(e.target.value) },
                    })
                  }
                  className='w-full'
                />
                <div className='text-center text-sm text-gray-600 dark:text-gray-400'>
                  {newLog.factors.stressLevel}
                </div>
              </div>

              <div>
                <label className='block text-xs text-gray-600 dark:text-gray-400 mb-1'>
                  Sleep Quality (1-5)
                </label>
                <input
                  type='range'
                  min='1'
                  max='5'
                  value={newLog.factors.sleepQuality}
                  onChange={e =>
                    setNewLog({
                      ...newLog,
                      factors: { ...newLog.factors, sleepQuality: parseInt(e.target.value) },
                    })
                  }
                  className='w-full'
                />
                <div className='text-center text-sm text-gray-600 dark:text-gray-400'>
                  {newLog.factors.sleepQuality}
                </div>
              </div>

              <div>
                <label className='block text-xs text-gray-600 dark:text-gray-400 mb-1'>
                  Nature Exposure (minutes)
                </label>
                <ZPInput
                  type='number'
                  value={newLog.factors.natureExposure}
                  onChange={e =>
                    setNewLog({
                      ...newLog,
                      factors: { ...newLog.factors, natureExposure: parseInt(e.target.value) || 0 },
                    })
                  }
                  placeholder='0'
                />
              </div>

              <div>
                <label className='block text-xs text-gray-600 dark:text-gray-400 mb-1'>
                  Physical Activity (minutes)
                </label>
                <ZPInput
                  type='number'
                  value={newLog.factors.physicalActivity}
                  onChange={e =>
                    setNewLog({
                      ...newLog,
                      factors: {
                        ...newLog.factors,
                        physicalActivity: parseInt(e.target.value) || 0,
                      },
                    })
                  }
                  placeholder='0'
                />
              </div>
            </div>
          </div>

          {/* Activities */}
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              Wellness Activities
            </label>
            <div className='flex flex-wrap gap-2'>
              {activityOptions.map(activity => (
                <button
                  key={activity}
                  onClick={() =>
                    toggleArrayItem(newLog.activities, activity, arr =>
                      setNewLog({ ...newLog, activities: arr })
                    )
                  }
                  className={`px-3 py-1 text-sm rounded-full border transition-all ${
                    newLog.activities.includes(activity)
                      ? 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300'
                      : 'bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {activity.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className='flex gap-2 pt-4'>
            <ZPButton variant='outline' onClick={() => setShowAddModal(false)} className='flex-1'>
              Cancel
            </ZPButton>
            <ZPButton variant='primary' onClick={handleAddLog} className='flex-1'>
              Save Check-in
            </ZPButton>
          </div>
        </div>
      </ZPModal>

      {/* Details Modal */}
      <ZPModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title='Mental Health Insights'
        size='lg'
      >
        <div className='space-y-6'>
          {/* Current Status */}
          <div>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
              Current Status
            </h3>
            <div className='grid grid-cols-2 gap-4'>
              <ZPCard className='p-4'>
                <div className='text-center'>
                  <div className='text-3xl mb-2'>{getMoodEmoji(Math.round(data.averageMood))}</div>
                  <div className='text-sm text-gray-600 dark:text-gray-400'>Average Mood</div>
                  <div className='text-lg font-bold text-gray-900 dark:text-white'>
                    {data.averageMood.toFixed(1)}/5
                  </div>
                </div>
              </ZPCard>

              <ZPCard className='p-4'>
                <div className='text-center'>
                  <div className='text-3xl mb-2'>🧠</div>
                  <div className='text-sm text-gray-600 dark:text-gray-400'>Eco Anxiety</div>
                  <ZPBadge
                    variant={
                      data.ecoAnxietyLevel === 'low'
                        ? 'success'
                        : data.ecoAnxietyLevel === 'moderate'
                          ? 'warning'
                          : 'danger'
                    }
                    className='mt-1'
                  >
                    {data.ecoAnxietyLevel}
                  </ZPBadge>
                </div>
              </ZPCard>
            </div>
          </div>

          {/* Weekly Patterns */}
          <div>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
              Weekly Patterns
            </h3>
            <div className='space-y-2'>
              {data.weeklyPatterns.map(day => (
                <div
                  key={day.dayOfWeek}
                  className='flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg'
                >
                  <span className='font-medium text-gray-900 dark:text-white'>{day.dayOfWeek}</span>
                  <div className='flex gap-4 text-sm'>
                    <span className='text-blue-600 dark:text-blue-400'>
                      Mood: {day.averageMood.toFixed(1)}
                    </span>
                    <span className='text-purple-600 dark:text-purple-400'>
                      EcoMind: {day.averageEcoMindScore.toFixed(0)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          {data.recommendations.length > 0 && (
            <div>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
                Personalized Recommendations
              </h3>
              <div className='space-y-2'>
                {data.recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className='flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg'
                  >
                    <span className='text-blue-600 dark:text-blue-400 mt-0.5'>💡</span>
                    <span className='text-sm text-gray-700 dark:text-gray-300'>{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </ZPModal>
    </>
  );
};
