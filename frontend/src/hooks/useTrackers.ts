/**
 * useTrackers Hook
 * Manages tracker state and provides tracker operations
 */

import { useState, useCallback } from 'react';
import api from '@/lib/apiClient';
import { ApiError } from '@/lib/apiClient';
import { 
  CarbonLog, 
  MentalHealthLog, 
  AnimalWelfareLog, 
  DigitalTwinSimulation, 
  MSMEReport 
} from '@/types';

export interface TrackerState {
  loading: boolean;
  error: string | null;
}

export interface CarbonLogData {
  actionType: 'transport' | 'energy' | 'waste' | 'water' | 'food';
  value: number;
  details?: {
    transportMode?: string;
    distance?: number;
    location?: string;
    wardId?: string;
  };
}

export interface MoodLogData {
  mood: 'excellent' | 'good' | 'neutral' | 'poor' | 'terrible';
  note?: string;
}

export interface AnimalLogData {
  actions: Array<{
    type: 'rescue' | 'adoption' | 'volunteer' | 'donation' | 'education';
    description: string;
    impact: number;
  }>;
}

export interface DigitalTwinData {
  inputConfig: {
    scenario: string;
    variables: Record<string, any>;
    objectives: string[];
    constraints?: string[];
  };
}

export interface MSMEReportData {
  orgId: string;
  monthData: {
    month: string;
    year: number;
    data: {
      environmental: {
        energyUsage: number;
        wasteReduction: number;
        waterConservation: number;
        renewableEnergy: number;
      };
      social: {
        employeeWellness: number;
        communityEngagement: number;
        diversity: number;
        safety: number;
      };
      governance: {
        transparency: number;
        ethics: number;
        compliance: number;
        innovation: number;
      };
    };
  };
}

export function useTrackers() {
  const [state, setState] = useState<TrackerState>({
    loading: false,
    error: null,
  });

  // Log carbon action
  const logCarbon = useCallback(async (data: CarbonLogData) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const response = await api.trackers.logCarbon(data);
      if (!response.success) {
        throw new ApiError(response.error || 'Failed to log carbon action');
      }

      setState(prev => ({ ...prev, loading: false, error: null }));
      return { success: true, log: response.data };
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Failed to log carbon action';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, []);

  // Log mood
  const logMood = useCallback(async (data: MoodLogData) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const response = await api.trackers.logMood(data);
      if (!response.success) {
        throw new ApiError(response.error || 'Failed to log mood');
      }

      setState(prev => ({ ...prev, loading: false, error: null }));
      return { success: true, log: response.data };
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Failed to log mood';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, []);

  // Log animal actions
  const logAnimal = useCallback(async (data: AnimalLogData) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const response = await api.trackers.logAnimal(data);
      if (!response.success) {
        throw new ApiError(response.error || 'Failed to log animal actions');
      }

      setState(prev => ({ ...prev, loading: false, error: null }));
      return { success: true, log: response.data };
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Failed to log animal actions';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, []);

  // Run digital twin simulation
  const runDigitalTwin = useCallback(async (data: DigitalTwinData) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const response = await api.trackers.runDigitalTwin(data);
      if (!response.success) {
        throw new ApiError(response.error || 'Failed to run digital twin simulation');
      }

      setState(prev => ({ ...prev, loading: false, error: null }));
      return { success: true, simulation: response.data };
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Failed to run digital twin simulation';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, []);

  // Generate MSME report
  const generateMSMEReport = useCallback(async (data: MSMEReportData) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const response = await api.trackers.generateMSMEReport(data);
      if (!response.success) {
        throw new ApiError(response.error || 'Failed to generate MSME report');
      }

      setState(prev => ({ ...prev, loading: false, error: null }));
      return { success: true, report: response.data };
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Failed to generate MSME report';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    // State
    loading: state.loading,
    error: state.error,
    
    // Actions
    logCarbon,
    logMood,
    logAnimal,
    runDigitalTwin,
    generateMSMEReport,
    clearError,
  };
}
