'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Droplets, Waves, Coffee, Utensils, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function WaterTrackerPage() {
  const [selectedActivity, setSelectedActivity] = useState('');
  const [amount, setAmount] = useState('');
  const [isLogging, setIsLogging] = useState(false);

  const waterActivities = [
    { id: 'shower', name: 'Shower', icon: Waves, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { id: 'drinking', name: 'Drinking', icon: Droplets, color: 'text-cyan-600', bgColor: 'bg-cyan-50' },
    { id: 'cooking', name: 'Cooking', icon: Utensils, color: 'text-purple-600', bgColor: 'bg-purple-50' },
    { id: 'cleaning', name: 'Cleaning', icon: Droplets, color: 'text-teal-600', bgColor: 'bg-teal-50' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedActivity || !amount) return;

    setIsLogging(true);
    
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const activity = waterActivities.find(a => a.id === selectedActivity);
    alert(`Logged: ${amount}L for ${activity?.name}\nHealCoins earned: +${Math.floor(parseFloat(amount) * 0.2)}`);
    
    setSelectedActivity('');
    setAmount('');
    setIsLogging(false);
  };

  return (
    <div className="min-h-screen tracker-bg-water">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="tracker-header">
          <Link href="/trackers" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Trackers
          </Link>
          <h1 className="tracker-header-title">Water Conservation Tracker</h1>
          <p className="tracker-header-subtitle">
            Track your water usage and conservation activities
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Logging Form */}
          <Card className="tracker-card">
            <CardHeader>
              <CardTitle>Log Your Water Usage</CardTitle>
              <CardDescription>Record your water consumption activities</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="tracker-form">
                {/* Water Activity Selection */}
                <div>
                  <label className="tracker-form-label">
                    Water Activity
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {waterActivities.map((activity) => {
                      const Icon = activity.icon;
                      return (
                        <button
                          key={activity.id}
                          type="button"
                          onClick={() => setSelectedActivity(activity.id)}
                          className={`p-4 border rounded-lg flex flex-col items-center space-y-2 transition-all ${
                            selectedActivity === activity.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <div className={`p-2 rounded-lg ${activity.bgColor}`}>
                            <Icon className={`w-5 h-5 ${activity.color}`} />
                          </div>
                          <span className="text-sm font-medium">{activity.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Amount Input */}
                <div>
                  <label htmlFor="amount" className="tracker-form-label">
                    Amount (L)
                  </label>
                  <input
                    type="number"
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="tracker-form-input"
                    placeholder="Enter amount in liters"
                    min="0"
                    step="0.1"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!selectedActivity || !amount || isLogging}
                  className="tracker-button-primary w-full"
                >
                  {isLogging ? 'Logging...' : 'Log Water Activity'}
                </button>
              </form>
            </CardContent>
          </Card>

          {/* Stats and Impact */}
          <div className="space-y-6">
            {/* Weekly Stats */}
            <Card className="tracker-card">
              <CardHeader>
                <CardTitle>This Week&#8217;s Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Water Used</span>
                    <span className="font-semibold">85.6 L</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Conserved</span>
                    <span className="font-semibold text-cyan-600">120 L</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Average per Day</span>
                    <span className="font-semibold text-blue-600">12.2 L</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">HealCoins Earned</span>
                    <span className="font-semibold text-blue-600">+17 HC</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activities */}
            <Card className="tracker-card">
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <Waves className="w-5 h-5 text-blue-600" />
                    <div className="flex-1">
                      <div className="font-medium">Quick shower</div>
                      <div className="text-sm text-gray-500">15.2 L • 2 hours ago</div>
                    </div>
                    <div className="text-blue-600 font-semibold">+3 HC</div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-cyan-50 rounded-lg">
                    <Droplets className="w-5 h-5 text-cyan-600" />
                    <div className="flex-1">
                      <div className="font-medium">Drinking water</div>
                      <div className="text-sm text-gray-500">2.5 L • Yesterday</div>
                    </div>
                    <div className="text-cyan-600 font-semibold">+1 HC</div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                    <Utensils className="w-5 h-5 text-purple-600" />
                    <div className="flex-1">
                      <div className="font-medium">Cooking with water</div>
                      <div className="text-sm text-gray-500">8.3 L • 2 days ago</div>
                    </div>
                    <div className="text-purple-600 font-semibold">+2 HC</div>
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