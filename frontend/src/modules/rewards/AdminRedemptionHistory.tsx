'use client';

import React, { useState } from 'react';
import { ZPCard } from '@/components/ZPCard';
import { ZPButton } from '@/components/ZPButton';
import { ZPTable } from '@/components/ZPTable';
import { Download, Filter, Search, Gift } from 'lucide-react';
import { exportRedemptionsToCSV } from './exportService';

interface Redemption {
  id: string;
  userId: string;
  userName: string;
  rewardId: string;
  rewardTitle: string;
  coinsSpent: number;
  status: 'success' | 'failed' | 'pending';
  createdAt: string;
  processedBy: string;
  voucherCode?: string;
}

interface AdminRedemptionHistoryProps {
  redemptions: Redemption[];
  isLoading?: boolean;
  onExport?: () => void;
}

export function AdminRedemptionHistory({ 
  redemptions, 
  isLoading = false,
  onExport
}: AdminRedemptionHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isExporting, setIsExporting] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Success
        </span>;
      case 'failed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Failed
        </span>;
      case 'pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Pending
        </span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Unknown
        </span>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredRedemptions = redemptions.filter(redemption => {
    const matchesSearch = redemption.userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          redemption.rewardTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || redemption.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    { key: 'userName', header: 'User' },
    { key: 'rewardTitle', header: 'Reward' },
    { key: 'coinsSpent', header: 'Coins' },
    { key: 'status', header: 'Status', render: (value: React.ReactNode) => value },
    { key: 'createdAt', header: 'Date' },
    { key: 'processedBy', header: 'Processed By' },
  ];

  const data = filteredRedemptions.map(redemption => ({
    ...redemption,
    status: getStatusBadge(redemption.status),
    createdAt: formatDate(redemption.createdAt),
  }));

  const handleExportRedemptions = async () => {
    setIsExporting(true);
    try {
      await exportRedemptionsToCSV(redemptions);
    } catch (error) {
      console.error('Error exporting redemptions:', error);
      // In a real app, you might show an error message to the user
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Redemption History</h2>
          <p className="text-gray-600 mt-1">
            View all reward redemptions across the platform
          </p>
        </div>
        
        <ZPButton
          variant="outline"
          onClick={handleExportRedemptions}
          className="flex items-center gap-2"
          disabled={isExporting}
        >
          <Download className={`h-4 w-4 ${isExporting ? 'animate-spin' : ''}`} />
          Export CSV
        </ZPButton>
      </div>

      {/* Filters */}
      <ZPCard className="bg-gray-50">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by user or reward..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-4 w-4 text-gray-400" />
            </div>
            <select
              className="block pl-10 pr-10 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="success">Success</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </ZPCard>

      {/* Redemption Table */}
      <ZPCard>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          </div>
        ) : filteredRedemptions.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Gift className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No redemptions found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <ZPTable
            columns={columns}
            data={data}
          />
        )}
      </ZPCard>
    </div>
  );
}