'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface MoodEntry {
  mood: number; // 1-5 scale
  ecoAnxiety: number; // 1-5 scale
  natureConnection: number; // 1-5 scale
  sustainabilityMotivation: number; // 1-5 scale
  notes: string;
  date: string;
}

interface MoodTrackerProps {
  onSubmit: (data: MoodEntry) => Promise<void>;
  loading?: boolean;
}

export function MoodTracker({ onSubmit, loading = false }: MoodTrackerProps) {
  const [formData, setFormData] = useState<MoodEntry>({
    mood: 3,
    ecoAnxiety: 3,
    natureConnection: 3,
    sustainabilityMotivation: 3,
    notes: '',
    date: new Date().toISOString().split('T')[0],
  });

  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await onSubmit(formData);

      // Reset form
      setFormData({
        mood: 3,
        ecoAnxiety: 3,
        natureConnection: 3,
        sustainabilityMotivation: 3,
        notes: '',
        date: new Date().toISOString().split('T')[0],
      });
    } catch (error: any) {
      setError(error.message || 'Failed to log mood entry');
    }
  };

  const MoodScale = ({
    label,
    value,
    onChange,
    lowLabel,
    highLabel,
  }: {
    label: string;
    value: number;
    onChange: (value: number) => void;
    lowLabel: string;
    highLabel: string;
  }) => (
    <div className='space-y-3'>
      <Label className='text-sm font-medium'>{label}</Label>
      <div className='flex items-center space-x-2'>
        <span className='text-xs text-gray-500 w-16'>{lowLabel}</span>
        <div className='flex space-x-1 flex-1 justify-center'>
          {[1, 2, 3, 4, 5].map(num => (
            <button
              key={num}
              type='button'
              onClick={() => onChange(num)}
              className={`w-8 h-8 rounded-full border-2 transition-colors ${
                value === num
                  ? 'bg-[#2E7D32] border-[#2E7D32] text-white'
                  : 'border-gray-300 hover:border-[#2E7D32]'
              }`}
            >
              {num}
            </button>
          ))}
        </div>
        <span className='text-xs text-gray-500 w-16 text-right'>{highLabel}</span>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>🧠 Eco-Mind Tracker</CardTitle>
        <CardDescription>Track your mental well-being and environmental mindset</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-6'>
          {error && (
            <div className='p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md'>
              {error}
            </div>
          )}

          <MoodScale
            label='Overall Mood'
            value={formData.mood}
            onChange={value => setFormData(prev => ({ ...prev, mood: value }))}
            lowLabel='Very Low'
            highLabel='Very High'
          />

          <MoodScale
            label='Eco-Anxiety Level'
            value={formData.ecoAnxiety}
            onChange={value => setFormData(prev => ({ ...prev, ecoAnxiety: value }))}
            lowLabel='None'
            highLabel='Severe'
          />

          <MoodScale
            label='Nature Connection'
            value={formData.natureConnection}
            onChange={value => setFormData(prev => ({ ...prev, natureConnection: value }))}
            lowLabel='Disconnected'
            highLabel='Very Connected'
          />

          <MoodScale
            label='Sustainability Motivation'
            value={formData.sustainabilityMotivation}
            onChange={value => setFormData(prev => ({ ...prev, sustainabilityMotivation: value }))}
            lowLabel='Very Low'
            highLabel='Very High'
          />

          <div className='space-y-2'>
            <Label htmlFor='date'>Date</Label>
            <input
              id='date'
              type='date'
              value={formData.date}
              onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2E7D32]'
              required
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='notes'>Reflection Notes</Label>
            <textarea
              id='notes'
              value={formData.notes}
              onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder='How are you feeling about the environment today? Any specific concerns or positive thoughts?'
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2E7D32] min-h-[80px]'
            />
          </div>

          <Button
            type='submit'
            className='w-full bg-[#2E7D32] hover:bg-[#1B5E20]'
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Log Mood Entry'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
