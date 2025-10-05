'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface ZPNavItem {
  label: string;
  href: string;
  active?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  badge?: string | number;
  children?: ZPNavItem[];
}

export interface ZPNavProps {
  items: ZPNavItem[];
  orientation?: 'horizontal' | 'vertical';
  variant?: 'default' | 'pills' | 'underline' | 'sidebar';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onItemClick?: (item: ZPNavItem) => void;
}

export const ZPNav = forwardRef<HTMLElement, ZPNavProps>(
  (
    {
      items,
      orientation = 'horizontal',
      variant = 'default',
      size = 'md',
      className,
      onItemClick,
      ...props
    },
    ref
  ) => {
    const orientationClasses = {
      horizontal: 'flex flex-row',
      vertical: 'flex flex-col',
    };

    const spacingClasses = {
      horizontal: 'space-x-1',
      vertical: 'space-y-1',
    };

    const sizeClasses = {
      sm: 'text-sm',
      md: 'text-sm',
      lg: 'text-base',
    };

    const paddingClasses = {
      sm: 'px-2 py-1',
      md: 'px-3 py-2',
      lg: 'px-4 py-3',
    };

    const getVariantClasses = (item: ZPNavItem, isActive: boolean) => {
      const baseClasses = [
        'inline-flex items-center justify-center',
        'font-medium transition-colors duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/20',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        paddingClasses[size],
      ];

      switch (variant) {
        case 'pills':
          return cn(
            baseClasses,
            'rounded-full',
            isActive
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          );

        case 'underline':
          return cn(
            baseClasses,
            'rounded-none border-b-2 border-transparent',
            isActive
              ? 'border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground hover:border-muted-foreground'
          );

        case 'sidebar':
          return cn(
            baseClasses,
            'w-full justify-start rounded-md',
            isActive
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          );

        default: // 'default'
          return cn(
            baseClasses,
            'rounded-md',
            isActive
              ? 'bg-muted text-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
          );
      }
    };

    const renderNavItem = (item: ZPNavItem, index: number) => {
      const isActive = Boolean(item.active);
      const isDisabled = Boolean(item.disabled);

      const handleClick = (e: React.MouseEvent) => {
        if (isDisabled) {
          e.preventDefault();
          return;
        }
        onItemClick?.(item);
      };

      const itemContent = (
        <>
          {item.icon && (
            <span className="mr-2 flex-shrink-0">
              {item.icon}
            </span>
          )}
          <span className="truncate">{item.label}</span>
          {item.badge && (
            <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
              {item.badge}
            </span>
          )}
        </>
      );

      if (item.href && !isDisabled) {
        return (
          <a
            key={index}
            href={item.href}
            onClick={handleClick}
            className={getVariantClasses(item, isActive)}
            aria-current={isActive ? 'page' : undefined}
            tabIndex={isDisabled ? -1 : undefined}
          >
            {itemContent}
          </a>
        );
      }

      return (
        <button
          key={index}
          onClick={handleClick}
          disabled={isDisabled}
          className={getVariantClasses(item, isActive)}
          aria-current={isActive ? 'page' : undefined}
          type="button"
        >
          {itemContent}
        </button>
      );
    };

    const renderNestedNav = (items: ZPNavItem[]) => {
      return items.map((item, index) => (
        <div key={index}>
          {renderNavItem(item, index)}
          {item.children && item.children.length > 0 && (
            <div className={cn(
              'ml-4 mt-1',
              orientation === 'vertical' ? 'border-l border-border pl-4' : ''
            )}>
              <ZPNav
                items={item.children}
                orientation={orientation}
                variant={variant}
                size={size}
                onItemClick={onItemClick}
              />
            </div>
          )}
        </div>
      ));
    };

    return (
      <nav
        ref={ref}
        role="navigation"
        className={cn(
          orientationClasses[orientation],
          spacingClasses[orientation],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {renderNestedNav(items)}
      </nav>
    );
  }
);

ZPNav.displayName = 'ZPNav';

// Breadcrumb Navigation Component
export interface ZPBreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

export interface ZPBreadcrumbProps {
  items: ZPBreadcrumbItem[];
  separator?: React.ReactNode;
  className?: string;
  onItemClick?: (item: ZPBreadcrumbItem) => void;
}

export const ZPBreadcrumb: React.FC<ZPBreadcrumbProps> = ({
  items,
  separator = '/',
  className,
  onItemClick,
}) => {
  return (
    <nav
      role="navigation"
      aria-label="Breadcrumb"
      className={cn('flex items-center space-x-2 text-sm', className)}
    >
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isActive = item.active || isLast;

          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <span className="mx-2 text-muted-foreground" aria-hidden="true">
                  {separator}
                </span>
              )}
              
              {item.href && !isActive ? (
                <a
                  href={item.href}
                  onClick={() => onItemClick?.(item)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.label}
                </a>
              ) : (
                <span
                  className={cn(
                    isActive ? 'text-foreground font-medium' : 'text-muted-foreground'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default ZPNav;