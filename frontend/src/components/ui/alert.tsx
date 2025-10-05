import React from 'react';
import { cn } from '@/lib/utils';

export interface AlertProps {
  children: React.ReactNode;
  variant?: 'default' | 'destructive' | 'warning' | 'success';
  className?: string;
}

export function Alert({ children, variant = 'default', className }: AlertProps) {
  return (
    <div
      className={cn(
        'rounded-lg border p-4',
        {
          'border-gray-200 bg-gray-50 text-gray-900': variant === 'default',
          'border-red-200 bg-red-50 text-red-900': variant === 'destructive',
          'border-yellow-200 bg-yellow-50 text-yellow-900': variant === 'warning',
          'border-green-200 bg-green-50 text-green-900': variant === 'success',
        },
        className
      )}
    >
      {children}
    </div>
  );
}

export function AlertTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h5 className={cn('mb-1 font-medium leading-none tracking-tight', className)}>
      {children}
    </h5>
  );
}

export function AlertDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('text-sm [&_p]:leading-relaxed', className)}>
      {children}
    </div>
  );
}
