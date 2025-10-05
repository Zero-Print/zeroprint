'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { redirect } from 'next/navigation';
import { ZPCard } from '@/components/ZPCard';
import { ZPButton } from '@/components/ZPButton';
import { ZPBadge } from '@/components/ZPBadge';
import { FileText, Download, BarChart3, TrendingUp, Calendar, Filter, PieChart, LineChart, Database, Users, Leaf } from 'lucide-react';

export default function ReportsPage() {
  const { user } = useAuth();

  // Role-based access control
  if (!user) {
    redirect('/auth/login');
  }

  const userRole = (user as any)?.role;
  if (userRole !== 'school' && userRole !== 'msme') {
    redirect('/dashboard');
  }

  // Mock data for reports
  const [reports] = useState([
    {
      id: '1',
      title: 'Monthly Sustainability Report',
      period: 'January 2024',
      type: 'Monthly',
      status: 'generated',
      fileSize: '2.4 MB',
      generatedAt: '2024-02-01',
    },
    {
      id: '2',
      title: 'Class Performance Analytics',
      period: 'Q4 2023',
      type: 'Quarterly',
      status: 'generated',
      fileSize: '5.1 MB',
      generatedAt: '2024-01-15',
    },
    {
      id: '3',
      title: 'Student Engagement Report',
      period: '2023',
      type: 'Annual',
      status: 'generating',
      fileSize: '-',
      generatedAt: '2024-02-05',
    },
    {
      id: '4',
      title: 'Carbon Impact Assessment',
      period: 'January 2024',
      type: 'Custom',
      status: 'scheduled',
      fileSize: '-',
      generatedAt: '2024-02-10',
    },
  ]);

  const roleStyles = {
    gradient: userRole === 'school' ? 'from-orange-600 to-red-600' : 'from-emerald-600 to-teal-600',
    bg: userRole === 'school' ? 'bg-gradient-to-br from-orange-50 to-red-50' : 'bg-gradient-to-br from-emerald-50 to-teal-50',
    text: userRole === 'school' ? 'text-orange-600' : 'text-emerald-600',
    border: userRole === 'school' ? 'border-orange-200' : 'border-emerald-200',
    card: userRole === 'school' ? 'bg-white border border-orange-100 shadow-sm' : 'bg-white border border-emerald-100 shadow-sm',
    button: userRole === 'school' ? 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700' : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700'
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'generated': return 'success';
      case 'generating': return 'warning';
      case 'scheduled': return 'info';
      default: return 'default';
    }
  };

  return (
    <div className={`min-h-screen ${roleStyles.bg}`}>
      {/* Header */}
      <div className='bg-white border-b border-gray-200 shadow-sm'>
        <div className='container mx-auto px-6 py-6'>
          <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
            <div className='flex items-center gap-4'>
              <div className='flex items-center gap-3'>
                <div className={`p-3 bg-gradient-to-r ${roleStyles.gradient} rounded-xl shadow-lg`}>
                  <BarChart3 className='h-8 w-8 text-white' />
                </div>
                <div>
                  <h1 className='text-3xl font-bold text-gray-900 flex items-center gap-2'>
                    Reports & Analytics
                  </h1>
                  <p className='text-gray-600'>Generate and download detailed sustainability reports</p>
                </div>
              </div>
              <ZPBadge variant='warning' className='ml-auto lg:ml-0 text-lg py-2 px-4'>
                {userRole === 'school' ? 'School' : 'MSME'} Dashboard
              </ZPBadge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6 space-y-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ZPCard className={`${roleStyles.card} p-6 hover:shadow-md transition-shadow`}>
            <div className="flex items-center">
              <div className={`p-3 rounded-full bg-gradient-to-r ${roleStyles.gradient} text-white`}>
                <FileText className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Reports</p>
                <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
              </div>
            </div>
          </ZPCard>

          <ZPCard className={`${roleStyles.card} p-6 hover:shadow-md transition-shadow`}>
            <div className="flex items-center">
              <div className={`p-3 rounded-full bg-gradient-to-r ${roleStyles.gradient} text-white`}>
                <PieChart className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Generated</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reports.filter(r => r.status === 'generated').length}
                </p>
              </div>
            </div>
          </ZPCard>

          <ZPCard className={`${roleStyles.card} p-6 hover:shadow-md transition-shadow`}>
            <div className="flex items-center">
              <div className={`p-3 rounded-full bg-gradient-to-r ${roleStyles.gradient} text-white`}>
                <Database className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Report Size</p>
                <p className="text-2xl font-bold text-gray-900">2.1 MB</p>
              </div>
            </div>
          </ZPCard>
        </div>

        {/* Reports List */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="h-5 w-5 text-orange-600" />
              All Reports
            </h2>
            <div className="flex gap-3">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Filter by date..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <select className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 appearance-none bg-white">
                  <option>All Types</option>
                  <option>Monthly</option>
                  <option>Quarterly</option>
                  <option>Annual</option>
                  <option>Custom</option>
                </select>
              </div>
              <ZPButton className={`${roleStyles.button} flex items-center gap-2`}>
                <FileText className="h-4 w-4" />
                Generate Report
              </ZPButton>
            </div>
          </div>

          <div className="space-y-4">
            {reports.map((report) => (
              <ZPCard key={report.id} className={`${roleStyles.card} p-6 hover:shadow-lg transition-all duration-300`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-full bg-gradient-to-r ${roleStyles.gradient} text-white`}>
                      <FileText className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{report.title}</h3>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <ZPBadge variant="secondary">{report.period}</ZPBadge>
                        <ZPBadge variant="info">{report.type}</ZPBadge>
                        <ZPBadge variant={getStatusColor(report.status) as any}>
                          {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                        </ZPBadge>
                      </div>
                      <p className="text-sm text-gray-600 mt-3 flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Generated: {new Date(report.generatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {report.fileSize !== '-' && (
                      <span className="text-sm text-gray-600 bg-orange-50 px-3 py-1 rounded-full">{report.fileSize}</span>
                    )}
                    <ZPButton 
                      variant="outline" 
                      size="sm"
                      disabled={report.status !== 'generated'}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </ZPButton>
                  </div>
                </div>
              </ZPCard>
            ))}
          </div>
        </div>

        {/* Report Templates */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <LineChart className="h-5 w-5 text-orange-600" />
            Report Templates
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ZPCard className={`${roleStyles.card} p-6 hover:shadow-lg transition-all duration-300`}>
              <div className="p-1">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${roleStyles.gradient} flex items-center justify-center mb-4`}>
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Student Performance</h3>
                <p className="text-sm text-gray-600 mb-4">Track individual and class performance metrics</p>
                <ZPButton variant="outline" size="sm" className="w-full">
                  Generate
                </ZPButton>
              </div>
            </ZPCard>
            
            <ZPCard className={`${roleStyles.card} p-6 hover:shadow-lg transition-all duration-300`}>
              <div className="p-1">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${roleStyles.gradient} flex items-center justify-center mb-4`}>
                  <Leaf className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Carbon Impact</h3>
                <p className="text-sm text-gray-600 mb-4">Measure CO2 reduction and environmental impact</p>
                <ZPButton variant="outline" size="sm" className="w-full">
                  Generate
                </ZPButton>
              </div>
            </ZPCard>
            
            <ZPCard className={`${roleStyles.card} p-6 hover:shadow-lg transition-all duration-300`}>
              <div className="p-1">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${roleStyles.gradient} flex items-center justify-center mb-4`}>
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Engagement Analytics</h3>
                <p className="text-sm text-gray-600 mb-4">Analyze participation and engagement trends</p>
                <ZPButton variant="outline" size="sm" className="w-full">
                  Generate
                </ZPButton>
              </div>
            </ZPCard>
          </div>
        </div>
      </div>
    </div>
  );
}