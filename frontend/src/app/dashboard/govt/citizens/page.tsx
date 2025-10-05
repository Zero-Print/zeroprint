'use client';

import React from 'react';
import { useNavigation } from '@/modules/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Search, Filter, Download } from 'lucide-react';

export default function GovernmentCitizensPage() {
  const { navigateBack } = useNavigation();
  
  // Mock data for citizens
  const citizens = [
    { id: 'user-1', name: 'Rahul Sharma', ward: 'Ward 2', ecoScore: 85, joinDate: '2023-01-15', status: 'Active' },
    { id: 'user-2', name: 'Priya Patel', ward: 'Ward 1', ecoScore: 92, joinDate: '2023-02-20', status: 'Active' },
    { id: 'user-3', name: 'Amit Kumar', ward: 'Ward 3', ecoScore: 78, joinDate: '2023-03-05', status: 'Inactive' },
    { id: 'user-4', name: 'Neha Singh', ward: 'Ward 2', ecoScore: 88, joinDate: '2023-01-30', status: 'Active' },
    { id: 'user-5', name: 'Vikram Mehta', ward: 'Ward 4', ecoScore: 76, joinDate: '2023-04-10', status: 'Active' },
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
            <h1 className="text-2xl font-bold text-gray-900">Citizen Management</h1>
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
            placeholder="Search citizens..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Citizens Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ward
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Eco Score
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Join Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {citizens.map((citizen) => (
                <tr key={citizen.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{citizen.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{citizen.ward}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`h-2.5 w-16 rounded-full ${getScoreColorClass(citizen.ecoScore)}`}>
                        <div 
                          className={`h-2.5 rounded-full bg-green-500`} 
                          style={{ width: `${citizen.ecoScore}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-sm text-gray-500">{citizen.ecoScore}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{citizen.joinDate}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColorClass(citizen.status)}`}>
                      {citizen.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button variant="link" size="sm">
                      View Profile
                    </Button>
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

function getStatusColorClass(status: string): string {
  switch (status) {
    case 'Active':
      return 'bg-green-100 text-green-800';
    case 'Inactive':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}