import React from 'react';
import { cn } from '@/lib/utils';

export interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
}

export function RadioGroup({ children, value, onValueChange, className, ...props }: RadioGroupProps) {
  return (
    <div
      className={cn('grid gap-2', className)}
      role="radiogroup"
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            ...child.props,
            checked: child.props.value === value,
            onValueChange,
          });
        }
        return child;
      })}
    </div>
  );
}

export interface RadioGroupItemProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
  onValueChange?: (value: string) => void;
}

export function RadioGroupItem({ value, onValueChange, className, ...props }: RadioGroupItemProps) {
  return (
    <input
      type="radio"
      value={value}
      onChange={(e) => onValueChange?.(e.target.value)}
      className={cn(
        'aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
}
