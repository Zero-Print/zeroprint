'use client';

import React, { useState } from 'react';
import { ZPCard } from '@/components/ZPCard';
import { ZPButton } from '@/components/ZPButton';

interface RewardFormProps {
  reward?: {
    id: string;
    title: string;
    description?: string;
    coinCost: number;
    stock: number;
    type: 'voucher' | 'product' | 'credit';
    imageUrl?: string;
  };
  onSubmit: (rewardData: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function RewardForm({ reward, onSubmit, onCancel, isLoading = false }: RewardFormProps) {
  const [formData, setFormData] = useState({
    title: reward?.title || '',
    description: reward?.description || '',
    coinCost: reward?.coinCost || 0,
    stock: reward?.stock || 0,
    type: reward?.type || 'voucher',
    imageUrl: reward?.imageUrl || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'coinCost' || name === 'stock' ? Number(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <ZPCard className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {reward ? 'Edit Reward' : 'Add New Reward'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Reward Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="coinCost" className="block text-sm font-medium text-gray-700 mb-1">
              Coin Cost
            </label>
            <input
              type="number"
              id="coinCost"
              name="coinCost"
              min="0"
              value={formData.coinCost}
              onChange={handleChange}
              required
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          
          <div>
            <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
              Stock
            </label>
            <input
              type="number"
              id="stock"
              name="stock"
              min="0"
              value={formData.stock}
              onChange={handleChange}
              required
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Reward Type
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="voucher">Voucher</option>
              <option value="product">Eco-Product</option>
              <option value="credit">Bill Credit</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
              Image URL (Optional)
            </label>
            <input
              type="text"
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-3 pt-4">
          <ZPButton
            variant="outline"
            onClick={onCancel}
            type="button"
            disabled={isLoading}
          >
            Cancel
          </ZPButton>
          
          <ZPButton
            variant="primary"
            type="submit"
            loading={isLoading}
          >
            {reward ? 'Update Reward' : 'Add Reward'}
          </ZPButton>
        </div>
      </form>
    </ZPCard>
  );
}