/**
 * RealtimeService - Real-time updates and optimistic UI management
 * Handles live data refresh, optimistic updates, and cross-dashboard synchronization
 */

import { EventEmitter } from 'events';

// ============================================================================
// INTERFACES
// ============================================================================

export interface RealtimeConfig {
  pollingInterval: number; // milliseconds
  optimisticTimeout: number; // milliseconds
  maxRetries: number;
  enableOptimisticUpdates: boolean;
  enablePolling: boolean;
  endpoints: RealtimeEndpoint[];
}

export interface RealtimeEndpoint {
  id: string;
  url: string;
  method: 'GET' | 'POST';
  interval: number; // milliseconds
  priority: 'high' | 'medium' | 'low';
  enabled: boolean;
  lastFetch?: Date;
  errorCount: number;
}

export interface OptimisticUpdate<T = any> {
  id: string;
  type: string;
  data: T;
  originalData?: T;
  timestamp: Date;
  status: 'pending' | 'confirmed' | 'failed' | 'reverted';
  retryCount: number;
}

export interface RealtimeEvent<T = any> {
  type: string;
  data: T;
  timestamp: Date;
  source: 'polling' | 'optimistic' | 'manual';
}

export interface SubscriptionOptions {
  immediate?: boolean;
  interval?: number;
  transform?: (data: any) => any;
  filter?: (data: any) => boolean;
}

// ============================================================================
// REALTIME SERVICE
// ============================================================================

export class RealtimeService extends EventEmitter {
  private config: RealtimeConfig;
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private optimisticUpdates: Map<string, OptimisticUpdate> = new Map();
  private subscriptions: Map<string, Set<string>> = new Map();
  private isActive: boolean = false;
  private retryTimeouts: Map<string, NodeJS.Timeout> = new Map();

  constructor(config?: Partial<RealtimeConfig>) {
    super();
    
    this.config = {
      pollingInterval: 30000, // 30 seconds
      optimisticTimeout: 5000, // 5 seconds
      maxRetries: 3,
      enableOptimisticUpdates: true,
      enablePolling: true,
      endpoints: [],
      ...config
    };
  }

  // ============================================================================
  // PUBLIC METHODS
  // ============================================================================

  /**
   * Start the realtime service
   */
  start(): void {
    if (this.isActive) return;
    
    this.isActive = true;
    console.log('Starting RealtimeService...');
    
    if (this.config.enablePolling) {
      this.startPolling();
    }
    
    this.emit('service:started');
  }

  /**
   * Stop the realtime service
   */
  stop(): void {
    if (!this.isActive) return;
    
    this.isActive = false;
    console.log('Stopping RealtimeService...');
    
    // Clear all intervals
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals.clear();
    
    // Clear retry timeouts
    this.retryTimeouts.forEach(timeout => clearTimeout(timeout));
    this.retryTimeouts.clear();
    
    // Revert pending optimistic updates
    this.revertAllOptimisticUpdates();
    
    this.emit('service:stopped');
  }

  /**
   * Subscribe to real-time updates for a specific data type
   */
  subscribe(
    dataType: string,
    callback: (event: RealtimeEvent) => void,
    options?: SubscriptionOptions
  ): () => void {
    const subscriptionId = this.generateSubscriptionId();
    
    if (!this.subscriptions.has(dataType)) {
      this.subscriptions.set(dataType, new Set());
    }
    
    this.subscriptions.get(dataType)!.add(subscriptionId);
    
    // Set up event listener
    const eventHandler = (event: RealtimeEvent) => {
      if (options?.filter && !options.filter(event.data)) return;
      
      const transformedEvent = options?.transform 
        ? { ...event, data: options.transform(event.data) }
        : event;
      
      callback(transformedEvent);
    };
    
    this.on(`data:${dataType}`, eventHandler);
    
    // Fetch immediately if requested
    if (options?.immediate) {
      this.fetchData(dataType);
    }
    
    // Return unsubscribe function
    return () => {
      this.subscriptions.get(dataType)?.delete(subscriptionId);
      this.off(`data:${dataType}`, eventHandler);
    };
  }

  /**
   * Apply optimistic update
   */
  applyOptimisticUpdate<T>(
    type: string,
    data: T,
    originalData?: T
  ): string {
    if (!this.config.enableOptimisticUpdates) {
      throw new Error('Optimistic updates are disabled');
    }
    
    const updateId = this.generateUpdateId();
    const update: OptimisticUpdate<T> = {
      id: updateId,
      type,
      data,
      originalData,
      timestamp: new Date(),
      status: 'pending',
      retryCount: 0
    };
    
    this.optimisticUpdates.set(updateId, update);
    
    // Emit optimistic update event
    this.emit(`data:${type}`, {
      type,
      data,
      timestamp: update.timestamp,
      source: 'optimistic'
    } as RealtimeEvent<T>);
    
    // Set timeout for automatic revert
    setTimeout(() => {
      this.handleOptimisticTimeout(updateId);
    }, this.config.optimisticTimeout);
    
    return updateId;
  }

  /**
   * Confirm optimistic update
   */
  confirmOptimisticUpdate(updateId: string, confirmedData?: any): boolean {
    const update = this.optimisticUpdates.get(updateId);
    if (!update || update.status !== 'pending') return false;
    
    update.status = 'confirmed';
    
    if (confirmedData) {
      this.emit(`data:${update.type}`, {
        type: update.type,
        data: confirmedData,
        timestamp: new Date(),
        source: 'manual'
      } as RealtimeEvent);
    }
    
    // Clean up after a delay
    setTimeout(() => {
      this.optimisticUpdates.delete(updateId);
    }, 1000);
    
    return true;
  }

  /**
   * Revert optimistic update
   */
  revertOptimisticUpdate(updateId: string): boolean {
    const update = this.optimisticUpdates.get(updateId);
    if (!update || update.status !== 'pending') return false;
    
    update.status = 'reverted';
    
    if (update.originalData) {
      this.emit(`data:${update.type}`, {
        type: update.type,
        data: update.originalData,
        timestamp: new Date(),
        source: 'manual'
      } as RealtimeEvent);
    }
    
    this.optimisticUpdates.delete(updateId);
    return true;
  }

  /**
   * Manually fetch data for a specific type
   */
  async fetchData(dataType: string): Promise<void> {
    const endpoint = this.config.endpoints.find(ep => ep.id === dataType);
    if (!endpoint || !endpoint.enabled) return;
    
    try {
      const response = await fetch(endpoint.url, {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      endpoint.lastFetch = new Date();
      endpoint.errorCount = 0;
      
      this.emit(`data:${dataType}`, {
        type: dataType,
        data,
        timestamp: new Date(),
        source: 'polling'
      } as RealtimeEvent);
      
    } catch (error) {
      endpoint.errorCount++;
      console.error(`Failed to fetch data for ${dataType}:`, error);
      
      this.emit('error', {
        type: 'fetch_error',
        endpoint: dataType,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      });
      
      // Retry with exponential backoff
      if (endpoint.errorCount <= this.config.maxRetries) {
        const retryDelay = Math.pow(2, endpoint.errorCount) * 1000;
        const timeoutId = setTimeout(() => {
          this.fetchData(dataType);
        }, retryDelay);
        
        this.retryTimeouts.set(`${dataType}-retry`, timeoutId);
      }
    }
  }

  /**
   * Add or update endpoint configuration
   */
  addEndpoint(endpoint: RealtimeEndpoint): void {
    const existingIndex = this.config.endpoints.findIndex(ep => ep.id === endpoint.id);
    
    if (existingIndex >= 0) {
      this.config.endpoints[existingIndex] = endpoint;
    } else {
      this.config.endpoints.push(endpoint);
    }
    
    // Restart polling for this endpoint if service is active
    if (this.isActive && endpoint.enabled) {
      this.startPollingForEndpoint(endpoint);
    }
  }

  /**
   * Remove endpoint
   */
  removeEndpoint(endpointId: string): boolean {
    const index = this.config.endpoints.findIndex(ep => ep.id === endpointId);
    if (index === -1) return false;
    
    // Stop polling for this endpoint
    const intervalId = this.intervals.get(endpointId);
    if (intervalId) {
      clearInterval(intervalId);
      this.intervals.delete(endpointId);
    }
    
    this.config.endpoints.splice(index, 1);
    return true;
  }

  /**
   * Get service statistics
   */
  getStats() {
    return {
      isActive: this.isActive,
      endpointCount: this.config.endpoints.length,
      activePolling: this.intervals.size,
      pendingOptimisticUpdates: Array.from(this.optimisticUpdates.values())
        .filter(update => update.status === 'pending').length,
      subscriptionCount: Array.from(this.subscriptions.values())
        .reduce((total, subs) => total + subs.size, 0),
      config: this.config
    };
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private startPolling(): void {
    for (const endpoint of this.config.endpoints) {
      if (endpoint.enabled) {
        this.startPollingForEndpoint(endpoint);
      }
    }
  }

  private startPollingForEndpoint(endpoint: RealtimeEndpoint): void {
    // Clear existing interval
    const existingInterval = this.intervals.get(endpoint.id);
    if (existingInterval) {
      clearInterval(existingInterval);
    }
    
    // Start new interval
    const interval = setInterval(() => {
      this.fetchData(endpoint.id);
    }, endpoint.interval || this.config.pollingInterval);
    
    this.intervals.set(endpoint.id, interval);
    
    // Fetch immediately
    this.fetchData(endpoint.id);
  }

  private handleOptimisticTimeout(updateId: string): void {
    const update = this.optimisticUpdates.get(updateId);
    if (!update || update.status !== 'pending') return;
    
    update.status = 'failed';
    
    // Revert to original data if available
    if (update.originalData) {
      this.emit(`data:${update.type}`, {
        type: update.type,
        data: update.originalData,
        timestamp: new Date(),
        source: 'manual'
      } as RealtimeEvent);
    }
    
    this.emit('optimistic:timeout', {
      updateId,
      type: update.type,
      timestamp: new Date()
    });
    
    this.optimisticUpdates.delete(updateId);
  }

  private revertAllOptimisticUpdates(): void {
    for (const [updateId, update] of this.optimisticUpdates) {
      if (update.status === 'pending') {
        this.revertOptimisticUpdate(updateId);
      }
    }
  }

  private generateSubscriptionId(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateUpdateId(): string {
    return `opt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let realtimeServiceInstance: RealtimeService | null = null;

export function getRealtimeService(config?: Partial<RealtimeConfig>): RealtimeService {
  if (!realtimeServiceInstance) {
    realtimeServiceInstance = new RealtimeService(config);
  }
  return realtimeServiceInstance;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Initialize realtime service with default endpoints
 */
export function initializeRealtimeService(): RealtimeService {
  const service = getRealtimeService({
    pollingInterval: 45000, // 45 seconds
    optimisticTimeout: 3000, // 3 seconds
    enableOptimisticUpdates: true,
    enablePolling: true,
    endpoints: [
      {
        id: 'leaderboards',
        url: '/api/leaderboards/live',
        method: 'GET',
        interval: 30000, // 30 seconds
        priority: 'high',
        enabled: true,
        errorCount: 0
      },
      {
        id: 'dashboard-stats',
        url: '/api/dashboard/stats',
        method: 'GET',
        interval: 60000, // 60 seconds
        priority: 'medium',
        enabled: true,
        errorCount: 0
      },
      {
        id: 'user-activity',
        url: '/api/activity/recent',
        method: 'GET',
        interval: 45000, // 45 seconds
        priority: 'medium',
        enabled: true,
        errorCount: 0
      }
    ]
  });
  
  service.start();
  return service;
}

/**
 * Create a React hook for real-time data
 */
export function createRealtimeHook<T>(dataType: string) {
  return function useRealtimeData(
    initialData?: T,
    options?: SubscriptionOptions
  ): {
    data: T | undefined;
    loading: boolean;
    error: string | null;
    lastUpdated: Date | null;
    refresh: () => void;
  } {
    const [data, setData] = useState<T | undefined>(initialData);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    
    const service = getRealtimeService();
    
    useEffect(() => {
      setLoading(true);
      
      const unsubscribe = service.subscribe(
        dataType,
        (event: RealtimeEvent<T>) => {
          setData(event.data);
          setLastUpdated(event.timestamp);
          setError(null);
          setLoading(false);
        },
        options
      );
      
      // Listen for errors
      const errorHandler = (errorEvent: any) => {
        if (errorEvent.endpoint === dataType) {
          setError(errorEvent.error);
          setLoading(false);
        }
      };
      
      service.on('error', errorHandler);
      
      return () => {
        unsubscribe();
        service.off('error', errorHandler);
      };
    }, [dataType, service]);
    
    const refresh = useCallback(() => {
      setLoading(true);
      service.fetchData(dataType);
    }, [dataType, service]);
    
    return {
      data,
      loading,
      error,
      lastUpdated,
      refresh
    };
  };
}

// Import React hooks
import { useState, useEffect, useCallback } from 'react';