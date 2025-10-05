'use client';

import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/styles/theme';
import { cn } from '@/lib/utils';

interface ZPThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'button' | 'icon' | 'switch';
}

export const ZPThemeToggle: React.FC<ZPThemeToggleProps> = ({
  className,
  size = 'md',
  variant = 'button',
}) => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const toggleTheme = () => {
    if (theme === 'system') {
      setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
    } else {
      setTheme(theme === 'dark' ? 'light' : 'dark');
    }
  };

  const sizeClasses = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg',
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={toggleTheme}
        className={cn(
          'inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          sizeClasses[size],
          className
        )}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? <Moon size={iconSizes[size]} /> : <Sun size={iconSizes[size]} />}
      </button>
    );
  }

  if (variant === 'switch') {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        <Sun size={16} className='text-muted-foreground' />
        <button
          onClick={toggleTheme}
          className={cn(
            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
            theme === 'dark' ? 'bg-primary' : 'bg-input'
          )}
          role='switch'
          aria-checked={theme === 'dark'}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          <span
            className={cn(
              'inline-block h-4 w-4 transform rounded-full bg-background transition-transform',
              theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
            )}
          />
        </button>
        <Moon size={16} className='text-muted-foreground' />
      </div>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background px-3 py-2',
        'hover:bg-accent hover:text-accent-foreground transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        'text-sm font-medium',
        className
      )}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <>
          <Moon size={16} />
          Dark Mode
        </>
      ) : (
        <>
          <Sun size={16} />
          Light Mode
        </>
      )}
    </button>
  );
};

// Export individual variants for convenience
export const ZPThemeToggleIcon: React.FC<Omit<ZPThemeToggleProps, 'variant'>> = props => (
  <ZPThemeToggle {...props} variant='icon' />
);

export const ZPThemeToggleSwitch: React.FC<Omit<ZPThemeToggleProps, 'variant'>> = props => (
  <ZPThemeToggle {...props} variant='switch' />
);

export const ZPThemeToggleButton: React.FC<Omit<ZPThemeToggleProps, 'variant'>> = props => (
  <ZPThemeToggle {...props} variant='button' />
);

export default ZPThemeToggle;
