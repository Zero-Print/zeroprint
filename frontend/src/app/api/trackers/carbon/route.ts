import { NextRequest, NextResponse } from 'next/server';

// Mock data for carbon tracker
const mockCarbonData = [
  {
    id: '1',
    date: '2024-01-15',
    category: 'transportation',
    activity: 'Car commute',
    amount: 5.2,
    unit: 'kg CO2',
    description: 'Daily commute to office',
    createdAt: '2024-01-15T08:00:00Z',
  },
  {
    id: '2',
    date: '2024-01-14',
    category: 'energy',
    activity: 'Electricity usage',
    amount: 12.8,
    unit: 'kg CO2',
    description: 'Home electricity consumption',
    createdAt: '2024-01-14T20:00:00Z',
  },
  {
    id: '3',
    date: '2024-01-13',
    category: 'food',
    activity: 'Meat consumption',
    amount: 3.4,
    unit: 'kg CO2',
    description: 'Beef dinner',
    createdAt: '2024-01-13T19:30:00Z',
  },
  {
    id: '4',
    date: '2024-01-12',
    category: 'transportation',
    activity: 'Flight',
    amount: 45.6,
    unit: 'kg CO2',
    description: 'Domestic flight',
    createdAt: '2024-01-12T14:00:00Z',
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    let filteredData = mockCarbonData;

    if (category) {
      filteredData = mockCarbonData.filter(item => item.category === category);
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      data: paginatedData,
      pagination: {
        page,
        limit,
        total: filteredData.length,
        totalPages: Math.ceil(filteredData.length / limit),
      },
    });
  } catch (error) {
    console.error('Carbon tracker API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch carbon tracker data',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const { category, activity, amount, description } = body;

    if (!category || !activity || !amount) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: category, activity, amount',
        },
        { status: 400 }
      );
    }

    // Create new carbon log entry
    const newEntry = {
      id: (mockCarbonData.length + 1).toString(),
      date: new Date().toISOString().split('T')[0],
      category,
      activity,
      amount: parseFloat(amount),
      unit: 'kg CO2',
      description: description || '',
      createdAt: new Date().toISOString(),
    };

    // In a real app, this would be saved to a database
    mockCarbonData.unshift(newEntry);

    return NextResponse.json({
      success: true,
      data: newEntry,
      message: 'Carbon log entry created successfully',
    });
  } catch (error) {
    console.error('Carbon tracker POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create carbon log entry',
      },
      { status: 500 }
    );
  }
}
