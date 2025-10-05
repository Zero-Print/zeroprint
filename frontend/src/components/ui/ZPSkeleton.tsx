'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface ZPSkeletonProps {
  height?: string | number;
  width?: string | number;
  shape?: 'rectangle' | 'circle' | 'text';
  animation?: 'pulse' | 'wave' | 'none';
  className?: string;
  lines?: number; // For text skeleton
}

export const ZPSkeleton = forwardRef<HTMLDivElement, ZPSkeletonProps>(
  (
    {
      height = 'auto',
      width = '100%',
      shape = 'rectangle',
      animation = 'pulse',
      className,
      lines = 1,
      ...props
    },
    ref
  ) => {
    const getHeightClass = () => {
      if (typeof height === 'number') return `h-[${height}px]`;
      if (typeof height === 'string') {
        if (height.includes('h-')) return height;
        return `h-[${height}]`;
      }
      return 'h-4'; // default
    };

    const getWidthClass = () => {
      if (typeof width === 'number') return `w-[${width}px]`;
      if (typeof width === 'string') {
        if (width.includes('w-')) return width;
        if (width === '100%') return 'w-full';
        return `w-[${width}]`;
      }
      return 'w-full'; // default
    };

    const shapeClasses = {
      rectangle: 'rounded-md',
      circle: 'rounded-full',
      text: 'rounded-sm',
    };

    const animationClasses = {
      pulse: 'animate-pulse',
      wave: 'animate-wave',
      none: '',
    };

    const baseClasses = [
      'bg-muted',
      shapeClasses[shape],
      animationClasses[animation],
    ];

    // For text skeleton with multiple lines
    if (shape === 'text' && lines > 1) {
      return (
        <div
          ref={ref}
          className={cn('space-y-2', className)}
          aria-label="Loading content..."
          {...props}
        >
          {Array.from({ length: lines }, (_, index) => (
            <div
              key={index}
              className={cn(
                baseClasses,
                getHeightClass(),
                index === lines - 1 ? 'w-3/4' : getWidthClass() // Last line is shorter
              )}
            />
          ))}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          baseClasses,
          getHeightClass(),
          getWidthClass(),
          className
        )}
        aria-label="Loading content..."
        {...props}
      />
    );
  }
);

ZPSkeleton.displayName = 'ZPSkeleton';

// Preset skeleton components for common use cases
export const ZPSkeletonText: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className,
}) => (
  <ZPSkeleton
    shape="text"
    height="h-4"
    lines={lines}
    className={className}
  />
);

export const ZPSkeletonAvatar: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({
  size = 'md',
  className,
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  return (
    <ZPSkeleton
      shape="circle"
      className={cn(sizeClasses[size], className)}
    />
  );
};

export const ZPSkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('space-y-3 p-4 border rounded-lg', className)}>
    <div className="flex items-center space-x-3">
      <ZPSkeletonAvatar size="sm" />
      <div className="flex-1 space-y-2">
        <ZPSkeleton height="h-4" width="w-1/3" />
        <ZPSkeleton height="h-3" width="w-1/4" />
      </div>
    </div>
    <ZPSkeletonText lines={2} />
    <div className="flex space-x-2">
      <ZPSkeleton height="h-8" width="w-16" />
      <ZPSkeleton height="h-8" width="w-20" />
    </div>
  </div>
);

export const ZPSkeletonTable: React.FC<{ rows?: number; columns?: number; className?: string }> = ({
  rows = 5,
  columns = 4,
  className,
}) => (
  <div className={cn('space-y-3', className)}>
    {/* Header */}
    <div className="flex space-x-4">
      {Array.from({ length: columns }, (_, index) => (
        <ZPSkeleton key={`header-${index}`} height="h-4" width="w-20" />
      ))}
    </div>
    
    {/* Rows */}
    {Array.from({ length: rows }, (_, rowIndex) => (
      <div key={`row-${rowIndex}`} className="flex space-x-4">
        {Array.from({ length: columns }, (_, colIndex) => (
          <ZPSkeleton
            key={`cell-${rowIndex}-${colIndex}`}
            height="h-4"
            width={colIndex === 0 ? 'w-24' : 'w-16'}
          />
        ))}
      </div>
    ))}
  </div>
);

export const ZPSkeletonButton: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({
  size = 'md',
  className,
}) => {
  const sizeClasses = {
    sm: 'h-8 w-16',
    md: 'h-10 w-20',
    lg: 'h-12 w-24',
  };

  return (
    <ZPSkeleton
      className={cn(sizeClasses[size], 'rounded-md', className)}
    />
  );
};

export default ZPSkeleton;