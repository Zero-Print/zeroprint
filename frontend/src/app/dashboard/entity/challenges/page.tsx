'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { redirect } from 'next/navigation';
import { ZPCard } from '@/components/ZPCard';
import { ZPButton } from '@/components/ZPButton';
import { ZPBadge } from '@/components/ZPBadge';
import { Gamepad2, Trophy, Users, Plus, Filter, Search, Target, Award, Calendar } from 'lucide-react';

export default function ChallengesPage() {
  const { user } = useAuth();

  // Role-based access control
  if (!user) {
    redirect('/auth/login');
  }

  const userRole = (user as any)?.role;
  if (userRole !== 'school' && userRole !== 'msme') {
    redirect('/dashboard');
  }

  // Mock data for challenges
  const [challenges] = useState([
    {
      id: '1',
      title: 'Plastic-Free Week Challenge',
      description: 'Eliminate single-use plastics for one week',
      progress: 75,
      reward: 500,
      difficulty: 'medium' as const,
      timeLimit: '2024-02-01',
      status: 'active' as const,
      participatingClasses: 8,
    },
    {
      id: '2',
      title: 'Tree Planting Initiative',
      description: 'Plant 100 trees around the school campus',
      progress: 45,
      reward: 1000,
      difficulty: 'hard' as const,
      timeLimit: '2024-02-15',
      status: 'active' as const,
      participatingClasses: 12,
    },
    {
      id: '3',
      title: 'Energy Conservation Week',
      description: 'Reduce school energy consumption by 20%',
      progress: 90,
      reward: 750,
      difficulty: 'easy' as const,
      timeLimit: '2024-01-25',
      status: 'active' as const,
      participatingClasses: 15,
    },
    {
      id: '4',
      title: 'Waste Segregation Challenge',
      description: 'Implement proper waste segregation practices',
      progress: 0,
      reward: 300,
      difficulty: 'easy' as const,
      timeLimit: '2024-03-01',
      status: 'upcoming' as const,
      participatingClasses: 0,
    },
  ]);

  const roleStyles = {
    gradient: userRole === 'school' ? 'from-orange-600 to-red-600' : 'from-emerald-600 to-teal-600',
    bg: userRole === 'school' ? 'bg-gradient-to-br from-orange-50 to-red-50' : 'bg-gradient-to-br from-emerald-50 to-teal-50',
    text: userRole === 'school' ? 'text-orange-600' : 'text-emerald-600',
    border: userRole === 'school' ? 'border-orange-200' : 'border-emerald-200',
    card: userRole === 'school' ? 'bg-white border border-orange-100 shadow-sm' : 'bg-white border border-emerald-100 shadow-sm',
    button: userRole === 'school' ? 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700' : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700'
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'success';
      case 'medium': return 'warning';
      case 'hard': return 'danger';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'info';
      case 'upcoming': return 'secondary';
      case 'completed': return 'success';
      default: return 'default';
    }
  };

  return (
    <div className={`min-h-screen ${roleStyles.bg}`}>
      {/* Header */}
      <div className='bg-white border-b border-gray-200 shadow-sm'>
        <div className='container mx-auto px-6 py-6'>
          <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
            <div className='flex items-center gap-4'>
              <div className='flex items-center gap-3'>
                <div className={`p-3 bg-gradient-to-r ${roleStyles.gradient} rounded-xl shadow-lg`}>
                  <Target className='h-8 w-8 text-white' />
                </div>
                <div>
                  <h1 className='text-3xl font-bold text-gray-900 flex items-center gap-2'>
                    Challenges
                  </h1>
                  <p className='text-gray-600'>Create and manage sustainability challenges for your students</p>
                </div>
              </div>
              <ZPBadge variant='warning' className='ml-auto lg:ml-0 text-lg py-2 px-4'>
                {userRole === 'school' ? 'School' : 'MSME'} Dashboard
              </ZPBadge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6 space-y-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ZPCard className={`${roleStyles.card} p-6 hover:shadow-md transition-shadow`}>
            <div className="flex items-center">
              <div className={`p-3 rounded-full bg-gradient-to-r ${roleStyles.gradient} text-white`}>
                <Gamepad2 className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Challenges</p>
                <p className="text-2xl font-bold text-gray-900">
                  {challenges.filter(c => c.status === 'active').length}
                </p>
              </div>
            </div>
          </ZPCard>

          <ZPCard className={`${roleStyles.card} p-6 hover:shadow-md transition-shadow`}>
            <div className="flex items-center">
              <div className={`p-3 rounded-full bg-gradient-to-r ${roleStyles.gradient} text-white`}>
                <Trophy className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Rewards</p>
                <p className="text-2xl font-bold text-gray-900">
                  {challenges.reduce((sum, ch) => sum + ch.reward, 0)}
                </p>
              </div>
            </div>
          </ZPCard>

          <ZPCard className={`${roleStyles.card} p-6 hover:shadow-md transition-shadow`}>
            <div className="flex items-center">
              <div className={`p-3 rounded-full bg-gradient-to-r ${roleStyles.gradient} text-white`}>
                <Users className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Participating Classes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {challenges.reduce((sum, ch) => sum + ch.participatingClasses, 0)}
                </p>
              </div>
            </div>
          </ZPCard>
        </div>

        {/* Challenges List */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Target className="h-5 w-5 text-orange-600" />
              All Challenges
            </h2>
            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search challenges..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <select className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 appearance-none bg-white">
                  <option>All Difficulties</option>
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </select>
              </div>
              <ZPButton className={`${roleStyles.button} flex items-center gap-2`}>
                <Plus className="h-4 w-4" />
                Create Challenge
              </ZPButton>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {challenges.map((challenge) => (
              <ZPCard key={challenge.id} className={`${roleStyles.card} p-6 hover:shadow-lg transition-all duration-300`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <Award className="h-5 w-5 text-orange-500" />
                      {challenge.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-2">{challenge.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex gap-2">
                      <ZPBadge variant={getStatusColor(challenge.status) as any}>
                        {challenge.status.charAt(0).toUpperCase() + challenge.status.slice(1)}
                      </ZPBadge>
                      <ZPBadge variant={getDifficultyColor(challenge.difficulty) as any}>
                        {challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}
                      </ZPBadge>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(challenge.timeLimit).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Progress</span>
                    <span>{challenge.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full bg-gradient-to-r ${roleStyles.gradient}`}
                      style={{ width: `${challenge.progress}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                    <p className="text-sm text-gray-600">Reward</p>
                    <p className="text-xl font-bold text-orange-700">{challenge.reward} HC</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                    <p className="text-sm text-gray-600">Classes</p>
                    <p className="text-xl font-bold text-orange-700">{challenge.participatingClasses}</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <ZPButton variant="outline" size="sm" className="flex-1">
                    View Details
                  </ZPButton>
                  <ZPButton 
                    variant={challenge.status === 'active' ? 'outline' : 'primary'} 
                    size="sm" 
                    className={challenge.status === 'active' ? '' : `${roleStyles.button} flex-1`}
                  >
                    {challenge.status === 'active' ? 'Manage' : 'Start'}
                  </ZPButton>
                </div>
              </ZPCard>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}