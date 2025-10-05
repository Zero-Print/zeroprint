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

    // Mock wallet data
    const mockWallet = {
      id: '1',
      userId: '1',
      walletId: 'wallet_1',
      inrBalance: 2500,
      healCoins: 1250,
      balance: 1250, // Alias for healCoins
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
    });
  } catch (error) {
    console.error('Wallet balance error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
