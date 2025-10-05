// Mock BigQuery implementation for browser environment
// This is a complete mock that doesn't use any Node.js modules

// ============================================================================
// BIGQUERY CONFIGURATION
// ============================================================================

interface BigQueryConfig {
  projectId: string;
  datasetId: string;
  location: string;
  keyFilename?: string;
  credentials?: any;
}

interface ExportOptions {
  format: 'JSON' | 'CSV' | 'AVRO' | 'PARQUET';
  compression?: 'GZIP' | 'SNAPPY' | 'DEFLATE';
  writeDisposition?: 'WRITE_TRUNCATE' | 'WRITE_APPEND' | 'WRITE_EMPTY';
  createDisposition?: 'CREATE_IF_NEEDED' | 'CREATE_NEVER';
}

interface ScheduleConfig {
  frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
  time?: string; // HH:MM format for daily/weekly/monthly
  dayOfWeek?: number; // 0-6 for weekly (0 = Sunday)
  dayOfMonth?: number; // 1-31 for monthly
  timezone?: string;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_TABLES = {
  'users': { rows: 15243, size: '1.2 GB', lastUpdated: new Date('2025-09-01') },
  'carbon_emissions': { rows: 52891, size: '3.5 GB', lastUpdated: new Date('2025-09-15') },
  'energy_consumption': { rows: 48721, size: '2.8 GB', lastUpdated: new Date('2025-09-10') },
  'waste_metrics': { rows: 31542, size: '1.9 GB', lastUpdated: new Date('2025-09-12') },
  'water_usage': { rows: 29876, size: '1.7 GB', lastUpdated: new Date('2025-09-14') },
};

const MOCK_JOBS = [
  { id: 'job-1', status: 'completed', type: 'export', startTime: new Date('2025-09-15T10:30:00'), endTime: new Date('2025-09-15T10:35:00'), recordCount: 15243, fileSize: '1.2 GB' },
  { id: 'job-2', status: 'running', type: 'export', startTime: new Date('2025-09-15T11:30:00') },
  { id: 'job-3', status: 'scheduled', type: 'export', startTime: new Date('2025-09-16T08:00:00') },
  { id: 'job-4', status: 'failed', type: 'export', startTime: new Date('2025-09-14T09:30:00'), endTime: new Date('2025-09-14T09:32:00'), errorMessage: 'Permission denied' },
];

// ============================================================================
// BIGQUERY SERVICE CLASS
// ============================================================================

export class BigQueryService {
  private config: BigQueryConfig;

  constructor(config: BigQueryConfig) {
    this.config = config;
  }

  // List all tables in the dataset
  async listTables() {
    return Object.keys(MOCK_TABLES).map(name => ({
      id: name,
      metadata: MOCK_TABLES[name as keyof typeof MOCK_TABLES]
    }));
  }

  // Get table metadata
  async getTableMetadata(tableId: string) {
    const table = MOCK_TABLES[tableId as keyof typeof MOCK_TABLES];
    if (!table) {
      throw new Error(`Table ${tableId} not found`);
    }
    return table;
  }

  // Run a query
  async runQuery(query: string) {
    console.log('Running mock query:', query);
    
    // Return mock data based on the query
    if (query.includes('SELECT * FROM users')) {
      return [
        { id: 'user1', name: 'John Doe', email: 'john@example.com', carbon_score: 85 },
        { id: 'user2', name: 'Jane Smith', email: 'jane@example.com', carbon_score: 92 },
        { id: 'user3', name: 'Bob Johnson', email: 'bob@example.com', carbon_score: 78 },
      ];
    }
    
    if (query.includes('carbon_emissions')) {
      return [
        { date: '2025-09-01', value: 120.5, source: 'electricity' },
        { date: '2025-09-02', value: 115.2, source: 'electricity' },
        { date: '2025-09-03', value: 118.7, source: 'electricity' },
        { date: '2025-09-01', value: 85.3, source: 'transportation' },
        { date: '2025-09-02', value: 82.1, source: 'transportation' },
        { date: '2025-09-03', value: 88.4, source: 'transportation' },
      ];
    }
    
    // Default mock data
    return [
      { id: 'row1', value: 100, timestamp: new Date() },
      { id: 'row2', value: 200, timestamp: new Date() },
      { id: 'row3', value: 300, timestamp: new Date() },
    ];
  }

  // Export table data
  async exportTable(tableId: string, destination: string, options: ExportOptions) {
    console.log(`Mock exporting table ${tableId} to ${destination}`);
    
    // Create a mock job
    const jobId = `export-${Date.now()}`;
    const job = {
      id: jobId,
      status: 'running',
      type: 'export',
      startTime: new Date(),
      tableId,
      destination,
      options
    };
    
    // Simulate job completion after 2 seconds
    setTimeout(() => {
      job.status = 'completed';
      (job as any).endTime = new Date();
      (job as any).recordCount = Math.floor(Math.random() * 10000) + 5000;
      (job as any).fileSize = `${(Math.random() * 5 + 1).toFixed(1)} GB`;
    }, 2000);
    
    return jobId;
  }

  // Get job status
  async getJobStatus(jobId: string) {
    // Find mock job or return a generated one
    const mockJob = MOCK_JOBS.find(job => job.id === jobId);
    
    if (mockJob) {
      return mockJob;
    }
    
    // For dynamically created jobs
    if (jobId.startsWith('export-')) {
      return {
        id: jobId,
        status: 'completed',
        type: 'export',
        startTime: new Date(parseInt(jobId.split('-')[1])),
        endTime: new Date(parseInt(jobId.split('-')[1]) + 5000),
        recordCount: Math.floor(Math.random() * 10000) + 5000,
        fileSize: `${(Math.random() * 5 + 1).toFixed(1)} GB`
      };
    }
    
    throw new Error(`Job ${jobId} not found`);
  }

  // Schedule a recurring export
  async scheduleExport(tableId: string, destination: string, options: ExportOptions, schedule: ScheduleConfig) {
    console.log(`Mock scheduling export for table ${tableId} to ${destination}`);
    
    // Create a mock scheduled job
    const jobId = `schedule-${Date.now()}`;
    const job = {
      id: jobId,
      status: 'scheduled',
      type: 'export',
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      tableId,
      destination,
      options,
      schedule
    };
    
    return jobId;
  }

  // Cancel a job
  async cancelJob(jobId: string) {
    console.log(`Mock cancelling job ${jobId}`);
    return { success: true };
  }
}

// Singleton instance for the application
let bigQueryServiceInstance: BigQueryService | null = null;

export const getBigQueryService = () => {
  if (!bigQueryServiceInstance) {
    bigQueryServiceInstance = new BigQueryService({
      projectId: 'mock-project',
      datasetId: 'zeroprint_data',
      location: 'US'
    });
  }
  return bigQueryServiceInstance;
};