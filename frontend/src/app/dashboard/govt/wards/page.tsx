'use client';

import React from 'react';
import { useNavigation } from '@/modules/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Search, Filter, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function GovernmentWardsPage() {
  const router = useRouter();
  const { navigateBack } = useNavigation();
  
  // Mock data for wards
  const wards = [
    { id: 'ward-1', name: 'Ward 1', population: 12500, carbonScore: 78, activeUsers: 4200 },
    { id: 'ward-2', name: 'Ward 2', population: 15800, carbonScore: 65, activeUsers: 5100 },
    { id: 'ward-3', name: 'Ward 3', population: 9300, carbonScore: 82, activeUsers: 3800 },
    { id: 'ward-4', name: 'Ward 4', population: 18200, carbonScore: 71, activeUsers: 6500 },
    { id: 'ward-5', name: 'Ward 5', population: 11000, carbonScore: 79, activeUsers: 4700 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={navigateBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Ward Management</h1>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search wards..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Wards Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ward Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Population
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Carbon Score
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Active Users
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {wards.map((ward) => (
                <tr key={ward.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{ward.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{ward.population.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`h-2.5 w-16 rounded-full ${getScoreColorClass(ward.carbonScore)}`}>
                        <div 
                          className={`h-2.5 rounded-full bg-green-500`} 
                          style={{ width: `${ward.carbonScore}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-sm text-gray-500">{ward.carbonScore}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{ward.activeUsers.toLocaleString()}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function getScoreColorClass(score: number): string {
  if (score >= 80) return 'bg-green-100';
  if (score >= 60) return 'bg-yellow-100';
  return 'bg-red-100';
}