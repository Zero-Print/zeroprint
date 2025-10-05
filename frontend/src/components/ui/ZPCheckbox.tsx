'use client';

import React, { forwardRef } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ZPCheckboxProps {
  label?: string | React.ReactNode;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  id?: string;
  name?: string;
  value?: string;
  indeterminate?: boolean;
}

export const ZPCheckbox = forwardRef<HTMLInputElement, ZPCheckboxProps>(
  (
    {
      label,
      checked,
      onChange,
      disabled,
      required,
      error,
      description,
      size = 'md',
      className,
      id,
      name,
      value,
      indeterminate,
      ...props
    },
    ref
  ) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
    const descriptionId = description ? `${checkboxId}-description` : undefined;
    const errorId = error ? `${checkboxId}-error` : undefined;

    const sizeClasses = {
      sm: 'h-3 w-3',
      md: 'h-4 w-4',
      lg: 'h-5 w-5',
    };

    const iconSizeClasses = {
      sm: 'h-2 w-2',
      md: 'h-3 w-3',
      lg: 'h-4 w-4',
    };

    const labelSizeClasses = {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
    };

    return (
      <div className={cn('space-y-1', className)}>
        <div className="flex items-start space-x-2">
          <div className="relative flex items-center">
            <input
              ref={ref}
              type="checkbox"
              id={checkboxId}
              name={name}
              value={value}
              checked={checked}
              onChange={(e) => onChange?.(e.target.checked)}
              disabled={disabled}
              required={required}
              aria-invalid={!!error}
              aria-describedby={cn(
                descriptionId,
                errorId
              ).trim() || undefined}
              className={cn(
                'peer sr-only',
                sizeClasses[size]
              )}
              {...props}
            />
            
            <div
              className={cn(
                'border-2 rounded transition-all duration-200',
                'peer-focus:ring-2 peer-focus:ring-offset-2 peer-focus:ring-primary/20',
                'peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
                sizeClasses[size],
                error
                  ? 'border-red-500'
                  : checked || indeterminate
                  ? 'border-primary bg-primary'
                  : 'border-input bg-background hover:border-primary/50'
              )}
            >
              {(checked || indeterminate) && (
                <Check 
                  className={cn(
                    'text-primary-foreground',
                    iconSizeClasses[size]
                  )}
                  strokeWidth={3}
                />
              )}
              
              {indeterminate && (
                <div 
                  className={cn(
                    'bg-primary-foreground',
                    size === 'sm' ? 'h-0.5 w-2' : size === 'md' ? 'h-0.5 w-2.5' : 'h-1 w-3'
                  )}
                />
              )}
            </div>
          </div>

          {label && (
            <label
              htmlFor={checkboxId}
              className={cn(
                'font-medium text-foreground cursor-pointer',
                'peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
                labelSizeClasses[size],
                error && 'text-red-900'
              )}
            >
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}
        </div>

        {description && (
          <p id={descriptionId} className="text-xs text-muted-foreground ml-6">
            {description}
          </p>
        )}

        {error && (
          <p id={errorId} className="text-xs text-red-600 ml-6" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

ZPCheckbox.displayName = 'ZPCheckbox';

export default ZPCheckbox;