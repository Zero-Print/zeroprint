import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '@/lib/apiClient';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // For now, return a mock response since we don't have a backend
    // In a real application, this would validate credentials with your auth service
    const mockUser = {
      id: '1',
      email: email,
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

    // Mock token generation
    const token = Buffer.from(JSON.stringify({ userId: mockUser.id, email })).toString('base64');

    return NextResponse.json({
      success: true,
      user: mockUser,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
