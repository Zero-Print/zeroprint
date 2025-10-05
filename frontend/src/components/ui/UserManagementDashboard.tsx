'use client';

import React, { useState } from 'react';
import { ZPCard } from '@/components/ZPCard';
import { ZPButton } from '@/components/ZPButton';
import { ZPBadge } from '@/components/ZPBadge';
import { ZPTable } from '@/components/ZPTable';

// Helper function for consistent date formatting
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export function UserManagementDashboard() {
  const [activeTab, setActiveTab] = useState<'all' | 'citizens' | 'institutions' | 'admins'>('all');
  
  // Mock user data
  const users = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'citizen',
      status: 'active',
      joinDate: '2023-01-15',
      healCoins: 1250,
    },
    {
      id: '2',
      name: 'Green High School',
      email: 'contact@greenhigh.edu',
      role: 'school',
      status: 'active',
      joinDate: '2023-02-20',
      healCoins: 5420,
    },
    {
      id: '3',
      name: 'EcoTech Solutions',
      email: 'info@ecotech.com',
      role: 'msme',
      status: 'pending',
      joinDate: '2023-03-10',
      healCoins: 0,
    },
    {
      id: '4',
      name: 'City Environmental Dept',
      email: 'environment@city.gov',
      role: 'government',
      status: 'active',
      joinDate: '2023-01-05',
      healCoins: 8750,
    },
    {
      id: '5',
      name: 'Admin User',
      email: 'admin@zeroprint.org',
      role: 'admin',
      status: 'active',
      joinDate: '2022-12-01',
      healCoins: 0,
    },
  ];

  const filteredUsers = activeTab === 'all' 
    ? users 
    : users.filter(user => user.role === activeTab || (activeTab === 'institutions' && (user.role === 'school' || user.role === 'msme' || user.role === 'government')));

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'suspended': return 'danger';
      default: return 'secondary';
    }
  };

  const getRoleVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'info';
      case 'citizen': return 'success';
      case 'school': return 'warning';
      case 'msme': return 'info';
      case 'government': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
        <p className="text-gray-600">Manage platform users, institutions, and administrators</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <ZPCard className="border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="rounded-full bg-blue-100 p-3 mr-4">
              <span className="text-blue-600 text-xl">👥</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-2xl font-bold">1,248</p>
            </div>
          </div>
        </ZPCard>
        
        <ZPCard className="border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="rounded-full bg-green-100 p-3 mr-4">
              <span className="text-green-600 text-xl">🏢</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Institutions</p>
              <p className="text-2xl font-bold">86</p>
            </div>
          </div>
        </ZPCard>
        
        <ZPCard className="border-l-4 border-yellow-500">
          <div className="flex items-center">
            <div className="rounded-full bg-yellow-100 p-3 mr-4">
              <span className="text-yellow-600 text-xl">⏳</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending Approval</p>
              <p className="text-2xl font-bold">12</p>
            </div>
          </div>
        </ZPCard>
        
        <ZPCard className="border-l-4 border-purple-500">
          <div className="flex items-center">
            <div className="rounded-full bg-purple-100 p-3 mr-4">
              <span className="text-purple-600 text-xl">🛡️</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Admins</p>
              <p className="text-2xl font-bold">5</p>
            </div>
          </div>
        </ZPCard>
      </div>

      {/* User Management Tabs */}
      <ZPCard className="mb-6">
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'all', label: 'All Users' },
              { id: 'citizens', label: 'Citizens' },
              { id: 'institutions', label: 'Institutions' },
              { id: 'admins', label: 'Administrators' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Users Table */}
        <ZPTable
          columns={[
            { key: 'name', header: 'User', render: (value, row: any) => (
              <div className="flex items-center">
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10 mr-3" />
                <div>
                  <div className="font-medium text-gray-900">{row.name}</div>
                </div>
              </div>
            )},
            { key: 'email', header: 'Email' },
            { key: 'role', header: 'Role', render: (value, row: any) => <ZPBadge variant={getRoleVariant(row.role)}>{row.role}</ZPBadge> },
            { key: 'status', header: 'Status', render: (value, row: any) => <ZPBadge variant={getStatusVariant(row.status)}>{row.status}</ZPBadge> },
            { key: 'joinDate', header: 'Join Date', render: (value) => formatDate(value) },
            { key: 'healCoins', header: 'HealCoins', render: (value) => value.toLocaleString() },
            { key: 'actions', header: 'Actions', render: () => (
              <div className="flex space-x-2">
                <ZPButton variant="outline" size="sm">View</ZPButton>
                <ZPButton variant="outline" size="sm">Edit</ZPButton>
              </div>
            )},
          ]}
          data={filteredUsers}
        />
      </ZPCard>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        <ZPButton variant="outline">Export Users</ZPButton>
        <ZPButton variant="primary">Add New User</ZPButton>
      </div>
    </div>
  );
}