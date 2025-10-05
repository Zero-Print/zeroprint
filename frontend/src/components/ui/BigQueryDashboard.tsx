'use client';

import React, { useState, useEffect } from 'react';
import { ZPCard } from '@/components/ZPCard';
import { ZPButton } from '@/components/ZPButton';
import { ZPBadge } from '@/components/ZPBadge';
import {
  Database,
  Download,
  Upload,
  Calendar,
  Clock,
  Settings,
  Play,
  Pause,
  Trash2,
  Plus,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  XCircle,
  BarChart3,
  FileText,
  Activity,
  Zap,
  Globe,
  Server,
  HardDrive,
  Timer,
  TrendingUp,
  Eye,
  Edit
} from 'lucide-react';
import { getBigQueryService } from '@/lib/services/bigquery';

// ============================================================================
// INTERFACES
// ============================================================================

interface ExportJob {
  id: string;
  type: 'user' | 'entity' | 'esg' | 'government';
  status: 'running' | 'completed' | 'failed' | 'scheduled';
  startTime: Date;
  endTime?: Date;
  recordCount?: number;
  fileSize?: number;
  errorMessage?: string;
}

interface ScheduledExport {
  id: string;
  exportType: 'user' | 'entity' | 'esg' | 'government';
  schedule: {
    frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
    time?: string;
    dayOfWeek?: number;
    dayOfMonth?: number;
    timezone?: string;
  };
  status: 'active' | 'paused' | 'error';
  lastRun?: Date;
  nextRun?: Date;
  totalRuns: number;
  successRate: number;
}

interface BigQueryStats {
  totalTables: number;
  totalRows: number;
  totalSizeGB: number;
  dailyExports: number;
  weeklyExports: number;
  monthlyExports: number;
  successRate: number;
  avgExportTime: number;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface BigQueryDashboardProps {
  onExportComplete?: (exportId: string) => void;
}

export const BigQueryDashboard: React.FC<BigQueryDashboardProps> = ({
  onExportComplete
}) => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'exports' | 'schedules' | 'analytics'>('overview');
  const [stats, setStats] = useState<BigQueryStats | null>(null);
  const [exportJobs, setExportJobs] = useState<ExportJob[]>([]);
  const [scheduledExports, setScheduledExports] = useState<ScheduledExport[]>([]);
  const [showCreateSchedule, setShowCreateSchedule] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    end: new Date()
  });

  const bigQueryService = getBigQueryService();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load BigQuery statistics
      const mockStats: BigQueryStats = {
        totalTables: 5,
        totalRows: 1250000,
        totalSizeGB: 45.7,
        dailyExports: 12,
        weeklyExports: 84,
        monthlyExports: 360,
        successRate: 98.5,
        avgExportTime: 2.3
      };
      setStats(mockStats);

      // Load recent export jobs
      const mockJobs: ExportJob[] = [
        {
          id: 'export_user_1758470001',
          type: 'user',
          status: 'completed',
          startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
          endTime: new Date(Date.now() - 2 * 60 * 60 * 1000 + 3 * 60 * 1000),
          recordCount: 15420,
          fileSize: 2.3
        },
        {
          id: 'export_esg_1758470002',
          type: 'esg',
          status: 'running',
          startTime: new Date(Date.now() - 15 * 60 * 1000)
        },
        {
          id: 'export_entity_1758470003',
          type: 'entity',
          status: 'failed',
          startTime: new Date(Date.now() - 4 * 60 * 60 * 1000),
          endTime: new Date(Date.now() - 4 * 60 * 60 * 1000 + 1 * 60 * 1000),
          errorMessage: 'Authentication failed'
        }
      ];
      setExportJobs(mockJobs);

      // Load scheduled exports with mock data since getScheduledExports doesn't exist
      const mockSchedules: ScheduledExport[] = [
        {
          id: 'schedule-1',
          exportType: 'user',
          schedule: {
            frequency: 'daily',
            time: '02:00',
            timezone: 'UTC'
          },
          status: 'active',
          lastRun: new Date(Date.now() - 24 * 60 * 60 * 1000),
          nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000),
          totalRuns: 45,
          successRate: 98.2
        },
        {
          id: 'schedule-2',
          exportType: 'entity',
          schedule: {
            frequency: 'weekly',
            dayOfWeek: 1, // Monday
            time: '03:00',
            timezone: 'UTC'
          },
          status: 'active',
          lastRun: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          nextRun: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000) - (24 * 60 * 60 * 1000)),
          totalRuns: 12,
          successRate: 95.8
        }
      ];
      setScheduledExports(mockSchedules);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManualExport = async (exportType: 'user' | 'entity' | 'esg' | 'government') => {
    try {
      const newJob: ExportJob = {
        id: `export_${exportType}_${Date.now()}`,
        type: exportType,
        status: 'running',
        startTime: new Date()
      };
      
      setExportJobs(prev => [newJob, ...prev]);

      let exportId: string;
      switch (exportType) {
        case 'user':
          exportId = await bigQueryService.exportTable('users', 'gs://mock-bucket/users.csv', { format: 'CSV' });
          break;
        case 'entity':
          exportId = await bigQueryService.exportTable('entities', 'gs://mock-bucket/entities.csv', { format: 'CSV' });
          break;
        case 'esg':
          exportId = await bigQueryService.exportTable('esg_metrics', 'gs://mock-bucket/esg.csv', { format: 'CSV' });
          break;
        case 'government':
          exportId = await bigQueryService.exportTable('government_data', 'gs://mock-bucket/gov.csv', { format: 'CSV' });
          break;
        default:
          exportId = `export-${Date.now()}`;
      }

      // Update job status
      setExportJobs(prev => prev.map(job => 
        job.id === newJob.id 
          ? { ...job, status: 'completed', endTime: new Date(), recordCount: Math.floor(Math.random() * 10000) + 1000 }
          : job
      ));

      if (onExportComplete) {
        onExportComplete(exportId);
      }
    } catch (error: any) {
      console.error('Export failed:', error);
      setExportJobs(prev => prev.map(job => 
        job.id.includes(exportType) && job.status === 'running'
          ? { ...job, status: 'failed', endTime: new Date(), errorMessage: error.message || 'Export failed' }
          : job
      ));
    }
  };

  const handleCreateSchedule = async (scheduleData: any) => {
    try {
      const scheduleId = await bigQueryService.scheduleExport(
        'users',
        'gs://mock-bucket/scheduled-export.csv',
        { format: 'CSV' },
        scheduleData.schedule
      );
      
      const newSchedule: ScheduledExport = {
        id: scheduleId,
        exportType: scheduleData.exportType,
        schedule: scheduleData.schedule,
        status: 'active',
        nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        totalRuns: 0,
        successRate: 100
      };
      
      setScheduledExports(prev => [...prev, newSchedule]);
      setShowCreateSchedule(false);
    } catch (error: any) {
      console.error('Error creating schedule:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'running':
        return <Activity className="h-4 w-4 text-blue-500 animate-pulse" />;
      case 'failed':
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
      case 'active':
        return 'success';
      case 'running':
        return 'info';
      case 'failed':
      case 'error':
        return 'danger';
      case 'paused':
        return 'warning';
      default:
        return 'info';
    }
  };

  const formatFileSize = (sizeGB: number) => {
    if (sizeGB < 1) return `${(sizeGB * 1024).toFixed(1)} MB`;
    return `${sizeGB.toFixed(1)} GB`;
  };

  const formatDuration = (start: Date, end?: Date) => {
    if (!end) return 'Running...';
    const duration = (end.getTime() - start.getTime()) / 1000;
    if (duration < 60) return `${duration.toFixed(0)}s`;
    return `${(duration / 60).toFixed(1)}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-white rounded-xl shadow-sm p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">BigQuery Analytics</h2>
          <p className="text-gray-600 mt-1">
            Data export management and scheduled analytics reporting
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <ZPButton variant="outline" size="sm" onClick={loadDashboardData} className="flex items-center gap-2 bg-white hover:bg-gray-50 border-gray-300">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </ZPButton>
          <ZPButton size="sm" onClick={() => setShowCreateSchedule(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            Schedule Export
          </ZPButton>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex flex-wrap gap-4">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'exports', label: 'Manual Exports', icon: Download },
            { id: 'schedules', label: 'Scheduled Jobs', icon: Calendar },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-blue-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ZPCard title="Total Data" description="Across all tables">
              <div className="text-center py-4">
                <HardDrive className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold text-gray-900">{formatFileSize(stats.totalSizeGB)}</div>
                <div className="text-sm text-gray-500">{stats.totalRows.toLocaleString()} rows</div>
              </div>
            </ZPCard>

            <ZPCard title="Export Success Rate" description="Last 30 days">
              <div className="text-center py-4">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold text-green-600">{stats.successRate}%</div>
                <div className="text-sm text-gray-500">{stats.monthlyExports} exports</div>
              </div>
            </ZPCard>

            <ZPCard title="Avg Export Time" description="Processing duration">
              <div className="text-center py-4">
                <Timer className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <div className="text-2xl font-bold text-purple-600">{stats.avgExportTime}m</div>
                <div className="text-sm text-gray-500">Average duration</div>
              </div>
            </ZPCard>

            <ZPCard title="Daily Exports" description="Automated & manual">
              <div className="text-center py-4">
                <Activity className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                <div className="text-2xl font-bold text-orange-600">{stats.dailyExports}</div>
                <div className="text-sm text-gray-500">Today</div>
              </div>
            </ZPCard>
          </div>

          {/* Recent Activity */}
          <ZPCard title="Recent Export Activity" description="Latest data export jobs">
            <div className="space-y-3">
              {exportJobs.slice(0, 5).map((job) => (
                <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(job.status)}
                    <div>
                      <div className="font-medium capitalize">{job.type} Analytics Export</div>
                      <div className="text-sm text-gray-500">
                        {job.startTime.toLocaleString()} • {formatDuration(job.startTime, job.endTime)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <ZPBadge variant={getStatusBadgeVariant(job.status)}>
                      {job.status}
                    </ZPBadge>
                    {job.recordCount && (
                      <div className="text-sm text-gray-500 mt-1">
                        {job.recordCount.toLocaleString()} records
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ZPCard>
        </div>
      )}

      {/* Manual Exports Tab */}
      {activeTab === 'exports' && (
        <div className="space-y-6">
          {/* Date Range Selector */}
          <ZPCard title="Export Configuration" description="Configure date range and export options">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={selectedDateRange.start.toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDateRange(prev => ({ ...prev, start: new Date(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={selectedDateRange.end.toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDateRange(prev => ({ ...prev, end: new Date(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </ZPCard>

          {/* Export Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { type: 'user', label: 'User Analytics', icon: Database, description: 'Individual user metrics and behavior' },
              { type: 'entity', label: 'Entity Analytics', icon: Server, description: 'School and MSME performance data' },
              { type: 'esg', label: 'ESG Metrics', icon: Globe, description: 'Environmental, Social, Governance data' },
              { type: 'government', label: 'Government Data', icon: FileText, description: 'Ward-level citizen analytics' }
            ].map((exportType) => (
              <ZPCard 
                key={exportType.type}
                title={exportType.label} 
                description={exportType.description}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleManualExport(exportType.type as any)}
              >
                <div className="text-center py-4">
                  <exportType.icon className="h-8 w-8 mx-auto mb-3 text-blue-600" />
                  <ZPButton variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Export Now
                  </ZPButton>
                </div>
              </ZPCard>
            ))}
          </div>

          {/* Export History */}
          <ZPCard title="Export History" description="Recent manual and scheduled exports">
            <div className="space-y-3">
              {exportJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-4">
                    {getStatusIcon(job.status)}
                    <div>
                      <div className="font-medium capitalize">{job.type} Analytics</div>
                      <div className="text-sm text-gray-500">
                        Started: {job.startTime.toLocaleString()}
                      </div>
                      {job.errorMessage && (
                        <div className="text-sm text-red-600 mt-1">{job.errorMessage}</div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <ZPBadge variant={getStatusBadgeVariant(job.status)}>
                      {job.status}
                    </ZPBadge>
                    <div className="text-sm text-gray-500 mt-1">
                      {job.recordCount ? `${job.recordCount.toLocaleString()} records` : 'Processing...'}
                    </div>
                    {job.fileSize && (
                      <div className="text-sm text-gray-500">
                        {formatFileSize(job.fileSize)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ZPCard>
        </div>
      )}

      {/* Scheduled Jobs Tab */}
      {activeTab === 'schedules' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {scheduledExports.map((schedule) => (
              <ZPCard 
                key={schedule.id}
                title={`${schedule.exportType.charAt(0).toUpperCase() + schedule.exportType.slice(1)} Export`}
                description={`${schedule.schedule.frequency} at ${schedule.schedule.time || 'default time'}`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(schedule.status)}
                      <span className="font-medium">Status</span>
                    </div>
                    <ZPBadge variant={getStatusBadgeVariant(schedule.status)}>
                      {schedule.status}
                    </ZPBadge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Total Runs:</span>
                      <div className="font-medium">{schedule.totalRuns}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Success Rate:</span>
                      <div className="font-medium">{schedule.successRate.toFixed(1)}%</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Last Run:</span>
                      <div className="font-medium">
                        {schedule.lastRun ? schedule.lastRun.toLocaleDateString() : 'Never'}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Next Run:</span>
                      <div className="font-medium">
                        {schedule.nextRun ? schedule.nextRun.toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <ZPButton variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </ZPButton>
                    <ZPButton variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View Logs
                    </ZPButton>
                    <ZPButton variant="outline" size="sm">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </ZPButton>
                  </div>
                </div>
              </ZPCard>
            ))}
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <ZPCard title="Export Analytics" description="Performance metrics and insights">
            <div className="text-center py-8 text-gray-500">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Advanced Analytics Coming Soon</p>
              <p className="text-sm">Detailed export performance metrics and trends</p>
            </div>
          </ZPCard>
        </div>
      )}
    </div>
  );
};

export default BigQueryDashboard;