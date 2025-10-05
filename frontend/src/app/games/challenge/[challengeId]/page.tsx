'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ZPCard } from '@/components/ZPCard';
import { ZPButton } from '@/components/ZPButton';
import { ZPBadge } from '@/components/ZPBadge';
import { Trophy, Users, Clock, Target, Play, CheckCircle } from 'lucide-react';

interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  reward: number;
  timeLimit: string;
  participants: number;
  completed: boolean;
  progress: number;
  startDate: string;
  endDate: string;
  tasks: Array<{
    id: string;
    title: string;
    description: string;
    completed: boolean;
  }>;
}

export default function ChallengeDetailPage({ params }: { params: { challengeId: string } }) {
  const router = useRouter();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading challenge data
    setTimeout(() => {
      setChallenge({
        id: params.challengeId,
        title: 'Community Solar Challenge',
        description: 'Work with your neighbors to install solar panels across your community and reduce carbon emissions.',
        difficulty: 'medium',
        reward: 150,
        timeLimit: '7 days',
        participants: 24,
        completed: false,
        progress: 65,
        startDate: '2023-06-01',
        endDate: '2023-06-08',
        tasks: [
          {
            id: '1',
            title: 'Recruit Neighbors',
            description: 'Get at least 5 neighbors to join the challenge',
            completed: true
          },
          {
            id: '2',
            title: 'Energy Audit',
            description: 'Complete an energy audit for participating homes',
            completed: true
          },
          {
            id: '3',
            title: 'Solar Quotes',
            description: 'Collect solar installation quotes from 3 providers',
            completed: false
          },
          {
            id: '4',
            title: 'Community Meeting',
            description: 'Host a community meeting to discuss solar options',
            completed: false
          }
        ]
      });
      setLoading(false);
    }, 500);
  }, [params.challengeId]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'green';
      case 'medium': return 'yellow';
      case 'hard': return 'red';
      default: return 'gray';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-green-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
                  <div className="h-10 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
              <div>
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-green-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Challenge Not Found</h1>
            <p className="text-gray-600 mb-6">The challenge you&apos;re looking for doesn&apos;t exist or has been removed.</p>
            <ZPButton onClick={() => router.push('/games')}>
              Browse All Games
            </ZPButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-green-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => router.push('/games')}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <span className="mr-2">←</span> Back to Games
          </button>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{challenge.title}</h1>
              <p className="text-gray-600">{challenge.description}</p>
            </div>
            <div className="mt-4 md:mt-0">
              <ZPBadge variant={getDifficultyColor(challenge.difficulty) as any}>
                {challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}
              </ZPBadge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress */}
            <ZPCard className="p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Challenge Progress</h2>
                <ZPBadge variant={challenge.completed ? 'success' : 'warning'}>
                  {challenge.completed ? 'Completed' : 'In Progress'}
                </ZPBadge>
              </div>
              
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>{challenge.progress}% Complete</span>
                  <span>{challenge.timeLimit} Remaining</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${challenge.progress}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center">
                  <Users className="mr-2" size={16} />
                  <span>{challenge.participants} participants</span>
                </div>
                <div className="flex items-center">
                  <Trophy className="mr-2 text-yellow-500" size={16} />
                  <span>{challenge.reward} HealCoins reward</span>
                </div>
              </div>
            </ZPCard>

            {/* Tasks */}
            <ZPCard className="p-6 shadow-lg border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Tasks</h2>
              
              <div className="space-y-4">
                {challenge.tasks.map((task) => (
                  <div 
                    key={task.id} 
                    className={`flex items-start p-4 rounded-lg border ${
                      task.completed 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mr-3 mt-0.5 ${
                      task.completed 
                        ? 'bg-green-500' 
                        : 'bg-gray-200'
                    }`}>
                      {task.completed ? (
                        <CheckCircle className="text-white" size={16} />
                      ) : (
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-medium ${
                        task.completed ? 'text-green-800' : 'text-gray-800'
                      }`}>
                        {task.title}
                      </h3>
                      <p className={`text-sm ${
                        task.completed ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {task.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ZPCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Challenge Info */}
            <ZPCard className="p-6 shadow-lg border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Challenge Info</h2>
              
              <div className="space-y-4">
                <div className="flex items-center text-gray-600">
                  <Clock className="mr-3" size={18} />
                  <div>
                    <div className="font-medium">Time Limit</div>
                    <div className="text-sm">{challenge.timeLimit}</div>
                  </div>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <Target className="mr-3" size={18} />
                  <div>
                    <div className="font-medium">Start Date</div>
                    <div className="text-sm">{new Date(challenge.startDate).toLocaleDateString()}</div>
                  </div>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <Trophy className="mr-3 text-yellow-500" size={18} />
                  <div>
                    <div className="font-medium">Reward</div>
                    <div className="text-sm">{challenge.reward} HealCoins</div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <ZPButton className="w-full" disabled={challenge.completed}>
                  <Play className="mr-2" size={16} />
                  {challenge.completed ? 'Completed' : 'Continue Challenge'}
                </ZPButton>
              </div>
            </ZPCard>

            {/* Leaderboard */}
            <ZPCard className="p-6 shadow-lg border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Leaderboard</h2>
              
              <div className="space-y-3">
                {[
                  { rank: 1, name: 'Alex Johnson', progress: 100, completed: true },
                  { rank: 2, name: 'Sam Wilson', progress: 85, completed: false },
                  { rank: 3, name: 'You', progress: challenge.progress, completed: challenge.completed },
                  { rank: 4, name: 'Jordan Lee', progress: 45, completed: false },
                  { rank: 5, name: 'Taylor Kim', progress: 30, completed: false },
                ].map((participant) => (
                  <div 
                    key={participant.rank} 
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      participant.name === 'You' 
                        ? 'bg-blue-50 border border-blue-200' 
                        : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                        participant.rank <= 3 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {participant.rank}
                      </div>
                      <span className="font-medium">{participant.name}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600 mr-2">{participant.progress}%</span>
                      {participant.completed && (
                        <CheckCircle className="text-green-500" size={16} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ZPCard>
          </div>
        </div>
      </div>
    </div>
  );
}