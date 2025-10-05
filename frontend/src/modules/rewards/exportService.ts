// Export Service - Handles CSV export functionality for rewards and redemptions

// Convert data to CSV format
function convertToCSV(data: any[]): string {
  if (!data || data.length === 0) {
    return '';
  }

  // Get headers from the first object
  const headers = Object.keys(data[0]);
  
  // Create CSV header row
  const csvHeader = headers.join(',');
  
  // Create CSV data rows
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header];
      // Escape commas and wrap in quotes if needed
      if (typeof value === 'string' && value.includes(',')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',');
  });
  
  // Combine header and rows
  return [csvHeader, ...csvRows].join('\n');
}

// Download CSV file
function downloadCSV(csvContent: string, filename: string): void {
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

// Export rewards to CSV
export async function exportRewardsToCSV(rewards: any[]): Promise<void> {
  try {
    // Transform rewards data for export
    const exportData = rewards.map(reward => ({
      id: reward.id,
      title: reward.title,
      description: reward.description || '',
      coinCost: reward.coinCost,
      stock: reward.stock,
      type: reward.type,
      createdAt: reward.createdAt instanceof Date 
        ? reward.createdAt.toISOString() 
        : reward.createdAt,
      createdBy: reward.createdBy
    }));
    
    const csvContent = convertToCSV(exportData);
    downloadCSV(csvContent, `rewards-export-${new Date().toISOString().split('T')[0]}.csv`);
  } catch (error) {
    console.error('Error exporting rewards to CSV:', error);
    throw new Error('Failed to export rewards');
  }
}

// Export redemptions to CSV
export async function exportRedemptionsToCSV(redemptions: any[]): Promise<void> {
  try {
    // Transform redemptions data for export
    const exportData = redemptions.map(redemption => ({
      id: redemption.id,
      userId: redemption.userId,
      userName: redemption.userName || `User ${redemption.userId.slice(-4)}`,
      rewardId: redemption.rewardId,
      rewardTitle: redemption.rewardTitle || `Reward ${redemption.rewardId}`,
      coinsSpent: redemption.coinsSpent,
      status: redemption.status,
      voucherCode: redemption.voucherCode || '',
      createdAt: redemption.createdAt instanceof Date 
        ? redemption.createdAt.toISOString() 
        : redemption.createdAt,
      processedBy: redemption.processedBy
    }));
    
    const csvContent = convertToCSV(exportData);
    downloadCSV(csvContent, `redemptions-export-${new Date().toISOString().split('T')[0]}.csv`);
  } catch (error) {
    console.error('Error exporting redemptions to CSV:', error);
    throw new Error('Failed to export redemptions');
  }
}

// Export analytics data to CSV
export async function exportAnalyticsToCSV(analyticsData: any): Promise<void> {
  try {
    // Create multiple CSV sections for different analytics data
    const csvSections: string[] = [];
    
    // Redemption stats
    csvSections.push('Redemption Statistics');
    csvSections.push(convertToCSV([{
      totalRedemptions: analyticsData.redemptionStats.totalRedemptions,
      successfulRedemptions: analyticsData.redemptionStats.successfulRedemptions,
      failedRedemptions: analyticsData.redemptionStats.failedRedemptions,
      pendingRedemptions: analyticsData.redemptionStats.pendingRedemptions,
      successRate: `${analyticsData.redemptionStats.successRate.toFixed(2)}%`,
      failureRate: `${analyticsData.redemptionStats.failureRate.toFixed(2)}%`
    }]));
    
    csvSections.push(''); // Empty line
    
    // Top rewards
    csvSections.push('Top Redeemed Rewards');
    const topRewardsData = analyticsData.topRewards.map((reward: any) => ({
      rewardTitle: reward.rewardTitle,
      totalRedemptions: reward.totalRedemptions,
      totalCoinsSpent: reward.totalCoinsSpent,
      avgCoinsPerRedemption: reward.avgCoinsPerRedemption.toFixed(2),
      stockOutCount: reward.stockOutCount
    }));
    csvSections.push(convertToCSV(topRewardsData));
    
    csvSections.push(''); // Empty line
    
    // Daily trends
    csvSections.push('Daily Redemption Trends');
    const dailyTrendsData = analyticsData.dailyTrends.map((trend: any) => ({
      date: trend.date,
      redemptions: trend.redemptions,
      coinsSpent: trend.coinsSpent
    }));
    csvSections.push(convertToCSV(dailyTrendsData));
    
    const csvContent = csvSections.join('\n');
    downloadCSV(csvContent, `analytics-export-${new Date().toISOString().split('T')[0]}.csv`);
  } catch (error) {
    console.error('Error exporting analytics to CSV:', error);
    throw new Error('Failed to export analytics');
  }
}