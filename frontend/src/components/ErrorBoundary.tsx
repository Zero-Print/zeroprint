'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('zeroprint_user');
        localStorage.removeItem('zeroprint_profile');
      } catch (storageError) {
        console.warn('Failed to clear local storage after error', storageError);
      }
    }
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md mx-auto text-center p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <h2 className="text-lg font-semibold text-red-800 mb-2">
                Something went wrong
              </h2>
              <p className="text-red-600 text-sm mb-4">
                There was an error loading the page. Please try refreshing or logging in again.
              </p>
              <button
                onClick={() => {
                  // Clear localStorage and reload
                  if (typeof window !== 'undefined') {
                    localStorage.clear();
                    window.location.href = '/auth/login';
                  }
                }}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                Clear Data & Go to Login
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
