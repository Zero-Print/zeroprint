import { useState, useCallback } from 'react';

/**
 * A hook for handling optimistic UI updates
 * 
 * @param initialData The initial data state
 * @param updateFn The function to call to update the data on the server
 * @returns An object with the optimistic data, update function, and loading state
 */
export function useOptimisticUpdate<T>(initialData: T, updateFn: (data: T) => Promise<void>) {
  const [data, setData] = useState<T>(initialData);
  const [optimisticData, setOptimisticData] = useState<T>(initialData);
  const [isUpdating, setIsUpdating] = useState(false);
  const [hasOptimisticChanges, setHasOptimisticChanges] = useState(false);

  const update = useCallback(async (newData: T) => {
    try {
      setIsUpdating(true);
      setOptimisticData(newData);
      setHasOptimisticChanges(true);
      
      // Perform the actual update
      await updateFn(newData);
      
      // If successful, commit the optimistic changes
      setData(newData);
      setHasOptimisticChanges(false);
    } catch (error) {
      // If failed, revert to original data
      setOptimisticData(data);
      setHasOptimisticChanges(false);
      console.error('Optimistic update failed:', error);
    } finally {
      setIsUpdating(false);
    }
  }, [data, updateFn]);

  return {
    data,
    optimisticData,
    update,
    isUpdating,
    hasOptimisticChanges
  };
}