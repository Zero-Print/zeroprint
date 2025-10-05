'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface KindnessAction {
  actionType: string;
  description: string;
  location: string;
  animalsHelped: number;
  timeSpent: number; // in minutes
  photos?: string[];
  date: string;
}

interface KindnessTrackerProps {
  onSubmit: (data: KindnessAction) => Promise<void>;
  loading?: boolean;
}

export function KindnessTracker({ onSubmit, loading = false }: KindnessTrackerProps) {
  const [formData, setFormData] = useState<KindnessAction>({
    actionType: 'feeding',
    description: '',
    location: '',
    animalsHelped: 1,
    timeSpent: 15,
    date: new Date().toISOString().split('T')[0],
  });

  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.description.trim()) {
      setError('Please describe your kindness action');
      return;
    }

    try {
      await onSubmit(formData);

      // Reset form
      setFormData({
        actionType: 'feeding',
        description: '',
        location: '',
        animalsHelped: 1,
        timeSpent: 15,
        date: new Date().toISOString().split('T')[0],
      });
    } catch (error: any) {
      setError(error.message || 'Failed to log kindness action');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>🐾 Kindness Tracker</CardTitle>
        <CardDescription>Log your acts of kindness towards animals</CardDescription>
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
              <Label htmlFor='actionType'>Action Type</Label>
              <select
                id='actionType'
                value={formData.actionType}
                onChange={e => setFormData(prev => ({ ...prev, actionType: e.target.value }))}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2E7D32]'
              >
                <option value='feeding'>Feeding Animals</option>
                <option value='rescue'>Animal Rescue</option>
                <option value='shelter'>Shelter Volunteering</option>
                <option value='medical'>Medical Care</option>
                <option value='adoption'>Adoption Facilitation</option>
                <option value='awareness'>Awareness Campaign</option>
                <option value='donation'>Donation</option>
                <option value='cleanup'>Habitat Cleanup</option>
                <option value='other'>Other</option>
              </select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='animalsHelped'>Animals Helped</Label>
              <Input
                id='animalsHelped'
                type='number'
                min='1'
                value={formData.animalsHelped}
                onChange={e =>
                  setFormData(prev => ({ ...prev, animalsHelped: parseInt(e.target.value) || 1 }))
                }
                required
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='timeSpent'>Time Spent (minutes)</Label>
              <Input
                id='timeSpent'
                type='number'
                min='1'
                value={formData.timeSpent}
                onChange={e =>
                  setFormData(prev => ({ ...prev, timeSpent: parseInt(e.target.value) || 15 }))
                }
                required
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='location'>Location</Label>
              <Input
                id='location'
                value={formData.location}
                onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder='Where did this happen?'
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
            <Label htmlFor='description'>Description</Label>
            <textarea
              id='description'
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder='Describe your act of kindness in detail...'
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2E7D32] min-h-[80px]'
              required
            />
          </div>

          <Button
            type='submit'
            className='w-full bg-[#2E7D32] hover:bg-[#1B5E20]'
            disabled={loading}
          >
            {loading ? 'Logging...' : 'Log Kindness Action'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
