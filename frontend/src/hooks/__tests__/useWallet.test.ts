/**
 * useWallet Hook Tests
 * Tests wallet hook with MSW mocks
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { useWallet } from '../useWallet';

// MSW server setup
const server = setupServer(
  rest.get('/api/wallet/balance', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: {
          id: 'wallet-123',
          userId: 'user-123',
          inrBalance: 1000,
          healCoins: 500,
          totalEarned: 1000,
          totalRedeemed: 500,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      })
    );
  }),
  rest.get('/api/wallet/transactions', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: [
          {
            id: 'txn-1',
            walletId: 'wallet-123',
            type: 'earn',
            amount: 100,
            source: 'game',
            description: 'Earned from game',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          hasNext: false,
          hasPrev: false,
        },
      })
    );
  }),
  rest.post('/api/wallet/earn', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: {
          id: 'wallet-123',
          userId: 'user-123',
          inrBalance: 1000,
          healCoins: 600,
          totalEarned: 1100,
          totalRedeemed: 500,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      })
    );
  }),
  rest.post('/api/wallet/redeem', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: {
          id: 'wallet-123',
          userId: 'user-123',
          inrBalance: 1000,
          healCoins: 400,
          totalEarned: 1000,
          totalRedeemed: 600,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      })
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('useWallet', () => {
  it('should load wallet balance on mount', async () => {
    const { result } = renderHook(() => useWallet());
    
    await waitFor(() => {
      expect(result.current.wallet).toBeDefined();
      expect(result.current.balance).toBe(500);
      expect(result.current.inrBalance).toBe(1000);
    });
  });

  it('should earn coins successfully', async () => {
    const { result } = renderHook(() => useWallet());
    
    await waitFor(() => {
      expect(result.current.wallet).toBeDefined();
    });

    await act(async () => {
      const response = await result.current.earnCoins({
        gameId: 'game-123',
        coins: 100,
      });
      expect(response.success).toBe(true);
    });

    expect(result.current.balance).toBe(600);
  });

  it('should redeem coins successfully', async () => {
    const { result } = renderHook(() => useWallet());
    
    await waitFor(() => {
      expect(result.current.wallet).toBeDefined();
    });

    await act(async () => {
      const response = await result.current.redeemCoins({
        amount: 100,
      });
      expect(response.success).toBe(true);
    });

    expect(result.current.balance).toBe(400);
  });

  it('should handle earn coins error', async () => {
    server.use(
      rest.post('/api/wallet/earn', (req, res, ctx) => {
        return res(
          ctx.status(400),
          ctx.json({
            success: false,
            error: 'Insufficient coins',
          })
        );
      })
    );

    const { result } = renderHook(() => useWallet());
    
    await waitFor(() => {
      expect(result.current.wallet).toBeDefined();
    });

    await act(async () => {
      const response = await result.current.earnCoins({
        gameId: 'game-123',
        coins: 1000,
      });
      expect(response.success).toBe(false);
      expect(response.error).toBe('Insufficient coins');
    });
  });
});
