/**
 * ServiceInitializer - Initialize and manage all application services
 * Handles startup, shutdown, and coordination of real-time services
 */

import { initializeRealtimeService } from '@/lib/realtime/RealtimeService';
import { initializePrecomputeService } from '@/lib/leaderboards/PrecomputeService';

// ============================================================================
// INTERFACES
// ============================================================================

export interface ServiceConfig {
  enableRealtime?: boolean;
  enablePrecompute?: boolean;
  realtimeConfig?: {
    pollingInterval?: number;
    optimisticTimeout?: number;
    maxRetries?: number;
  };
  precomputeConfig?: {
    enabled?: boolean;
    batchSize?: number;
    maxConcurrent?: number;
    scheduleInterval?: number;
  };
}

export interface ServiceStatus {
  realtime: {
    active: boolean;
    lastStarted?: Date;
    error?: string;
  };
  precompute: {
    active: boolean;
    lastStarted?: Date;
    error?: string;
  };
}

// ============================================================================
// SERVICE INITIALIZER
// ============================================================================

class ServiceInitializer {
  private status: ServiceStatus = {
    realtime: { active: false },
    precompute: { active: false }
  };
  
  private config: ServiceConfig = {
    enableRealtime: true,
    enablePrecompute: true,
    realtimeConfig: {
      pollingInterval: 30000, // 30 seconds
      optimisticTimeout: 3000, // 3 seconds
      maxRetries: 3
    },
    precomputeConfig: {
      enabled: true,
      batchSize: 10,
      maxConcurrent: 3,
      scheduleInterval: 30 // 30 minutes
    }
  };

  /**
   * Initialize all services
   */
  async initialize(config?: Partial<ServiceConfig>): Promise<void> {
    this.config = { ...this.config, ...config };
    
    console.log('🚀 Initializing ZeroPrint services...');

    // Initialize real-time service
    if (this.config.enableRealtime) {
      try {
        const realtimeService = initializeRealtimeService();
        this.status.realtime = {
          active: true,
          lastStarted: new Date()
        };
        console.log('✅ Real-time service initialized');
      } catch (error) {
        this.status.realtime = {
          active: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
        console.error('❌ Failed to initialize real-time service:', error);
      }
    }

    // Initialize precompute service
    if (this.config.enablePrecompute) {
      try {
        initializePrecomputeService(this.config.precomputeConfig);
        this.status.precompute = {
          active: true,
          lastStarted: new Date()
        };
        console.log('✅ Precompute service initialized');
      } catch (error) {
        this.status.precompute = {
          active: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
        console.error('❌ Failed to initialize precompute service:', error);
      }
    }

    console.log('🎉 ZeroPrint services initialization complete');
  }

  /**
   * Get service status
   */
  getStatus(): ServiceStatus {
    return { ...this.status };
  }

  /**
   * Check if all services are healthy
   */
  isHealthy(): boolean {
    const realtimeHealthy = !this.config.enableRealtime || this.status.realtime.active;
    const precomputeHealthy = !this.config.enablePrecompute || this.status.precompute.active;
    
    return realtimeHealthy && precomputeHealthy;
  }

  /**
   * Restart a specific service
   */
  async restartService(serviceName: 'realtime' | 'precompute'): Promise<void> {
    console.log(`🔄 Restarting ${serviceName} service...`);
    
    try {
      if (serviceName === 'realtime' && this.config.enableRealtime) {
        const realtimeService = initializeRealtimeService();
        this.status.realtime = {
          active: true,
          lastStarted: new Date()
        };
      } else if (serviceName === 'precompute' && this.config.enablePrecompute) {
        initializePrecomputeService(this.config.precomputeConfig);
        this.status.precompute = {
          active: true,
          lastStarted: new Date()
        };
      }
      
      console.log(`✅ ${serviceName} service restarted successfully`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (serviceName === 'realtime') {
        this.status.realtime = { active: false, error: errorMessage };
      } else {
        this.status.precompute = { active: false, error: errorMessage };
      }
      
      console.error(`❌ Failed to restart ${serviceName} service:`, error);
      throw error;
    }
  }

  /**
   * Shutdown all services
   */
  async shutdown(): Promise<void> {
    console.log('🛑 Shutting down ZeroPrint services...');
    
    // Note: Individual services handle their own cleanup
    // This method is for coordination and logging
    
    this.status.realtime.active = false;
    this.status.precompute.active = false;
    
    console.log('✅ ZeroPrint services shutdown complete');
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let serviceInitializerInstance: ServiceInitializer | null = null;

export function getServiceInitializer(): ServiceInitializer {
  if (!serviceInitializerInstance) {
    serviceInitializerInstance = new ServiceInitializer();
  }
  return serviceInitializerInstance;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Initialize all services with default configuration
 */
export async function initializeServices(config?: Partial<ServiceConfig>): Promise<void> {
  const initializer = getServiceInitializer();
  await initializer.initialize(config);
}

/**
 * Get current service status
 */
export function getServiceStatus(): ServiceStatus {
  const initializer = getServiceInitializer();
  return initializer.getStatus();
}

/**
 * Check if services are healthy
 */
export function areServicesHealthy(): boolean {
  const initializer = getServiceInitializer();
  return initializer.isHealthy();
}

/**
 * React hook for service status
 */
export function useServiceStatus() {
  const [status, setStatus] = useState<ServiceStatus>(() => getServiceStatus());
  const [isHealthy, setIsHealthy] = useState<boolean>(() => areServicesHealthy());

  useEffect(() => {
    const checkStatus = () => {
      const newStatus = getServiceStatus();
      const newHealthy = areServicesHealthy();
      
      setStatus(newStatus);
      setIsHealthy(newHealthy);
    };

    // Check status every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const restartService = useCallback(async (serviceName: 'realtime' | 'precompute') => {
    const initializer = getServiceInitializer();
    await initializer.restartService(serviceName);
    
    // Update status after restart
    setStatus(getServiceStatus());
    setIsHealthy(areServicesHealthy());
  }, []);

  return {
    status,
    isHealthy,
    restartService
  };
}

// Import React hooks
import { useState, useEffect, useCallback } from 'react';