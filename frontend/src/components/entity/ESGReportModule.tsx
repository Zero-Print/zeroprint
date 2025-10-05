'use client';

import React, { useState, useCallback } from 'react';
import { ZPCard } from '@/components/ZPCard';
import { ZPButton } from '@/components/ZPButton';
import { FileText, Download, Calendar, BarChart2, CheckCircle } from 'lucide-react';

interface ESGReportModuleProps {
  entityId: string;
  entityType: 'school' | 'msme';
  reportingPeriod?: 'monthly' | 'quarterly' | 'yearly';
  onExportReport?: (format: 'pdf' | 'csv') => void;
}

export const ESGReportModule: React.FC<ESGReportModuleProps> = ({
  entityId,
  entityType,
  reportingPeriod = 'monthly',
  onExportReport,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>(reportingPeriod);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null);
  
  // Mock ESG metrics - in a real app, these would come from an API
  const esgMetrics = {
    environmental: {
      carbonFootprint: 12500, // kg CO2e
      energyConsumption: 45000, // kWh
      wasteReduction: 35, // percentage
      renewableEnergy: 25, // percentage
    },
    social: {
      employeeWellbeing: 82, // score out of 100
      communityEngagement: 75, // score out of 100
      diversityIndex: 68, // score out of 100
      trainingHours: 450, // hours
    },
    governance: {
      complianceScore: 95, // score out of 100
      transparencyIndex: 88, // score out of 100
      ethicsRating: 90, // score out of 100
      reportingQuality: 85, // score out of 100
    }
  };
  
  const generateReport = useCallback(async () => {
    setIsGenerating(true);
    
    // Simulate API call to generate report
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setLastGenerated(new Date());
      setIsGenerating(false);
    } catch (error) {
      console.error('Error generating ESG report:', error);
      setIsGenerating(false);
    }
  }, []);
  
  const handleExport = useCallback((format: 'pdf' | 'csv') => {
    if (onExportReport) {
      onExportReport(format);
    } else {
      console.log(`Exporting ${format} report for ${entityId}`);
      // In a real app, this would trigger a download
    }
  }, [entityId, onExportReport]);
  
  return (
    <ZPCard className="w-full">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-500" />
          <h3 className="font-medium text-gray-800">ESG Report Generator</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Period:</span>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="text-sm border border-gray-200 rounded-md px-2 py-1"
          >
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
      </div>
      
      <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-1 md:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-green-700 mb-2">Environmental</h4>
              <ul className="space-y-2">
                <li className="flex justify-between">
                  <span className="text-xs text-gray-600">Carbon Footprint:</span>
                  <span className="text-xs font-medium">{esgMetrics.environmental.carbonFootprint} kg</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-xs text-gray-600">Energy Usage:</span>
                  <span className="text-xs font-medium">{esgMetrics.environmental.energyConsumption} kWh</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-xs text-gray-600">Waste Reduction:</span>
                  <span className="text-xs font-medium">{esgMetrics.environmental.wasteReduction}%</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-xs text-gray-600">Renewable Energy:</span>
                  <span className="text-xs font-medium">{esgMetrics.environmental.renewableEnergy}%</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-blue-700 mb-2">Social</h4>
              <ul className="space-y-2">
                <li className="flex justify-between">
                  <span className="text-xs text-gray-600">Wellbeing Score:</span>
                  <span className="text-xs font-medium">{esgMetrics.social.employeeWellbeing}/100</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-xs text-gray-600">Community Engagement:</span>
                  <span className="text-xs font-medium">{esgMetrics.social.communityEngagement}/100</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-xs text-gray-600">Diversity Index:</span>
                  <span className="text-xs font-medium">{esgMetrics.social.diversityIndex}/100</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-xs text-gray-600">Training Hours:</span>
                  <span className="text-xs font-medium">{esgMetrics.social.trainingHours} hrs</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-purple-700 mb-2">Governance</h4>
              <ul className="space-y-2">
                <li className="flex justify-between">
                  <span className="text-xs text-gray-600">Compliance:</span>
                  <span className="text-xs font-medium">{esgMetrics.governance.complianceScore}/100</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-xs text-gray-600">Transparency:</span>
                  <span className="text-xs font-medium">{esgMetrics.governance.transparencyIndex}/100</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-xs text-gray-600">Ethics Rating:</span>
                  <span className="text-xs font-medium">{esgMetrics.governance.ethicsRating}/100</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-xs text-gray-600">Reporting Quality:</span>
                  <span className="text-xs font-medium">{esgMetrics.governance.reportingQuality}/100</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Report Summary</h4>
            <div className="flex items-center gap-4 mb-2">
              <div className="flex items-center gap-1">
                <BarChart2 className="h-4 w-4 text-green-500" />
                <span className="text-xs text-gray-600">Environmental Score:</span>
                <span className="text-xs font-medium">
                  {Math.round((esgMetrics.environmental.wasteReduction + 
                              esgMetrics.environmental.renewableEnergy) / 2)}%
                </span>
              </div>
              <div className="flex items-center gap-1">
                <BarChart2 className="h-4 w-4 text-blue-500" />
                <span className="text-xs text-gray-600">Social Score:</span>
                <span className="text-xs font-medium">
                  {Math.round((esgMetrics.social.employeeWellbeing + 
                              esgMetrics.social.communityEngagement + 
                              esgMetrics.social.diversityIndex) / 3)}%
                </span>
              </div>
              <div className="flex items-center gap-1">
                <BarChart2 className="h-4 w-4 text-purple-500" />
                <span className="text-xs text-gray-600">Governance Score:</span>
                <span className="text-xs font-medium">
                  {Math.round((esgMetrics.governance.complianceScore + 
                              esgMetrics.governance.transparencyIndex + 
                              esgMetrics.governance.ethicsRating + 
                              esgMetrics.governance.reportingQuality) / 4)}%
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar className="h-3 w-3" />
              <span>
                {lastGenerated 
                  ? `Last generated: ${lastGenerated.toLocaleDateString()} at ${lastGenerated.toLocaleTimeString()}`
                  : 'No reports generated yet'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Generate Report</h4>
            <p className="text-xs text-gray-500 mb-4">
              Generate an ESG report for your {entityType === 'school' ? 'school' : 'organization'} based on the selected time period.
            </p>
            <ZPButton
              onClick={generateReport}
              disabled={isGenerating}
              className="w-full mb-2"
            >
              {isGenerating ? 'Generating...' : 'Generate Report'}
            </ZPButton>
            
            <div className="mt-4">
              <h5 className="text-xs font-medium text-gray-700 mb-2">Export Options</h5>
              <div className="flex gap-2">
                <ZPButton
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport('pdf')}
                  disabled={!lastGenerated || isGenerating}
                  className="flex-1"
                >
                  <Download className="h-3 w-3 mr-1" />
                  PDF
                </ZPButton>
                <ZPButton
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport('csv')}
                  disabled={!lastGenerated || isGenerating}
                  className="flex-1"
                >
                  <Download className="h-3 w-3 mr-1" />
                  CSV
                </ZPButton>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Compliance Checklist</h4>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <span className="text-xs text-gray-600">Environmental data collection complete</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <span className="text-xs text-gray-600">Social metrics verified</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <span className="text-xs text-gray-600">Governance policies documented</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <span className="text-xs text-gray-600">Stakeholder feedback incorporated</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </ZPCard>
  );
};

export default ESGReportModule;