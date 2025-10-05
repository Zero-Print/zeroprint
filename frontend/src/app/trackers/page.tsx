'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Car, 
  Brain, 
  Heart, 
  Recycle, 
  Zap, 
  Droplets,
  TreePine,
  ArrowRight
} from 'lucide-react';

interface TrackerCard {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  href: string;
  color: string;
  bgColor: string;
  stats?: {
    label: string;
    value: string;
  };
}

export default function TrackersPage() {
  const trackers: TrackerCard[] = [
    {
      title: 'Carbon Footprint',
      description: 'Track your daily carbon emissions and see your environmental impact',
      icon: Car,
      href: '/trackers/carbon',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      stats: {
        label: 'This Week',
        value: '12.5 kg CO₂'
      }
    },
    {
      title: 'Mental Health',
      description: 'Monitor your mood and mental wellness with daily check-ins',
      icon: Brain,
      href: '/trackers/mental-health',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      stats: {
        label: 'Current Score',
        value: '78/100'
      }
    },
    {
      title: 'Animal Welfare',
      description: 'Log your animal-friendly actions and kindness activities',
      icon: Heart,
      href: '/trackers/animal-welfare',
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      stats: {
        label: 'Actions This Month',
        value: '12 acts'
      }
    },
    {
      title: 'Waste Management',
      description: 'Track your waste reduction, recycling, and composting efforts',
      icon: Recycle,
      href: '/trackers/waste',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      stats: {
        label: 'Recycled This Week',
        value: '8.2 kg'
      }
    },
    {
      title: 'Energy Usage',
      description: 'Monitor your energy consumption and renewable energy adoption',
      icon: Zap,
      href: '/trackers/energy',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      stats: {
        label: 'Solar Energy Used',
        value: '45 kWh'
      }
    },
    {
      title: 'Water Conservation',
      description: 'Track your water usage and conservation activities',
      icon: Droplets,
      href: '/trackers/water',
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      stats: {
        label: 'Water Saved',
        value: '120 L'
      }
    },
    {
      title: 'Green Initiatives',
      description: 'Log tree planting, gardening, and other green activities',
      icon: TreePine,
      href: '/trackers/green',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      stats: {
        label: 'Trees Planted',
        value: '5 trees'
      }
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-full">
              <Recycle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Environmental Trackers
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Monitor your environmental impact across different categories and earn HealCoins for your sustainable actions
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="zp-card p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500 rounded-full">
                <TreePine className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600">234.5</div>
                <div className="text-sm text-green-700 font-medium">Total CO₂ Saved (kg)</div>
              </div>
            </div>
          </div>
          <div className="zp-card p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-[var(--zp-healcoin-gold)] rounded-full">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-3xl font-bold zp-text-healcoin">1,250</div>
                <div className="text-sm text-yellow-700 font-medium">HealCoins Earned</div>
              </div>
            </div>
          </div>
          <div className="zp-card p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-500 rounded-full">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600">89</div>
                <div className="text-sm text-purple-700 font-medium">Activities Logged</div>
              </div>
            </div>
          </div>
          <div className="zp-card p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-500 rounded-full">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-600">15</div>
                <div className="text-sm text-orange-700 font-medium">Day Streak</div>
              </div>
            </div>
          </div>
        </div>

      {/* Tracker Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {trackers.map((tracker) => {
          const Icon = tracker.icon;
          return (
            <Link key={tracker.title} href={tracker.href}>
              <Card className="h-full hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group zp-card border-0 bg-gradient-to-br from-white to-gray-50">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-4 rounded-xl ${tracker.bgColor} shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                      <Icon className={`w-8 h-8 ${tracker.color}`} />
                    </div>
                    <div className="p-2 rounded-full bg-gray-100 group-hover:bg-gray-200 transition-colors duration-300">
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-800 group-hover:text-gray-900">{tracker.title}</CardTitle>
                  <CardDescription className="text-gray-600 leading-relaxed">
                    {tracker.description}
                  </CardDescription>
                </CardHeader>
                {tracker.stats && (
                  <CardContent className="pt-0">
                    <div className={`p-4 ${tracker.bgColor} rounded-xl border border-opacity-20`}>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">{tracker.stats.label}</span>
                        <span className={`font-bold text-lg ${tracker.color}`}>
                          {tracker.stats.value}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Recent Activity */}
      <Card className="mt-12 zp-card bg-gradient-to-br from-white to-blue-50 border-blue-200 zp-shadow-card">
        <CardHeader className="pb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500 rounded-full">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-800">Recent Tracking Activity</CardTitle>
              <CardDescription className="text-gray-600">Your latest environmental actions</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-6 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200 hover:shadow-lg transition-all duration-300">
              <div className="p-3 bg-green-600 rounded-full shadow-lg">
                <Car className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-800 text-lg">Cycled to work</div>
                <div className="text-sm text-green-700 font-medium">Saved 2.5 kg CO₂ • 2 hours ago</div>
              </div>
              <div className="text-green-600 font-bold text-xl">+10 HC</div>
            </div>
            
            <div className="flex items-center space-x-4 p-6 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200 hover:shadow-lg transition-all duration-300">
              <div className="p-3 bg-purple-600 rounded-full shadow-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-800 text-lg">Daily mood check-in</div>
                <div className="text-sm text-purple-700 font-medium">Feeling great about sustainability • 5 hours ago</div>
              </div>
              <div className="text-purple-600 font-bold text-xl">+5 HC</div>
            </div>
            
            <div className="flex items-center space-x-4 p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200 hover:shadow-lg transition-all duration-300">
              <div className="p-3 bg-blue-600 rounded-full shadow-lg">
                <Recycle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-800 text-lg">Recycled plastic bottles</div>
                <div className="text-sm text-blue-700 font-medium">5 bottles recycled • Yesterday</div>
              </div>
              <div className="text-blue-600 font-bold text-xl">+8 HC</div>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}