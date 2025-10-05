'use client';

import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet, ChevronDown } from 'lucide-react';
import { ZPButton } from '@/components/ZPButton';
import { exportCitizenData, exportEntityData, exportGovernmentData } from '@/lib/utils/exportUtils';
import { useAuth } from '@/modules/auth';
import { loggingUtils } from '@/lib/data/logging';

interface ExportButtonProps {
  dashboardType: 'citizen' | 'entity' | 'government' | 'admin';
  entityType?: 'school' | 'msme';
  id: string;
  data: any;
  timeframe?: string;
  reportType?: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  dashboardType,
  entityType = 'school',
  id,
  data,
  timeframe = 'monthly',
  reportType = 'default',
  className = '',
  variant = 'default',
  size = 'md'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  const handleExport = async (format: 'csv' | 'pdf') => {
    setIsOpen(false);
    
    // Log the export action with audit trail
    if (user) {
      await loggingUtils.logUserAction({
        userId: user.id,
        action: `dashboard_export_${format}`,
        resource: `${dashboardType}_dashboard`,
        resourceId: id,
        details: {
          format,
          dashboardType,
          entityType: dashboardType === 'entity' ? entityType : undefined,
          timeframe: dashboardType === 'government' || dashboardType === 'admin' ? timeframe : undefined,
          reportType
        },
        requiresAudit: true
      });
    }
    
    switch (dashboardType) {
      case 'citizen':
        exportCitizenData(id, data, format);
        break;
      case 'entity':
        exportEntityData(id, entityType, data, format);
        break;
      case 'government':
        exportGovernmentData(id, timeframe, data, format);
        break;
      case 'admin':
        // Use government export as fallback for admin
        exportGovernmentData(id, timeframe || 'monthly', data, format);
        break;
    }
  };

  return (
    <div className="relative inline-block">
      <ZPButton
        variant={variant}
        size={size}
        className={`flex items-center ${className}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Download className="h-4 w-4 mr-2" />
        Export
        <ChevronDown className="h-4 w-4 ml-1" />
      </ZPButton>
      
      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="export-button"
        >
          <div className="py-1" role="none">
            <button
              className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              role="menuitem"
              onClick={() => handleExport('csv')}
            >
              <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />
              Export as CSV
            </button>
            <button
              className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              role="menuitem"
              onClick={() => handleExport('pdf')}
            >
              <FileText className="h-4 w-4 mr-2 text-blue-600" />
              Export as PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportButton;