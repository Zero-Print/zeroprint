import { useCallback, useEffect } from 'react';
import { captureErrorWithNotification } from '@/lib/sentry';

interface ErrorMonitoringOptions {
  component?: string;
  enableGlobalHandler?: boolean;
}

export const useErrorMonitoring = (options: ErrorMonitoringOptions = {}) => {
  const { component = 'unknown', enableGlobalHandler = false } = options;

  const captureError = useCallback(
    async (error: Error, context?: Record<string, any>, shouldNotify: boolean = false) => {
      await captureErrorWithNotification(
        error,
        {
          component,
          ...context,
        },
        shouldNotify
      );
    },
    [component]
  );

  const captureAsyncError = useCallback(
    (asyncFn: (...args: any[]) => Promise<any>, context?: Record<string, any>) => {
      return async (...args: any[]) => {
        try {
          return await asyncFn(...args);
        } catch (error) {
          await captureError(
            error instanceof Error ? error : new Error(String(error)),
            context,
            true // Async errors are often critical
          );
          throw error;
        }
      };
    },
    [captureError]
  );

  const wrapApiCall = useCallback(
    <T extends (...args: any[]) => Promise<any>>(apiCall: T, endpoint: string): T => {
      return captureAsyncError(apiCall, {
        action: 'api_call',
        endpoint,
      }) as T;
    },
    [captureAsyncError]
  );

  useEffect(() => {
    if (!enableGlobalHandler) return;

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));

      captureError(
        error,
        {
          action: 'unhandled_promise_rejection',
          reason: event.reason,
        },
        true
      );
    };

    const handleError = (event: ErrorEvent) => {
      const error = event.error instanceof Error ? event.error : new Error(event.message);

      captureError(
        error,
        {
          action: 'global_error',
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
        true
      );
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, [enableGlobalHandler, captureError]);

  return {
    captureError,
    captureAsyncError,
    wrapApiCall,
  };
};
