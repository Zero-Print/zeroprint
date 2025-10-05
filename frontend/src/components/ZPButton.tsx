'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ZPButtonProps extends Omit<React.ComponentProps<'button'>, 'variant' | 'size'> {
  variant?:
    | 'primary'
    | 'secondary'
    | 'ghost'
    | 'outline'
    | 'success'
    | 'warning'
    | 'danger'
    | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'icon';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  children?: React.ReactNode;
}

export const ZPButton = React.forwardRef<HTMLButtonElement, ZPButtonProps>(function ZPButton({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  children,
  className,
  disabled,
  fullWidth = false,
  ...props
}, ref) {
  const baseClasses =
    'font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center rounded-md';

  const variantClasses = {
    primary:
      'bg-[var(--zp-primary-green)] hover:bg-[var(--zp-primary-green)]/90 text-white focus:ring-[var(--zp-primary-green)]/20 shadow-sm',
    secondary:
      'bg-[var(--zp-solar-yellow)] hover:bg-[var(--zp-solar-yellow)]/90 text-black focus:ring-[var(--zp-solar-yellow)]/20 shadow-sm',
    ghost: 'hover:bg-accent hover:text-accent-foreground focus:ring-ring/20',
    outline:
      'border border-input bg-background hover:bg-accent hover:text-accent-foreground focus:ring-ring/20',
    success:
      'bg-[var(--zp-success)] hover:bg-[var(--zp-success)]/90 text-white focus:ring-[var(--zp-success)]/20 shadow-sm',
    warning:
      'bg-[var(--zp-warning)] hover:bg-[var(--zp-warning)]/90 text-white focus:ring-[var(--zp-warning)]/20 shadow-sm',
    danger:
      'bg-[var(--zp-danger)] hover:bg-[var(--zp-danger)]/90 text-white focus:ring-[var(--zp-danger)]/20 shadow-sm',
    icon: 'hover:bg-accent hover:text-accent-foreground focus:ring-ring/20 rounded-full',
  };

  const sizeClasses = {
    sm: 'h-8 px-3 text-sm gap-1.5',
    md: 'h-10 px-4 text-sm gap-2',
    lg: 'h-11 px-6 text-base gap-2',
    xl: 'h-12 px-8 text-lg gap-2.5',
    icon: 'h-10 w-10 p-0',
  };

  // For icon-only buttons, ensure proper accessibility
  const isIconOnly = variant === 'icon' || (icon && !children);

  return (
    <Button
      ref={ref}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || loading}
      aria-label={
        isIconOnly && typeof props['aria-label'] === 'undefined' ? 'Button' : props['aria-label']
      }
      {...props}
    >
      {loading && <Loader2 className='h-4 w-4 animate-spin' />}
      {icon && iconPosition === 'left' && !loading && icon}
      {children && !loading && children}
      {icon && iconPosition === 'right' && !loading && icon}
      {isIconOnly && !loading && !children && icon}
    </Button>
  );
});

// Convenience components for common use cases
export const ZPButtonPrimary: React.FC<Omit<ZPButtonProps, 'variant'>> = props => (
  <ZPButton {...props} variant='primary' />
);

export const ZPButtonSecondary: React.FC<Omit<ZPButtonProps, 'variant'>> = props => (
  <ZPButton {...props} variant='secondary' />
);

export const ZPButtonGhost: React.FC<Omit<ZPButtonProps, 'variant'>> = props => (
  <ZPButton {...props} variant='ghost' />
);

export const ZPButtonIcon: React.FC<Omit<ZPButtonProps, 'variant' | 'size'>> = props => (
  <ZPButton {...props} variant='icon' size='icon' />
);

export default ZPButton;
