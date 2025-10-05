'use client';

import React from 'react';
import { Button } from './button';
import { useAuth } from '@/modules/auth/AuthContext';
import { useRouter } from 'next/navigation';

export function UserMenu() {
  const [isOpen, setIsOpen] = React.useState(false);
  const { user, logout: signOut } = useAuth();
  const router = useRouter();
  const menuRef = React.useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await signOut();
    router.push('/auth/login');
  };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={menuRef} data-testid="user-menu">
      <Button
        variant="ghost"
        className="flex items-center gap-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white">
          {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
        </div>
        <span className="hidden md:inline">{user?.displayName || user?.email}</span>
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
          <button
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={handleLogout}
            role="menuitem"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}