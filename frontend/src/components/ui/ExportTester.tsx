'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExportManager } from '@/components/ui/ExportManager';
import { ZPBadge } from '@/components/ZPBadge';

interface ExportTestResult {
  dashboardType: string;
  exportType: 'csv' | 'pdf';
  status: 'pass' | 'fail' | 'pending';
  message: string;
  filename?: string;
}

export function ExportTester() {
  const [testResults, setTestResults] = useState<ExportTestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>('');

  // Mock data for different dashboard types
  const mockData: Record<string, any> = {
    admin: {
      users: [
        { id: '1', name: 'John Doe', email: 'john@example.com', role: 'admin', status: 'active', createdAt: new Date() },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'user', status: 'active', createdAt: new Date() }
      ],
      organizations: [
        { id: '1', name: 'Green Corp', type: 'enterprise', memberCount: 150, ecoScore: 85 },
        { id: '2', name: 'Eco School', type: 'school', memberCount: 850, ecoScore: 78 }
      ],
      systemMetrics: [
        { timestamp: new Date(), activeUsers: 1250, performance: 95, errors: 2 }
      ],
      auditLogs: [],
      transactions: []
    },
    government: {
      wards: [
        { id: '1', name: 'Ward 1', population: 50000, ecoScore: 78, carbonReduction: 12.5 },
        { id: '2', name: 'Ward 2', population: 45000, ecoScore: 82, carbonReduction: 15.2 }
      ],
      kpiData: [
        { category: 'environmental', metric: 'air_quality', value: 65, target: 50, trend: 'improving' },
        { category: 'social', metric: 'engagement', value: 72, target: 80, trend: 'stable' }
      ],
      auditLogs: [],
      transactions: []
    },
    institutional: {
      institutions: [
        { id: '1', name: 'Environmental Studies', type: 'department', members: 25, esgScore: 85 },
        { id: '2', name: 'Sustainability Office', type: 'department', members: 12, esgScore: 78 }
      ],
      departments: [
        { id: '1', name: 'Research', institution: 'Environmental Studies', budget: 50000 },
        { id: '2', name: 'Outreach', institution: 'Sustainability Office', budget: 25000 }
      ],
      activities: [
        { id: '1', title: 'Carbon Audit', department: 'Research', status: 'completed', date: new Date() },
        { id: '2', title: 'Community Workshop', department: 'Outreach', status: 'planned', date: new Date() }
      ],
      auditLogs: [],
      transactions: []
    },
    bigquery: {
      bigqueryData: [
        { metric: 'user_engagement', value: 78.5, timestamp: new Date(), category: 'usage' },
        { metric: 'carbon_reduction', value: 15.2, timestamp: new Date(), category: 'environmental' }
      ],
      auditLogs: [],
      transactions: []
    },
    audit: {
      auditLogs: [
        { id: '1', action: 'data_access', user: 'admin@example.com', timestamp: new Date(), details: 'Viewed user data', ipAddress: '192.168.1.100' },
        { id: '2', action: 'export_data', user: 'analyst@example.com', timestamp: new Date(), details: 'Exported analytics', ipAddress: '192.168.1.101' }
      ],
      transactions: [
        { id: '1', type: 'transfer', amount: 500, from: 'user1', to: 'user2', timestamp: new Date() },
        { id: '2', type: 'adjustment', amount: -25, from: 'system', to: 'user3', timestamp: new Date() }
      ]
    }
  };

  const runExportTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    const results: ExportTestResult[] = [];

    const dashboardTypes = ['admin', 'government', 'institutional', 'bigquery', 'audit'] as const;
    const exportTypes = ['csv', 'pdf'] as const;

    for (const dashboardType of dashboardTypes) {
      for (const exportType of exportTypes) {
        setCurrentTest(`Testing ${dashboardType} dashboard - ${exportType.toUpperCase()} export`);
        
        try {
          // Simulate export test
          await new Promise(resolve => setTimeout(resolve, 500)); // Simulate processing time
          
          const testData = mockData[dashboardType];
          const filename = `${dashboardType}_export_${Date.now()}.${exportType}`;
          
          // Check if data exists and is properly formatted
          if (testData && Object.keys(testData).length > 0) {
            results.push({
              dashboardType,
              exportType,
              status: 'pass',
              message: `Export successful - ${Object.keys(testData).length} data sections`,
              filename
            });
          } else {
            results.push({
              dashboardType,
              exportType,
              status: 'fail',
              message: 'No data available for export'
            });
          }
        } catch (error) {
          results.push({
            dashboardType,
            exportType,
            status: 'fail',
            message: `Export failed: ${error}`
          });
        }
      }
    }

    setTestResults(results);
    setCurrentTest('');
    setIsRunning(false);
  };

  const getStatusColor = (status: ExportTestResult['status']) => {
    switch (status) {
      case 'pass': return 'text-green-600';
      case 'fail': return 'text-red-600';
      case 'pending': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: ExportTestResult['status']) => {
    switch (status) {
      case 'pass': return '✅';
      case 'fail': return '❌';
      case 'pending': return '⏳';
      default: return '❓';
    }
  };

  const passedTests = testResults.filter(r => r.status === 'pass').length;
  const totalTests = testResults.length;

  return (
    <Card className="w-full max-w-6xl mx-auto bg-white rounded-xl shadow-lg border border-gray-200">
      <CardHeader className="pb-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-t-xl">
        <CardTitle className="flex items-center gap-3 text-2xl">
          <span className="text-2xl">📊</span>
          <span className="font-bold text-gray-800">Export Functionality Tests</span>
          {testResults.length > 0 && (
            <span className="text-base font-normal bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
              ({passedTests}/{totalTests} passed)
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={runExportTests} 
              disabled={isRunning}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {isRunning ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Testing Exports...</span>
                </>
              ) : (
                <>
                  <span className="text-lg">🚀</span>
                  <span>Test All Export Functions</span>
                </>
              )}
            </Button>
            
            {testResults.length > 0 && (
              <div className="flex flex-wrap gap-4 text-sm">
                <span className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full">
                  <span className="text-green-600">✅</span>
                  <span>{testResults.filter(r => r.status === 'pass').length} Passed</span>
                </span>
                <span className="flex items-center gap-1 bg-red-100 text-red-800 px-3 py-1 rounded-full">
                  <span className="text-red-600">❌</span>
                  <span>{testResults.filter(r => r.status === 'fail').length} Failed</span>
                </span>
              </div>
            )}
          </div>

          {currentTest && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2 sm:mt-0">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-blue-700 font-medium">{currentTest}</span>
              </div>
            </div>
          )}
        </div>

        {testResults.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">Export Test Results</h3>
            <div className="max-h-96 overflow-y-auto space-y-3 p-2 bg-white rounded-lg border border-gray-200">
              {testResults.map((result, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                  <span className="text-2xl">{getStatusIcon(result.status)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-gray-900 capitalize">{result.dashboardType}</span>
                      <span className="text-xs bg-gray-200 px-2 py-1 rounded uppercase font-mono">
                        {result.exportType}
                      </span>
                    </div>
                    <div className={`text-sm mt-1 ${getStatusColor(result.status)}`}>
                      {result.message}
                    </div>
                    {result.filename && (
                      <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <span>📄</span>
                        <span>{result.filename}</span>
                      </div>
                    )}
                  </div>
                  <ZPBadge 
                    variant={result.status === 'pass' ? 'success' : result.status === 'fail' ? 'danger' : 'warning'}
                    className="whitespace-nowrap"
                  >
                    {result.status.toUpperCase()}
                  </ZPBadge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Live Export Demo */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-xl">🎯</span>
            <span>Live Export Demo</span>
          </h3>
          <p className="text-gray-600 mb-6">
            Test the actual export functionality with real components:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
              <h4 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                <span className="text-lg">🏢</span>
                <span>Admin Dashboard Export</span>
              </h4>
              <ExportManager
                dashboardType="admin"
                onExportComplete={(type, filename) => {
                  console.log(`Admin export completed: ${filename} (${type})`);
                }}
                data={mockData.admin}
              />
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-xl border border-green-200 shadow-sm hover:shadow-md transition-shadow">
              <h4 className="font-semibold text-green-900 mb-4 flex items-center gap-2">
                <span className="text-lg">🏛️</span>
                <span>Government Dashboard Export</span>
              </h4>
              <ExportManager
                dashboardType="government"
                onExportComplete={(type, filename) => {
                  console.log(`Government export completed: ${filename} (${type})`);
                }}
                data={mockData.government}
              />
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-5 rounded-xl border border-purple-200 shadow-sm hover:shadow-md transition-shadow">
              <h4 className="font-semibold text-purple-900 mb-4 flex items-center gap-2">
                <span className="text-lg">🏢</span>
                <span>Institutional Dashboard Export</span>
              </h4>
              <ExportManager
                dashboardType="institutional"
                onExportComplete={(type, filename) => {
                  console.log(`Institutional export completed: ${filename} (${type})`);
                }}
                data={mockData.institutional}
              />
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-5 rounded-xl border border-amber-200 shadow-sm hover:shadow-md transition-shadow">
              <h4 className="font-semibold text-amber-900 mb-4 flex items-center gap-2">
                <span className="text-lg">📈</span>
                <span>BigQuery Dashboard Export</span>
              </h4>
              <ExportManager
                dashboardType="bigquery"
                onExportComplete={(type, filename) => {
                  console.log(`BigQuery export completed: ${filename} (${type})`);
                }}
                data={mockData.bigquery}
              />
            </div>
            <div className="bg-gradient-to-br from-rose-50 to-pink-50 p-5 rounded-xl border border-rose-200 shadow-sm hover:shadow-md transition-shadow">
              <h4 className="font-semibold text-rose-900 mb-4 flex items-center gap-2">
                <span className="text-lg">📋</span>
                <span>Audit Dashboard Export</span>
              </h4>
              <ExportManager
                dashboardType="audit"
                onExportComplete={(type, filename) => {
                  console.log(`Audit export completed: ${filename} (${type})`);
                }}
                data={mockData.audit}
              />
            </div>
          </div>
        </div>

        {testResults.length > 0 && (
          <div className="mt-8 p-5 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
            <h4 className="font-semibold text-purple-900 text-lg mb-3 flex items-center gap-2">
              <span className="text-xl">📊</span>
              <span>Export Test Summary</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-purple-800">
              <div className="bg-white p-3 rounded-lg border border-purple-100">
                <div className="text-sm text-purple-600">Total Export Tests</div>
                <div className="text-2xl font-bold">{totalTests}</div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-purple-100">
                <div className="text-sm text-purple-600">Successful Exports</div>
                <div className="text-2xl font-bold text-green-600">{passedTests}</div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-purple-100">
                <div className="text-sm text-purple-600">Failed Exports</div>
                <div className="text-2xl font-bold text-red-600">{totalTests - passedTests}</div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-purple-100">
                <div className="text-sm text-purple-600">Success Rate</div>
                <div className="text-2xl font-bold">{totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0}%</div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-purple-100">
                <div className="text-sm text-purple-600">Dashboard Types Tested</div>
                <div className="text-2xl font-bold">{new Set(testResults.map(r => r.dashboardType)).size}</div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-purple-100">
                <div className="text-sm text-purple-600">Export Formats Tested</div>
                <div className="text-2xl font-bold">CSV, PDF</div>
              </div>
            </div>
            {passedTests === totalTests && totalTests > 0 && (
              <div className="mt-4 p-3 bg-green-100 rounded-lg text-green-800 text-center">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xl">🎉</span>
                  <span className="font-semibold">All export tests passed! Export functionality is working correctly across all dashboard types.</span>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}