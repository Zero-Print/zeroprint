import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WalletCard } from '../../../src/components/ui/WalletCard';
import { TEST_WALLETS } from '../../fixtures/seed-data';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/dashboard',
  }),
}));

// Mock wallet hook
const mockUseWallet = {
  wallet: null,
  transactions: [],
  loading: false,
  error: null,
  refreshWallet: jest.fn(),
  getTransactionHistory: jest.fn(),
};

jest.mock('../../../src/hooks/useWallet', () => ({
  useWallet: () => ({
    wallet: mockUseWallet.wallet,
    transactions: mockUseWallet.transactions,
    loading: mockUseWallet.loading,
    error: mockUseWallet.error,
    refreshWallet: mockUseWallet.refreshWallet,
    getTransactionHistory: mockUseWallet.getTransactionHistory,
  }),
}));

// Mock auth hook
const mockUseAuth = {
  user: {
    uid: 'test-citizen-1',
    email: 'citizen@test.com',
    role: 'citizen',
  },
  loading: false,
};

jest.mock('../../../src/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth,
}));

describe('WalletCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should show loading skeleton when wallet is loading', () => {
      mockUseWallet.loading = true;
      mockUseWallet.wallet = null;

      render(<WalletCard />);

      expect(screen.getByTestId('wallet-loading')).toBeInTheDocument();
      expect(screen.getByText('Loading wallet...')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should show error message when wallet fails to load', () => {
      mockUseWallet.loading = false;
      mockUseWallet.wallet = null;
      mockUseWallet.error = 'Failed to load wallet';

      render(<WalletCard />);

      expect(screen.getByTestId('wallet-error')).toBeInTheDocument();
      expect(screen.getByText('Failed to load wallet')).toBeInTheDocument();
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });

    it('should call refreshWallet when retry button is clicked', () => {
      mockUseWallet.loading = false;
      mockUseWallet.wallet = null;
      mockUseWallet.error = 'Network error';

      render(<WalletCard />);

      const retryButton = screen.getByText('Retry');
      fireEvent.click(retryButton);

      expect(mockUseWallet.refreshWallet).toHaveBeenCalledTimes(1);
    });
  });

  describe('Wallet Display', () => {
    it('should display wallet with high balance correctly', () => {
      const highBalanceWallet = {
        ...TEST_WALLETS['test-citizen-1'],
        healCoins: 150,
      };

      mockUseWallet.loading = false;
      mockUseWallet.wallet = highBalanceWallet;
      mockUseWallet.error = null;

      render(<WalletCard />);

      expect(screen.getByTestId('wallet-card')).toBeInTheDocument();
      expect(screen.getByText('150')).toBeInTheDocument();
      expect(screen.getByText('HealCoins')).toBeInTheDocument();
      expect(screen.getByTestId('wallet-balance-high')).toBeInTheDocument();
      expect(screen.queryByTestId('wallet-balance-low')).not.toBeInTheDocument();
    });

    it('should display wallet with low balance correctly', () => {
      const lowBalanceWallet = {
        ...TEST_WALLETS['test-citizen-1'],
        healCoins: 5,
      };

      mockUseWallet.loading = false;
      mockUseWallet.wallet = lowBalanceWallet;
      mockUseWallet.error = null;

      render(<WalletCard />);

      expect(screen.getByTestId('wallet-card')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('HealCoins')).toBeInTheDocument();
      expect(screen.getByTestId('wallet-balance-low')).toBeInTheDocument();
      expect(screen.queryByTestId('wallet-balance-high')).not.toBeInTheDocument();
    });

    it('should display zero balance correctly', () => {
      const zeroBalanceWallet = {
        ...TEST_WALLETS['test-citizen-1'],
        healCoins: 0,
      };

      mockUseWallet.loading = false;
      mockUseWallet.wallet = zeroBalanceWallet;
      mockUseWallet.error = null;

      render(<WalletCard />);

      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByTestId('wallet-balance-zero')).toBeInTheDocument();
      expect(screen.getByText('Start earning HealCoins!')).toBeInTheDocument();
    });

    it('should show last updated timestamp', () => {
      const wallet = {
        ...TEST_WALLETS['test-citizen-1'],
        lastUpdated: new Date('2024-01-15T10:30:00Z').toISOString(),
      };

      mockUseWallet.loading = false;
      mockUseWallet.wallet = wallet;
      mockUseWallet.error = null;

      render(<WalletCard />);

      expect(screen.getByText(/Last updated:/)).toBeInTheDocument();
      expect(screen.getByText(/Jan 15, 2024/)).toBeInTheDocument();
    });
  });

  describe('Transaction History', () => {
    it('should show recent transactions when available', async () => {
      const wallet = TEST_WALLETS['test-citizen-1'];
      const mockTransactions = [
        {
          id: 'txn_1',
          type: 'credit',
          amount: 10,
          description: 'Quiz completion reward',
          createdAt: new Date().toISOString(),
          status: 'completed',
        },
        {
          id: 'txn_2',
          type: 'debit',
          amount: 25,
          description: 'Voucher redemption',
          createdAt: new Date().toISOString(),
          status: 'completed',
        },
      ];

      mockUseWallet.loading = false;
      mockUseWallet.wallet = wallet;
      mockUseWallet.transactions = mockTransactions;
      mockUseWallet.error = null;

      render(<WalletCard showTransactions={true} />);

      // Wait for transactions to load
      await waitFor(() => {
        expect(screen.getByText('Recent Transactions')).toBeInTheDocument();
      });

      expect(screen.getByText('Quiz completion reward')).toBeInTheDocument();
      expect(screen.getByText('Voucher redemption')).toBeInTheDocument();
      expect(screen.getByText('+10')).toBeInTheDocument();
      expect(screen.getByText('-25')).toBeInTheDocument();
    });

    it('should show empty state when no transactions', async () => {
      const wallet = TEST_WALLETS['test-citizen-1'];

      mockUseWallet.loading = false;
      mockUseWallet.wallet = wallet;
      mockUseWallet.error = null;
      mockUseWallet.getTransactionHistory.mockResolvedValue([]);

      render(<WalletCard showTransactions={true} />);

      await waitFor(() => {
        expect(screen.getByText('No transactions yet')).toBeInTheDocument();
      });

      expect(screen.getByText('Start playing games to earn HealCoins!')).toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('should show earn coins button for low balance', () => {
      const lowBalanceWallet = {
        ...TEST_WALLETS['test-citizen-1'],
        healCoins: 5,
      };

      mockUseWallet.loading = false;
      mockUseWallet.wallet = lowBalanceWallet;
      mockUseWallet.error = null;

      render(<WalletCard />);

      const earnButton = screen.getByText('Earn More Coins');
      expect(earnButton).toBeInTheDocument();
      expect(earnButton).toHaveAttribute('href', '/games');
    });

    it('should show redeem button for high balance', () => {
      const highBalanceWallet = {
        ...TEST_WALLETS['test-citizen-1'],
        healCoins: 150,
      };

      mockUseWallet.loading = false;
      mockUseWallet.wallet = highBalanceWallet;
      mockUseWallet.error = null;

      render(<WalletCard />);

      const redeemButton = screen.getByText('Redeem Rewards');
      expect(redeemButton).toBeInTheDocument();
      expect(redeemButton).toHaveAttribute('href', '/rewards');
    });

    it('should show both buttons for medium balance', () => {
      const mediumBalanceWallet = {
        ...TEST_WALLETS['test-citizen-1'],
        healCoins: 50,
      };

      mockUseWallet.loading = false;
      mockUseWallet.wallet = mediumBalanceWallet;
      mockUseWallet.error = null;

      render(<WalletCard />);

      expect(screen.getByText('Earn More Coins')).toBeInTheDocument();
      expect(screen.getByText('Redeem Rewards')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should apply compact layout on mobile', () => {
      // Mock window.innerWidth
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375, // Mobile width
      });

      const wallet = TEST_WALLETS['test-citizen-1'];
      mockUseWallet.loading = false;
      mockUseWallet.wallet = wallet;
      mockUseWallet.error = null;

      render(<WalletCard compact={true} />);

      expect(screen.getByTestId('wallet-card-compact')).toBeInTheDocument();
      expect(screen.queryByText('Recent Transactions')).not.toBeInTheDocument();
    });

    it('should apply full layout on desktop', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024, // Desktop width
      });

      const wallet = TEST_WALLETS['test-citizen-1'];
      mockUseWallet.loading = false;
      mockUseWallet.wallet = wallet;
      mockUseWallet.error = null;

      render(<WalletCard />);

      expect(screen.getByTestId('wallet-card')).toBeInTheDocument();
      expect(screen.queryByTestId('wallet-card-compact')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      const wallet = TEST_WALLETS['test-citizen-1'];
      mockUseWallet.loading = false;
      mockUseWallet.wallet = wallet;
      mockUseWallet.error = null;

      render(<WalletCard />);

      expect(screen.getByLabelText('Wallet balance')).toBeInTheDocument();
      expect(screen.getByLabelText('HealCoins balance: 150')).toBeInTheDocument();
    });

    it('should be keyboard navigable', () => {
      const wallet = { ...TEST_WALLETS['test-citizen-1'], healCoins: 100 }; // Medium balance for both buttons
      mockUseWallet.loading = false;
      mockUseWallet.wallet = wallet;
      mockUseWallet.error = null;

      render(<WalletCard />);

      const earnButton = screen.getByText('Earn More Coins');
      const redeemButton = screen.getByText('Redeem Rewards');

      // Test tab navigation
      earnButton.focus();
      expect(document.activeElement).toBe(earnButton);

      // Use Tab key to navigate to next focusable element
      fireEvent.keyDown(earnButton, { key: 'Tab', keyCode: 9 });
      expect(document.activeElement).toBe(redeemButton);
    });

    it('should announce balance changes to screen readers', () => {
      const wallet = TEST_WALLETS['test-citizen-1'];
      mockUseWallet.loading = false;
      mockUseWallet.wallet = wallet;
      mockUseWallet.error = null;

      const { rerender } = render(<WalletCard />);

      // Update wallet balance
      const updatedWallet = { ...wallet, healCoins: 120 };
      mockUseWallet.wallet = updatedWallet;

      rerender(<WalletCard />);

      expect(screen.getByLabelText('HealCoins balance: 120')).toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveTextContent('Balance updated to 120 HealCoins');
    });
  });

  describe('Animation and Visual Feedback', () => {
    it('should animate balance changes', async () => {
      const wallet = TEST_WALLETS['test-citizen-1'];
      mockUseWallet.loading = false;
      mockUseWallet.wallet = wallet;
      mockUseWallet.error = null;

      const { rerender } = render(<WalletCard />);

      // Update balance
      const updatedWallet = { ...wallet, healCoins: 110 };
      mockUseWallet.wallet = updatedWallet;

      rerender(<WalletCard />);

      // Check for animation class
      await waitFor(() => {
        expect(screen.getByTestId('wallet-balance-high')).toHaveClass('animate-balance-change');
      });
    });

    it('should show success indicator for recent credit', () => {
      const wallet = {
        ...TEST_WALLETS['test-citizen-1'],
        lastTransaction: {
          type: 'credit',
          amount: 10,
          createdAt: new Date().toISOString(),
        },
      };

      mockUseWallet.loading = false;
      mockUseWallet.wallet = wallet;
      mockUseWallet.error = null;

      render(<WalletCard />);

      expect(screen.getByTestId('recent-credit-indicator')).toBeInTheDocument();
      expect(screen.getByText('+10 HealCoins earned!')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large balance numbers', () => {
      const largeBalanceWallet = {
        ...TEST_WALLETS['test-citizen-1'],
        healCoins: 999999,
      };

      mockUseWallet.loading = false;
      mockUseWallet.wallet = largeBalanceWallet;
      mockUseWallet.error = null;

      render(<WalletCard />);

      expect(screen.getByText('999,999')).toBeInTheDocument(); // Should format with commas
    });

    it('should handle negative balance gracefully', () => {
      const negativeBalanceWallet = {
        ...TEST_WALLETS['test-citizen-1'],
        healCoins: -10,
      };

      mockUseWallet.loading = false;
      mockUseWallet.wallet = negativeBalanceWallet;
      mockUseWallet.error = null;

      render(<WalletCard />);

      expect(screen.getByTestId('wallet-balance-negative')).toBeInTheDocument();
      expect(screen.getByText('Contact support')).toBeInTheDocument();
    });

    it('should handle missing wallet data', () => {
      mockUseWallet.loading = false;
      mockUseWallet.wallet = null;
      mockUseWallet.error = null;

      render(<WalletCard />);

      expect(screen.getByText('Wallet not found')).toBeInTheDocument();
      expect(screen.getByText('Create Wallet')).toBeInTheDocument();
    });
  });
});
