'use client';

import React, { forwardRef } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ZPToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose?: () => void;
  closable?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  id?: string;
}

export const ZPToast = forwardRef<HTMLDivElement, ZPToastProps>(
  (
    {
      message,
      type = 'info',
      duration = 5000,
      onClose,
      closable = true,
      action,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const [isVisible, setIsVisible] = React.useState(true);

    const handleClose = React.useCallback(() => {
      setIsVisible(false);
      setTimeout(() => onClose?.(), 300); // Allow animation to complete
    }, [onClose]);

    React.useEffect(() => {
      if (duration > 0) {
        const timer = setTimeout(handleClose, duration);
        return () => clearTimeout(timer);
      }
    }, [duration, handleClose]);

    const typeConfig = {
      success: {
        icon: CheckCircle,
        className: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/50 dark:border-green-800 dark:text-green-100',
        iconClassName: 'text-green-500 dark:text-green-400',
      },
      error: {
        icon: AlertCircle,
        className: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/50 dark:border-red-800 dark:text-red-100',
        iconClassName: 'text-red-500 dark:text-red-400',
      },
      warning: {
        icon: AlertTriangle,
        className: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/50 dark:border-yellow-800 dark:text-yellow-100',
        iconClassName: 'text-yellow-500 dark:text-yellow-400',
      },
      info: {
        icon: Info,
        className: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/50 dark:border-blue-800 dark:text-blue-100',
        iconClassName: 'text-blue-500 dark:text-blue-400',
      },
    };

    const config = typeConfig[type];
    const Icon = config.icon;

    if (!isVisible) return null;

    return (
      <div
        ref={ref}
        id={id}
        role="alert"
        aria-live="polite"
        className={cn(
          'flex items-center p-4 border rounded-lg shadow-lg',
          'transition-all duration-300 ease-in-out',
          'max-w-md w-full',
          config.className,
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2',
          className
        )}
        {...props}
      >
        <Icon className={cn('h-5 w-5 mr-3 flex-shrink-0', config.iconClassName)} />
        
        <div className="flex-1 mr-2">
          <p className="text-sm font-medium">{message}</p>
        </div>

        <div className="flex items-center space-x-2">
          {action && (
            <button
              onClick={action.onClick}
              className={cn(
                'text-xs font-medium underline hover:no-underline',
                'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current',
                'rounded px-1 py-0.5'
              )}
            >
              {action.label}
            </button>
          )}

          {closable && (
            <button
              onClick={handleClose}
              className={cn(
                'ml-2 flex-shrink-0 rounded-md p-1.5',
                'hover:bg-black/10 dark:hover:bg-white/10',
                'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current',
                'transition-colors'
              )}
              aria-label="Close notification"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    );
  }
);

ZPToast.displayName = 'ZPToast';

// Toast Container for managing multiple toasts
export interface ZPToastContainerProps {
  toasts: Array<ZPToastProps & { id: string }>;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  className?: string;
}

export const ZPToastContainer: React.FC<ZPToastContainerProps> = ({
  toasts,
  position = 'top-right',
  className,
}) => {
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
  };

  if (toasts.length === 0) return null;

  return (
    <div
      className={cn(
        'fixed z-50 flex flex-col space-y-2',
        positionClasses[position],
        className
      )}
    >
      {toasts.map((toast) => (
        <ZPToast key={toast.id} {...toast} />
      ))}
    </div>
  );
};

// Hook for managing toasts
export const useZPToast = () => {
  const [toasts, setToasts] = React.useState<Array<ZPToastProps & { id: string }>>([]);

  const addToast = React.useCallback((toast: Omit<ZPToastProps, 'onClose'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = {
      ...toast,
      id,
      onClose: () => removeToast(id),
    };
    setToasts(prev => [...prev, newToast]);
    return id;
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const removeAllToasts = React.useCallback(() => {
    setToasts([]);
  }, []);

  return {
    toasts,
    addToast,
    removeToast,
    removeAllToasts,
    toast: {
      success: (message: string, options?: Partial<ZPToastProps>) =>
        addToast({ ...options, message, type: 'success' }),
      error: (message: string, options?: Partial<ZPToastProps>) =>
        addToast({ ...options, message, type: 'error' }),
      warning: (message: string, options?: Partial<ZPToastProps>) =>
        addToast({ ...options, message, type: 'warning' }),
      info: (message: string, options?: Partial<ZPToastProps>) =>
        addToast({ ...options, message, type: 'info' }),
    },
  };
};

export default ZPToast;