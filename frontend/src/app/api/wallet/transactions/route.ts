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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Mock transaction data
    const mockTransactions = [
      {
        id: '1',
        walletId: 'wallet_1',
        type: 'credit_healcoin',
        amount: 50,
        description: 'Eco-friendly commute',
        status: 'completed',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '2',
        walletId: 'wallet_1',
        type: 'credit_healcoin',
        amount: 25,
        description: 'Recycling activity',
        status: 'completed',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '3',
        walletId: 'wallet_1',
        type: 'debit_healcoin',
        amount: 10,
        description: 'Reward redemption',
        status: 'completed',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    const pagination = {
      page,
      limit,
      total: mockTransactions.length,
      totalPages: Math.ceil(mockTransactions.length / limit),
    };

    return NextResponse.json({
      success: true,
      data: mockTransactions,
      pagination,
    });
  } catch (error) {
    console.error('Wallet transactions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
