import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
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
    const { amount } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Valid amount is required' },
        { status: 400 }
      );
    }

    // Mock wallet update
    const mockWallet = {
      id: '1',
      userId: '1',
      walletId: 'wallet_1',
      inrBalance: 2500 + amount,
      healCoins: 1250,
      balance: 1250,
      totalEarned: 1500,
      totalRedeemed: 250,
      transactions: [],
      recentTransactions: [],
      lastTransactionAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      isActive: true,
      dailyEarnLimit: 100,
      monthlyEarnLimit: 2000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: mockWallet,
      message: `Successfully added ₹${amount} to your wallet`,
    });
  } catch (error) {
    console.error('Add credits error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
