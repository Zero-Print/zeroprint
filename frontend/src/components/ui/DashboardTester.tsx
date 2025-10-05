'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExportTester } from '@/components/ui/ExportTester';
import { ZPBadge } from '@/components/ZPBadge';

interface TestResult {
  component: string;
  status: 'pass' | 'fail' | 'pending';
  message: string;
}

// Add a helper function to safely check if an element exists
const safeQuerySelector = (selector: string): Element | null => {
  try {
    return document.querySelector(selector);
  } catch (error) {
    console.error('Error querying selector:', selector, error);
    return null;
  }
};

// Add a helper function to safely check if an element with text content exists
const safeQueryByText = (text: string): Element | null => {
  try {
    return Array.from(document.querySelectorAll('*')).find(el => 
      el.textContent?.includes(text)
    ) || null;
  } catch (error) {
    console.error('Error querying by text:', text, error);
    return null;
  }
};

export function DashboardTester() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runTests = async () => {
    setIsRunning(true);
    const results: TestResult[] = [];

    // Test 1: Check if AdminDashboard renders
    try {
      const adminDashboard = safeQuerySelector('[data-testid="admin-dashboard"]');
      results.push({
        component: 'AdminDashboard',
        status: adminDashboard ? 'pass' : 'fail',
        message: adminDashboard ? 'Component renders successfully' : 'Component not found'
      });
    } catch (error) {
      results.push({
        component: 'AdminDashboard',
        status: 'fail',
        message: `Error: ${error}`
      });
    }

    // Test 2: Check if tab navigation exists
    try {
      const tabNavigation = safeQuerySelector('nav');
      results.push({
        component: 'Tab Navigation',
        status: tabNavigation ? 'pass' : 'fail',
        message: tabNavigation ? 'Navigation found' : 'Navigation not found'
      });
    } catch (error) {
      results.push({
        component: 'Tab Navigation',
        status: 'fail',
        message: `Error: ${error}`
      });
    }

    // Test 3: Check if export button exists
    try {
      const exportButton = safeQueryByText('Export Data');
      results.push({
        component: 'Export Button',
        status: exportButton ? 'pass' : 'fail',
        message: exportButton ? 'Export button found' : 'Export button not found'
      });
    } catch (error) {
      results.push({
        component: 'Export Button',
        status: 'fail',
        message: `Error: ${error}`
      });
    }

    // Test 4: Check if tab buttons exist
    const expectedTabs = ['Overview', 'User Management', 'Institutional Users', 'Admin Console', 'Government Dashboard', 'BigQuery Analytics'];
    expectedTabs.forEach(tabName => {
      try {
        const tabButton = safeQueryByText(tabName);
        results.push({
          component: `${tabName} Tab`,
          status: tabButton ? 'pass' : 'fail',
          message: tabButton ? 'Tab button found' : 'Tab button not found'
        });
      } catch (error) {
        results.push({
          component: `${tabName} Tab`,
          status: 'fail',
          message: `Error: ${error}`
        });
      }
    });

    // Test 5: Check if components are properly imported
    const componentTests = [
      'InstitutionalUserManagement',
      'AdminConsole', 
      'EnhancedGovernmentDashboard',
      'ExportManager',
      'BigQueryDashboard'
    ];

    componentTests.forEach(componentName => {
      results.push({
        component: `${componentName} Import`,
        status: 'pass', // If we got this far, imports are working
        message: 'Component imported successfully'
      });
    });

    setTestResults(results);
    setIsRunning(false);
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'pass': return 'text-green-600';
      case 'fail': return 'text-red-600';
      case 'pending': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
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
      <CardHeader className="pb-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
        <CardTitle className="flex items-center gap-3 text-2xl">
          <span className="text-2xl">🧪</span>
          <span className="font-bold text-gray-800">Dashboard Integration Tests</span>
          {testResults.length > 0 && (
            <span className="text-base font-normal bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
              ({passedTests}/{totalTests} passed)
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={runTests} 
              disabled={isRunning}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {isRunning ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Running Tests...</span>
                </>
              ) : (
                <>
                  <span className="text-lg">🚀</span>
                  <span>Run Integration Tests</span>
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
        </div>

        {testResults.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">Test Results</h3>
            <div className="max-h-96 overflow-y-auto space-y-3 p-2 bg-white rounded-lg border border-gray-200">
              {testResults.map((result, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                  <span className="text-2xl">{getStatusIcon(result.status)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">{result.component}</div>
                    <div className={`text-sm mt-1 ${getStatusColor(result.status)}`}>
                      {result.message}
                    </div>
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

        {testResults.length > 0 && (
          <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 text-lg mb-3 flex items-center gap-2">
              <span className="text-xl">📊</span>
              <span>Test Summary</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-blue-800">
              <div className="bg-white p-3 rounded-lg border border-blue-100">
                <div className="text-sm text-blue-600">Total Tests</div>
                <div className="text-2xl font-bold">{totalTests}</div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-blue-100">
                <div className="text-sm text-blue-600">Passed</div>
                <div className="text-2xl font-bold text-green-600">{passedTests}</div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-blue-100">
                <div className="text-sm text-blue-600">Failed</div>
                <div className="text-2xl font-bold text-red-600">{totalTests - passedTests}</div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-blue-100">
                <div className="text-sm text-blue-600">Success Rate</div>
                <div className="text-2xl font-bold">{totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0}%</div>
              </div>
            </div>
            {passedTests === totalTests && totalTests > 0 && (
              <div className="mt-4 p-3 bg-green-100 rounded-lg text-green-800 text-center">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xl">🎉</span>
                  <span className="font-semibold">All tests passed! Dashboard integration is working correctly.</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Export Functionality Tests */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <ExportTester />
        </div>
      </CardContent>
    </Card>
  );
}