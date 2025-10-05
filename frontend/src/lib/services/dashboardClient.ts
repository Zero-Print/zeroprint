import api from '@/lib/apiClient';

type DashboardRole = 'citizen' | 'entity' | 'government' | 'school' | 'msme';

// Mock data for development
const getMockDashboardData = (dashboardType: DashboardRole): any => {
  const baseData = {
    carbonFootprint: { current: 120, previous: 150 },
    healCoins: { earned: 250, spent: 50, balance: 200 },
    activities: [
      { description: 'Planted a tree', points: 50, timestamp: new Date().toISOString() },
      { description: 'Used public transport', points: 30, timestamp: new Date().toISOString() },
      { description: 'Recycled plastic', points: 20, timestamp: new Date().toISOString() },
    ],
    leaderboard: [
      { userId: '1', name: 'Eco Warrior', points: 500 },
      { userId: '2', name: 'Green Champion', points: 450 },
      { userId: '3', name: 'Earth Protector', points: 400 },
    ],
    energyConsumption: { current: 80 },
  };

  return baseData;
};

export async function fetchDashboardData<T = unknown>(
  dashboardType: DashboardRole,
  timeframe: 'week' | 'month' | 'year' = 'week',
): Promise<T> {
  try {
    console.log(`🔧 Calling API for dashboard: ${dashboardType}`);
    
    // Map dashboard types to API endpoints
    const endpointMap = {
      citizen: '/dashboard/citizen',
      entity: '/dashboard/entity', 
      government: '/dashboard/govt',
      school: '/dashboard/entity',
      msme: '/dashboard/entity',
    };

    const endpoint = endpointMap[dashboardType];
    if (!endpoint) {
      throw new Error(`Unknown dashboard type: ${dashboardType}`);
    }

    const response = await api.get(`${endpoint}?timeframe=${timeframe}`);
    
    if (response.success && response.data) {
      return response.data as T;
    } else {
      console.warn('API call failed, falling back to mock data');
      return getMockDashboardData(dashboardType) as T;
    }
  } catch (error) {
    console.warn('Error calling API, using mock data:', error);
    return getMockDashboardData(dashboardType) as T;
  }
}
