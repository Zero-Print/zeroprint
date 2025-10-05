'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { redirect } from 'next/navigation';
import { ZPCard } from '@/components/ZPCard';
import { ZPButton } from '@/components/ZPButton';
import { ZPBadge } from '@/components/ZPBadge';
import { Users, TrendingUp, BookOpen, Plus, Search, GraduationCap, Award } from 'lucide-react';

export default function ClassesPage() {
  const { user } = useAuth();

  // Role-based access control
  if (!user) {
    redirect('/auth/login');
  }

  const userRole = (user as any)?.role;
  if (userRole !== 'school' && userRole !== 'msme') {
    redirect('/dashboard');
  }

  // Mock data for classes
  const [classes] = useState([
    {
      id: '1',
      name: 'Class 10A',
      teacher: 'Ms. Sarah Johnson',
      studentCount: 30,
      avgEcoScore: 95,
      weeklyProgress: 8,
    },
    {
      id: '2',
      name: 'Class 9B',
      teacher: 'Mr. David Smith',
      studentCount: 28,
      avgEcoScore: 88,
      weeklyProgress: 12,
    },
    {
      id: '3',
      name: 'Class 11C',
      teacher: 'Ms. Emily Brown',
      studentCount: 32,
      avgEcoScore: 82,
      weeklyProgress: -3,
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

  return (
    <div className={`min-h-screen ${roleStyles.bg}`}>
      {/* Header */}
      <div className='bg-white border-b border-gray-200 shadow-sm'>
        <div className='container mx-auto px-6 py-6'>
          <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
            <div className='flex items-center gap-4'>
              <div className='flex items-center gap-3'>
                <div className={`p-3 bg-gradient-to-r ${roleStyles.gradient} rounded-xl shadow-lg`}>
                  <GraduationCap className='h-8 w-8 text-white' />
                </div>
                <div>
                  <h1 className='text-3xl font-bold text-gray-900 flex items-center gap-2'>
                    Class Management
                  </h1>
                  <p className='text-gray-600'>Manage your classes and track student performance</p>
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
                <Users className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Classes</p>
                <p className="text-2xl font-bold text-gray-900">{classes.length}</p>
              </div>
            </div>
          </ZPCard>

          <ZPCard className={`${roleStyles.card} p-6 hover:shadow-md transition-shadow`}>
            <div className="flex items-center">
              <div className={`p-3 rounded-full bg-gradient-to-r ${roleStyles.gradient} text-white`}>
                <BookOpen className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">
                  {classes.reduce((sum, cls) => sum + cls.studentCount, 0)}
                </p>
              </div>
            </div>
          </ZPCard>

          <ZPCard className={`${roleStyles.card} p-6 hover:shadow-md transition-shadow`}>
            <div className="flex items-center">
              <div className={`p-3 rounded-full bg-gradient-to-r ${roleStyles.gradient} text-white`}>
                <TrendingUp className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Eco Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(classes.reduce((sum, cls) => sum + cls.avgEcoScore, 0) / classes.length)}
                </p>
              </div>
            </div>
          </ZPCard>
        </div>

        {/* Classes List */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-orange-600" />
              Your Classes
            </h2>
            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search classes..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <ZPButton className={`${roleStyles.button} flex items-center gap-2`}>
                <Plus className="h-4 w-4" />
                Add Class
              </ZPButton>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {classes.map((cls) => (
              <ZPCard key={cls.id} className={`${roleStyles.card} p-6 hover:shadow-lg transition-all duration-300`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-orange-500" />
                      {cls.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">Teacher: {cls.teacher}</p>
                  </div>
                  <ZPBadge variant="info" className="text-sm">{cls.studentCount} students</ZPBadge>
                </div>
                
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                    <p className="text-sm text-gray-600">Eco Score</p>
                    <p className="text-2xl font-bold text-orange-700">{cls.avgEcoScore}</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                    <p className="text-sm text-gray-600">Weekly Progress</p>
                    <p className={`text-2xl font-bold ${cls.weeklyProgress >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {cls.weeklyProgress >= 0 ? '+' : ''}{cls.weeklyProgress}%
                    </p>
                  </div>
                </div>
                
                <div className="mt-6 flex gap-3">
                  <ZPButton variant="outline" size="sm" className="flex-1">
                    View Details
                  </ZPButton>
                  <ZPButton variant="outline" size="sm" className="flex-1">
                    Manage Students
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