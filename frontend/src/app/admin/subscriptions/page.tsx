'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/modules/auth';
import { redirect } from 'next/navigation';
import { Subscription, Payment } from '@/types/subscriptions';
import { formatCurrency } from '@/lib/services/subscriptionService';
import api from '@/lib/api';

interface SubscriptionAnalytics {
  totalActive: number;
  totalExpired: number;
  totalCancelled: number;
  revenueThisMonth: number;
  planDistribution: Record<string, number>;
}

export default function AdminSubscriptionsPage() {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [analytics, setAnalytics] = useState<SubscriptionAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Redirect if not authenticated or not admin
  if (!user) {
    redirect('/auth/login');
  }

  // Simple admin check (in real app, this would be more robust)
  const isAdmin = user?.email?.includes('admin') || false;
  if (!isAdmin) {
    redirect('/dashboard');
  }

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load analytics
      await loadAnalytics();

      // Load subscriptions
      await loadSubscriptions();

      // Load recent payments
      await loadPayments();

    } catch (err) {
      console.error('Error loading admin data:', err);
      setError('Failed to load admin data');
      
      // Set mock data for development
      setAnalytics(getMockAnalytics());
      setSubscriptions(getMockSubscriptions());
      setPayments(getMockPayments());
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await api.admin.getAnalytics('7d');
      if (response.success && response.data) {
        // Mock analytics data - would come from actual analytics endpoint
        setAnalytics({
          totalActive: 150,
          totalExpired: 25,
          totalCancelled: 10,
          revenueThisMonth: 45000,
          planDistribution: {
            'basic': 80,
            'premium': 60,
            'enterprise': 10,
          },
        });
      } else {
        setAnalytics(getMockAnalytics());
      }
    } catch (err) {
      console.warn('Error loading analytics, using mock data:', err);
      setAnalytics(getMockAnalytics());
    }
  };

  const loadSubscriptions = async () => {
    try {
      // Mock subscriptions data - would come from actual subscriptions endpoint
      const subscriptionData: Subscription[] = [
        {
          subscriptionId: 'sub_1',
          userId: 'user_1',
          planId: 'citizen',
          status: 'active',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          autoRenewal: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          subscriptionId: 'sub_2',
          userId: 'user_2',
          planId: 'school',
          status: 'expired',
          startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          autoRenewal: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      setSubscriptions(subscriptionData);
    } catch (err) {
      console.warn('Error loading subscriptions, using mock data:', err);
      setSubscriptions(getMockSubscriptions());
    }
  };

  const loadPayments = async () => {
    try {
      // Mock payments data - would come from actual payments endpoint
      const paymentData: Payment[] = [
        {
          id: 'pay_1',
          userId: 'user_1',
          planId: 'citizen',
          amount: 299,
          currency: 'INR',
          status: 'completed',
          razorpayOrderId: 'order_123',
          razorpayPaymentId: 'pay_123',
          type: 'subscription',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'pay_2',
          userId: 'user_2',
          planId: 'school',
          amount: 499,
          currency: 'INR',
          status: 'pending',
          razorpayOrderId: 'order_456',
          type: 'subscription',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      setPayments(paymentData);
    } catch (err) {
      console.warn('Error loading payments, using mock data:', err);
      setPayments(getMockPayments());
    }
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesStatus = filterStatus === 'all' || sub.status === filterStatus;
    const matchesSearch = searchTerm === '' || 
      sub.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.planId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.subscriptionId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Subscription Management</h1>
              <p className="mt-1 text-sm text-gray-500">
                Monitor and manage all subscription activities
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => exportToCSV(filteredSubscriptions, 'subscriptions')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export CSV
              </button>
              <button
                onClick={() => exportToCSV(payments, 'payments')}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Export Payments
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-800">
                  {error} - Showing sample data for development
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Active</p>
                  <p className="text-2xl font-semibold text-gray-900">{analytics.totalActive}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Expired</p>
                  <p className="text-2xl font-semibold text-gray-900">{analytics.totalExpired}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Cancelled</p>
                  <p className="text-2xl font-semibold text-gray-900">{analytics.totalCancelled}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Revenue MTD</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {formatCurrency(analytics.revenueThisMonth)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-500 mb-2">Plan Distribution</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Citizen:</span>
                    <span className="font-medium">{analytics.planDistribution.citizen || 0}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>School:</span>
                    <span className="font-medium">{analytics.planDistribution.school || 0}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>MSME:</span>
                    <span className="font-medium">{analytics.planDistribution.msme || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex space-x-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="cancelled">Cancelled</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div className="flex space-x-4">
              <input
                type="text"
                placeholder="Search users, plans, or IDs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Subscriptions Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Subscriptions ({filteredSubscriptions.length})
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Start Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Renewal Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subscription ID
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSubscriptions.map((subscription) => (
                  <tr key={subscription.subscriptionId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                      {subscription.userId.slice(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 capitalize">
                        {subscription.planId}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(subscription.status)}`}>
                        {subscription.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(subscription.startDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(subscription.renewalDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                      {subscription.subscriptionId.slice(0, 16)}...
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// Mock data functions
function getMockAnalytics(): SubscriptionAnalytics {
  return {
    totalActive: 156,
    totalExpired: 23,
    totalCancelled: 12,
    revenueThisMonth: 25400,
    planDistribution: {
      citizen: 120,
      school: 25,
      msme: 11
    }
  };
}

function getMockSubscriptions(): Subscription[] {
  return [
    {
      subscriptionId: 'sub_001',
      userId: 'user_citizen_123',
      planId: 'citizen',
      status: 'active',
      startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      renewalDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      autoRenewal: true,
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      subscriptionId: 'sub_002',
      userId: 'user_school_456',
      planId: 'school',
      status: 'active',
      startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      renewalDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
      autoRenewal: true,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      subscriptionId: 'sub_003',
      userId: 'user_msme_789',
      planId: 'msme',
      status: 'expired',
      startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      renewalDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      autoRenewal: false,
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];
}

function getMockPayments(): Payment[] {
  return [
    {
      paymentId: 'pay_001',
      userId: 'user_citizen_123',
      planId: 'citizen',
      subscriptionId: 'sub_001',
      amount: 99,
      currency: 'INR',
      status: 'success',
      razorpayOrderId: 'order_123',
      razorpayPaymentId: 'pay_razorpay_123',
      type: 'subscription',
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      paymentId: 'pay_002',
      userId: 'user_school_456',
      planId: 'school',
      subscriptionId: 'sub_002',
      amount: 500,
      currency: 'INR',
      status: 'success',
      razorpayOrderId: 'order_124',
      razorpayPaymentId: 'pay_razorpay_124',
      type: 'subscription',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];
}
