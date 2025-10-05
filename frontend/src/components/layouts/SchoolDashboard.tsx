'use client';

import React from 'react';
import { ZPCard } from '@/components/ZPCard';
import { ZPButton } from '@/components/ZPButton';
import { ZPBadge } from '@/components/ZPBadge';
import { LeaderboardList } from '@/components/ui/LeaderboardList';
import { GameCard } from '@/components/ui/GameCard';
import { TrackerCard } from '@/components/ui/TrackerCard';
import { 
  BookOpen, 
  Users, 
  Leaf, 
  Brain, 
  PawPrint, 
  Trophy, 
  Award, 
  TrendingUp, 
  RefreshCw, 
  Settings,
  Loader2
} from 'lucide-react';

interface SchoolDashboardProps {
  user: {
    displayName: string;
    totalStudents?: number;
    totalTeachers?: number;
    avgEcoScore?: number;
  };
  data: {
    classrooms: Array<{
      id: string;
      name: string;
      teacher: string;
      studentCount: number;
      avgEcoScore: number;
      weeklyProgress: number;
    }>;
    schoolLeaderboard: Array<{
      id: string;
      name: string;
      score: number;
      rank: number;
      category: 'carbon' | 'mental' | 'animal' | 'overall';
      change: number;
    }>;
    groupChallenges: Array<{
      id: string;
      title: string;
      description: string;
      progress: number;
      reward: number;
      difficulty: 'easy' | 'medium' | 'hard';
      timeLimit: string;
      status: 'active' | 'completed' | 'locked';
      participatingClasses: number;
    }>;
    schoolMetrics: {
      totalCarbonSaved: number;
      avgMentalWellness: number;
      animalWelfareProjects: number;
    };
    recentAchievements: Array<{
      student: string;
      achievement: string;
      points: number;
      date: Date;
      classroom: string;
    }>;
  };
}

export function SchoolDashboard({ user, data }: SchoolDashboardProps) {
  // Defensive programming: provide default values if data is undefined or incomplete
  const safeData = {
    schoolMetrics: {
      totalCarbonSaved: data?.schoolMetrics?.totalCarbonSaved ?? 0,
      avgMentalWellness: data?.schoolMetrics?.avgMentalWellness ?? 0,
      animalWelfareProjects: data?.schoolMetrics?.animalWelfareProjects ?? 0,
    },
    classrooms: data?.classrooms ?? [],
    schoolLeaderboard: data?.schoolLeaderboard ?? [],
    groupChallenges: data?.groupChallenges ?? [],
    recentAchievements: data?.recentAchievements ?? [],
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-amber-50'>
      {/* Header */}
      <div className='bg-white border-b border-gray-200 shadow-sm'>
        <div className='container mx-auto px-6 py-6'>
          <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
            <div className='flex items-center gap-4'>
              <div className='flex items-center gap-3'>
                <div className='p-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl shadow-lg'>
                  <BookOpen className='h-8 w-8 text-white' />
                </div>
                <div>
                  <h1 className='text-3xl font-bold text-gray-900 flex items-center gap-2'>
                    {user.displayName} <span className='text-2xl'>🏫</span>
                  </h1>
                  <p className='text-gray-600'>Empowering the next generation of eco-warriors</p>
                </div>
              </div>
              <ZPBadge variant='warning' className='ml-auto lg:ml-0 text-lg py-2 px-4'>
                School Dashboard
              </ZPBadge>
            </div>
            
            <div className='flex items-center gap-3'>
              <ZPButton
                variant='outline'
                size='sm'
                className='flex items-center gap-2'
              >
                <RefreshCw className='h-4 w-4' />
                Refresh
              </ZPButton>
              
              <ZPButton
                variant='outline'
                size='sm'
                className='flex items-center gap-2'
              >
                <Settings className='h-4 w-4' />
                Settings
              </ZPButton>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='container mx-auto p-6 space-y-8'>
        {/* Top Row - School Overview */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          <ZPCard className='p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-md hover:shadow-lg transition-shadow'>
            <div className='flex items-center gap-4'>
              <div className='p-3 bg-blue-500 rounded-lg'>
                <Users className='h-6 w-6 text-white' />
              </div>
              <div>
                <div className='text-3xl font-bold text-blue-700 mb-1'>{user.totalStudents ?? 0}</div>
                <div className='text-sm text-blue-600 font-medium'>Total Students</div>
              </div>
            </div>
            <ZPBadge variant='info' size='sm' className='mt-4'>
              Active Community
            </ZPBadge>
          </ZPCard>

          <ZPCard className='p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-md hover:shadow-lg transition-shadow'>
            <div className='flex items-center gap-4'>
              <div className='p-3 bg-green-500 rounded-lg'>
                <TrendingUp className='h-6 w-6 text-white' />
              </div>
              <div>
                <div className='text-3xl font-bold text-green-700 mb-1'>{user.avgEcoScore ?? 0}</div>
                <div className='text-sm text-green-600 font-medium'>School Eco Score</div>
              </div>
            </div>
            <ZPBadge variant='success' size='sm' className='mt-4'>
              +8 this week
            </ZPBadge>
          </ZPCard>

          <ZPCard className='p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 shadow-md hover:shadow-lg transition-shadow'>
            <div className='flex items-center gap-4'>
              <div className='p-3 bg-orange-500 rounded-lg'>
                <Leaf className='h-6 w-6 text-white' />
              </div>
              <div>
                <div className='text-3xl font-bold text-orange-700 mb-1'>
                  {safeData.schoolMetrics.totalCarbonSaved}kg
                </div>
                <div className='text-sm text-orange-600 font-medium'>CO₂ Saved</div>
              </div>
            </div>
            <ZPBadge variant='warning' size='sm' className='mt-4'>
              This semester
            </ZPBadge>
          </ZPCard>

          <ZPCard className='p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-md hover:shadow-lg transition-shadow'>
            <div className='flex items-center gap-4'>
              <div className='p-3 bg-purple-500 rounded-lg'>
                <Trophy className='h-6 w-6 text-white' />
              </div>
              <div>
                <div className='text-3xl font-bold text-purple-700 mb-1'>#1</div>
                <div className='text-sm text-purple-600 font-medium'>School Ranking</div>
              </div>
            </div>
            <ZPBadge variant='secondary' size='sm' className='mt-4'>
              Regional
            </ZPBadge>
          </ZPCard>
        </div>

        {/* Second Row - Environmental Tracking */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <TrackerCard
            type='carbon'
            title='School Carbon Impact'
            metrics={[
              {
                label: 'Daily Average',
                value: Number((safeData.schoolMetrics.totalCarbonSaved / 30).toFixed(1)),
                unit: 'kg CO₂ saved',
              },
              {
                label: 'This Month',
                value: safeData.schoolMetrics.totalCarbonSaved,
                unit: 'kg CO₂ saved',
              },
              {
                label: 'Per Student',
                value: Number(
                  (safeData.schoolMetrics.totalCarbonSaved / (user.totalStudents || 100)).toFixed(1)
                ),
                unit: 'kg CO₂ saved',
              },
            ]}
            trend='declining'
            lastUpdated={new Date()}
            onViewDetails={() => console.log('View school carbon details')}
          />

          <TrackerCard
            type='mental-health'
            title='Student Wellness'
            metrics={[
              { label: 'Avg Wellness', value: safeData.schoolMetrics.avgMentalWellness, unit: '/100' },
              { label: 'Mindfulness', value: 85, unit: '% participation' },
              { label: 'Outdoor Time', value: 4.2, unit: 'hrs/week' },
            ]}
            trend='improving'
            lastUpdated={new Date()}
            onViewDetails={() => console.log('View student wellness details')}
          />

          <TrackerCard
            type='animal-welfare'
            title='Animal Welfare Projects'
            metrics={[
              {
                label: 'Active Projects',
                value: safeData.schoolMetrics.animalWelfareProjects,
                unit: 'projects',
              },
              { label: 'Students Involved', value: 156, unit: 'students' },
              { label: 'Funds Raised', value: 1240, unit: 'USD this year' },
            ]}
            trend='improving'
            lastUpdated={new Date()}
            onViewDetails={() => console.log('View animal welfare details')}
          />
        </div>

        {/* Third Row - Classrooms & Group Challenges */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          <div className='space-y-6'>
            <div className='flex items-center justify-between'>
              <h3 className='text-xl font-semibold text-gray-900 flex items-center gap-2'>
                <Users className='h-5 w-5 text-orange-600' />
                Classroom Performance
              </h3>
              <ZPBadge variant='warning'>{safeData.classrooms.length} Classes</ZPBadge>
            </div>
            <div className='space-y-4'>
              {safeData.classrooms.map(classroom => (
                <ZPCard key={classroom.id} className='p-4 hover:shadow-md transition-shadow border-orange-100'>
                  <div className='flex items-center justify-between mb-3'>
                    <div>
                      <h4 className='font-semibold text-gray-900'>{classroom.name}</h4>
                      <p className='text-sm text-gray-600'>Teacher: {classroom.teacher}</p>
                    </div>
                    <ZPBadge variant='info'>{classroom.studentCount} students</ZPBadge>
                  </div>
                  <div className='flex items-center justify-between'>
                    <div className='text-sm'>
                      <span className='text-gray-600'>Eco Score: </span>
                      <span className='font-semibold text-green-700'>{classroom.avgEcoScore}</span>
                    </div>
                    <div className='text-sm'>
                      <span className='text-gray-600'>Weekly Progress: </span>
                      <span
                        className={`font-semibold ${classroom.weeklyProgress >= 0 ? 'text-green-600' : 'text-red-600'}`}
                      >
                        {classroom.weeklyProgress >= 0 ? '+' : ''}
                        {classroom.weeklyProgress}%
                      </span>
                    </div>
                  </div>
                </ZPCard>
              ))}
            </div>
            <ZPButton variant='outline' className='w-full'>
              Manage All Classrooms
            </ZPButton>
          </div>

          <div className='space-y-6'>
            <div className='flex items-center justify-between'>
              <h3 className='text-xl font-semibold text-gray-900 flex items-center gap-2'>
                <Award className='h-5 w-5 text-orange-600' />
                Group Challenges
              </h3>
              <ZPBadge variant='warning'>{safeData.groupChallenges.length} Active</ZPBadge>
            </div>
            <div className='space-y-4'>
              {safeData.groupChallenges.slice(0, 3).map(challenge => (
                <GameCard
                  key={challenge.id}
                  type='challenge'
                  title={challenge.title}
                  description={`${challenge.description} (${challenge.participatingClasses} classes participating)`}
                  progress={{ current: challenge.progress, total: 100, unit: '%' }}
                  reward={{ amount: challenge.reward, type: 'tokens' }}
                  difficulty={challenge.difficulty}
                  timeLimit={{
                    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    isExpired: false,
                  }}
                  status={challenge.status === 'active' ? 'in-progress' : challenge.status}
                  category='community'
                  onStart={() => console.log('Start group challenge:', challenge.id)}
                  onClaim={() => console.log('Claim group reward:', challenge.id)}
                  onView={() => console.log('View group challenge:', challenge.id)}
                />
              ))}
            </div>
            <ZPButton variant='outline' className='w-full'>
              Create New Challenge
            </ZPButton>
          </div>
        </div>

        {/* Fourth Row - Leaderboard & Recent Achievements */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          <div className='space-y-6'>
            <div className='flex items-center justify-between'>
              <h3 className='text-xl font-semibold text-gray-900 flex items-center gap-2'>
                <Trophy className='h-5 w-5 text-orange-600' />
                School Leaderboard
              </h3>
              <ZPBadge variant='warning'>Top Performers</ZPBadge>
            </div>
            <LeaderboardList
              entries={safeData.schoolLeaderboard.map(e => ({
                ...e,
                category:
                  e.category === 'mental'
                    ? 'mental-health'
                    : e.category === 'animal'
                      ? 'animal-welfare'
                      : e.category,
              }))}
              currentUserId=''
              title='Top Students This Month'
              showCategory={true}
              maxEntries={10}
            />
          </div>

          <ZPCard
            title='Recent Achievements'
            description='Latest student accomplishments'
            headerAction={
              <ZPButton variant='outline' size='sm'>
                View All
              </ZPButton>
            }
            className='border-orange-100'
          >
            <div className='space-y-4'>
              {safeData.recentAchievements.map((achievement, index) => (
                <div
                  key={index}
                  className='flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100'
                >
                  <div>
                    <div className='font-medium text-gray-900'>{achievement.student}</div>
                    <div className='text-sm text-gray-600'>{achievement.achievement}</div>
                    <div className='text-xs text-gray-500'>{achievement.classroom}</div>
                  </div>
                  <div className='text-right'>
                    <ZPBadge variant='success'>+{achievement.points} HC</ZPBadge>
                    <div className='text-xs text-gray-500 mt-1'>
                      {new Date(achievement.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ZPCard>
        </div>

        {/* Bottom Row - Quick Actions */}
        <ZPCard title='School Management' description='Administrative tools and resources' className='border-orange-100'>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <ZPButton variant='outline' className='h-20 flex-col bg-orange-50 hover:bg-orange-100 border-orange-200'>
              <Users className='h-6 w-6 text-orange-600 mb-2' />
              <span className='text-sm'>Manage Students</span>
            </ZPButton>
            <ZPButton variant='outline' className='h-20 flex-col bg-orange-50 hover:bg-orange-100 border-orange-200'>
              <Award className='h-6 w-6 text-orange-600 mb-2' />
              <span className='text-sm'>Create Challenge</span>
            </ZPButton>
            <ZPButton variant='outline' className='h-20 flex-col bg-orange-50 hover:bg-orange-100 border-orange-200'>
              <BookOpen className='h-6 w-6 text-orange-600 mb-2' />
              <span className='text-sm'>Learning Resources</span>
            </ZPButton>
            <ZPButton variant='outline' className='h-20 flex-col bg-orange-50 hover:bg-orange-100 border-orange-200'>
              <TrendingUp className='h-6 w-6 text-orange-600 mb-2' />
              <span className='text-sm'>Analytics</span>
            </ZPButton>
          </div>
        </ZPCard>
      </div>
    </div>
  );
}