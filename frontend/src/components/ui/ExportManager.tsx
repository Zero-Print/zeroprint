'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Download, FileText, Table } from 'lucide-react';
import { format } from 'date-fns';

interface ExportData {
  users?: any[];
  organizations?: any[];
  transactions?: any[];
  auditLogs?: any[];
  wards?: any[];
  kpiData?: any[];
  bigqueryData?: any[];
  systemMetrics?: any[];
}

interface ExportManagerProps {
  data: ExportData;
  dashboardType: 'admin' | 'government' | 'institutional' | 'bigquery' | 'audit';
  onExportComplete?: (type: 'csv' | 'pdf', filename: string) => void;
}

export function ExportManager({ data, dashboardType, onExportComplete }: ExportManagerProps) {
  const [exportType, setExportType] = useState<'csv' | 'pdf'>('csv');
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [isExporting, setIsExporting] = useState(false);

  const getAvailableFields = () => {
    switch (dashboardType) {
      case 'admin':
        return [
          { id: 'users', label: 'User Data', fields: ['id', 'name', 'email', 'role', 'status', 'createdAt'] },
          { id: 'organizations', label: 'Organizations', fields: ['id', 'name', 'type', 'memberCount', 'ecoScore'] },
          { id: 'systemMetrics', label: 'System Metrics', fields: ['timestamp', 'activeUsers', 'performance', 'errors'] }
        ];
      case 'government':
        return [
          { id: 'wards', label: 'Ward Data', fields: ['id', 'name', 'population', 'ecoScore', 'carbonReduction'] },
          { id: 'kpiData', label: 'KPI Metrics', fields: ['category', 'metric', 'value', 'target', 'trend'] }
        ];
      case 'institutional':
        return [
          { id: 'users', label: 'Users', fields: ['id', 'name', 'email', 'role', 'status', 'createdAt'] },
          { id: 'organizations', label: 'Organizations', fields: ['id', 'name', 'type', 'memberCount', 'ecoScore'] }
        ];
      case 'bigquery':
        return [
          { id: 'bigqueryData', label: 'Analytics Data', fields: ['metric', 'value', 'timestamp', 'category', 'source'] }
        ];
      case 'audit':
        return [
          { id: 'auditLogs', label: 'Audit Logs', fields: ['id', 'action', 'user', 'timestamp', 'details', 'ipAddress'] },
          { id: 'transactions', label: 'Wallet Transactions', fields: ['id', 'type', 'amount', 'from', 'to', 'timestamp'] }
        ];
      default:
        return [];
    }
  };

  const generateCSV = (selectedData: any[], fields: string[]) => {
    if (!selectedData.length) return '';
    
    const headers = fields.join(',');
    const rows = selectedData.map(item => 
      fields.map(field => {
        const value = item[field];
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value || '';
      }).join(',')
    );
    
    return [headers, ...rows].join('\n');
  };

  const generatePDF = async (selectedData: any[], fields: string[], title: string) => {
    // Mock PDF generation - in a real app, you'd use a library like jsPDF
    const content = `
      ${title} Export Report
      Generated on: ${format(new Date(), 'PPP')}
      
      ${selectedData.map(item => 
        fields.map(field => `${field}: ${item[field] || 'N/A'}`).join('\n')
      ).join('\n\n')}
    `;
    
    return content;
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const availableFields = getAvailableFields();
      const selectedDataSets = availableFields.filter(field => selectedFields.includes(field.id));
      
      for (const dataSet of selectedDataSets) {
        const dataKey = dataSet.id as keyof ExportData;
        const selectedData = data[dataKey] || [];
        const filename = `${dashboardType}_${dataSet.id}_${format(new Date(), 'yyyy-MM-dd')}`;
        
        if (exportType === 'csv') {
          const csvContent = generateCSV(selectedData, dataSet.fields);
          const blob = new Blob([csvContent], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${filename}.csv`;
          a.click();
          URL.revokeObjectURL(url);
        } else {
          const pdfContent = await generatePDF(selectedData, dataSet.fields, dataSet.label);
          const blob = new Blob([pdfContent], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${filename}.txt`; // Mock PDF as text file
          a.click();
          URL.revokeObjectURL(url);
        }
        
        onExportComplete?.(exportType, `${filename}.${exportType === 'csv' ? 'csv' : 'pdf'}`);
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const availableFields = getAvailableFields();

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export {dashboardType.charAt(0).toUpperCase() + dashboardType.slice(1)} Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Export Type Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Export Format</label>
          <Select value={exportType} onValueChange={(value: 'csv' | 'pdf') => setExportType(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">
                <div className="flex items-center gap-2">
                  <Table className="h-4 w-4" />
                  CSV (Spreadsheet)
                </div>
              </SelectItem>
              <SelectItem value="pdf">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  PDF (Document)
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Data Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Data to Export</label>
          <div className="space-y-3">
            {availableFields.map((field) => (
              <div key={field.id} className="flex items-start space-x-2">
                <Checkbox
                  id={field.id}
                  checked={selectedFields.includes(field.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedFields([...selectedFields, field.id]);
                    } else {
                      setSelectedFields(selectedFields.filter(f => f !== field.id));
                    }
                  }}
                />
                <div className="space-y-1">
                  <label htmlFor={field.id} className="text-sm font-medium cursor-pointer">
                    {field.label}
                  </label>
                  <p className="text-xs text-gray-500">
                    Fields: {field.fields.join(', ')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Date Range Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Date Range (Optional)</label>
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? format(dateRange.from, 'PPP') : 'From date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateRange.from}
                  onSelect={(date) => setDateRange({ ...dateRange, from: date })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.to ? format(dateRange.to, 'PPP') : 'To date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateRange.to}
                  onSelect={(date) => setDateRange({ ...dateRange, to: date })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Export Summary */}
        {selectedFields.length > 0 && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Export Summary</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Format: {exportType.toUpperCase()}</li>
              <li>• Data sets: {selectedFields.length}</li>
              <li>• Date range: {dateRange.from && dateRange.to ? 'Custom range' : 'All data'}</li>
            </ul>
          </div>
        )}

        {/* Export Button */}
        <Button 
          onClick={handleExport} 
          disabled={selectedFields.length === 0 || isExporting}
          className="w-full"
        >
          {isExporting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Exporting...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Export Selected Data
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}