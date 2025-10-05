import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || 'week';

    // Mock citizen dashboard data
    const mockDashboardData = {
      carbonFootprint: { 
        current: 120, 
        previous: 150,
        saved: 30,
        trend: 'down'
      },
      healCoins: { 
        earned: 250, 
        spent: 50, 
        balance: 200,
        trend: 'up'
      },
      activities: [
        { 
          id: '1',
          description: 'Planted a tree', 
          points: 50, 
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          type: 'environmental'
        },
        { 
          id: '2',
          description: 'Used public transport', 
          points: 30, 
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          type: 'transport'
        },
        { 
          id: '3',
          description: 'Recycled plastic', 
          points: 20, 
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          type: 'waste'
        },
      ],
      leaderboard: [
        { userId: '1', name: 'Eco Warrior', points: 500, rank: 1 },
        { userId: '2', name: 'Green Champion', points: 450, rank: 2 },
        { userId: '3', name: 'Earth Protector', points: 400, rank: 3 },
      ],
      energyConsumption: { 
        current: 80, 
        previous: 100,
        saved: 20,
        trend: 'down'
      },
      ecoScore: 85,
      moodTrend: [
        { date: '2024-01-01', score: 7 },
        { date: '2024-01-02', score: 8 },
        { date: '2024-01-03', score: 6 },
        { date: '2024-01-04', score: 9 },
        { date: '2024-01-05', score: 8 },
      ],
      kindnessIndex: 7.5,
      achievements: [
        { id: '1', name: 'First Tree', description: 'Planted your first tree', unlocked: true },
        { id: '2', name: 'Eco Commuter', description: 'Used public transport 10 times', unlocked: true },
        { id: '3', name: 'Recycling Master', description: 'Recycled 50 items', unlocked: false },
      ],
      timeframe,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: mockDashboardData,
    });
  } catch (error) {
    console.error('Citizen dashboard error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
