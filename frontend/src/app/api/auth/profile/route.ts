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

    // For now, return a mock user profile
    // In a real application, this would validate the token and fetch user data
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'citizen',
      profile: {
        preferences: {
          theme: 'light',
          language: 'en',
          units: 'metric',
        },
      },
      wallet: {
        balance: 1000,
        currency: 'ZP',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      user: mockUser,
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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

    const body = await request.json();

    // For now, return the updated mock user profile
    // In a real application, this would update the user data in the database
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: body.name || 'Test User',
      role: 'citizen',
      profile: {
        preferences: {
          theme: body.theme || 'light',
          language: body.language || 'en',
          units: body.units || 'metric',
        },
      },
      wallet: {
        balance: 1000,
        currency: 'ZP',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      user: mockUser,
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
