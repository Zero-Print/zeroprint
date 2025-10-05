'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Coins, Leaf, Zap, Droplets, Recycle } from 'lucide-react';

interface ZPBadgeProps {
  children: React.ReactNode;
  variant?:
    | 'default'
    | 'success'
    | 'warning'
    | 'danger'
    | 'info'
    | 'secondary'
    | 'healcoin'
    | 'carbon'
    | 'energy'
    | 'water'
    | 'waste'
    | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  icon?: React.ReactNode;
  showIcon?: boolean;
}

export function ZPBadge({
  children,
  variant = 'default',
  size = 'md',
  className,
  icon,
  showIcon = false,
}: ZPBadgeProps) {
  const baseClasses = 'inline-flex items-center font-medium rounded-full transition-colors';

  const variantClasses = {
    default: 'bg-secondary text-secondary-foreground',
    success: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    danger: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    secondary:
      'bg-[var(--zp-light-gray)] text-[var(--zp-primary-green)] dark:bg-[var(--zp-primary-green)]/20 dark:text-[var(--zp-primary-green)]',
    healcoin:
      'bg-gradient-to-r from-yellow-100 to-amber-100 text-amber-800 border border-amber-200 dark:from-yellow-900/20 dark:to-amber-900/20 dark:text-amber-400 dark:border-amber-800/30',
    carbon: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    energy: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    water: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400',
    waste: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
    outline:
      'border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-sm gap-1.5',
    lg: 'px-3 py-1.5 text-base gap-2',
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  // Default icons for specific variants
  const getDefaultIcon = () => {
    switch (variant) {
      case 'healcoin':
        return <Coins size={iconSizes[size]} />;
      case 'carbon':
        return <Leaf size={iconSizes[size]} />;
      case 'energy':
        return <Zap size={iconSizes[size]} />;
      case 'water':
        return <Droplets size={iconSizes[size]} />;
      case 'waste':
        return <Recycle size={iconSizes[size]} />;
      default:
        return null;
    }
  };

  const displayIcon = icon || (showIcon ? getDefaultIcon() : null);

  return (
    <span className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}>
      {displayIcon}
      {children}
    </span>
  );
}

// Convenience components for common use cases
export const ZPHealCoinBadge: React.FC<Omit<ZPBadgeProps, 'variant'>> = ({
  children,
  ...props
}) => (
  <ZPBadge {...props} variant='healcoin' showIcon>
    {children}
  </ZPBadge>
);

export const ZPCarbonBadge: React.FC<Omit<ZPBadgeProps, 'variant'>> = ({ children, ...props }) => (
  <ZPBadge {...props} variant='carbon' showIcon>
    {children}
  </ZPBadge>
);

export const ZPEnergyBadge: React.FC<Omit<ZPBadgeProps, 'variant'>> = ({ children, ...props }) => (
  <ZPBadge {...props} variant='energy' showIcon>
    {children}
  </ZPBadge>
);

export const ZPWaterBadge: React.FC<Omit<ZPBadgeProps, 'variant'>> = ({ children, ...props }) => (
  <ZPBadge {...props} variant='water' showIcon>
    {children}
  </ZPBadge>
);

export const ZPWasteBadge: React.FC<Omit<ZPBadgeProps, 'variant'>> = ({ children, ...props }) => (
  <ZPBadge {...props} variant='waste' showIcon>
    {children}
  </ZPBadge>
);

export default ZPBadge;
