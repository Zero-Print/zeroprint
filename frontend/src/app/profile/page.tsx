'use client';

import React from 'react';
import { useAuth } from '@/modules/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ZPBadge } from '@/components/ZPBadge';
import Link from 'next/link';
import { 
  User, 
  Mail, 
  Calendar, 
  MapPin, 
  Award, 
  Edit3, 
  Camera, 
  Trophy, 
  Star, 
  TrendingUp, 
  Shield,
  Zap
} from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-4">Please log in to view your profile.</p>
          <Link href="/login" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const userRole = user?.role || 'citizen';
  const joinDate = new Date().toLocaleDateString(); // Mock join date

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Enhanced Header */}
        <div className="mb-10">
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-full shadow-lg">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                My Profile
              </h1>
              <p className="text-gray-600 text-lg mt-1">
                Manage your account information and track your environmental impact
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Enhanced Profile Card */}
          <div className="lg:col-span-1">
            <Card className="bg-gradient-to-br from-white to-green-50 border-green-200 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="text-center pb-6">
                <div className="relative mb-6">
                  <div className="w-32 h-32 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white text-4xl font-bold mx-auto mb-4 shadow-lg">
                    {(user?.displayName || 'U').charAt(0).toUpperCase()}
                  </div>
                  <button className="absolute bottom-0 right-1/2 transform translate-x-6 translate-y-2 p-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <Camera className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
                <CardTitle className="text-2xl font-bold text-gray-800 mb-2">{user?.displayName || 'User'}</CardTitle>
                <ZPBadge variant="secondary" className="mb-4 bg-green-100 text-green-800 border-green-300">
                  {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                </ZPBadge>
                <button className="flex items-center space-x-2 mx-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300">
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center space-x-4 p-3 bg-white rounded-lg shadow-sm">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Mail className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 uppercase font-medium">Email</div>
                    <div className="text-sm text-gray-900 font-medium">{user?.email}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-3 bg-white rounded-lg shadow-sm">
                  <div className="p-2 bg-green-100 rounded-full">
                    <Calendar className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 uppercase font-medium">Member Since</div>
                    <div className="text-sm text-gray-900 font-medium">{joinDate}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-3 bg-white rounded-lg shadow-sm">
                  <div className="p-2 bg-purple-100 rounded-full">
                    <MapPin className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 uppercase font-medium">Location</div>
                    <div className="text-sm text-gray-900 font-medium">India</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Details Cards */}
          <div className="lg:col-span-2 space-y-8">
            {/* Enhanced Statistics */}
            <Card className="bg-gradient-to-br from-white to-purple-50 border-purple-200 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center space-x-3 text-2xl font-bold text-gray-800">
                  <div className="p-2 bg-purple-500 rounded-full">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <span>Your Environmental Impact</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-green-600 mb-1">234.5</div>
                    <div className="text-sm text-green-700 font-medium">kg CO₂ Saved</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl border border-yellow-200">
                    <div className="w-12 h-12 bg-[var(--zp-healcoin-gold)] rounded-full flex items-center justify-center mx-auto mb-3">
                      <Star className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-yellow-600 mb-1">1,250</div>
                    <div className="text-sm text-yellow-700 font-medium">HealCoins Earned</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                    <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Trophy className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-purple-600 mb-1">15</div>
                    <div className="text-sm text-purple-700 font-medium">Global Rank</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200">
                    <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-orange-600 mb-1">12</div>
                    <div className="text-sm text-orange-700 font-medium">Trees Planted</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Account Information */}
            <Card className="bg-gradient-to-br from-white to-blue-50 border-blue-200 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="pb-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-3 text-2xl font-bold text-gray-800">
                    <div className="p-2 bg-blue-500 rounded-full">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <span>Account Information</span>
                  </CardTitle>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300">
                    <Edit3 className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                    <label className="text-xs text-gray-500 uppercase font-semibold mb-2 block">Display Name</label>
                    <div className="text-lg font-semibold text-gray-900">{user?.displayName || 'Not set'}</div>
                  </div>
                  <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                    <label className="text-xs text-gray-500 uppercase font-semibold mb-2 block">Email Address</label>
                    <div className="text-lg font-semibold text-gray-900">{user?.email}</div>
                  </div>
                  <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                    <label className="text-xs text-gray-500 uppercase font-semibold mb-2 block">User ID</label>
                    <div className="text-sm font-mono text-gray-700 bg-gray-50 px-3 py-2 rounded-md">{user?.userId || 'demo-user-1'}</div>
                  </div>
                  <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                    <label className="text-xs text-gray-500 uppercase font-semibold mb-2 block">Account Type</label>
                    <ZPBadge variant="outline" className="border-blue-300 text-blue-700 bg-blue-50">{userRole.charAt(0).toUpperCase() + userRole.slice(1)}</ZPBadge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Recent Achievements */}
            <Card className="bg-gradient-to-br from-white to-orange-50 border-orange-200 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center space-x-3 text-2xl font-bold text-gray-800">
                  <div className="p-2 bg-orange-500 rounded-full">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <span>Recent Achievements</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-6 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200 hover:shadow-lg transition-all duration-300">
                    <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center shadow-lg">
                      <Award className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-lg text-gray-800 mb-1">Eco Warrior</div>
                      <div className="text-sm text-green-600 font-medium">Saved 200kg CO₂ • Unlocked 3 days ago</div>
                      <div className="text-xs text-gray-500 mt-1">Keep up the amazing environmental work!</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">+50</div>
                      <div className="text-xs text-green-700">HealCoins</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200 hover:shadow-lg transition-all duration-300">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                      <Star className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-lg text-gray-800 mb-1">First Steps</div>
                      <div className="text-sm text-blue-600 font-medium">Completed first carbon log • Unlocked 1 week ago</div>
                      <div className="text-xs text-gray-500 mt-1">Welcome to your sustainability journey!</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">+25</div>
                      <div className="text-xs text-blue-700">HealCoins</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 p-6 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200 hover:shadow-lg transition-all duration-300">
                    <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center shadow-lg">
                      <TrendingUp className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-lg text-gray-800 mb-1">Rising Star</div>
                      <div className="text-sm text-purple-600 font-medium">Top 10% improvement this month • Unlocked 2 days ago</div>
                      <div className="text-xs text-gray-500 mt-1">Your dedication is paying off!</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-600">+75</div>
                      <div className="text-xs text-purple-700">HealCoins</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}