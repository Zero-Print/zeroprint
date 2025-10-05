import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/modules/auth';
import { Wallet } from '@/types';
import api from '@/lib/api';

export function useWallet() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const load = useCallback(async () => {
    if (!user) { setWallet(null); setLoading(false); return; }
    try {
      setLoading(true);
      const res: any = await api.request('/wallet/balance');
      const w = res?.wallet || res?.data?.wallet || null;
      setWallet(w ? ({ userId: w.walletId, balance: w.inrBalance, transactions: [], createdAt: w.lastUpdated, updatedAt: w.lastUpdated } as any) : null);
      setError(null);
    } catch (e: any) {
      setError(e?.message || 'Failed to load wallet');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const earn = async (coins: number, gameId = 'manual'): Promise<void> => {
    if (!user) throw new Error('User not authenticated');
    await api.request('/wallet/earn', { method: 'POST', body: JSON.stringify({ coins, gameId }) });
    await load();
  };

  const redeem = async (amount: number, rewardId?: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');
    await api.request('/wallet/redeem', { method: 'POST', body: JSON.stringify({ amount, rewardId }) });
    await load();
  };

  return { wallet, loading, error, reload: load, refreshWallet: load, earn, redeem };
}
