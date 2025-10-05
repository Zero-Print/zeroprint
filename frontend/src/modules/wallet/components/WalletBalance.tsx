'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet } from '@/types';

interface WalletBalanceProps {
  wallet: Wallet | null;
  loading?: boolean;
}

export function WalletBalance({ wallet, loading = false }: WalletBalanceProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='animate-pulse bg-gray-200 h-6 w-32 rounded'></CardTitle>
        </CardHeader>
        <CardContent>
          <div className='animate-pulse bg-gray-200 h-8 w-24 rounded'></div>
        </CardContent>
      </Card>
    );
  }

  if (!wallet) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Wallet</CardTitle>
          <CardDescription>Your carbon credits and rewards</CardDescription>
        </CardHeader>
        <CardContent>
          <p className='text-gray-500'>Wallet not found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Carbon Wallet</CardTitle>
        <CardDescription>Your earned carbon credits and rewards</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          <div className='flex justify-between items-center'>
            <span className='text-sm font-medium'>Balance</span>
            <span className='text-2xl font-bold text-[#2E7D32]'>₹{wallet.balance.toFixed(2)}</span>
          </div>

          <div className='flex justify-between items-center'>
            <span className='text-sm font-medium'>Transactions</span>
            <span className='text-xl font-semibold text-blue-600'>
              {wallet.transactions.length}
            </span>
          </div>

          <div className='pt-2 border-t'>
            <div className='text-xs text-gray-500'>
              Last updated: {new Date(wallet.updatedAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
