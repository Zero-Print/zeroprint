'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

interface ZPInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  description?: string;
  error?: string;
  success?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'underlined';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showPasswordToggle?: boolean;
  fullWidth?: boolean;
  required?: boolean;
}

export const ZPInput = forwardRef<HTMLInputElement, ZPInputProps>(
  (
    {
      label,
      description,
      error,
      success,
      size = 'md',
      variant = 'default',
      leftIcon,
      rightIcon,
      showPasswordToggle = false,
      fullWidth = true,
      required = false,
      className,
      type = 'text',
      id,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [isFocused, setIsFocused] = React.useState(false);

    const generatedId = React.useId();
    const inputId = id || `input-${generatedId}`;
    const descriptionId = description ? `${inputId}-description` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;

    const inputType = type === 'password' && showPassword ? 'text' : type;

    const baseClasses =
      'flex w-full rounded-md border transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50';

    const sizeClasses = {
      sm: 'h-8 px-3 py-1 text-sm',
      md: 'h-10 px-3 py-2 text-sm',
      lg: 'h-11 px-4 py-2 text-base',
    };

    const variantClasses = {
      default:
        'border-input bg-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      filled:
        'border-transparent bg-muted focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-ring',
      underlined:
        'border-0 border-b-2 border-input bg-transparent rounded-none focus-visible:border-ring',
    };

    const stateClasses = {
      error: 'border-destructive focus-visible:ring-destructive',
      success: 'border-green-500 focus-visible:ring-green-500',
      default: '',
    };

    const currentState = error ? 'error' : success ? 'success' : 'default';

    const hasLeftIcon = leftIcon || false;
    const hasRightIcon = rightIcon || showPasswordToggle || error || success;

    return (
      <div className={cn('space-y-2', !fullWidth && 'w-auto', className)}>
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
              error && 'text-destructive',
              success && 'text-green-600'
            )}
          >
            {label}
            {required && <span className='text-destructive ml-1'>*</span>}
          </label>
        )}

        <div className='relative'>
          {hasLeftIcon && (
            <div className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground'>
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            type={inputType}
            id={inputId}
            className={cn(
              baseClasses,
              sizeClasses[size],
              variantClasses[variant],
              stateClasses[currentState],
              hasLeftIcon && 'pl-10',
              hasRightIcon && 'pr-10'
            )}
            aria-describedby={cn(descriptionId, errorId)}
            aria-invalid={error ? 'true' : 'false'}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            suppressHydrationWarning
            {...props}
          />

          {hasRightIcon && (
            <div className='absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1'>
              {error && <AlertCircle className='h-4 w-4 text-destructive' />}
              {success && !error && <CheckCircle className='h-4 w-4 text-green-500' />}
              {showPasswordToggle && type === 'password' && (
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='text-muted-foreground hover:text-foreground focus:outline-none focus:text-foreground'
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                </button>
              )}
              {rightIcon && !showPasswordToggle && !error && !success && rightIcon}
            </div>
          )}
        </div>

        {description && !error && (
          <p id={descriptionId} className='text-sm text-muted-foreground'>
            {description}
          </p>
        )}

        {error && (
          <p id={errorId} className='text-sm text-destructive flex items-center gap-1'>
            <AlertCircle className='h-3 w-3' />
            {error}
          </p>
        )}

        {success && !error && (
          <p className='text-sm text-green-600 flex items-center gap-1'>
            <CheckCircle className='h-3 w-3' />
            {success}
          </p>
        )}
      </div>
    );
  }
);

ZPInput.displayName = 'ZPInput';

// Convenience components for specific input types
export const ZPPasswordInput: React.FC<
  Omit<ZPInputProps, 'type' | 'showPasswordToggle'>
> = props => <ZPInput {...props} type='password' showPasswordToggle />;

export const ZPEmailInput: React.FC<Omit<ZPInputProps, 'type'>> = props => (
  <ZPInput {...props} type='email' />
);

export const ZPNumberInput: React.FC<Omit<ZPInputProps, 'type'>> = props => (
  <ZPInput {...props} type='number' />
);

export const ZPSearchInput: React.FC<Omit<ZPInputProps, 'type'>> = props => (
  <ZPInput {...props} type='search' />
);

export default ZPInput;
