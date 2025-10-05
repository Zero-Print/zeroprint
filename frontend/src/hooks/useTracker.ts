'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/modules/auth';

export type TrackerType = 'carbon' | 'water' | 'energy' | 'waste';

export interface TrackerEntry {
  id: string;
  userId: string;
  type: TrackerType;
  value: number;
  unit: string;
  category: string;
  description: string;
  timestamp: string;
  location?: string;
  metadata?: Record<string, any>;
}

export interface TrackerSummary {
  type: TrackerType;
  totalEntries: number;
  totalValue: number;
  averageValue: number;
  unit: string;
  lastUpdated: string;
}

export function useTracker(type: TrackerType) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<TrackerEntry[]>([]);
  const [summary, setSummary] = useState<TrackerSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset state when user changes or is null
    setEntries([]);
    setSummary(null);
    setError(null);
    
    if (!user) {
      setLoading(false);
      return;
    }
    
    const fetchTrackerData = async () => {
      try {
        setLoading(true);
        // Mock data until backend is implemented
        const mockEntries: TrackerEntry[] = [
          {
            id: '1',
            userId: user.userId,
            type,
            value: 2.5,
            unit: type === 'carbon' ? 'kg' : type === 'water' ? 'liters' : type === 'energy' ? 'kWh' : 'kg',
            category: 'transportation',
            description: 'Daily commute',
            timestamp: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            id: '2',
            userId: user.userId,
            type,
            value: 1.2,
            unit: type === 'carbon' ? 'kg' : type === 'water' ? 'liters' : type === 'energy' ? 'kWh' : 'kg',
            category: 'food',
            description: 'Vegetarian meal',
            timestamp: new Date(Date.now() - 172800000).toISOString(),
          },
          {
            id: '3',
            userId: user.userId,
            type,
            value: 3.7,
            unit: type === 'carbon' ? 'kg' : type === 'water' ? 'liters' : type === 'energy' ? 'kWh' : 'kg',
            category: 'household',
            description: 'Electricity usage',
            timestamp: new Date(Date.now() - 259200000).toISOString(),
          }
        ];
        
        setEntries(mockEntries);
        
        // Calculate summary
        const totalValue = mockEntries.reduce((sum, entry) => sum + entry.value, 0);
        const mockSummary: TrackerSummary = {
          type,
          totalEntries: mockEntries.length,
          totalValue,
          averageValue: totalValue / mockEntries.length,
          unit: mockEntries[0]?.unit || '',
          lastUpdated: new Date().toISOString()
        };
        
        setSummary(mockSummary);
      } catch (err) {
        setError(`Failed to load ${type} tracker data`);
        console.error(`Error loading ${type} tracker data:`, err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrackerData();
  }, [user, type]);

  const addEntry = async (entryData: Omit<TrackerEntry, 'id' | 'userId' | 'type' | 'timestamp'>) => {
    if (!user) return null;
    
    try {
      const newEntry: TrackerEntry = {
        id: `temp-${Date.now()}`,
        userId: user.userId,
        type,
        timestamp: new Date().toISOString(),
        ...entryData
      };
      
      const updatedEntries = [newEntry, ...entries];
      setEntries(updatedEntries);
      
      // Update summary
      if (summary) {
        const totalValue = updatedEntries.reduce((sum, entry) => sum + entry.value, 0);
        setSummary({
          ...summary,
          totalEntries: updatedEntries.length,
          totalValue,
          averageValue: totalValue / updatedEntries.length,
          lastUpdated: new Date().toISOString()
        });
      }
      
      return newEntry;
    } catch (err) {
      setError(`Failed to add ${type} tracker entry`);
      console.error(`Error adding ${type} tracker entry:`, err);
      return null;
    }
  };

  const updateEntry = async (entryId: string, updates: Partial<Omit<TrackerEntry, 'id' | 'userId' | 'type'>>) => {
    if (!user) return false;
    
    try {
      const updatedEntries = entries.map(entry => 
        entry.id === entryId ? { ...entry, ...updates } : entry
      );
      
      setEntries(updatedEntries);
      
      // Update summary
      if (summary) {
        const totalValue = updatedEntries.reduce((sum, entry) => sum + entry.value, 0);
        setSummary({
          ...summary,
          totalValue,
          averageValue: totalValue / updatedEntries.length,
          lastUpdated: new Date().toISOString()
        });
      }
      
      return true;
    } catch (err) {
      setError(`Failed to update ${type} tracker entry`);
      console.error(`Error updating ${type} tracker entry:`, err);
      return false;
    }
  };

  const deleteEntry = async (entryId: string) => {
    if (!user) return false;
    
    try {
      const updatedEntries = entries.filter(entry => entry.id !== entryId);
      setEntries(updatedEntries);
      
      // Update summary
      if (summary && updatedEntries.length > 0) {
        const totalValue = updatedEntries.reduce((sum, entry) => sum + entry.value, 0);
        setSummary({
          ...summary,
          totalEntries: updatedEntries.length,
          totalValue,
          averageValue: totalValue / updatedEntries.length,
          lastUpdated: new Date().toISOString()
        });
      } else if (summary) {
        // No entries left
        setSummary({
          ...summary,
          totalEntries: 0,
          totalValue: 0,
          averageValue: 0,
          lastUpdated: new Date().toISOString()
        });
      }
      
      return true;
    } catch (err) {
      setError(`Failed to delete ${type} tracker entry`);
      console.error(`Error deleting ${type} tracker entry:`, err);
      return false;
    }
  };

  return {
    entries,
    summary,
    loading,
    error,
    addEntry,
    updateEntry,
    deleteEntry
  };
}