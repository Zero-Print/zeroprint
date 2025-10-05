'use client';

import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ZPSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface ZPSelectProps {
  label?: string;
  options: ZPSelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  error?: string;
  success?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  id?: string;
  name?: string;
}

export const ZPSelect = forwardRef<HTMLSelectElement, ZPSelectProps>(
  (
    {
      label,
      options,
      value,
      onChange,
      placeholder,
      error,
      success,
      description,
      required,
      disabled,
      size = 'md',
      className,
      id,
      name,
      ...props
    },
    ref
  ) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
    const descriptionId = description ? `${selectId}-description` : undefined;
    const errorId = error ? `${selectId}-error` : undefined;
    const successId = success ? `${selectId}-success` : undefined;

    const sizeClasses = {
      sm: 'h-8 text-sm px-2',
      md: 'h-10 text-sm px-3',
      lg: 'h-12 text-base px-4',
    };

    const baseClasses = [
      'w-full rounded-md border transition-colors',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'appearance-none bg-background',
      sizeClasses[size],
    ];

    const variantClasses = error
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
      : success
      ? 'border-green-500 focus:border-green-500 focus:ring-green-500/20'
      : 'border-input focus:border-primary focus:ring-primary/20';

    return (
      <div className={cn('space-y-2', className)}>
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-foreground">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            name={name}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            disabled={disabled}
            required={required}
            aria-invalid={!!error}
            aria-describedby={cn(
              descriptionId,
              errorId,
              successId
            ).trim() || undefined}
            className={cn(baseClasses, variantClasses, 'pr-8')}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>

          <ChevronDown
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
            aria-hidden="true"
          />
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

        {success && !error && (
          <p id={successId} className="text-xs text-green-600">
            {success}
          </p>
        )}
      </div>
    );
  }
);

ZPSelect.displayName = 'ZPSelect';

export default ZPSelect;