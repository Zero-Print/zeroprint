'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Smile, Meh, Frown, ArrowLeft, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function MentalHealthTrackerPage() {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [isLogging, setIsLogging] = useState(false);

  const moodOptions = [
    { value: 5, label: 'Excellent', icon: Smile, color: 'text-green-600', bgColor: 'bg-green-100' },
    { value: 4, label: 'Good', icon: Smile, color: 'text-green-500', bgColor: 'bg-green-50' },
    { value: 3, label: 'Okay', icon: Meh, color: 'text-yellow-500', bgColor: 'bg-yellow-50' },
    { value: 2, label: 'Poor', icon: Frown, color: 'text-orange-500', bgColor: 'bg-orange-50' },
    { value: 1, label: 'Very Poor', icon: Frown, color: 'text-red-500', bgColor: 'bg-red-50' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMood === null) return;

    setIsLogging(true);
    
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mood = moodOptions.find(m => m.value === selectedMood);
    alert(`Mood logged: ${mood?.label}\nNote: ${note}\nHealCoins earned: +5 HC`);
    
    setSelectedMood(null);
    setNote('');
    setIsLogging(false);
  };

  return (
    <div className="min-h-screen tracker-bg-mental-health">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="tracker-header">
          <Link href="/trackers" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Trackers
          </Link>
          <h1 className="tracker-header-title">Mental Health Tracker</h1>
          <p className="tracker-header-subtitle">
            Track your daily mood and mental wellness journey
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Mood Logging Form */}
          <Card className="tracker-card">
            <CardHeader>
              <CardTitle>Daily Check-in</CardTitle>
              <CardDescription>How are you feeling today?</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="tracker-form">
                {/* Mood Selection */}
                <div>
                  <label className="tracker-form-label">
                    Your Mood Today
                  </label>
                  <div className="space-y-2">
                    {moodOptions.map((mood) => {
                      const Icon = mood.icon;
                      return (
                        <button
                          key={mood.value}
                          type="button"
                          onClick={() => setSelectedMood(mood.value)}
                          className={`w-full p-4 border rounded-lg flex items-center space-x-4 transition-all ${
                            selectedMood === mood.value
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <div className={`p-2 rounded-lg ${mood.bgColor}`}>
                            <Icon className={`w-5 h-5 ${mood.color}`} />
                          </div>
                          <span className="font-medium">{mood.label}</span>
                          <div className="flex ml-auto">
                            {Array.from({ length: mood.value }, (_, i) => (
                              <div key={i} className={`w-2 h-2 rounded-full ${mood.bgColor.replace('bg-', 'bg-').replace('-50', '-400')} mr-1`} />
                            ))}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Optional Note */}
                <div>
                  <label htmlFor="note" className="tracker-form-label">
                    How are you feeling about your environmental impact? (Optional)
                  </label>
                  <textarea
                    id="note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                    className="tracker-form-input"
                    placeholder="Share your thoughts about your sustainability journey today..."
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={selectedMood === null || isLogging}
                  className="tracker-button-primary w-full"
                >
                  {isLogging ? 'Logging...' : 'Log Mood'}
                </button>
              </form>
            </CardContent>
          </Card>

          {/* Stats and Insights */}
          <div className="space-y-6">
            {/* Current Stats */}
            <Card className="tracker-card">
              <CardHeader>
                <CardTitle>Your Wellness Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Current Streak</span>
                    <span className="font-semibold text-green-600">7 days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Average Mood</span>
                    <span className="font-semibold">4.2/5</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Eco-Mind Score</span>
                    <span className="font-semibold text-purple-600">85/100</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">HealCoins This Week</span>
                    <span className="font-semibold text-blue-600">+35 HC</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mood Trend */}
            <Card className="tracker-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>7-Day Mood Trend</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Today</span>
                    <div className="flex space-x-1">
                      {Array.from({ length: 4 }, (_, i) => (
                        <div key={i} className="w-2 h-2 rounded-full bg-green-400" />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Yesterday</span>
                    <div className="flex space-x-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <div key={i} className="w-2 h-2 rounded-full bg-green-500" />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">2 days ago</span>
                    <div className="flex space-x-1">
                      {Array.from({ length: 3 }, (_, i) => (
                        <div key={i} className="w-2 h-2 rounded-full bg-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Check-ins */}
            <Card className="tracker-card">
              <CardHeader>
                <CardTitle>Recent Check-ins</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <Smile className="w-5 h-5 text-green-600" />
                    <div className="flex-1">
                      <div className="font-medium">Good mood</div>
                      <div className="text-sm text-gray-500">Feeling great about my bike commute! • Yesterday</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <Smile className="w-5 h-5 text-green-600" />
                    <div className="flex-1">
                      <div className="font-medium">Excellent mood</div>
                      <div className="text-sm text-gray-500">Planted trees today, feeling amazing! • 2 days ago</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                    <Meh className="w-5 h-5 text-yellow-600" />
                    <div className="flex-1">
                      <div className="font-medium">Okay mood</div>
                      <div className="text-sm text-gray-500">Need to do more for the environment • 3 days ago</div>
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