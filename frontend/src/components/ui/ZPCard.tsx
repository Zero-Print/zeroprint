'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ZPCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  clickable?: boolean;
  onClick?: () => void;
}

interface ZPCardHeaderProps {
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}

interface ZPCardBodyProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

interface ZPCardFooterProps {
  children: React.ReactNode;
  className?: string;
  justify?: 'start' | 'center' | 'end' | 'between';
}

// Main Card Component
type ZPCardComponent = React.FC<ZPCardProps> & {
  Header: typeof ZPCardHeader;
  Title: typeof ZPCardTitle;
  Description: typeof ZPCardDescription;
  Body: typeof ZPCardBody;
  Footer: typeof ZPCardFooter;
};

export const ZPCard = (({
  children,
  className,
  variant = 'default',
  padding = 'md',
  hover = false,
  clickable = false,
  onClick,
}: ZPCardProps) => {
  const baseClasses = 'rounded-lg border transition-all duration-200';

  const variantClasses = {
    default: 'bg-card text-card-foreground border-border shadow-sm',
    elevated: 'bg-card text-card-foreground border-border shadow-lg shadow-black/5',
    outlined: 'bg-background text-foreground border-2 border-border',
    filled: 'bg-muted text-muted-foreground border-transparent',
  };

  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const interactiveClasses = {
    hover: hover ? 'hover:shadow-md hover:shadow-black/10 hover:-translate-y-0.5' : '',
    clickable: clickable
      ? 'cursor-pointer hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
      : '',
  };

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        paddingClasses[padding],
        interactiveClasses.hover,
        interactiveClasses.clickable,
        className
      )}
      onClick={clickable ? onClick : undefined}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={
        clickable
          ? e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
    >
      {children}
    </div>
  );
}) as ZPCardComponent;

// Card Header Component
export const ZPCardHeader: React.FC<ZPCardHeaderProps> = ({ children, className, actions }) => {
  return (
    <div className={cn('flex items-center justify-between space-y-1.5 pb-4', className)}>
      <div className='flex-1'>{children}</div>
      {actions && <div className='flex items-center space-x-2'>{actions}</div>}
    </div>
  );
};

// Card Title Component
export const ZPCardTitle: React.FC<{
  children: React.ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}> = ({ children, className, as: Component = 'h3' }) => {
  return (
    <Component className={cn('text-lg font-semibold leading-none tracking-tight', className)}>
      {children}
    </Component>
  );
};

// Card Description Component
export const ZPCardDescription: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return <p className={cn('text-sm text-muted-foreground mt-1', className)}>{children}</p>;
};

// Card Body Component
export const ZPCardBody: React.FC<ZPCardBodyProps> = ({
  children,
  className,
  padding = 'none',
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  return <div className={cn('flex-1', paddingClasses[padding], className)}>{children}</div>;
};

// Card Footer Component
export const ZPCardFooter: React.FC<ZPCardFooterProps> = ({
  children,
  className,
  justify = 'end',
}) => {
  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
  };

  return (
    <div className={cn('flex items-center pt-4 space-x-2', justifyClasses[justify], className)}>
      {children}
    </div>
  );
};

// Compound component with sub-components
ZPCard.Header = ZPCardHeader;
ZPCard.Title = ZPCardTitle;
ZPCard.Description = ZPCardDescription;
ZPCard.Body = ZPCardBody;
ZPCard.Footer = ZPCardFooter;

export default ZPCard;
