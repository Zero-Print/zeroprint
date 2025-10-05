'use client';

import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';

type Fetch = typeof fetch;

export function installNetworkInterceptor() {
  if (typeof window === 'undefined') return;
  const origFetch: Fetch = window.fetch.bind(window);
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const start = performance.now();
    try {
      const res = await origFetch(input, init);
      const dur = performance.now() - start;
      try {
        const perfFn: any = httpsCallable(functions as any, 'recordPerfMetric');
        await perfFn({ metricType: 'fetch_latency_ms', value: dur, context: { url: String(input), status: res.status } });
      } catch {}
      if (!res.ok) {
        try {
          const errFn: any = httpsCallable(functions as any, 'logSystemError');
          await errFn({ module: 'frontend', errorType: 'http_error', message: `${res.status} ${res.statusText}`, stackTrace: '', severity: res.status >= 500 ? 'high' : 'medium' });
        } catch {}
      }
      return res;
    } catch (e: any) {
      try {
        const errFn: any = httpsCallable(functions as any, 'logSystemError');
        await errFn({ module: 'frontend', errorType: 'network_failure', message: e?.message || 'fetch failed', stackTrace: e?.stack || '' , severity: 'high' });
      } catch {}
      throw e;
    }
  };
}


