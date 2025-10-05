import { NextRequest, NextResponse } from 'next/server';

// Mock data for mood tracker
const mockMoodData = [
  {
    id: '1',
    date: '2024-01-15',
    mood: 'happy',
    energy: 8,
    stress: 3,
    sleep: 7.5,
    notes: 'Great day at work, feeling productive',
    activities: ['exercise', 'meditation'],
    createdAt: '2024-01-15T20:00:00Z',
  },
  {
    id: '2',
    date: '2024-01-14',
    mood: 'neutral',
    energy: 6,
    stress: 5,
    sleep: 6,
    notes: 'Average day, some work stress',
    activities: ['reading'],
    createdAt: '2024-01-14T21:30:00Z',
  },
  {
    id: '3',
    date: '2024-01-13',
    mood: 'sad',
    energy: 4,
    stress: 7,
    sleep: 5,
    notes: 'Feeling overwhelmed with deadlines',
    activities: ['music'],
    createdAt: '2024-01-13T22:00:00Z',
  },
  {
    id: '4',
    date: '2024-01-12',
    mood: 'excited',
    energy: 9,
    stress: 2,
    sleep: 8,
    notes: 'Started new project, very motivated',
    activities: ['exercise', 'socializing', 'meditation'],
    createdAt: '2024-01-12T19:45:00Z',
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mood = searchParams.get('mood');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let filteredData = mockMoodData;

    if (mood) {
      filteredData = filteredData.filter(item => item.mood === mood);
    }

    if (startDate) {
      filteredData = filteredData.filter(item => item.date >= startDate);
    }

    if (endDate) {
      filteredData = filteredData.filter(item => item.date <= endDate);
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    // Calculate mood statistics
    const moodStats = {
      averageEnergy:
        filteredData.reduce((sum, item) => sum + item.energy, 0) / filteredData.length || 0,
      averageStress:
        filteredData.reduce((sum, item) => sum + item.stress, 0) / filteredData.length || 0,
      averageSleep:
        filteredData.reduce((sum, item) => sum + item.sleep, 0) / filteredData.length || 0,
      moodDistribution: filteredData.reduce(
        (acc, item) => {
          acc[item.mood] = (acc[item.mood] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
    };

    return NextResponse.json({
      success: true,
      data: paginatedData,
      stats: moodStats,
      pagination: {
        page,
        limit,
        total: filteredData.length,
        totalPages: Math.ceil(filteredData.length / limit),
      },
    });
  } catch (error) {
    console.error('Mood tracker API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch mood tracker data',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const { mood, energy, stress, sleep } = body;

    if (!mood || energy === undefined || stress === undefined || sleep === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: mood, energy, stress, sleep',
        },
        { status: 400 }
      );
    }

    // Validate ranges
    if (energy < 1 || energy > 10 || stress < 1 || stress > 10 || sleep < 0 || sleep > 24) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid values: energy and stress must be 1-10, sleep must be 0-24',
        },
        { status: 400 }
      );
    }

    // Create new mood log entry
    const newEntry = {
      id: (mockMoodData.length + 1).toString(),
      date: new Date().toISOString().split('T')[0],
      mood,
      energy: parseInt(energy),
      stress: parseInt(stress),
      sleep: parseFloat(sleep),
      notes: body.notes || '',
      activities: body.activities || [],
      createdAt: new Date().toISOString(),
    };

    // In a real app, this would be saved to a database
    mockMoodData.unshift(newEntry);

    return NextResponse.json({
      success: true,
      data: newEntry,
      message: 'Mood log entry created successfully',
    });
  } catch (error) {
    console.error('Mood tracker POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create mood log entry',
      },
      { status: 500 }
    );
  }
}
