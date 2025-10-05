import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, userData } = body;

    if (!email || !password || !userData) {
      return NextResponse.json(
        { error: 'Email, password, and user data are required' },
        { status: 400 }
      );
    }

    // For now, return a mock response since we don't have a backend
    // In a real application, this would create a new user account
    const mockUser = {
      id: '1',
      email: email,
      name: userData.name || 'New User',
      role: userData.role || 'citizen',
      profile: {
        preferences: {
          theme: 'light',
          language: 'en',
          units: 'metric',
        },
      },
      wallet: {
        balance: 100, // Starting balance for new users
        currency: 'ZP',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Mock token generation
    const token = Buffer.from(JSON.stringify({ userId: mockUser.id, email })).toString('base64');

    return NextResponse.json({
      success: true,
      user: mockUser,
      token,
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
