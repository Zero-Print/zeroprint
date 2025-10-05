'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  FileText, 
  Download, 
  Calendar, 
  Settings, 
  Users, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Clock,
  Mail,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { ESGMetricsEngine, ESGCalculatedMetrics } from '../../lib/esg/ESGMetricsEngine';
import { PDFReportGenerator, ReportConfig } from '../../lib/esg/PDFReportGenerator';
import { AutomatedReportScheduler, ScheduleConfig, ScheduledReport, EmailRecipient } from '../../lib/esg/AutomatedReportScheduler';

// ============================================================================
// ESG REPORT GENERATOR COMPONENT
// ============================================================================

interface ESGReportGeneratorProps {
  entityId: string;
  entityName: string;
  entityType: 'school' | 'msme';
  onReportGenerated?: (reportUrl: string) => void;
}

interface ReportGenerationState {
  isGenerating: boolean;
  progress: number;
  currentStep: string;
  error?: string;
  reportUrl?: string;
}

export const ESGReportGenerator: React.FC<ESGReportGeneratorProps> = ({
  entityId,
  entityName,
  entityType,
  onReportGenerated
}) => {
  // State management
  const [activeTab, setActiveTab] = useState<'generate' | 'schedule' | 'history'>('generate');
  const [generationState, setGenerationState] = useState<ReportGenerationState>({
    isGenerating: false,
    progress: 0,
    currentStep: 'Ready to generate'
  });
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    entityName,
    entityType,
    reportingPeriod: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    includeCharts: true,
    includeBenchmarks: true,
    includeRecommendations: true,
    includeExecutiveSummary: true
  });
  const [scheduleConfig, setScheduleConfig] = useState<Partial<ScheduleConfig>>({
    entityId,
    entityName,
    entityType,
    frequency: 'monthly',
    dayOfMonth: 1,
    recipients: [],
    isActive: true,
    timezone: 'UTC'
  });
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([]);
  const [esgMetrics, setEsgMetrics] = useState<ESGCalculatedMetrics | null>(null);

  // Initialize services (singleton instances)
  const metricsEngine = ESGMetricsEngine.getInstance();
  const pdfGenerator = PDFReportGenerator.getInstance();
  const scheduler = AutomatedReportScheduler.getInstance();

  /**
   * Load ESG metrics for the entity
   */
  const loadESGMetrics = useCallback(async () => {
    try {
      // In real implementation, fetch actual data from API
      const type = (entityType as any) || 'msme';
      const mockData = metricsEngine.generateMockData(type, 'medium');
      const calculatedMetrics = metricsEngine.calculateESGMetrics(mockData);
      setEsgMetrics(calculatedMetrics);
    } catch (error) {
      console.error('Failed to load ESG metrics:', error);
    }
  }, [entityId, entityType, metricsEngine]);

  /**
   * Load scheduled reports
   */
  const loadScheduledReports = useCallback(() => {
    const reports = scheduler.getScheduledReports(entityId);
    setScheduledReports(reports);
  }, [entityId, scheduler]);

  /**
   * Initialize scheduler
   */
  const initializeScheduler = useCallback(async () => {
    try {
      await scheduler.initialize();
    } catch (error) {
      console.error('Failed to initialize scheduler:', error);
    }
  }, [scheduler]);

  useEffect(() => {
    loadESGMetrics();
    loadScheduledReports();
    initializeScheduler();
  }, [loadESGMetrics, loadScheduledReports, initializeScheduler]);

  /**
   * Generate ESG report
   */
  const generateReport = async () => {
    try {
      setGenerationState({
        isGenerating: true,
        progress: 0,
        currentStep: 'Fetching entity data...'
      });

      // Step 1: Fetch data
      await new Promise(resolve => setTimeout(resolve, 1000));
      const type = (entityType as any) || 'msme';
      const rawData = metricsEngine.generateMockData(type, 'medium');
      
      setGenerationState(prev => ({
        ...prev,
        progress: 25,
        currentStep: 'Calculating ESG metrics...'
      }));

      // Step 2: Calculate metrics
      await new Promise(resolve => setTimeout(resolve, 1000));
      const calculatedMetrics = metricsEngine.calculateESGMetrics(rawData);
      setEsgMetrics(calculatedMetrics);

      setGenerationState(prev => ({
        ...prev,
        progress: 50,
        currentStep: 'Generating PDF report...'
      }));

      // Step 3: Generate PDF
      await new Promise(resolve => setTimeout(resolve, 2000));
      const reportUrl = await pdfGenerator.generateESGReport(rawData, calculatedMetrics, reportConfig);

      setGenerationState(prev => ({
        ...prev,
        progress: 100,
        currentStep: 'Report generated successfully!',
        reportUrl
      }));

      if (onReportGenerated) {
        onReportGenerated(reportUrl);
      }

      // Reset after 3 seconds
      setTimeout(() => {
        setGenerationState({
          isGenerating: false,
          progress: 0,
          currentStep: 'Ready to generate'
        });
      }, 3000);

    } catch (error) {
      setGenerationState({
        isGenerating: false,
        progress: 0,
        currentStep: 'Ready to generate',
        error: (error as Error).message
      });
    }
  };

  /**
   * Create automated schedule
   */
  const createSchedule = async () => {
    try {
      if (!scheduleConfig.recipients || scheduleConfig.recipients.length === 0) {
        throw new Error('At least one recipient is required');
      }

      const fullConfig: ScheduleConfig = {
        entityId,
        entityName,
        entityType,
        frequency: scheduleConfig.frequency || 'monthly',
        dayOfMonth: scheduleConfig.dayOfMonth || 1,
        recipients: scheduleConfig.recipients,
        reportConfig: reportConfig,
        isActive: scheduleConfig.isActive ?? true,
        timezone: scheduleConfig.timezone || 'UTC',
        customMessage: scheduleConfig.customMessage
      };

      await scheduler.createSchedule(fullConfig);
      loadScheduledReports();
      
      // Reset form
      setScheduleConfig({
        entityId,
        entityName,
        entityType,
        frequency: 'monthly',
        dayOfMonth: 1,
        recipients: [],
        isActive: true,
        timezone: 'UTC'
      });

    } catch (error) {
      console.error('Failed to create schedule:', error);
    }
  };

  /**
   * Add email recipient
   */
  const addRecipient = () => {
    const newRecipient: EmailRecipient = {
      email: '',
      name: '',
      role: 'manager',
      includeExecutiveSummary: true,
      includeFullReport: true
    };

    setScheduleConfig(prev => ({
      ...prev,
      recipients: [...(prev.recipients || []), newRecipient]
    }));
  };

  /**
   * Update recipient
   */
  const updateRecipient = (index: number, updates: Partial<EmailRecipient>) => {
    setScheduleConfig(prev => ({
      ...prev,
      recipients: prev.recipients?.map((recipient, i) => 
        i === index ? { ...recipient, ...updates } : recipient
      ) || []
    }));
  };

  /**
   * Remove recipient
   */
  const removeRecipient = (index: number) => {
    setScheduleConfig(prev => ({
      ...prev,
      recipients: prev.recipients?.filter((_, i) => i !== index) || []
    }));
  };

  /**
   * Render ESG metrics overview
   */
  const renderMetricsOverview = () => {
    if (!esgMetrics) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Environmental</p>
              <p className="text-3xl font-bold text-green-900">{esgMetrics.environmental.overallScore}</p>
            </div>
            <Activity className="h-8 w-8 text-green-600" />
          </div>
          <p className="text-sm text-green-700 mt-2">
            {esgMetrics.environmental.overallScore >= 70 ? 'Strong performance' : 'Needs improvement'}
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Social</p>
              <p className="text-3xl font-bold text-blue-900">{esgMetrics.social.overallScore}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
          <p className="text-sm text-blue-700 mt-2">
            {esgMetrics.social.overallScore >= 70 ? 'Strong performance' : 'Needs improvement'}
          </p>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Governance</p>
              <p className="text-3xl font-bold text-orange-900">{esgMetrics.governance.overallScore}</p>
            </div>
            <Settings className="h-8 w-8 text-orange-600" />
          </div>
          <p className="text-sm text-orange-700 mt-2">
            {esgMetrics.governance.overallScore >= 70 ? 'Strong performance' : 'Needs improvement'}
          </p>
        </div>
      </div>
    );
  };

  /**
   * Render report generation tab
   */
  const renderGenerateTab = () => (
    <div className="space-y-8">
      {renderMetricsOverview()}

      {/* Report Configuration */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Configuration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reporting Period
            </label>
            <input
              type="text"
              value={reportConfig.reportingPeriod}
              onChange={(e) => setReportConfig(prev => ({ ...prev, reportingPeriod: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Options
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={reportConfig.includeCharts}
                  onChange={(e) => setReportConfig(prev => ({ ...prev, includeCharts: e.target.checked }))}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="ml-2 text-sm text-gray-700">Include Charts</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={reportConfig.includeBenchmarks}
                  onChange={(e) => setReportConfig(prev => ({ ...prev, includeBenchmarks: e.target.checked }))}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="ml-2 text-sm text-gray-700">Include Benchmarks</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={reportConfig.includeRecommendations}
                  onChange={(e) => setReportConfig(prev => ({ ...prev, includeRecommendations: e.target.checked }))}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="ml-2 text-sm text-gray-700">Include Recommendations</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Generation Progress */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Generate Report</h3>
          {generationState.reportUrl && (
            <a
              href={generationState.reportUrl}
              download
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </a>
          )}
        </div>

        {generationState.isGenerating && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">{generationState.currentStep}</span>
              <span className="text-sm text-gray-600">{generationState.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${generationState.progress}%` }}
              />
            </div>
          </div>
        )}

        {generationState.error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-sm text-red-700">{generationState.error}</span>
            </div>
          </div>
        )}

        <button
          onClick={generateReport}
          disabled={generationState.isGenerating}
          className="w-full px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {generationState.isGenerating ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
              Generating Report...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <FileText className="h-5 w-5 mr-2" />
              Generate ESG Report
            </div>
          )}
        </button>
      </div>
    </div>
  );

  /**
   * Render schedule tab
   */
  const renderScheduleTab = () => (
    <div className="space-y-8">
      {/* Schedule Configuration */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Automated Report Schedule</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Frequency
            </label>
            <select
              value={scheduleConfig.frequency}
              onChange={(e) => setScheduleConfig(prev => ({ ...prev, frequency: e.target.value as ScheduleConfig['frequency'] }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="annually">Annually</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Day of Month
            </label>
            <input
              type="number"
              min={1}
              max={28}
              value={scheduleConfig.dayOfMonth}
              onChange={(e) => setScheduleConfig(prev => ({ ...prev, dayOfMonth: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timezone
            </label>
            <select
              value={scheduleConfig.timezone}
              onChange={(e) => setScheduleConfig(prev => ({ ...prev, timezone: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
            </select>
          </div>
        </div>

        {/* Email Recipients */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium text-gray-900">Email Recipients</h4>
            <button
              onClick={addRecipient}
              className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
            >
              Add Recipient
            </button>
          </div>

          <div className="space-y-4">
            {scheduleConfig.recipients?.map((recipient, index) => (
              <div key={index} className="border border-gray-200 rounded-md p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={recipient.name}
                      onChange={(e) => updateRecipient(index, { name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={recipient.email}
                      onChange={(e) => updateRecipient(index, { email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select
                      value={recipient.role}
                      onChange={(e) => updateRecipient(index, { role: e.target.value as EmailRecipient['role'] })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                      <option value="stakeholder">Stakeholder</option>
                      <option value="board_member">Board Member</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={() => removeRecipient(index)}
                      className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Message */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Custom Message (Optional)
          </label>
          <textarea
            value={scheduleConfig.customMessage || ''}
            onChange={(e) => setScheduleConfig(prev => ({ ...prev, customMessage: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Add a custom message to include in the email..."
          />
        </div>

        <button
          onClick={createSchedule}
          className="w-full px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          <div className="flex items-center justify-center">
            <Calendar className="h-5 w-5 mr-2" />
            Create Schedule
          </div>
        </button>
      </div>
    </div>
  );

  /**
   * Render history tab
   */
  const renderHistoryTab = () => (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Scheduled Reports</h3>
        
        {scheduledReports.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No scheduled reports found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {scheduledReports.map((report) => (
              <div key={report.id} className="border border-gray-200 rounded-md p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{report.reportType.replace('_', ' ').toUpperCase()}</h4>
                    <p className="text-sm text-gray-600">
                      Scheduled: {report.scheduledDate.toLocaleDateString()}
                    </p>
                    {report.generatedDate && (
                      <p className="text-sm text-gray-600">
                        Generated: {report.generatedDate.toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      {report.status === 'completed' && <CheckCircle className="h-5 w-5 text-green-600" />}
                      {report.status === 'pending' && <Clock className="h-5 w-5 text-yellow-600" />}
                      {report.status === 'generating' && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600" />}
                      {report.status === 'failed' && <AlertCircle className="h-5 w-5 text-red-600" />}
                      <span className="ml-2 text-sm text-gray-600 capitalize">{report.status}</span>
                    </div>
                    {report.reportUrl && (
                      <a
                        href={report.reportUrl}
                        download
                        className="inline-flex items-center px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </a>
                    )}
                  </div>
                </div>
                
                {report.emailsSent > 0 && (
                  <div className="mt-2 flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-1" />
                    {report.emailsSent} emails sent
                    {report.emailsFailed > 0 && (
                      <span className="text-red-600 ml-2">({report.emailsFailed} failed)</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">ESG Report Generator</h1>
        <p className="text-gray-600">
          Generate comprehensive ESG reports for {entityName} with automated scheduling and delivery
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'generate', label: 'Generate Report', icon: FileText },
            { id: 'schedule', label: 'Schedule Reports', icon: Calendar },
            { id: 'history', label: 'Report History', icon: BarChart3 }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === id
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="h-5 w-5 mr-2" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'generate' && renderGenerateTab()}
      {activeTab === 'schedule' && renderScheduleTab()}
      {activeTab === 'history' && renderHistoryTab()}
    </div>
  );
};

export default ESGReportGenerator;
