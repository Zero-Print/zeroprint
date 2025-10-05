'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ZPButton } from '@/components/ZPButton';
import { ZPCard } from '@/components/ZPCard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signIn } = useAuth();
  const router = useRouter();

  const quickSignIn = async (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setLoading(true);
    setError('');

    try {
      const result = await signIn({ email: demoEmail, password: demoPassword });
      if (result.success) {
        router.push('/dashboard');
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn({ email, password });
      if (result.success) {
        // Route by role from local auth context if available; fallback to /dashboard
        const stored = localStorage.getItem('zeroprint_user');
        const u = stored ? JSON.parse(stored) : null;
        const role = u?.role;
        if (role === 'citizen') router.push('/dashboard/citizen');
        else if (role === 'school') router.push('/dashboard/school');
        else if (role === 'msme') router.push('/dashboard/msme');
        else if (role === 'govt' || role === 'government') router.push('/dashboard/govt');
        else if (role === 'admin') router.push('/admin');
        else router.push('/dashboard');
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4'>
      <ZPCard className='w-full max-w-md'>
        <div className='text-center mb-6'>
          <h1 className='text-2xl font-bold text-[#2E7D32] mb-2'>Welcome to ZeroPrint</h1>
          <p className='text-gray-600'>Sign in to your eco-friendly account</p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <Label htmlFor='email'>Email</Label>
            <Input
              id='email'
              type='email'
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder='Enter your email'
              required
            />
          </div>

          <div>
            <Label htmlFor='password'>Password</Label>
            <Input
              id='password'
              type='password'
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder='Enter your password'
              required
            />
          </div>

          {error && <div className='text-red-600 text-sm bg-red-50 p-3 rounded'>{error}</div>}

          <ZPButton type='submit' variant='primary' size='lg' loading={loading} className='w-full'>
            Sign In
          </ZPButton>
        </form>

        <div className='mt-6 text-center'>
          <p className='text-gray-600'>
            Don&apos;t have an account?{' '}
            <Link href='/signup' className='text-[#2E7D32] hover:underline font-medium'>
              Sign up
            </Link>
          </p>
        </div>

        {/* Demo Credentials */}
        <div className='mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200'>
          <h3 className='text-sm font-semibold text-blue-800 mb-2'>Demo Credentials</h3>
          <div className='text-xs text-blue-700 space-y-2'>
            <div className='flex justify-between items-center'>
              <span><strong>Citizen:</strong> vikash11@gmail.com / 123456</span>
              <button
                type="button"
                onClick={() => quickSignIn('vikash11@gmail.com', '123456')}
                className='ml-2 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700'
                disabled={loading}
              >
                Use
              </button>
            </div>
            <div className='flex justify-between items-center'>
              <span><strong>Admin:</strong> admin@zeroprint.com / admin123</span>
              <button
                type="button"
                onClick={() => quickSignIn('admin@zeroprint.com', 'admin123')}
                className='ml-2 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700'
                disabled={loading}
              >
                Use
              </button>
            </div>
            <div className='flex justify-between items-center'>
              <span><strong>Government:</strong> govt@zeroprint.com / govt123</span>
              <button
                type="button"
                onClick={() => quickSignIn('govt@zeroprint.com', 'govt123')}
                className='ml-2 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700'
                disabled={loading}
              >
                Use
              </button>
            </div>
          </div>
        </div>

        <div className='mt-4 text-center'>
          <Link href='/forgot-password' className='text-sm text-gray-500 hover:underline'>
            Forgot your password?
          </Link>
        </div>
      </ZPCard>
    </div>
  );
}
