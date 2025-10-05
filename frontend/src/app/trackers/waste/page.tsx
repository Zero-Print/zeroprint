'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Recycle, Trash2, Package, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function WasteTrackerPage() {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [isLogging, setIsLogging] = useState(false);

  const wasteCategories = [
    { id: 'plastic', name: 'Plastic', icon: Package, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { id: 'paper', name: 'Paper', icon: Package, color: 'text-green-600', bgColor: 'bg-green-50' },
    { id: 'glass', name: 'Glass', icon: Package, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
    { id: 'organic', name: 'Organic', icon: Package, color: 'text-orange-600', bgColor: 'bg-orange-50' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || !amount) return;

    setIsLogging(true);
    
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const category = wasteCategories.find(c => c.id === selectedCategory);
    alert(`Logged: ${amount}kg of ${category?.name}\nHealCoins earned: +${Math.floor(parseFloat(amount) * 2)}`);
    
    setSelectedCategory('');
    setAmount('');
    setIsLogging(false);
  };

  return (
    <div className="min-h-screen tracker-bg-waste">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="tracker-header">
          <Link href="/trackers" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Trackers
          </Link>
          <h1 className="tracker-header-title">Waste Management Tracker</h1>
          <p className="tracker-header-subtitle">
            Track your waste reduction, recycling, and composting efforts
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Logging Form */}
          <Card className="tracker-card">
            <CardHeader>
              <CardTitle>Log Your Waste</CardTitle>
              <CardDescription>Record your waste management activities</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="tracker-form">
                {/* Waste Category Selection */}
                <div>
                  <label className="tracker-form-label">
                    Waste Category
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {wasteCategories.map((category) => {
                      const Icon = category.icon;
                      return (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => setSelectedCategory(category.id)}
                          className={`p-4 border rounded-lg flex flex-col items-center space-y-2 transition-all ${
                            selectedCategory === category.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <div className={`p-2 rounded-lg ${category.bgColor}`}>
                            <Icon className={`w-5 h-5 ${category.color}`} />
                          </div>
                          <span className="text-sm font-medium">{category.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Amount Input */}
                <div>
                  <label htmlFor="amount" className="tracker-form-label">
                    Amount (kg)
                  </label>
                  <input
                    type="number"
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="tracker-form-input"
                    placeholder="Enter amount in kilograms"
                    min="0"
                    step="0.1"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!selectedCategory || !amount || isLogging}
                  className="tracker-button-primary w-full"
                >
                  {isLogging ? 'Logging...' : 'Log Waste Activity'}
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
                    <span className="text-gray-600">Total Waste Reduced</span>
                    <span className="font-semibold">12.5 kg</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Recycled</span>
                    <span className="font-semibold text-blue-600">8.2 kg</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Composted</span>
                    <span className="font-semibold text-green-600">3.1 kg</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">HealCoins Earned</span>
                    <span className="font-semibold text-blue-600">+25 HC</span>
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
                    <Recycle className="w-5 h-5 text-blue-600" />
                    <div className="flex-1">
                      <div className="font-medium">Recycled plastic</div>
                      <div className="text-sm text-gray-500">4.2 kg • 2 hours ago</div>
                    </div>
                    <div className="text-blue-600 font-semibold">+8 HC</div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <Trash2 className="w-5 h-5 text-green-600" />
                    <div className="flex-1">
                      <div className="font-medium">Composted organic waste</div>
                      <div className="text-sm text-gray-500">2.1 kg • Yesterday</div>
                    </div>
                    <div className="text-green-600 font-semibold">+4 HC</div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                    <Package className="w-5 h-5 text-yellow-600" />
                    <div className="flex-1">
                      <div className="font-medium">Recycled paper</div>
                      <div className="text-sm text-gray-500">1.8 kg • 2 days ago</div>
                    </div>
                    <div className="text-yellow-600 font-semibold">+4 HC</div>
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