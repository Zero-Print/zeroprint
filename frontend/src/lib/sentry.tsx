// import * as Sentry from '@sentry/nextjs';
import React from 'react';
// import { api } from './api';

export const initSentry = () => {
  // Sentry initialization disabled for now
  if (process.env.NODE_ENV === 'development') {
    console.debug('Sentry initialization skipped - package not installed');
  }
};

export const logErrorToBackend = async (error: Error, context?: Record<string, any>) => {
  // Backend logging disabled for now
  if (process.env.NODE_ENV === 'development') {
    console.debug('Backend error logging skipped:', error.message, context);
  }
};

export const captureError = (error: Error, context?: Record<string, any>) => {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error captured:', error, context);
  }
};

export const captureErrorWithNotification = async (
  error: Error,
  context?: Record<string, any>,
  showNotification: boolean = false
) => {
  // Capture the error
  captureError(error, context);

  // Show user notification if requested
  if (showNotification && typeof window !== 'undefined') {
    console.warn('User notification:', error.message);
  }
};

export const setUserContext = (user: { id: string; email?: string; role?: string }) => {
  console.log('User context set:', user);
};

export const addBreadcrumb = (
  message: string,
  category: string,
  level: 'info' | 'warning' | 'error' = 'info'
) => {
  console.log('Breadcrumb:', { message, category, level });
};

export const startTransaction = (name: string, op: string) => {
  console.log('Transaction started:', { name, op });
  return { finish: () => console.log('Transaction finished:', name) };
};

export const setTag = (key: string, value: string) => {
  console.log('Tag set:', { key, value });
};

export const setContext = (key: string, context: Record<string, any>) => {
  console.log('Context set:', { key, context });
};

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundaryClass extends React.Component<
  {
    children: React.ReactNode;
    fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
  },
  ErrorBoundaryState
> {
  constructor(props: {
    children: React.ReactNode;
    fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
  }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error boundary caught an error:', error, errorInfo);
    captureError(error, { errorInfo });
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || ErrorFallback;
      return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

export const withErrorBoundary = <T extends Record<string, any>>(
  Component: React.ComponentType<T>,
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>
) => {
  const WrappedComponent = React.forwardRef<any, T>((props, ref) => (
    <ErrorBoundaryClass fallback={fallback}>
      <Component {...props} ref={ref} />
    </ErrorBoundaryClass>
  ));

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
};

const ErrorFallback: React.FC<{ error: Error; resetError: () => void }> = ({
  error,
  resetError,
}) => (
  <div className='min-h-screen flex items-center justify-center bg-gray-50'>
    <div className='max-w-md w-full bg-white shadow-lg rounded-lg p-6'>
      <div className='flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4'>
        <svg className='w-6 h-6 text-red-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
          />
        </svg>
      </div>
      <h2 className='text-lg font-semibold text-gray-900 text-center mb-2'>Something went wrong</h2>
      <p className='text-gray-600 text-center mb-4'>
        We&apos;ve been notified about this error and are working to fix it.
      </p>
      <div className='flex space-x-3'>
        <button
          onClick={resetError}
          className='flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors'
        >
          Try Again
        </button>
        <button
          onClick={() => (window.location.href = '/')}
          className='flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors'
        >
          Go Home
        </button>
      </div>
    </div>
  </div>
);
