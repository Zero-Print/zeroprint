'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface ZPRadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface ZPRadioProps {
  name: string;
  options: ZPRadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  description?: string;
  orientation?: 'vertical' | 'horizontal';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

export const ZPRadio = forwardRef<HTMLDivElement, ZPRadioProps>(
  (
    {
      name,
      options,
      value,
      onChange,
      disabled,
      required,
      error,
      description,
      orientation = 'vertical',
      size = 'md',
      className,
      label,
      ...props
    },
    ref
  ) => {
    const groupId = `radio-group-${Math.random().toString(36).substr(2, 9)}`;
    const descriptionId = description ? `${groupId}-description` : undefined;
    const errorId = error ? `${groupId}-error` : undefined;

    const sizeClasses = {
      sm: 'h-3 w-3',
      md: 'h-4 w-4',
      lg: 'h-5 w-5',
    };

    const labelSizeClasses = {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
    };

    const orientationClasses = {
      vertical: 'flex-col space-y-3',
      horizontal: 'flex-row flex-wrap gap-6',
    };

    return (
      <div
        ref={ref}
        className={cn('space-y-2', className)}
        role="radiogroup"
        aria-labelledby={label ? `${groupId}-label` : undefined}
        aria-describedby={cn(
          descriptionId,
          errorId
        ).trim() || undefined}
        aria-required={required}
        aria-invalid={!!error}
        {...props}
      >
        {label && (
          <label id={`${groupId}-label`} className="text-sm font-medium text-foreground">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className={cn('flex', orientationClasses[orientation])}>
          {options.map((option, index) => {
            const isChecked = value === option.value;
            const isDisabled = disabled || option.disabled;
            const optionId = `${name}-${index}`;

            return (
              <div key={option.value} className="flex items-start space-x-2">
                <div className="relative flex items-center">
                  <input
                    type="radio"
                    id={optionId}
                    name={name}
                    value={option.value}
                    checked={isChecked}
                    onChange={(e) => onChange?.(e.target.value)}
                    disabled={isDisabled}
                    required={required}
                    className="peer sr-only"
                  />
                  
                  <div
                    className={cn(
                      'border-2 rounded-full transition-all duration-200',
                      'peer-focus:ring-2 peer-focus:ring-offset-2 peer-focus:ring-primary/20',
                      'peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
                      'flex items-center justify-center',
                      sizeClasses[size],
                      error
                        ? 'border-red-500'
                        : isChecked
                        ? 'border-primary bg-primary'
                        : 'border-input bg-background hover:border-primary/50'
                    )}
                  >
                    {isChecked && (
                      <div
                        className={cn(
                          'rounded-full bg-primary-foreground',
                          size === 'sm' ? 'h-1 w-1' : size === 'md' ? 'h-1.5 w-1.5' : 'h-2 w-2'
                        )}
                      />
                    )}
                  </div>
                </div>

                <div className="flex-1">
                  <label
                    htmlFor={optionId}
                    className={cn(
                      'font-medium text-foreground cursor-pointer',
                      'peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
                      labelSizeClasses[size],
                      error && 'text-red-900',
                      isDisabled && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    {option.label}
                  </label>
                  
                  {option.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {option.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {description && (
          <p id={descriptionId} className="text-xs text-muted-foreground">
            {description}
          </p>
        )}

        {error && (
          <p id={errorId} className="text-xs text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

ZPRadio.displayName = 'ZPRadio';

export default ZPRadio;