'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, Bike, Train, Plane, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CarbonTrackerPage() {
  const [selectedMode, setSelectedMode] = useState('');
  const [distance, setDistance] = useState('');
  const [isLogging, setIsLogging] = useState(false);

  const transportModes = [
    { id: 'car', name: 'Car', icon: Car, co2PerKm: 0.21, color: 'text-red-600', bgColor: 'bg-red-50' },
    { id: 'bike', name: 'Bicycle', icon: Bike, co2PerKm: 0, color: 'text-green-600', bgColor: 'bg-green-50' },
    { id: 'train', name: 'Train', icon: Train, co2PerKm: 0.06, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { id: 'plane', name: 'Plane', icon: Plane, co2PerKm: 0.25, color: 'text-purple-600', bgColor: 'bg-purple-50' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMode || !distance) return;

    setIsLogging(true);
    
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mode = transportModes.find(m => m.id === selectedMode);
    const co2 = (parseFloat(distance) * (mode?.co2PerKm || 0)).toFixed(2);
    
    alert(`Logged: ${distance}km by ${mode?.name}\nCO₂ Impact: ${co2}kg\nHealCoins earned: +${Math.floor(parseFloat(distance) * 0.5)}`);
    
    setSelectedMode('');
    setDistance('');
    setIsLogging(false);
  };

  return (
    <div className="min-h-screen tracker-bg-carbon">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="tracker-header">
          <Link href="/trackers" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Trackers
          </Link>
          <h1 className="tracker-header-title">Carbon Footprint Tracker</h1>
          <p className="tracker-header-subtitle">
            Track your transportation choices and monitor your carbon emissions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Logging Form */}
          <Card className="tracker-card">
            <CardHeader>
              <CardTitle>Log Your Journey</CardTitle>
              <CardDescription>Record your transportation details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="tracker-form">
                {/* Transport Mode Selection */}
                <div>
                  <label className="tracker-form-label">
                    Transportation Mode
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {transportModes.map((mode) => {
                      const Icon = mode.icon;
                      return (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() => setSelectedMode(mode.id)}
                          className={`p-4 border rounded-lg flex flex-col items-center space-y-2 transition-all ${
                            selectedMode === mode.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <div className={`p-2 rounded-lg ${mode.bgColor}`}>
                            <Icon className={`w-5 h-5 ${mode.color}`} />
                          </div>
                          <span className="text-sm font-medium">{mode.name}</span>
                          <span className="text-xs text-gray-500">
                            {mode.co2PerKm} kg CO&#8322;/km
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Distance Input */}
                <div>
                  <label htmlFor="distance" className="tracker-form-label">
                    Distance (km)
                  </label>
                  <input
                    type="number"
                    id="distance"
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    className="tracker-form-input"
                    placeholder="Enter distance in kilometers"
                    min="0"
                    step="0.1"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!selectedMode || !distance || isLogging}
                  className="tracker-button-primary w-full"
                >
                  {isLogging ? 'Logging...' : 'Log Journey'}
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
                    <span className="text-gray-600">Total Distance</span>
                    <span className="font-semibold">45.2 km</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">CO&#8322; Emissions</span>
                    <span className="font-semibold text-red-600">8.7 kg</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">CO&#8322; Saved</span>
                    <span className="font-semibold text-green-600">12.5 kg</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">HealCoins Earned</span>
                    <span className="font-semibold text-blue-600">+23 HC</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Journeys */}
            <Card className="tracker-card">
              <CardHeader>
                <CardTitle>Recent Journeys</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <Bike className="w-5 h-5 text-green-600" />
                    <div className="flex-1">
                      <div className="font-medium">Bike to work</div>
                      <div className="text-sm text-gray-500">5.2 km • 2 hours ago</div>
                    </div>
                    <div className="text-green-600 font-semibold">+3 HC</div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <Train className="w-5 h-5 text-blue-600" />
                    <div className="flex-1">
                      <div className="font-medium">Train to city</div>
                      <div className="text-sm text-gray-500">12.0 km • Yesterday</div>
                    </div>
                    <div className="text-blue-600 font-semibold">+6 HC</div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
                    <Car className="w-5 h-5 text-red-600" />
                    <div className="flex-1">
                      <div className="font-medium">Car trip</div>
                      <div className="text-sm text-gray-500">8.5 km • 2 days ago</div>
                    </div>
                    <div className="text-gray-500">1.8 kg CO&#8322;</div>
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