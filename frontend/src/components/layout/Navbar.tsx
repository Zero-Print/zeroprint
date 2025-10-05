'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/modules/auth';
import { 
  Bell, 
  User, 
  Settings, 
  LogOut, 
  ChevronDown,
  Menu,
  X,
  Home,
  BarChart3,
  Gamepad2,
  Wallet
} from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  // Don't show navbar content if user is not logged in
  if (!user) {
    return null;
  }

  const userRole = (user as any)?.role || 'citizen';

  // Map user roles to dashboard routes
  const getDashboardRoute = (role: string) => {
    switch (role) {
      case 'citizen':
        return '/dashboard/citizen';
      case 'school':
        return '/dashboard/school';
      case 'msme':
        return '/dashboard/msme';
      case 'government':
      case 'govt':
        return '/dashboard/govt';
      case 'admin':
        return '/admin';
      default:
        return '/dashboard/citizen';
    }
  };

  // Get role-specific navigation items
  const getRoleBasedNavigation = (role: string) => {
    const baseItems = [
      { name: 'Dashboard', href: getDashboardRoute(role), icon: Home },
      { name: 'Trackers', href: '/trackers', icon: BarChart3 },
      { name: 'Games', href: '/games', icon: Gamepad2 },
      { name: 'Wallet', href: '/wallet', icon: Wallet },
    ];

    // Add role-specific items
    if (role === 'admin') {
      return [
        { name: 'Admin Panel', href: '/admin', icon: Home },
        { name: 'User Management', href: '/admin/users', icon: BarChart3 },
        { name: 'System Monitor', href: '/admin/system', icon: Gamepad2 },
        { name: 'Reports', href: '/admin/reports', icon: Wallet },
      ];
    }

    if (role === 'government' || role === 'govt') {
      return [
        { name: 'Dashboard', href: getDashboardRoute(role), icon: Home },
        { name: 'Ward Analytics', href: '/dashboard/govt/wards', icon: BarChart3 },
        { name: 'Policy Manager', href: '/dashboard/govt/policies', icon: Gamepad2 },
        { name: 'Citizens', href: '/dashboard/govt/citizens', icon: Wallet },
      ];
    }

    if (role === 'school' || role === 'msme') {
      return [
        { name: 'Dashboard', href: getDashboardRoute(role), icon: Home },
        { name: 'Classes', href: role === 'school' ? '/dashboard/school/classes' : '/dashboard/msme/classes', icon: BarChart3 },
        { name: 'Challenges', href: role === 'school' ? '/dashboard/school/challenges' : '/dashboard/msme/challenges', icon: Gamepad2 },
        { name: 'Reports', href: role === 'school' ? '/dashboard/school/reports' : '/dashboard/msme/reports', icon: Wallet },
      ];
    }

    return baseItems;
  };

  // Get role-specific styling
  const getRoleStyles = (role: string) => {
    switch (role) {
      case 'admin':
        return {
          gradient: 'from-purple-600 to-indigo-600',
          bg: 'bg-gradient-to-r from-purple-50 to-indigo-50',
          text: 'text-purple-600',
          border: 'border-purple-200',
          logo: 'from-purple-600 to-indigo-600'
        };
      case 'government':
      case 'govt':
        return {
          gradient: 'from-blue-600 to-cyan-600',
          bg: 'bg-gradient-to-r from-blue-50 to-cyan-50',
          text: 'text-blue-600',
          border: 'border-blue-200',
          logo: 'from-blue-600 to-cyan-600'
        };
      case 'school':
        return {
          gradient: 'from-orange-600 to-red-600',
          bg: 'bg-gradient-to-r from-orange-50 to-red-50',
          text: 'text-orange-600',
          border: 'border-orange-200',
          logo: 'from-orange-600 to-red-600'
        };
      case 'msme':
        return {
          gradient: 'from-emerald-600 to-teal-600',
          bg: 'bg-gradient-to-r from-emerald-50 to-teal-50',
          text: 'text-emerald-600',
          border: 'border-emerald-200',
          logo: 'from-emerald-600 to-teal-600'
        };
      default: // citizen
        return {
          gradient: 'from-green-600 to-blue-600',
          bg: 'bg-gradient-to-r from-green-50 to-blue-50',
          text: 'text-green-600',
          border: 'border-green-200',
          logo: 'from-green-600 to-blue-600'
        };
    }
  };

  const roleStyles = getRoleStyles(userRole);
  const navigation = getRoleBasedNavigation(userRole);

  return (
    <nav className={`bg-white shadow-sm border-b ${roleStyles.border}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Navigation */}
          <div className="flex">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href={getDashboardRoute(userRole)} className="flex items-center space-x-2">
                <div className={`w-8 h-8 bg-gradient-to-r ${roleStyles.logo} rounded-full flex items-center justify-center`}>
                  <span className="text-white font-bold text-sm">Z</span>
                </div>
                <span className={`text-xl font-bold ${roleStyles.text}`}>ZeroPrint</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:${roleStyles.text} hover:border-gray-300 border-b-2 border-transparent transition-colors`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className={`p-2 text-gray-400 hover:${roleStyles.text} focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded-md`}>
              <Bell className="w-5 h-5" />
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-3 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                <div className={`w-8 h-8 bg-gradient-to-r ${roleStyles.logo} rounded-full flex items-center justify-center text-white font-medium`}>
                  {((user as any)?.displayName || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium text-gray-700">
                    {(user as any)?.displayName || 'User'}
                  </div>
                  <div className="text-xs text-gray-500 capitalize">
                    {userRole}
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <div className="text-sm font-medium text-gray-900">
                      {(user as any)?.displayName || 'User'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {(user as any)?.email}
                    </div>
                  </div>
                  
                  <Link
                    href="/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <User className="w-4 h-4 mr-3" />
                    View Profile
                  </Link>
                  
                  <Link
                    href="/settings"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <Settings className="w-4 h-4 mr-3" />
                    Settings
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Sign out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="sm:hidden p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded-md"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="sm:hidden border-t border-gray-200 py-3">
            <div className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close profile dropdown */}
      {isProfileOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsProfileOpen(false)}
        />
      )}
    </nav>
  );
}