'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CarbonLog } from '@/types';

interface CarbonLogListProps {
  logs: CarbonLog[];
  onEdit?: (log: CarbonLog) => void;
  onDelete?: (logId: string) => void;
  loading?: boolean;
}

export function CarbonLogList({ logs, onEdit, onDelete, loading = false }: CarbonLogListProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      transport: 'bg-blue-100 text-blue-800',
      energy: 'bg-yellow-100 text-yellow-800',
      food: 'bg-green-100 text-green-800',
      waste: 'bg-red-100 text-red-800',
      water: 'bg-cyan-100 text-cyan-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  if (loading) {
    return (
      <div className='space-y-4'>
        {[...Array(3)].map((_, i) => (
          <Card key={i} className='animate-pulse'>
            <CardContent className='p-6'>
              <div className='h-4 bg-gray-200 rounded w-3/4 mb-2'></div>
              <div className='h-3 bg-gray-200 rounded w-1/2'></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <Card>
        <CardContent className='p-6 text-center'>
          <p className='text-gray-500'>No carbon logs found. Start tracking your activities!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-4'>
      {logs.map(log => (
        <Card key={log.logId} className='hover:shadow-md transition-shadow'>
          <CardContent className='p-6'>
            <div className='flex justify-between items-start mb-3'>
              <div className='flex-1'>
                <h3 className='font-semibold text-lg'>{log.transportMode}</h3>
                <p className='text-sm text-gray-600 mt-1'>
                  {formatDate(log.createdAt)} • {log.co2Saved} kg CO₂
                </p>
              </div>
              <div className='flex items-center space-x-2'>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor('transport')}`}
                >
                  transport
                </span>
                <span className='text-sm font-medium text-[#2E7D32]'>
                  {log.co2Saved.toFixed(2)} kg CO₂
                </span>
              </div>
            </div>

            <div className='flex justify-between items-center'>
              <div className='text-xs text-gray-500'>Logged on {formatDate(log.createdAt)}</div>
              <div className='space-x-2'>
                {onEdit && (
                  <Button variant='outline' size='sm' onClick={() => onEdit(log)}>
                    Edit
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => onDelete(log.logId)}
                    className='text-red-600 hover:text-red-700'
                  >
                    Delete
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
