'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CarbonLogFormData } from '@/types';

interface TransportTrackerProps {
  onSubmit: (data: CarbonLogFormData) => Promise<void>;
  loading?: boolean;
}

export function TransportTracker({ onSubmit, loading = false }: TransportTrackerProps) {
  const [formData, setFormData] = useState({
    mode: 'car',
    distance: 0,
    fuelType: 'petrol',
    passengers: 1,
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.distance <= 0) {
      setError('Distance must be greater than 0');
      return;
    }

    try {
      const carbonData: CarbonLogFormData = {
        activity: `${formData.mode} travel - ${formData.distance}km`,
        category: 'transport',
        amount: formData.distance,
        unit: 'km',
        description: `${formData.mode} (${formData.fuelType}, ${formData.passengers} passengers) - ${formData.description}`,
        date: formData.date,
      };

      await onSubmit(carbonData);

      // Reset form
      setFormData({
        mode: 'car',
        distance: 0,
        fuelType: 'petrol',
        passengers: 1,
        description: '',
        date: new Date().toISOString().split('T')[0],
      });
    } catch (error: any) {
      setError(error.message || 'Failed to log transport activity');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>🚗 Transport Tracker</CardTitle>
        <CardDescription>Log your daily transportation activities</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-4'>
          {error && (
            <div className='p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md'>
              {error}
            </div>
          )}

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='mode'>Transport Mode</Label>
              <select
                id='mode'
                value={formData.mode}
                onChange={e => setFormData(prev => ({ ...prev, mode: e.target.value }))}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2E7D32]'
              >
                <option value='car'>Car</option>
                <option value='bike'>Bike/Motorcycle</option>
                <option value='bus'>Bus</option>
                <option value='train'>Train</option>
                <option value='metro'>Metro</option>
                <option value='auto'>Auto Rickshaw</option>
                <option value='taxi'>Taxi/Cab</option>
                <option value='flight'>Flight</option>
                <option value='walking'>Walking</option>
                <option value='cycling'>Cycling</option>
              </select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='distance'>Distance (km)</Label>
              <Input
                id='distance'
                type='number'
                step='0.1'
                min='0'
                value={formData.distance}
                onChange={e =>
                  setFormData(prev => ({ ...prev, distance: parseFloat(e.target.value) || 0 }))
                }
                placeholder='0.0'
                required
              />
            </div>

            {['car', 'bike', 'taxi'].includes(formData.mode) && (
              <div className='space-y-2'>
                <Label htmlFor='fuelType'>Fuel Type</Label>
                <select
                  id='fuelType'
                  value={formData.fuelType}
                  onChange={e => setFormData(prev => ({ ...prev, fuelType: e.target.value }))}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2E7D32]'
                >
                  <option value='petrol'>Petrol</option>
                  <option value='diesel'>Diesel</option>
                  <option value='cng'>CNG</option>
                  <option value='electric'>Electric</option>
                  <option value='hybrid'>Hybrid</option>
                </select>
              </div>
            )}

            <div className='space-y-2'>
              <Label htmlFor='passengers'>Passengers</Label>
              <Input
                id='passengers'
                type='number'
                min='1'
                max='50'
                value={formData.passengers}
                onChange={e =>
                  setFormData(prev => ({ ...prev, passengers: parseInt(e.target.value) || 1 }))
                }
                required
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='date'>Date</Label>
              <Input
                id='date'
                type='date'
                value={formData.date}
                onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='description'>Additional Notes</Label>
            <textarea
              id='description'
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder='Trip purpose, route details, etc.'
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2E7D32] min-h-[60px]'
            />
          </div>

          <Button
            type='submit'
            className='w-full bg-[#2E7D32] hover:bg-[#1B5E20]'
            disabled={loading}
          >
            {loading ? 'Logging...' : 'Log Transport Activity'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
