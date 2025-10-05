'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ZPButton } from '@/components/ZPButton';
import { ZPCard } from '@/components/ZPCard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { UserRole } from '@/types';

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    role: 'citizen' as UserRole,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signUp } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await signUp(formData.email, formData.password, formData.displayName, formData.role);
      // Send to role-based dashboards explicitly to avoid defaulting to citizen
      const role = formData.role;
      if (role === 'citizen') router.push('/dashboard/citizen');
      else if (role === 'school') router.push('/dashboard/school');
      else if (role === 'msme') router.push('/dashboard/msme');
      else if (role === 'govt' || role === 'government') router.push('/dashboard/govt');
      else if (role === 'admin') router.push('/admin');
      else router.push('/dashboard/citizen');
    } catch (error: any) {
      setError(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4'>
      <ZPCard className='w-full max-w-md'>
        <div className='text-center mb-6'>
          <h1 className='text-2xl font-bold text-[#2E7D32] mb-2'>Join ZeroPrint</h1>
          <p className='text-gray-600'>Create your eco-friendly account</p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-4'>
          {error && <div className='text-red-600 text-sm bg-red-50 p-3 rounded'>{error}</div>}

          <div>
            <Label htmlFor='displayName'>Full Name</Label>
            <Input
              id='displayName'
              name='displayName'
              type='text'
              value={formData.displayName}
              onChange={handleChange}
              placeholder='Enter your full name'
              required
            />
          </div>

          <div>
            <Label htmlFor='email'>Email</Label>
            <Input
              id='email'
              name='email'
              type='email'
              value={formData.email}
              onChange={handleChange}
              placeholder='Enter your email'
              required
            />
          </div>

          <div>
            <Label htmlFor='role'>Account Type</Label>
            <select
              id='role'
              name='role'
              value={formData.role}
              onChange={handleChange}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2E7D32]'
              required
            >
              <option value='citizen'>Citizen</option>
              <option value='school'>School</option>
              <option value='msme'>MSME</option>
              <option value='govt'>Government</option>
            </select>
          </div>

          <div>
            <Label htmlFor='password'>Password</Label>
            <Input
              id='password'
              name='password'
              type='password'
              value={formData.password}
              onChange={handleChange}
              placeholder='Create a password'
              required
            />
          </div>

          <div>
            <Label htmlFor='confirmPassword'>Confirm Password</Label>
            <Input
              id='confirmPassword'
              name='confirmPassword'
              type='password'
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder='Confirm your password'
              required
            />
          </div>

          <ZPButton type='submit' variant='primary' size='lg' loading={loading} className='w-full'>
            Create Account
          </ZPButton>
        </form>

        <div className='mt-6 text-center'>
          <p className='text-gray-600'>
            Already have an account?{' '}
            <Link href='/login' className='text-[#2E7D32] hover:underline font-medium'>
              Sign in
            </Link>
          </p>
        </div>
      </ZPCard>
    </div>
  );
}
