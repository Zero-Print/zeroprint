'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/modules/auth';
import { ChevronDown, User, Settings, LogOut, Wallet, Trophy, Gamepad2 } from 'lucide-react';

interface NavigationProps {
  user: {
    displayName: string;
    healCoins?: number;
  };
}

export function Navigation({ user }: NavigationProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { logout } = useAuth();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navigationItems = [
    { label: 'Dashboard', href: '/dashboard', icon: null },
    { label: 'Games', href: '/games', icon: Gamepad2 },
    { label: 'Wallet', href: '/wallet', icon: Wallet },
    { label: 'Leaderboard', href: '/leaderboard', icon: Trophy },
  ];

  // Default healCoins to 0 if not provided
  const displayHealCoins = user.healCoins || 0;

  return (
    <nav className='bg-white shadow-sm border-b border-gray-200'>
      <div className='container mx-auto px-6 py-4'>
        <div className='flex justify-between items-center'>
          {/* Logo and Navigation */}
          <div className='flex items-center space-x-4'>
            <div className='flex items-center space-x-2'>
              <div className='w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center'>
                <span className='text-white font-bold text-sm'>Z</span>
              </div>
              <span className='text-xl font-bold text-gray-900'>ZeroPrint</span>
            </div>
            <div className='hidden md:flex space-x-6'>
              {navigationItems.map(item => (
                <button
                  key={item.label}
                  onClick={() => router.push(item.href)}
                  className='text-gray-600 hover:text-green-600 font-medium transition-colors duration-200 flex items-center space-x-1'
                >
                  {item.icon && <item.icon className='w-4 h-4' />}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* User Section */}
          <div className='flex items-center space-x-4'>
            {/* HealCoins Display */}
            <div className='flex items-center space-x-2 bg-green-100 px-3 py-1 rounded-full'>
              <span className='text-green-600 font-semibold'>{displayHealCoins} HC</span>
            </div>

            {/* Profile Dropdown */}
            <div className='relative' ref={dropdownRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className='flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200'
                data-testid='user-menu'
              >
                <div className='w-8 h-8 bg-gradient-to-r from-green-400 to-blue-400 rounded-full flex items-center justify-center'>
                  <span className='text-white font-bold text-sm'>
                    {user.displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Dropdown Menu */}
              {isProfileOpen && (
                <div className='absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50'>
                  {/* User Info */}
                  <div className='px-4 py-3 border-b border-gray-100'>
                    <p className='text-sm font-medium text-gray-900'>{user.displayName}</p>
                    <p className='text-xs text-gray-500'>Level 5 Eco Warrior</p>
                  </div>

                  {/* Menu Items */}
                  <div className='py-1'>
                    <button
                      onClick={() => {
                        router.push('/profile');
                        setIsProfileOpen(false);
                      }}
                      className='flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200'
                    >
                      <User className='w-4 h-4' />
                      <span>View Profile</span>
                    </button>

                    <button
                      onClick={() => {
                        router.push('/settings');
                        setIsProfileOpen(false);
                      }}
                      className='flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200'
                    >
                      <Settings className='w-4 h-4' />
                      <span>Settings</span>
                    </button>

                    <button
                      onClick={() => {
                        router.push('/wallet');
                        setIsProfileOpen(false);
                      }}
                      className='flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200'
                    >
                      <Wallet className='w-4 h-4' />
                      <span>My Wallet</span>
                    </button>
                  </div>

                  {/* Logout */}
                  <div className='border-t border-gray-100 py-1'>
                    <button
                      onClick={handleLogout}
                      className='flex items-center space-x-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200'
                      role='menuitem'
                    >
                      <LogOut className='w-4 h-4' />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}