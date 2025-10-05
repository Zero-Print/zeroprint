import React from 'react';

interface ZPCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  headerAction?: React.ReactNode;
  [key: string]: any;
}

export function ZPCard({ 
  children, 
  className = '', 
  title, 
  description, 
  headerAction,
  ...props 
}: ZPCardProps) {
  const hasHeader = title || description || headerAction;
  
  return (
    <div className={`bg-white rounded-lg border shadow-sm ${className}`} {...props}>
      {hasHeader && (
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              {title && (
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              )}
              {description && (
                <p className="text-sm text-gray-500 mt-1">{description}</p>
              )}
            </div>
            {headerAction && (
              <div>{headerAction}</div>
            )}
          </div>
        </div>
      )}
      <div className={hasHeader ? 'p-6' : 'p-6'}>
        {children}
      </div>
    </div>
  );
}

interface ZPButtonProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  [key: string]: any;
}

export function ZPButton({ 
  children, 
  className = '', 
  variant = 'default', 
  size = 'md',
  ...props 
}: ZPButtonProps) {
  const baseClasses = 'inline-flex items-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';
  
  const variants: Record<string, string> = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
    ghost: 'text-gray-700 hover:bg-gray-100',
  };
  
  const sizes: Record<string, string> = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  
  return (
    <button 
      className={`${baseClasses} ${variants[variant] || variants.default} ${sizes[size] || sizes.md} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
}

interface ZPBadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'secondary';
  [key: string]: any;
}

export function ZPBadge({ 
  children, 
  className = '', 
  variant = 'default',
  ...props 
}: ZPBadgeProps) {
  const baseClasses = 'inline-flex items-center rounded-full font-medium';
  
  const variants: Record<string, string> = {
    default: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    secondary: 'bg-gray-100 text-gray-800',
  };
  
  const sizes: Record<string, string> = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm',
  };
  
  return (
    <span 
      className={`${baseClasses} ${variants[variant] || variants.default} ${sizes.md} ${className}`} 
      {...props}
    >
      {children}
    </span>
  );
}