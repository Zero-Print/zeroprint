'use client';

import { useState } from 'react';
import { useAuth } from '@/modules/auth';
import { api } from '@/lib/api';
import { ZPCard } from '@/components/ui/ZPCard';
import { ZPButton } from '@/components/ui/ZPButton';
import { ZPBadge } from '@/components/ui/ZPBadge';
import { Download, FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface ExportRequest {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requestedAt: string;
  completedAt?: string;
  downloadUrl?: string;
  expiresAt?: string;
  dataTypes: string[];
}

export default function DataExportPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [exportRequests, setExportRequests] = useState<ExportRequest[]>([]);
  const [selectedDataTypes, setSelectedDataTypes] = useState<string[]>([
    'profile',
    'wallet',
    'trackers',
    'activities',
  ]);

  const dataTypeOptions = [
    {
      id: 'profile',
      label: 'Profile Information',
      description: 'Basic account details and preferences',
    },
    {
      id: 'wallet',
      label: 'Wallet & Transactions',
      description: 'Payment history and wallet balance',
    },
    {
      id: 'trackers',
      label: 'Tracker Data',
      description: 'Carbon footprint and mental health logs',
    },
    { id: 'activities', label: 'Activity Logs', description: 'App usage and interaction history' },
    { id: 'games', label: 'Game Progress', description: 'Game scores and achievements' },
    {
      id: 'subscriptions',
      label: 'Subscription History',
      description: 'Plan subscriptions and billing',
    },
  ];

  const handleDataTypeToggle = (dataType: string) => {
    setSelectedDataTypes(prev =>
      prev.includes(dataType) ? prev.filter(type => type !== dataType) : [...prev, dataType]
    );
  };

  const handleExportRequest = async () => {
    if (!user || selectedDataTypes.length === 0) return;

    setLoading(true);
    try {
      const response = await api.account.exportData({
        format: 'json',
      });

      // Add new export request to the list
      const newRequest: ExportRequest = {
        id: response.data?.downloadUrl || 'export_' + Date.now(),
        status: 'pending',
        requestedAt: new Date().toISOString(),
        dataTypes: selectedDataTypes,
      };

      setExportRequests(prev => [newRequest, ...prev]);

      // Show success message
      alert('Data export request submitted successfully. You will receive an email when ready.');
    } catch (error) {
      console.error('Export request failed:', error);
      alert('Failed to submit export request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (request: ExportRequest) => {
    if (!request.downloadUrl) return;

    try {
      const response = await fetch(request.downloadUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `zeroprint-data-export-${request.id}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    }
  };

  const getStatusIcon = (status: ExportRequest['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className='w-4 h-4 text-yellow-500' />;
      case 'processing':
        return <Clock className='w-4 h-4 text-blue-500 animate-spin' />;
      case 'completed':
        return <CheckCircle className='w-4 h-4 text-green-500' />;
      case 'failed':
        return <AlertCircle className='w-4 h-4 text-red-500' />;
    }
  };

  const getStatusColor = (status: ExportRequest['status']) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'processing':
        return 'info';
      case 'completed':
        return 'success';
      case 'failed':
        return 'danger';
    }
  };

  return (
    <div className='container mx-auto px-4 py-8 max-w-4xl'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>Data Export</h1>
        <p className='text-gray-600'>
          Export your personal data in compliance with DPDP regulations. You can request a copy of
          all data associated with your account.
        </p>
      </div>

      {/* New Export Request */}
      <ZPCard className='mb-8'>
        <div className='p-6'>
          <h2 className='text-xl font-semibold mb-4 flex items-center'>
            <FileText className='w-5 h-5 mr-2' />
            Request Data Export
          </h2>

          <div className='mb-6'>
            <h3 className='text-sm font-medium text-gray-700 mb-3'>Select data to export:</h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
              {dataTypeOptions.map(option => (
                <label
                  key={option.id}
                  className='flex items-start space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50'
                >
                  <input
                    type='checkbox'
                    checked={selectedDataTypes.includes(option.id)}
                    onChange={() => handleDataTypeToggle(option.id)}
                    className='mt-1'
                  />
                  <div>
                    <div className='font-medium text-sm'>{option.label}</div>
                    <div className='text-xs text-gray-500'>{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6'>
            <h4 className='font-medium text-blue-900 mb-2'>Important Information:</h4>
            <ul className='text-sm text-blue-800 space-y-1'>
              <li>• Export requests are processed within 30 days as per DPDP regulations</li>
              <li>• You will receive an email notification when your export is ready</li>
              <li>• Download links expire after 7 days for security reasons</li>
              <li>• Data is exported in JSON format within a ZIP archive</li>
            </ul>
          </div>

          <ZPButton
            onClick={handleExportRequest}
            disabled={loading || selectedDataTypes.length === 0}
            className='w-full md:w-auto'
          >
            {loading ? 'Submitting Request...' : 'Request Data Export'}
          </ZPButton>
        </div>
      </ZPCard>

      {/* Export History */}
      <ZPCard>
        <div className='p-6'>
          <h2 className='text-xl font-semibold mb-4'>Export History</h2>

          {exportRequests.length === 0 ? (
            <div className='text-center py-8 text-gray-500'>
              <FileText className='w-12 h-12 mx-auto mb-3 opacity-50' />
              <p>No export requests yet</p>
            </div>
          ) : (
            <div className='space-y-4'>
              {exportRequests.map(request => (
                <div
                  key={request.id}
                  className='border rounded-lg p-4 flex items-center justify-between'
                >
                  <div className='flex items-center space-x-3'>
                    {getStatusIcon(request.status)}
                    <div>
                      <div className='font-medium'>Export Request #{request.id.slice(-8)}</div>
                      <div className='text-sm text-gray-500'>
                        Requested: {new Date(request.requestedAt).toLocaleDateString()}
                        {request.completedAt && (
                          <span className='ml-2'>
                            • Completed: {new Date(request.completedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <div className='text-xs text-gray-400 mt-1'>
                        Data types: {request.dataTypes.join(', ')}
                      </div>
                    </div>
                  </div>

                  <div className='flex items-center space-x-3'>
                    <ZPBadge variant={getStatusColor(request.status)}>{request.status}</ZPBadge>

                    {request.status === 'completed' && request.downloadUrl && (
                      <ZPButton variant='outline' size='sm' onClick={() => handleDownload(request)}>
                        <Download className='w-4 h-4 mr-1' />
                        Download
                      </ZPButton>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ZPCard>
    </div>
  );
}
