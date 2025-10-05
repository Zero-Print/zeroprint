export async function downloadBlob(url: string, filename: string, body?: any) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}),
  });
  if (!res.ok) throw new Error('Export failed');
  const blob = await res.blob();
  const href = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(href);
}

// Blob-based exporters (used by dashboards)
export async function exportCitizenData(userId: string, data: any, format: 'csv' | 'pdf') {
  const filename = `citizen_${userId}_${Date.now()}.${format}`;
  if (format === 'csv') {
    const rows = buildCitizenRows(data);
    return downloadBlob('/api/export/csv', filename, { filename, rows });
  }
  return downloadBlob('/api/export/pdf', filename, { filename, title: 'Citizen Report', summary: 'Citizen activity report' });
}

export async function exportEntityData(entityId: string, entityType: 'school' | 'msme' = 'school', data: any, format: 'csv' | 'pdf') {
  const filename = `${entityType}_${entityId}_${Date.now()}.${format}`;
  if (format === 'csv') {
    const rows = buildEntityRows(data);
    return downloadBlob('/api/export/csv', filename, { filename, rows });
  }
  return downloadBlob('/api/export/pdf', filename, { filename, title: 'Entity ESG Report', summary: 'Entity ESG-lite summary' });
}

export async function exportGovernmentData(scopeId: string, timeframe: string, data: any, format: 'csv' | 'pdf') {
  const filename = `govt_${scopeId}_${timeframe}_${Date.now()}.${format}`;
  if (format === 'csv') {
    const rows = buildGovernmentRows(data);
    return downloadBlob('/api/export/csv', filename, { filename, rows });
  }
  return downloadBlob('/api/export/pdf', filename, { filename, title: 'Government Ward Report', summary: `Ward report (${timeframe})` });
}

function buildCitizenRows(data: any): string[][] {
  const rows: string[][] = [["date","action","details"]];
  (data?.activities || []).slice(0, 100).forEach((a: any) => {
    rows.push([new Date(a.timestamp || Date.now()).toISOString(), a.description || a.action || '', JSON.stringify(a.details || {})]);
  });
  return rows;
}

function buildEntityRows(data: any): string[][] {
  const rows: string[][] = [["userId","name","ecoScore","healCoins","co2Saved"]];
  (data?.leaderboard || []).slice(0, 100).forEach((e: any) => {
    rows.push([e.userId || '', e.name || '', String(e.points || e.ecoScore || 0), String(e.healCoins || 0), String(e.co2Saved || 0)]);
  });
  return rows;
}

function buildGovernmentRows(data: any): string[][] {
  const rows: string[][] = [["wardId","name","population","ecoScore","carbonReduction","participationRate"]];
  (data?.districts || []).forEach((d: any) => {
    rows.push([d.id, d.name, String(d.population), String(d.ecoScore), String(d.carbonReduction), String(d.participationRate)]);
  });
  return rows;
}

/**
 * ZeroPrint Export Utilities
 * 
 * Provides functionality for exporting dashboard data to CSV and PDF formats
 */

// Helper to convert data to CSV format
export function convertToCSV(data: any[], headers?: string[]) {
  if (!data || !data.length) return '';
  
  // If headers aren't provided, use the keys from the first object
  const csvHeaders = headers || Object.keys(data[0]);
  
  // Create header row
  let csvString = csvHeaders.join(',') + '\n';
  
  // Add data rows
  data.forEach(item => {
    const row = csvHeaders.map(header => {
      // Get the value for this header
      const value = header.includes('.')
        ? header.split('.').reduce((obj, key) => obj?.[key], item)
        : item[header];
      
      // Format the value for CSV
      if (value === null || value === undefined) return '';
      if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`;
      if (value instanceof Date) return value.toISOString();
      return value;
    });
    
    csvString += row.join(',') + '\n';
  });
  
  return csvString;
}

// Download CSV file
export function downloadCSV(data: any[], filename: string, headers?: string[]) {
  const csvContent = convertToCSV(data, headers);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Helper for citizen dashboard exports
// Legacy CSV-only helpers (kept for backward compatibility in some components)
export function exportCitizenDataCSV(userId: string, data: any) {
  const activityData = (data.activities || []).map((activity: any) => ({
    date: activity.timestamp,
    type: activity.type,
    description: activity.description,
    carbonSaved: activity.carbonSaved || 0,
    healCoinsEarned: activity.healCoinsEarned || 0
  }));
  downloadCSV(activityData, `citizen-activity-${userId}.csv`, [
    'date', 'type', 'description', 'carbonSaved', 'healCoinsEarned'
  ]);
}

// Helper for school/MSME dashboard exports
export function exportEntityDataCSV(entityId: string, entityType: 'school' | 'msme', data: any) {
    // Export leaderboard data
    const leaderboardData = data.leaderboard.map((entry: any) => ({
      rank: entry.rank,
      name: entry.displayName,
      ecoScore: entry.ecoScore,
      healCoins: entry.healCoins,
      co2Saved: entry.co2Saved,
      change: entry.change
    }));
    
  downloadCSV(leaderboardData, `${entityType}-leaderboard-${entityId}.csv`, [
      'rank', 'name', 'ecoScore', 'healCoins', 'co2Saved', 'change'
    ]);
}

// Helper for government dashboard exports
export function exportGovernmentDataCSV(wardId: string | 'all', timeframe: string, data: any) {
    // Export ward data
    const wardData = Array.isArray(data.wards) ? data.wards : [data.wards];
    const exportData = wardData.map((ward: { 
      name: string;
      population: number;
      ecoScore: number;
      co2Saved: number;
      activeUsers: number;
      monthlyMetrics?: {
        wasteSegregation: number;
        energyEfficiency: number;
        avgEcoMindScore: number;
        kindnessIndex: number;
      };
    }) => ({
      wardName: ward.name,
      population: ward.population,
      ecoScore: ward.ecoScore,
      co2Saved: ward.co2Saved,
      activeUsers: ward.activeUsers,
      wasteSegregation: ward.monthlyMetrics?.wasteSegregation || 0,
      solarAdoption: ward.monthlyMetrics?.energyEfficiency || 0,
      avgEcoMindScore: ward.monthlyMetrics?.avgEcoMindScore || 0,
      kindnessIndex: ward.monthlyMetrics?.kindnessIndex || 0
    }));
    
    downloadCSV(exportData, `government-ward-data-${wardId}-${timeframe}.csv`, [
      'wardName', 'population', 'ecoScore', 'co2Saved', 'activeUsers', 
      'wasteSegregation', 'solarAdoption', 'avgEcoMindScore', 'kindnessIndex'
    ]);
}

// Helper for admin dashboard exports
export function exportAdminData(reportType: string, timeframe: string, data: any, format: 'csv' | 'pdf') {
  if (format === 'csv') {
    let exportData: any[] = [];
    let filename = '';
    let headers: string[] = [];
    
    // Different report types
    switch (reportType) {
      case 'users':
        exportData = data.users.map((user: any) => ({
          id: user.id,
          displayName: user.displayName,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          lastActive: user.lastActive,
          healCoins: user.healCoins || 0
        }));
        filename = `admin-users-${timeframe}.csv`;
        headers = ['id', 'displayName', 'email', 'role', 'createdAt', 'lastActive', 'healCoins'];
        break;
        
      case 'transactions':
        exportData = data.transactions.map((tx: any) => ({
          id: tx.id,
          userId: tx.userId,
          timestamp: tx.timestamp,
          amount: tx.amount,
          currency: tx.currency,
          type: tx.type,
          description: tx.description
        }));
        filename = `admin-transactions-${timeframe}.csv`;
        headers = ['id', 'userId', 'timestamp', 'amount', 'currency', 'type', 'description'];
        break;
        
      case 'auditLogs':
        exportData = data.auditLogs.map((log: any) => ({
          id: log.id,
          timestamp: log.timestamp,
          userId: log.userId,
          action: log.action,
          resource: log.resource,
          resourceId: log.resourceId,
          ipAddress: log.ipAddress
        }));
        filename = `admin-audit-logs-${timeframe}.csv`;
        headers = ['id', 'timestamp', 'userId', 'action', 'resource', 'resourceId', 'ipAddress'];
        break;
        
      default:
        console.error('Unknown report type:', reportType);
        return;
    }
    
    downloadCSV(exportData, filename, headers);
  } else {
    // PDF export would be implemented with a library like jsPDF
    console.log('PDF export not implemented yet');
    alert('PDF export coming soon!');
  }
}

// Integration with dashboard components
export function useExportFunctions() {
  return {
    exportCitizenData,
    exportEntityData,
    exportGovernmentData,
    exportAdminData
  };
}