'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CarbonLog, CarbonLogFormData } from '@/types';

interface CarbonLogFormProps {
  onSubmit: (data: CarbonLogFormData) => Promise<void>;
  initialData?: Partial<CarbonLogFormData>;
  loading?: boolean;
}

export function CarbonLogForm({ onSubmit, initialData, loading = false }: CarbonLogFormProps) {
  const [formData, setFormData] = useState<CarbonLogFormData>({
    activity: initialData?.activity || '',
    category: initialData?.category || 'transport',
    amount: initialData?.amount || 0,
    unit: initialData?.unit || 'km',
    description: initialData?.description || '',
    date: initialData?.date || new Date().toISOString().split('T')[0],
  });

  const [error, setError] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.activity.trim()) {
      setError('Activity is required');
      return;
    }

    if (formData.amount <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error: any) {
      setError(error.message || 'Failed to save carbon log');
    }
  };

  return (
    <Card className='w-full max-w-2xl mx-auto'>
      <CardHeader>
        <CardTitle>Log Carbon Activity</CardTitle>
        <CardDescription>
          Track your daily activities and their environmental impact
        </CardDescription>
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
              <Label htmlFor='activity'>Activity</Label>
              <Input
                id='activity'
                name='activity'
                value={formData.activity}
                onChange={handleChange}
                placeholder='e.g., Car ride to work'
                required
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='category'>Category</Label>
              <select
                id='category'
                name='category'
                value={formData.category}
                onChange={handleChange}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2E7D32]'
                required
              >
                <option value='transport'>Transport</option>
                <option value='energy'>Energy</option>
                <option value='food'>Food</option>
                <option value='waste'>Waste</option>
                <option value='water'>Water</option>
                <option value='other'>Other</option>
              </select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='amount'>Amount</Label>
              <Input
                id='amount'
                name='amount'
                type='number'
                step='0.01'
                min='0'
                value={formData.amount}
                onChange={handleChange}
                placeholder='0.00'
                required
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='unit'>Unit</Label>
              <select
                id='unit'
                name='unit'
                value={formData.unit}
                onChange={handleChange}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2E7D32]'
                required
              >
                <option value='km'>Kilometers</option>
                <option value='kwh'>kWh</option>
                <option value='liters'>Liters</option>
                <option value='kg'>Kilograms</option>
                <option value='hours'>Hours</option>
                <option value='units'>Units</option>
              </select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='date'>Date</Label>
              <Input
                id='date'
                name='date'
                type='date'
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='description'>Description (Optional)</Label>
            <textarea
              id='description'
              name='description'
              value={formData.description}
              onChange={handleChange}
              placeholder='Additional details about this activity...'
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2E7D32] min-h-[80px]'
            />
          </div>

          <Button
            type='submit'
            className='w-full bg-[#2E7D32] hover:bg-[#1B5E20]'
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Log Activity'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
