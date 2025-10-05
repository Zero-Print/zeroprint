'use client';

import React, { forwardRef } from 'react';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ZPAvatarProps {
  src?: string;
  alt: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  fallback?: string;
  className?: string;
  shape?: 'circle' | 'square';
  status?: 'online' | 'offline' | 'away' | 'busy';
  onClick?: () => void;
  loading?: boolean;
}

export const ZPAvatar = forwardRef<HTMLDivElement, ZPAvatarProps>(
  (
    {
      src,
      alt,
      size = 'md',
      fallback,
      className,
      shape = 'circle',
      status,
      onClick,
      loading,
      ...props
    },
    ref
  ) => {
    const [imageError, setImageError] = React.useState(false);
    const [imageLoaded, setImageLoaded] = React.useState(false);

    const sizeClasses = {
      xs: 'h-6 w-6 text-xs',
      sm: 'h-8 w-8 text-sm',
      md: 'h-10 w-10 text-base',
      lg: 'h-12 w-12 text-lg',
      xl: 'h-16 w-16 text-xl',
      '2xl': 'h-20 w-20 text-2xl',
    };

    const iconSizes = {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 20,
      xl: 24,
      '2xl': 28,
    };

    const statusSizes = {
      xs: 'h-1.5 w-1.5',
      sm: 'h-2 w-2',
      md: 'h-2.5 w-2.5',
      lg: 'h-3 w-3',
      xl: 'h-3.5 w-3.5',
      '2xl': 'h-4 w-4',
    };

    const statusColors = {
      online: 'bg-green-500',
      offline: 'bg-gray-400',
      away: 'bg-yellow-500',
      busy: 'bg-red-500',
    };

    const shapeClasses = {
      circle: 'rounded-full',
      square: 'rounded-md',
    };

    const getFallbackText = () => {
      if (fallback) return fallback;
      return alt
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    };

    const shouldShowImage = src && !imageError && !loading;
    const shouldShowFallback = !shouldShowImage;

    return (
      <div
        ref={ref}
        className={cn(
          'relative inline-flex items-center justify-center',
          'bg-muted text-muted-foreground font-medium',
          'overflow-hidden border border-border',
          sizeClasses[size],
          shapeClasses[shape],
          onClick && 'cursor-pointer hover:opacity-80 transition-opacity',
          className
        )}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={
          onClick
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onClick();
                }
              }
            : undefined
        }
        {...props}
      >
        {loading && (
          <div className="animate-pulse bg-muted-foreground/20 w-full h-full absolute inset-0" />
        )}

        {shouldShowImage && (
          <img
            src={src}
            alt={alt}
            className={cn(
              'w-full h-full object-cover',
              shapeClasses[shape],
              !imageLoaded && 'opacity-0'
            )}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        )}

        {shouldShowFallback && (
          <>
            {getFallbackText() ? (
              <span className="select-none">
                {getFallbackText()}
              </span>
            ) : (
              <User size={iconSizes[size]} />
            )}
          </>
        )}

        {status && (
          <div
            className={cn(
              'absolute bottom-0 right-0 rounded-full border-2 border-background',
              statusSizes[size],
              statusColors[status]
            )}
            aria-label={`Status: ${status}`}
          />
        )}
      </div>
    );
  }
);

ZPAvatar.displayName = 'ZPAvatar';

// Avatar Group Component for displaying multiple avatars
export interface ZPAvatarGroupProps {
  children: React.ReactNode;
  max?: number;
  size?: ZPAvatarProps['size'];
  className?: string;
  showMore?: boolean;
}

export const ZPAvatarGroup: React.FC<ZPAvatarGroupProps> = ({
  children,
  max = 5,
  size = 'md',
  className,
  showMore = true,
}) => {
  const childrenArray = React.Children.toArray(children);
  const visibleChildren = childrenArray.slice(0, max);
  const remainingCount = childrenArray.length - max;

  return (
    <div className={cn('flex -space-x-2', className)}>
      {visibleChildren.map((child, index) => (
        <div key={index} className="ring-2 ring-background rounded-full">
          {React.cloneElement(child as React.ReactElement, { size })}
        </div>
      ))}
      
      {showMore && remainingCount > 0 && (
        <ZPAvatar
          size={size}
          alt={`+${remainingCount} more`}
          fallback={`+${remainingCount}`}
          className="ring-2 ring-background"
        />
      )}
    </div>
  );
};

export default ZPAvatar;