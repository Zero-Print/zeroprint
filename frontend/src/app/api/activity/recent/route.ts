import { NextResponse } from 'next/server';

export async function GET() {
  // Mock recent activity data
  const mockActivityData = [
    {
      id: 'act1',
      user: { id: 'user1', name: 'John Doe', avatar: '/avatar1.png' },
      action: 'query_executed',
      details: 'Executed BigQuery job on dataset "analytics"',
      timestamp: new Date(Date.now() - 15 * 60000).toISOString()
    },
    {
      id: 'act2',
      user: { id: 'user2', name: 'Jane Smith', avatar: '/avatar2.png' },
      action: 'table_exported',
      details: 'Exported "user_metrics" table to CSV',
      timestamp: new Date(Date.now() - 45 * 60000).toISOString()
    },
    {
      id: 'act3',
      user: { id: 'user3', name: 'Alex Johnson', avatar: '/avatar3.png' },
      action: 'dashboard_created',
      details: 'Created new dashboard "Marketing Performance"',
      timestamp: new Date(Date.now() - 120 * 60000).toISOString()
    },
    {
      id: 'act4',
      user: { id: 'user4', name: 'Maria Garcia', avatar: '/avatar4.png' },
      action: 'query_optimized',
      details: 'Optimized query, reduced processing by 35%',
      timestamp: new Date(Date.now() - 180 * 60000).toISOString()
    },
    {
      id: 'act5',
      user: { id: 'user5', name: 'Robert Chen', avatar: '/avatar5.png' },
      action: 'dataset_shared',
      details: 'Shared "finance_metrics" dataset with Finance team',
      timestamp: new Date(Date.now() - 240 * 60000).toISOString()
    }
  ];

  return NextResponse.json(mockActivityData);
}