import { NextRequest, NextResponse } from 'next/server';

// Mock data for transport tracker
const mockTransportData = [
  {
    id: '1',
    date: '2024-01-15',
    mode: 'bicycle',
    distance: 8.5,
    duration: 25,
    route: 'Home to Office',
    startLocation: 'Brooklyn Heights',
    endLocation: 'Manhattan Financial District',
    cost: 0,
    carbonSaved: 2.1,
    calories: 180,
    weather: 'sunny',
    notes: 'Great bike ride across Brooklyn Bridge',
    createdAt: '2024-01-15T08:00:00Z',
  },
  {
    id: '2',
    date: '2024-01-14',
    mode: 'subway',
    distance: 12.3,
    duration: 35,
    route: 'L Train to Union Square',
    startLocation: 'Williamsburg',
    endLocation: 'Union Square',
    cost: 2.9,
    carbonSaved: 8.4,
    calories: 25,
    weather: 'rainy',
    notes: 'Avoided driving due to rain',
    createdAt: '2024-01-14T09:15:00Z',
  },
  {
    id: '3',
    date: '2024-01-13',
    mode: 'walking',
    distance: 2.1,
    duration: 22,
    route: 'Local errands',
    startLocation: 'Home',
    endLocation: 'Grocery Store',
    cost: 0,
    carbonSaved: 1.2,
    calories: 95,
    weather: 'cloudy',
    notes: 'Walking for health and environment',
    createdAt: '2024-01-13T14:30:00Z',
  },
  {
    id: '4',
    date: '2024-01-12',
    mode: 'bus',
    distance: 15.7,
    duration: 45,
    route: 'Express Bus to Airport',
    startLocation: 'Port Authority',
    endLocation: 'JFK Airport',
    cost: 8.0,
    carbonSaved: 12.3,
    calories: 15,
    weather: 'clear',
    notes: 'Much cheaper than taxi or rideshare',
    createdAt: '2024-01-12T06:00:00Z',
  },
  {
    id: '5',
    date: '2024-01-11',
    mode: 'electric_scooter',
    distance: 4.2,
    duration: 12,
    route: 'Quick trip to meeting',
    startLocation: 'Coworking Space',
    endLocation: 'Client Office',
    cost: 3.5,
    carbonSaved: 1.8,
    calories: 35,
    weather: 'sunny',
    notes: 'Fast and fun alternative to taxi',
    createdAt: '2024-01-11T11:45:00Z',
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let filteredData = mockTransportData;

    if (mode) {
      filteredData = filteredData.filter(item => item.mode === mode);
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

    // Calculate statistics
    const stats = {
      totalTrips: filteredData.length,
      totalDistance: filteredData.reduce((sum, item) => sum + item.distance, 0),
      totalDuration: filteredData.reduce((sum, item) => sum + item.duration, 0),
      totalCost: filteredData.reduce((sum, item) => sum + item.cost, 0),
      totalCarbonSaved: filteredData.reduce((sum, item) => sum + item.carbonSaved, 0),
      totalCalories: filteredData.reduce((sum, item) => sum + item.calories, 0),
      modeDistribution: filteredData.reduce(
        (acc, item) => {
          acc[item.mode] = (acc[item.mode] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
      averageDistance:
        filteredData.length > 0
          ? filteredData.reduce((sum, item) => sum + item.distance, 0) / filteredData.length
          : 0,
      averageDuration:
        filteredData.length > 0
          ? filteredData.reduce((sum, item) => sum + item.duration, 0) / filteredData.length
          : 0,
    };

    return NextResponse.json({
      success: true,
      data: paginatedData,
      stats,
      pagination: {
        page,
        limit,
        total: filteredData.length,
        totalPages: Math.ceil(filteredData.length / limit),
      },
    });
  } catch (error) {
    console.error('Transport tracker API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch transport tracker data',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const { mode, distance, duration, route } = body;

    if (!mode || !distance || !duration || !route) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: mode, distance, duration, route',
        },
        { status: 400 }
      );
    }

    // Validate values
    if (distance <= 0 || duration <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Distance and duration must be positive numbers',
        },
        { status: 400 }
      );
    }

    // Calculate carbon saved and calories based on mode
    const carbonFactors: Record<string, number> = {
      walking: 0.6,
      bicycle: 0.25,
      electric_scooter: 0.4,
      subway: 0.7,
      bus: 0.8,
      electric_car: 0.3,
      car: 0.0, // No carbon saved for regular car
    };

    const calorieFactors: Record<string, number> = {
      walking: 45, // per km
      bicycle: 20,
      electric_scooter: 8,
      subway: 3,
      bus: 2,
      electric_car: 1,
      car: 1,
    };

    const carbonSaved = (carbonFactors[mode] || 0) * parseFloat(distance);
    const calories = (calorieFactors[mode] || 0) * parseFloat(distance);

    // Create new transport log entry
    const newEntry = {
      id: (mockTransportData.length + 1).toString(),
      date: new Date().toISOString().split('T')[0],
      mode,
      distance: parseFloat(distance),
      duration: parseInt(duration),
      route,
      startLocation: body.startLocation || '',
      endLocation: body.endLocation || '',
      cost: parseFloat(body.cost || '0'),
      carbonSaved: Math.round(carbonSaved * 10) / 10,
      calories: Math.round(calories),
      weather: body.weather || '',
      notes: body.notes || '',
      createdAt: new Date().toISOString(),
    };

    // In a real app, this would be saved to a database
    mockTransportData.unshift(newEntry);

    return NextResponse.json({
      success: true,
      data: newEntry,
      message: 'Transport log entry created successfully',
    });
  } catch (error) {
    console.error('Transport tracker POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create transport log entry',
      },
      { status: 500 }
    );
  }
}
