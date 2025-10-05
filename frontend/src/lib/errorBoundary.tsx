'use client';

import React from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';

type Props = { children: React.ReactNode };
type State = { hasError: boolean };

export class GlobalErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error: any) {
    return { hasError: true };
  }

  async componentDidCatch(error: Error, info: React.ErrorInfo) {
    try {
      const logFn: any = httpsCallable(functions as any, 'logSystemError');
      await logFn({ module: 'frontend', errorType: 'uncaught', message: error.message, stackTrace: (error.stack || '') + '\n' + info.componentStack, severity: 'high' });
    } catch (_e) {
      // swallow
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-2">Something went wrong</h2>
            <p className="text-gray-600">Our team has been notified.</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}


