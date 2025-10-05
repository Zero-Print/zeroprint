'use client';

import React from 'react';
import { useNavigation } from '@/modules/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Search, Filter } from 'lucide-react';

export default function GovernmentPoliciesPage() {
  const { navigateBack } = useNavigation();
  
  // Mock data for policies
  const policies = [
    { id: 'policy-1', name: 'Green Transport Initiative', status: 'Active', impact: 'High', dateImplemented: '2023-05-15' },
    { id: 'policy-2', name: 'Solar Panel Subsidy Program', status: 'Active', impact: 'Medium', dateImplemented: '2023-02-10' },
    { id: 'policy-3', name: 'Waste Reduction Campaign', status: 'Planned', impact: 'High', dateImplemented: '2023-08-01' },
    { id: 'policy-4', name: 'Water Conservation Program', status: 'Active', impact: 'Medium', dateImplemented: '2023-01-20' },
    { id: 'policy-5', name: 'Electric Vehicle Incentives', status: 'Draft', impact: 'High', dateImplemented: '-' },
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
            <h1 className="text-2xl font-bold text-gray-900">Sustainability Policies</h1>
          </div>
          <div className="flex space-x-2">
            <Button variant="default" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Policy
            </Button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search policies..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>

        {/* Policies Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Policy Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Impact
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Implemented
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {policies.map((policy) => (
                <tr key={policy.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{policy.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColorClass(policy.status)}`}>
                      {policy.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${getImpactColorClass(policy.impact)}`}>{policy.impact}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{policy.dateImplemented}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button variant="link" size="sm">
                      Edit
                    </Button>
                    <Button variant="link" size="sm">
                      View
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

function getStatusColorClass(status: string): string {
  switch (status) {
    case 'Active':
      return 'bg-green-100 text-green-800';
    case 'Planned':
      return 'bg-blue-100 text-blue-800';
    case 'Draft':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function getImpactColorClass(impact: string): string {
  switch (impact) {
    case 'High':
      return 'text-green-600 font-medium';
    case 'Medium':
      return 'text-yellow-600 font-medium';
    case 'Low':
      return 'text-red-600 font-medium';
    default:
      return 'text-gray-500';
  }
}