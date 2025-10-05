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

    // Mock games data
    const mockGames = [
      {
        id: '1',
        title: 'Carbon Footprint Challenge',
        description: 'Test your knowledge about carbon emissions and eco-friendly practices',
        type: 'quiz',
        difficulty: 'medium',
        rewardCoins: 50,
        timeLimit: 300, // 5 minutes
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        title: 'Eco Memory Match',
        description: 'Match environmental terms and concepts in this memory game',
        type: 'memory',
        difficulty: 'easy',
        rewardCoins: 30,
        timeLimit: 180, // 3 minutes
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '3',
        title: 'Sustainability Puzzle',
        description: 'Solve puzzles related to sustainable living practices',
        type: 'puzzle',
        difficulty: 'hard',
        rewardCoins: 75,
        timeLimit: 600, // 10 minutes
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    return NextResponse.json({
      success: true,
      data: mockGames,
    });
  } catch (error) {
    console.error('Games fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
