'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ZPModal } from './ZPModal';
import { ZPButton } from '../ZPButton';
import { ZPCard } from '../ZPCard';
import { FileText, Target, Gift, Plus, Calendar, Award } from 'lucide-react';

export function QuickActions() {
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [showRewardsModal, setShowRewardsModal] = useState(false);
  const router = useRouter();

  const activityTypes = [
    {
      id: 'carbon',
      label: 'Carbon Tracking',
      icon: '🌱',
      description: 'Log your carbon footprint activities',
    },
    { id: 'mood', label: 'Mood Check-in', icon: '😊', description: 'Track your mental wellness' },
    {
      id: 'animal',
      label: 'Animal Welfare',
      icon: '🐾',
      description: 'Log animal welfare actions',
    },
    {
      id: 'transport',
      label: 'Transportation',
      icon: '🚗',
      description: 'Track your travel emissions',
    },
  ];

  const challenges = [
    { id: 'weekly-carbon', title: 'Weekly Carbon Challenge', reward: '100 HC', difficulty: 'Easy' },
    {
      id: 'tree-planting',
      title: 'Tree Planting Marathon',
      reward: '250 HC',
      difficulty: 'Medium',
    },
    { id: 'zero-waste', title: 'Zero Waste Week', reward: '500 HC', difficulty: 'Hard' },
  ];

  const rewards = [
    { id: 'coffee', title: 'Free Coffee Voucher', cost: '50 HC', available: true },
    { id: 'plant', title: 'Plant Sapling', cost: '100 HC', available: true },
    { id: 'tshirt', title: 'Eco T-Shirt', cost: '500 HC', available: false },
  ];

  const handleActivitySelect = (activityId: string) => {
    setShowActivityModal(false);
    router.push(`/trackers/${activityId}`);
  };

  const handleChallengeJoin = (challengeId: string) => {
    // In a real app, this would call an API to join the challenge
    console.log('Joining challenge:', challengeId);
    setShowChallengeModal(false);
    // Show success message or redirect
  };

  const handleRewardRedeem = (rewardId: string) => {
    // In a real app, this would call an API to redeem the reward
    console.log('Redeeming reward:', rewardId);
    setShowRewardsModal(false);
    // Show success message or redirect
  };

  return (
    <>
      <div className='bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300'>
        <div className='flex items-center mb-6'>
          <div className='w-10 h-10 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center mr-3'>
            <span className='text-white text-lg'>⚡</span>
          </div>
          <h3 className='text-xl font-bold text-gray-800'>Quick Actions</h3>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <button
            onClick={() => setShowActivityModal(true)}
            className='w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 font-semibold shadow-md hover:shadow-lg flex items-center justify-center space-x-2'
          >
            <FileText className='w-4 h-4' />
            <span>📝 Log Activity</span>
          </button>
          <button
            onClick={() => setShowChallengeModal(true)}
            className='w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-semibold shadow-md hover:shadow-lg flex items-center justify-center space-x-2'
          >
            <Target className='w-4 h-4' />
            <span>🎯 Join Challenge</span>
          </button>
          <button
            onClick={() => setShowRewardsModal(true)}
            className='w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-300 font-semibold shadow-md hover:shadow-lg flex items-center justify-center space-x-2'
          >
            <Gift className='w-4 h-4' />
            <span>🎁 Redeem Rewards</span>
          </button>
        </div>
      </div>

      {/* Activity Selection Modal */}
      <ZPModal
        isOpen={showActivityModal}
        onClose={() => setShowActivityModal(false)}
        title='Log Activity'
        size='md'
      >
        <div className='space-y-4'>
          <p className='text-gray-600'>Choose the type of activity you want to log:</p>
          <div className='grid grid-cols-1 gap-3'>
            {activityTypes.map(activity => (
              <button
                key={activity.id}
                onClick={() => handleActivitySelect(activity.id)}
                className='flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all duration-200'
              >
                <span className='text-2xl'>{activity.icon}</span>
                <div className='flex-1 text-left'>
                  <h4 className='font-medium text-gray-900'>{activity.label}</h4>
                  <p className='text-sm text-gray-500'>{activity.description}</p>
                </div>
                <Plus className='w-5 h-5 text-gray-400' />
              </button>
            ))}
          </div>
        </div>
      </ZPModal>

      {/* Challenge Selection Modal */}
      <ZPModal
        isOpen={showChallengeModal}
        onClose={() => setShowChallengeModal(false)}
        title='Join Challenge'
        size='md'
      >
        <div className='space-y-4'>
          <p className='text-gray-600'>Choose a challenge to join and start earning rewards:</p>
          <div className='space-y-3'>
            {challenges.map(challenge => (
              <ZPCard key={challenge.id} className='p-4'>
                <div className='flex items-center justify-between'>
                  <div className='flex-1'>
                    <h4 className='font-medium text-gray-900 mb-1'>{challenge.title}</h4>
                    <div className='flex items-center space-x-4 text-sm text-gray-500'>
                      <span className='flex items-center space-x-1'>
                        <Award className='w-4 h-4' />
                        <span>{challenge.reward}</span>
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          challenge.difficulty === 'Easy'
                            ? 'bg-green-100 text-green-600'
                            : challenge.difficulty === 'Medium'
                              ? 'bg-yellow-100 text-yellow-600'
                              : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {challenge.difficulty}
                      </span>
                    </div>
                  </div>
                  <ZPButton
                    variant='primary'
                    size='sm'
                    onClick={() => handleChallengeJoin(challenge.id)}
                  >
                    Join
                  </ZPButton>
                </div>
              </ZPCard>
            ))}
          </div>
        </div>
      </ZPModal>

      {/* Rewards Modal */}
      <ZPModal
        isOpen={showRewardsModal}
        onClose={() => setShowRewardsModal(false)}
        title='Redeem Rewards'
        size='md'
      >
        <div className='space-y-4'>
          <p className='text-gray-600'>Use your HealCoins to redeem these rewards:</p>
          <div className='space-y-3'>
            {rewards.map(reward => (
              <ZPCard key={reward.id} className='p-4'>
                <div className='flex items-center justify-between'>
                  <div className='flex-1'>
                    <h4 className='font-medium text-gray-900 mb-1'>{reward.title}</h4>
                    <p className='text-sm text-gray-500'>{reward.cost}</p>
                  </div>
                  <ZPButton
                    variant={reward.available ? 'primary' : 'outline'}
                    size='sm'
                    disabled={!reward.available}
                    onClick={() => handleRewardRedeem(reward.id)}
                  >
                    {reward.available ? 'Redeem' : 'Unavailable'}
                  </ZPButton>
                </div>
              </ZPCard>
            ))}
          </div>
        </div>
      </ZPModal>
    </>
  );
}
