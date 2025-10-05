'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Sun, Wind, Home, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EnergyTrackerPage() {
  const [selectedSource, setSelectedSource] = useState('');
  const [consumption, setConsumption] = useState('');
  const [isLogging, setIsLogging] = useState(false);

  const energySources = [
    { id: 'solar', name: 'Solar', icon: Sun, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
    { id: 'wind', name: 'Wind', icon: Wind, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { id: 'grid', name: 'Grid', icon: Zap, color: 'text-purple-600', bgColor: 'bg-purple-50' },
    { id: 'home', name: 'Home Generation', icon: Home, color: 'text-green-600', bgColor: 'bg-green-50' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSource || !consumption) return;

    setIsLogging(true);
    
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const source = energySources.find(s => s.id === selectedSource);
    alert(`Logged: ${consumption}kWh from ${source?.name}\nHealCoins earned: +${Math.floor(parseFloat(consumption) * 0.5)}`);
    
    setSelectedSource('');
    setConsumption('');
    setIsLogging(false);
  };

  return (
    <div className="min-h-screen tracker-bg-energy">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="tracker-header">
          <Link href="/trackers" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Trackers
          </Link>
          <h1 className="tracker-header-title">Energy Usage Tracker</h1>
          <p className="tracker-header-subtitle">
            Monitor your energy consumption and renewable energy adoption
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Logging Form */}
          <Card className="tracker-card">
            <CardHeader>
              <CardTitle>Log Your Energy</CardTitle>
              <CardDescription>Record your energy consumption and generation</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="tracker-form">
                {/* Energy Source Selection */}
                <div>
                  <label className="tracker-form-label">
                    Energy Source
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {energySources.map((source) => {
                      const Icon = source.icon;
                      return (
                        <button
                          key={source.id}
                          type="button"
                          onClick={() => setSelectedSource(source.id)}
                          className={`p-4 border rounded-lg flex flex-col items-center space-y-2 transition-all ${
                            selectedSource === source.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <div className={`p-2 rounded-lg ${source.bgColor}`}>
                            <Icon className={`w-5 h-5 ${source.color}`} />
                          </div>
                          <span className="text-sm font-medium">{source.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Consumption Input */}
                <div>
                  <label htmlFor="consumption" className="tracker-form-label">
                    Energy (kWh)
                  </label>
                  <input
                    type="number"
                    id="consumption"
                    value={consumption}
                    onChange={(e) => setConsumption(e.target.value)}
                    className="tracker-form-input"
                    placeholder="Enter energy in kilowatt-hours"
                    min="0"
                    step="0.1"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!selectedSource || !consumption || isLogging}
                  className="tracker-button-primary w-full"
                >
                  {isLogging ? 'Logging...' : 'Log Energy Activity'}
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
                    <span className="text-gray-600">Total Consumption</span>
                    <span className="font-semibold">125.4 kWh</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Renewable Energy</span>
                    <span className="font-semibold text-yellow-600">45.0 kWh</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Grid Energy</span>
                    <span className="font-semibold text-purple-600">80.4 kWh</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">HealCoins Earned</span>
                    <span className="font-semibold text-blue-600">+63 HC</span>
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
                  <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                    <Sun className="w-5 h-5 text-yellow-600" />
                    <div className="flex-1">
                      <div className="font-medium">Solar energy generated</div>
                      <div className="text-sm text-gray-500">15.2 kWh • 2 hours ago</div>
                    </div>
                    <div className="text-yellow-600 font-semibold">+8 HC</div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                    <Zap className="w-5 h-5 text-purple-600" />
                    <div className="flex-1">
                      <div className="font-medium">Grid electricity used</div>
                      <div className="text-sm text-gray-500">22.5 kWh • Yesterday</div>
                    </div>
                    <div className="text-purple-600 font-semibold">-11 HC</div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <Wind className="w-5 h-5 text-blue-600" />
                    <div className="flex-1">
                      <div className="font-medium">Wind energy used</div>
                      <div className="text-sm text-gray-500">8.3 kWh • 2 days ago</div>
                    </div>
                    <div className="text-blue-600 font-semibold">+4 HC</div>
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