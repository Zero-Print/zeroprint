'use client';

import React, { useState, useEffect } from 'react';
import { ZPCard } from '@/components/ZPCard';
import { ZPButton } from '@/components/ZPButton';
import { ZPBadge } from '@/components/ZPBadge';
import { ZPTable } from '@/components/ZPTable';
import { useAuth } from '@/modules/auth';
import apiClient from '@/lib/api';
import { Wallet, Transaction } from '@/types';
import { 
  Wallet as WalletIcon, 
  TrendingUp, 
  Download, 
  Upload, 
  History, 
  Coins,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw
} from 'lucide-react';

export default function WalletPage() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingCredits, setAddingCredits] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadWalletData();
    }
  }, [user]);

  const loadWalletData = async () => {
    try {
      const [walletResponse, transactionResponse] = await Promise.all([
        apiClient.wallet.getBalance(),
        apiClient.wallet.getTransactions(1, 10),
      ]);
      
      // Handle wallet data
      if (walletResponse.success && walletResponse.data) {
        setWallet(walletResponse.data as Wallet);
      }
      
      // Handle transaction data - ensure it's always an array
      if (transactionResponse.success && transactionResponse.data) {
        const transactions = Array.isArray(transactionResponse.data) 
          ? transactionResponse.data 
          : [];
        setTransactions(transactions as Transaction[]);
      } else {
        setTransactions([]);
      }
    } catch (error) {
      console.error('Failed to load wallet data:', error);
      setTransactions([]); // Ensure transactions is always an array
    } finally {
      setLoading(false);
    }
  };

  const handleAddCredits = async () => {
    setAddingCredits(true);
    try {
      await apiClient.wallet.addCredits(100); // Add ₹100
      await loadWalletData();
    } catch (error) {
      console.error('Failed to add credits:', error);
    } finally {
      setAddingCredits(false);
    }
  };

  const transactionColumns = [
    {
      key: 'createdAt',
      header: 'Date',
      render: (value: Date) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">
            {new Date(value).toLocaleDateString()}
          </div>
          <div className="text-gray-500 text-xs">
            {new Date(value).toLocaleTimeString()}
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (value: string) => {
        const isCredit = value.includes('credit');
        return (
          <div className="flex items-center space-x-2">
            <div className={`p-1 rounded-full ${
              isCredit ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {isCredit ? (
                <ArrowDownRight className="w-3 h-3 text-green-600" />
              ) : (
                <ArrowUpRight className="w-3 h-3 text-red-600" />
              )}
            </div>
            <ZPBadge 
              variant={isCredit ? 'success' : 'warning'}
              className={`${
                isCredit 
                  ? 'bg-green-100 text-green-800 border-green-300' 
                  : 'bg-orange-100 text-orange-800 border-orange-300'
              }`}
            >
              {value.replace('_', ' ').toUpperCase()}
            </ZPBadge>
          </div>
        );
      },
    },
    {
      key: 'description',
      header: 'Description',
      render: (value: string) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-gray-500 text-xs">Environmental activity</div>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (value: number, row: Transaction) => {
        const isCredit = row.type.includes('credit');
        const isINR = row.type.includes('inr');
        const isHealCoin = row.type.includes('healcoin');
        
        return (
          <div className={`text-right font-bold text-lg ${
            isCredit ? 'text-green-600' : 'text-red-600'
          }`}>
            {isCredit ? '+' : '-'}
            {isINR ? '₹' : ''}
            {value.toLocaleString()}
            {isHealCoin ? ' HC' : ''}
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (value: string) => {
        const isCompleted = value === 'completed';
        return (
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              isCompleted ? 'bg-green-500' : 'bg-yellow-500'
            }`}></div>
            <ZPBadge 
              variant={isCompleted ? 'success' : 'warning'}
              className={`${
                isCompleted 
                  ? 'bg-green-100 text-green-800 border-green-300' 
                  : 'bg-yellow-100 text-yellow-800 border-yellow-300'
              }`}
            >
              {value.toUpperCase()}
            </ZPBadge>
          </div>
        );
      },
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="container mx-auto p-6">
          <div className="animate-pulse space-y-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-8 bg-gray-200 rounded w-48"></div>
                <div className="h-4 bg-gray-200 rounded w-64"></div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="h-48 bg-gray-200 rounded-xl"></div>
              <div className="h-48 bg-gray-200 rounded-xl"></div>
            </div>
            <div className="h-96 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto p-6">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-full shadow-lg">
              <WalletIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                My Wallet
              </h1>
              <p className="text-gray-600 text-lg mt-1">
                Manage your INR balance and HealCoins with advanced financial tools
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="group">
            <ZPCard className="h-full bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-xl hover:scale-105 transition-all duration-300 overflow-hidden">
              <div className="relative p-8">
                <div className="absolute top-4 right-4 p-2 bg-green-500 rounded-full">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-green-800 mb-2">INR Balance</h3>
                  <p className="text-green-600 text-sm font-medium">Your current Indian Rupee balance</p>
                </div>
                <div className="mb-6">
                  <div className="text-4xl font-bold text-green-700 mb-2">
                    ₹{(
                      ((wallet as any)?.inrBalance ?? wallet?.balance) as number | undefined
                    )?.toLocaleString() || '0'}
                  </div>
                  <div className="flex items-center text-green-600 text-sm font-medium">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span>+5.2% this month</span>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <ZPButton 
                    variant="primary" 
                    size="sm" 
                    loading={addingCredits} 
                    onClick={handleAddCredits}
                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Add ₹100</span>
                  </ZPButton>
                  <ZPButton 
                    variant="outline" 
                    size="sm"
                    className="border-green-300 text-green-700 hover:bg-green-50"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </ZPButton>
                </div>
              </div>
            </ZPCard>
          </div>

          <div className="group">
            <ZPCard className="h-full bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 hover:shadow-xl hover:scale-105 transition-all duration-300 overflow-hidden">
              <div className="relative p-8">
                <div className="absolute top-4 right-4 p-2 bg-[var(--zp-healcoin-gold)] rounded-full">
                  <Coins className="w-6 h-6 text-white" />
                </div>
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-yellow-800 mb-2">HealCoins</h3>
                  <p className="text-yellow-600 text-sm font-medium">Earned through eco-friendly activities</p>
                </div>
                <div className="mb-6">
                  <div className="text-4xl font-bold zp-text-healcoin mb-2">
                    {(((wallet as any)?.healCoins ?? 0) as number).toLocaleString()} HC
                  </div>
                  <div className="flex items-center text-yellow-600 text-sm font-medium">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span>+12.8% this week</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <ZPBadge 
                    variant="info" 
                    size="sm"
                    className="bg-yellow-200 text-yellow-800 border-yellow-300"
                  >
                    1 HC = 1kg CO₂ saved
                  </ZPBadge>
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-yellow-600 font-medium">Live Updates</span>
                  </div>
                </div>
              </div>
            </ZPCard>
          </div>
        </div>

        {/* Enhanced Transaction History */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-blue-500 rounded-full">
              <History className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Transaction History</h2>
              <p className="text-gray-600">Your recent wallet transactions and activities</p>
            </div>
          </div>

          <ZPCard className="zp-card bg-gradient-to-br from-white to-gray-50 border-gray-200 zp-shadow-card">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Download className="w-4 h-4" />
                    <span className="text-sm font-medium">Recent Transactions</span>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <ZPButton 
                    variant="outline" 
                    size="sm"
                    className="flex items-center space-x-2 border-blue-300 text-blue-700 hover:bg-blue-50"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                  </ZPButton>
                  <ZPButton 
                    variant="outline" 
                    size="sm"
                    className="flex items-center space-x-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Refresh</span>
                  </ZPButton>
                </div>
              </div>
              
              {transactions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <History className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No transactions yet</h3>
                  <p className="text-gray-500 mb-6">Start earning HealCoins by participating in eco-friendly activities!</p>
                  <ZPButton variant="primary" size="sm">
                    Explore Activities
                  </ZPButton>
                </div>
              ) : (
                <ZPTable
                  data={transactions}
                  columns={transactionColumns}
                  emptyMessage="No transactions found"
                />
              )}
            </div>
          </ZPCard>
        </div>
      </div>
    </div>
  );
}
