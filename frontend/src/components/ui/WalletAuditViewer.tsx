'use client';

import React, { useState, useEffect } from 'react';
import { ZPCard } from '@/components/ZPCard';
import { ZPBadge } from '@/components/ZPBadge';
import { ZPButton } from '@/components/ZPButton';
import { Download, Filter, Search, RefreshCw } from 'lucide-react';

// Types for wallet transactions
interface WalletTransaction {
  id: string;
  userId: string;
  userName: string;
  type: 'admin_adjustment' | 'earn' | 'redeem' | 'transfer' | string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed' | string;
  adminId?: string;
  adminName?: string;
  metadata?: Record<string, any>;
}

interface WalletAuditViewerProps {
  onExport?: (format: 'csv' | 'pdf') => void;
}

export const WalletAuditViewer: React.FC<WalletAuditViewerProps> = ({ onExport }) => {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<WalletTransaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('7d');
  const [transactionType, setTransactionType] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // Mock data - in a real app, this would come from an API
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockTransactions: WalletTransaction[] = [
        {
          id: 'tx1',
          userId: 'user1',
          userName: 'John Doe',
          type: 'admin_adjustment',
          amount: 500,
          balanceBefore: 1000,
          balanceAfter: 1500,
          description: 'Compensation for system downtime',
          timestamp: new Date('2024-06-15T10:00:00'),
          status: 'completed',
          adminId: 'admin1',
          adminName: 'Admin User',
          metadata: { reason: 'system_compensation', ticketId: 'INC-2024-06-15-001' }
        },
        {
          id: 'tx2',
          userId: 'user2',
          userName: 'Sarah Wilson',
          type: 'earn',
          amount: 50,
          balanceBefore: 200,
          balanceAfter: 250,
          description: 'Carbon tracking activity reward',
          timestamp: new Date('2024-06-15T09:30:00'),
          status: 'completed',
          metadata: { activityType: 'carbon_tracking', activityId: 'act-123456' }
        },
        {
          id: 'tx3',
          userId: 'user3',
          userName: 'Mike Johnson',
          type: 'redeem',
          amount: -100,
          balanceBefore: 300,
          balanceAfter: 200,
          description: 'Redeemed for eco-friendly product',
          timestamp: new Date('2024-06-15T08:15:00'),
          status: 'completed',
          metadata: { productId: 'prod-eco-bag', category: 'sustainable_products' }
        },
        {
          id: 'tx4',
          userId: 'user4',
          userName: 'Emily Chen',
          type: 'transfer',
          amount: -75,
          balanceBefore: 500,
          balanceAfter: 425,
          description: 'Transfer to community garden project',
          timestamp: new Date('2024-06-14T14:20:00'),
          status: 'completed',
          metadata: { recipientId: 'org-community-garden', transferType: 'donation' }
        },
        {
          id: 'tx5',
          userId: 'user5',
          userName: 'David Brown',
          type: 'earn',
          amount: 200,
          balanceBefore: 150,
          balanceAfter: 350,
          description: 'Sustainable challenge completion bonus',
          timestamp: new Date('2024-06-14T11:45:00'),
          status: 'completed',
          metadata: { challengeId: 'chl-summer-2024', achievement: 'gold_level' }
        },
        {
          id: 'tx6',
          userId: 'user6',
          userName: 'Lisa Taylor',
          type: 'admin_adjustment',
          amount: -50,
          balanceBefore: 250,
          balanceAfter: 200,
          description: 'Correction for duplicate reward',
          timestamp: new Date('2024-06-13T16:30:00'),
          status: 'completed',
          adminId: 'admin2',
          adminName: 'Support Team',
          metadata: { reason: 'duplicate_correction', originalTxId: 'tx-duplicate-123' }
        },
        {
          id: 'tx7',
          userId: 'user7',
          userName: 'Robert Garcia',
          type: 'redeem',
          amount: -150,
          balanceBefore: 450,
          balanceAfter: 300,
          description: 'Redeemed for public transport pass',
          timestamp: new Date('2024-06-13T09:10:00'),
          status: 'completed',
          metadata: { productId: 'prod-transport-pass', category: 'sustainable_transport' }
        }
      ];
      
      setTransactions(mockTransactions);
      setFilteredTransactions(mockTransactions);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Filter transactions based on search term, date range, and transaction type
  useEffect(() => {
    let filtered = transactions;
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(tx => 
        tx.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.userId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by date range
    const now = new Date();
    let startDate = new Date();
    
    switch (dateRange) {
      case '1d':
        startDate.setDate(now.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }
    
    filtered = filtered.filter(tx => tx.timestamp >= startDate);
    
    // Filter by transaction type
    if (transactionType !== 'all') {
      filtered = filtered.filter(tx => tx.type === transactionType);
    }
    
    setFilteredTransactions(filtered);
  }, [searchTerm, dateRange, transactionType, transactions]);

  // Handle export
  const handleExport = (format: 'csv' | 'pdf') => {
    if (onExport) {
      onExport(format);
    } else {
      console.log(`Exporting wallet audit in ${format} format`);
      // In a real app, this would trigger an API call to generate the export
    }
  };

  // Get appropriate badge color based on transaction type
  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'admin_adjustment':
        return 'bg-purple-100 text-purple-800';
      case 'earn':
        return 'bg-green-100 text-green-800';
      case 'redeem':
        return 'bg-blue-100 text-blue-800';
      case 'transfer':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <ZPCard 
      title="Wallet Audit Viewer" 
      description="Comprehensive view of all wallet transactions and adjustments"
      data-testid="wallet-audit-viewer"
      className="bg-white rounded-xl shadow-sm border border-gray-200"
    >
      <div className="space-y-6">
        {/* Controls and Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                data-testid="search-transactions"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                data-testid="date-range-filter"
              >
                <option value="1d">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
              
              <select
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                data-testid="transaction-type-filter"
              >
                <option value="all">All Types</option>
                <option value="admin_adjustment">Admin Adjustment</option>
                <option value="earn">Earn</option>
                <option value="redeem">Redeem</option>
                <option value="transfer">Transfer</option>
              </select>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <ZPButton 
              variant="outline" 
              size="sm"
              onClick={() => {
                setIsLoading(true);
                setTimeout(() => {
                  setIsLoading(false);
                }, 500);
              }}
              data-testid="refresh-transactions"
              className="flex items-center gap-2 bg-white hover:bg-gray-50 border-gray-300"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </ZPButton>
            
            <ZPButton 
              variant="outline" 
              size="sm"
              onClick={() => handleExport('csv')}
              data-testid="export-csv"
              className="flex items-center gap-2 bg-white hover:bg-gray-50 border-gray-300"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </ZPButton>
            
            <ZPButton 
              variant="outline" 
              size="sm"
              onClick={() => handleExport('pdf')}
              data-testid="export-pdf"
              className="flex items-center gap-2 bg-white hover:bg-gray-50 border-gray-300"
            >
              <Download className="h-4 w-4" />
              Export PDF
            </ZPButton>
          </div>
        </div>
        
        {/* Transaction Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-sm text-blue-700 mb-1">Total Transactions</div>
            <div className="text-2xl font-bold text-blue-800">{filteredTransactions.length}</div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-sm text-green-700 mb-1">Total Volume</div>
            <div className="text-2xl font-bold text-green-800">
              {filteredTransactions.reduce((sum, tx) => sum + Math.abs(tx.amount), 0)} HC
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-sm text-purple-700 mb-1">Net Change</div>
            <div className={`text-2xl font-bold ${
              filteredTransactions.reduce((sum, tx) => sum + tx.amount, 0) >= 0 
                ? 'text-green-600' 
                : 'text-red-600'
            }`}>
              {filteredTransactions.reduce((sum, tx) => sum + tx.amount, 0)} HC
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-sm text-orange-700 mb-1">Admin Adjustments</div>
            <div className="text-2xl font-bold text-orange-800">
              {filteredTransactions.filter(tx => tx.type === 'admin_adjustment').length}
            </div>
          </div>
        </div>
        
        {/* Transaction Table */}
        <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm">
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <table className="w-full border-collapse" data-testid="transactions-table">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left p-4 font-medium text-gray-700">User</th>
                  <th className="text-left p-4 font-medium text-gray-700">Type</th>
                  <th className="text-left p-4 font-medium text-gray-700">Amount</th>
                  <th className="text-left p-4 font-medium text-gray-700">Balance Change</th>
                  <th className="text-left p-4 font-medium text-gray-700">Description</th>
                  <th className="text-left p-4 font-medium text-gray-700">Admin</th>
                  <th className="text-left p-4 font-medium text-gray-700">Status</th>
                  <th className="text-left p-4 font-medium text-gray-700">Timestamp</th>
                  <th className="text-left p-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-4xl mb-2">🔍</span>
                        <p className="text-lg font-medium">No transactions found</p>
                        <p className="text-sm">Try adjusting your search or filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map(tx => (
                    <tr key={tx.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="font-medium text-gray-900">{tx.userName}</div>
                        <div className="text-sm text-gray-500">{tx.userId}</div>
                      </td>
                      <td className="p-4">
                        <ZPBadge className={getTransactionTypeColor(tx.type)}>
                          {tx.type.replace('_', ' ').toUpperCase()}
                        </ZPBadge>
                      </td>
                      <td className="p-4">
                        <span className={`font-medium ${tx.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {tx.amount >= 0 ? '+' : ''}{tx.amount}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          <span className="text-gray-500">{tx.balanceBefore} → </span>
                          <span className="font-medium">{tx.balanceAfter}</span>
                        </div>
                      </td>
                      <td className="p-4 max-w-xs">
                        <div className="text-gray-700" title={tx.description}>
                          {tx.description}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-gray-600">{tx.adminName || '-'}</div>
                      </td>
                      <td className="p-4">
                        <ZPBadge variant={tx.status === 'completed' ? 'success' : tx.status === 'failed' ? 'danger' : 'warning'}>
                          {tx.status}
                        </ZPBadge>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-gray-600">{tx.timestamp.toLocaleString()}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <ZPButton
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              if (!confirm('Are you sure you want to reverse this transaction?')) return;
                              try {
                                const { httpsCallable } = await import('firebase/functions');
                                const { functions } = await import('@/lib/firebase');
                                const fn: any = httpsCallable(functions as any, 'reverseTransaction');
                                // In a real app, we would pass the audit log id; for demo use tx.id
                                const res: any = await fn({ logId: tx.id, adminId: 'admin_demo' });
                                alert('Reversal requested successfully');
                              } catch (e) {
                                console.error('Reverse failed', e);
                                alert('Failed to reverse');
                              }
                            }}
                          >
                            Reverse
                          </ZPButton>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Pagination */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">
            Showing {filteredTransactions.length} of {transactions.length} transactions
          </div>
          <div className="flex space-x-2">
            <ZPButton variant="outline" size="sm" disabled className="bg-white hover:bg-gray-50 border-gray-300">Previous</ZPButton>
            <ZPButton variant="outline" size="sm" disabled className="bg-white hover:bg-gray-50 border-gray-300">Next</ZPButton>
          </div>
        </div>
      </div>
    </ZPCard>
  );
};