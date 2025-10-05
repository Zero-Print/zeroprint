'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface ZPTextAreaProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  error?: string;
  success?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
  maxLength?: number;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
  className?: string;
  id?: string;
  name?: string;
}

export const ZPTextArea = forwardRef<HTMLTextAreaElement, ZPTextAreaProps>(
  (
    {
      label,
      placeholder,
      value,
      onChange,
      error,
      success,
      description,
      required,
      disabled,
      rows = 4,
      maxLength,
      resize = 'vertical',
      className,
      id,
      name,
      ...props
    },
    ref
  ) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
    const descriptionId = description ? `${textareaId}-description` : undefined;
    const errorId = error ? `${textareaId}-error` : undefined;
    const successId = success ? `${textareaId}-success` : undefined;

    const resizeClasses = {
      none: 'resize-none',
      vertical: 'resize-y',
      horizontal: 'resize-x',
      both: 'resize',
    };

    const baseClasses = [
      'w-full rounded-md border px-3 py-2 text-sm transition-colors',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'placeholder:text-muted-foreground',
      'bg-background',
      resizeClasses[resize],
    ];

    const variantClasses = error
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
      : success
      ? 'border-green-500 focus:border-green-500 focus:ring-green-500/20'
      : 'border-input focus:border-primary focus:ring-primary/20';

    const currentLength = value?.length || 0;
    const showCounter = maxLength && maxLength > 0;

    return (
      <div className={cn('space-y-2', className)}>
        {label && (
          <label htmlFor={textareaId} className="text-sm font-medium text-foreground">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          <textarea
            ref={ref}
            id={textareaId}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            rows={rows}
            maxLength={maxLength}
            aria-invalid={!!error}
            aria-describedby={cn(
              descriptionId,
              errorId,
              successId
            ).trim() || undefined}
            className={cn(baseClasses, variantClasses)}
            {...props}
          />

          {showCounter && (
            <div className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-background/80 px-1 rounded">
              {currentLength}/{maxLength}
            </div>
          )}
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

ZPTextArea.displayName = 'ZPTextArea';

export default ZPTextArea;