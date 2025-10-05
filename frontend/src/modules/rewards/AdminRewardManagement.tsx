'use client';

import React, { useState } from 'react';
import { ZPCard } from '@/components/ZPCard';
import { ZPButton } from '@/components/ZPButton';
import { ZPTable } from '@/components/ZPTable';
import { Plus, Edit, Trash2, Upload, Download, Search, Gift } from 'lucide-react';
import { VoucherUploadModal } from './VoucherUploadModal';
import { uploadVouchers } from './voucherService';
import { exportRewardsToCSV } from './exportService';

interface Reward {
  id: string;
  title: string;
  description?: string;
  coinCost: number;
  stock: number;
  type: 'voucher' | 'product' | 'credit';
  imageUrl?: string;
  createdAt: Date;
  createdBy: string;
}

interface RewardRow {
  id: string;
  title: string;
  description?: string;
  coinCost: number;
  stock: number;
  type: 'voucher' | 'product' | 'credit';
  imageUrl?: string;
  createdAt: string; // Formatted date string for display
  createdBy: string;
}

interface AdminRewardManagementProps {
  rewards: Reward[];
  onAddReward: () => void;
  onEditReward: (rewardId: string) => void;
  onDeleteReward: (rewardId: string) => void;
  onUploadVouchers: (file: File, rewardId: string) => Promise<{ success: boolean; message: string }>;
  onExportRewards: () => void;
  isLoading?: boolean;
}

export function AdminRewardManagement({ 
  rewards, 
  onAddReward,
  onEditReward,
  onDeleteReward,
  onUploadVouchers,
  onExportRewards,
  isLoading = false
}: AdminRewardManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'voucher':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          Voucher
        </span>;
      case 'product':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Product
        </span>;
      case 'credit':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
          Credit
        </span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Unknown
        </span>;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredRewards = rewards.filter(reward => 
    reward.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (reward.description && reward.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const columns = [
    { key: 'title', header: 'Reward' },
    { key: 'type', header: 'Type', render: (value: string) => getTypeBadge(value) },
    { key: 'coinCost', header: 'Cost (HC)' },
    { key: 'stock', header: 'Stock' },
    { key: 'createdAt', header: 'Created' },
    { 
      key: 'actions', 
      header: 'Actions',
      render: (_: any, row: RewardRow) => (
        <div className="flex items-center gap-2">
          <ZPButton
            variant="outline"
            size="sm"
            onClick={() => onEditReward(row.id)}
            className="p-2"
            aria-label="Edit reward"
          >
            <Edit className="h-4 w-4" />
          </ZPButton>
          <ZPButton
            variant="outline"
            size="sm"
            onClick={() => onDeleteReward(row.id)}
            className="p-2 text-red-600 hover:text-red-700"
            aria-label="Delete reward"
          >
            <Trash2 className="h-4 w-4" />
          </ZPButton>
        </div>
      )
    },
  ];

  const data: RewardRow[] = filteredRewards.map(reward => ({
    ...reward,
    createdAt: formatDate(reward.createdAt),
  }));

  const handleVoucherUpload = async (file: File, rewardId: string) => {
    setIsUploading(true);
    try {
      // Use the actual uploadVouchers function
      const result = await uploadVouchers(file, rewardId, 'admin1'); // In real app, use actual admin ID
      return result;
    } finally {
      setIsUploading(false);
    }
  };

  const handleExportRewards = async () => {
    setIsExporting(true);
    try {
      await exportRewardsToCSV(rewards);
    } catch (error) {
      console.error('Error exporting rewards:', error);
      // In a real app, you might show an error message to the user
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reward Management</h2>
          <p className="text-gray-600 mt-1">
            Manage rewards available in the marketplace
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <ZPButton
            variant="outline"
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Upload Vouchers
          </ZPButton>
          
          <ZPButton
            variant="outline"
            onClick={handleExportRewards}
            className="flex items-center gap-2"
            disabled={isExporting}
          >
            <Download className={`h-4 w-4 ${isExporting ? 'animate-spin' : ''}`} />
            Export
          </ZPButton>
          
          <ZPButton
            variant="primary"
            onClick={onAddReward}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Reward
          </ZPButton>
        </div>
      </div>

      {/* Search */}
      <ZPCard className="bg-gray-50">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search rewards..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </ZPCard>

      {/* Rewards Table */}
      <ZPCard>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          </div>
        ) : filteredRewards.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Gift className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No rewards found</h3>
            <p className="text-gray-500">Create your first reward to get started</p>
            <ZPButton
              variant="primary"
              onClick={onAddReward}
              className="mt-4"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Reward
            </ZPButton>
          </div>
        ) : (
          <ZPTable
            columns={columns}
            data={data}
          />
        )}
      </ZPCard>

      {/* Voucher Upload Modal */}
      <VoucherUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleVoucherUpload}
        isLoading={isUploading}
      />
    </div>
  );
}