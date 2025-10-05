'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TreePine, Leaf, Sprout, Flower2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function GreenTrackerPage() {
  const [selectedActivity, setSelectedActivity] = useState('');
  const [amount, setAmount] = useState('');
  const [isLogging, setIsLogging] = useState(false);

  const greenActivities = [
    { id: 'tree', name: 'Tree Planting', icon: TreePine, color: 'text-green-600', bgColor: 'bg-green-50' },
    { id: 'garden', name: 'Gardening', icon: Leaf, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
    { id: 'compost', name: 'Composting', icon: Sprout, color: 'text-lime-600', bgColor: 'bg-lime-50' },
    { id: 'other', name: 'Other Green', icon: Flower2, color: 'text-teal-600', bgColor: 'bg-teal-50' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedActivity || !amount) return;

    setIsLogging(true);
    
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const activity = greenActivities.find(a => a.id === selectedActivity);
    alert(`Logged: ${amount} ${activity?.name} activities\nHealCoins earned: +${Math.floor(parseFloat(amount) * 3)}`);
    
    setSelectedActivity('');
    setAmount('');
    setIsLogging(false);
  };

  return (
    <div className="min-h-screen tracker-bg-green">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="tracker-header">
          <Link href="/trackers" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Trackers
          </Link>
          <h1 className="tracker-header-title">Green Initiatives Tracker</h1>
          <p className="tracker-header-subtitle">
            Log tree planting, gardening, and other green activities
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Logging Form */}
          <Card className="tracker-card">
            <CardHeader>
              <CardTitle>Log Your Green Activity</CardTitle>
              <CardDescription>Record your environmental initiatives</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="tracker-form">
                {/* Green Activity Selection */}
                <div>
                  <label className="tracker-form-label">
                    Green Activity
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {greenActivities.map((activity) => {
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
                    Amount/Count
                  </label>
                  <input
                    type="number"
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="tracker-form-input"
                    placeholder="Enter number of activities/trees"
                    min="0"
                    step="1"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!selectedActivity || !amount || isLogging}
                  className="tracker-button-primary w-full"
                >
                  {isLogging ? 'Logging...' : 'Log Green Activity'}
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
                    <span className="text-gray-600">Trees Planted</span>
                    <span className="font-semibold">5 trees</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Gardening Activities</span>
                    <span className="font-semibold text-green-600">12 activities</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Composting Started</span>
                    <span className="font-semibold text-lime-600">1 compost</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">HealCoins Earned</span>
                    <span className="font-semibold text-blue-600">+45 HC</span>
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
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <TreePine className="w-5 h-5 text-green-600" />
                    <div className="flex-1">
                      <div className="font-medium">Planted fruit trees</div>
                      <div className="text-sm text-gray-500">3 trees • 2 hours ago</div>
                    </div>
                    <div className="text-green-600 font-semibold">+9 HC</div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-emerald-50 rounded-lg">
                    <Leaf className="w-5 h-5 text-emerald-600" />
                    <div className="flex-1">
                      <div className="font-medium">Started vegetable garden</div>
                      <div className="text-sm text-gray-500">1 garden • Yesterday</div>
                    </div>
                    <div className="text-emerald-600 font-semibold">+12 HC</div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-lime-50 rounded-lg">
                    <Sprout className="w-5 h-5 text-lime-600" />
                    <div className="flex-1">
                      <div className="font-medium">Started composting</div>
                      <div className="text-sm text-gray-500">1 compost bin • 2 days ago</div>
                    </div>
                    <div className="text-lime-600 font-semibold">+15 HC</div>
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