// Utility to clear potentially corrupted localStorage data that might cause ZodError

export function clearInvalidLocalStorageData() {
  if (typeof window === 'undefined') return;

  try {
    // List of keys that might contain corrupted data
    const keysToCheck = [
      'zeroprint_user',
      'zeroprint_profile',
      'user_preferences',
      'dashboard_stats',
      'wallet_data',
      'tracker_data'
    ];

    keysToCheck.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        try {
          const parsed = JSON.parse(value);
          // Basic validation - check if it's a valid object
          if (!parsed || typeof parsed !== 'object') {
            console.warn(`Removing invalid data for key: ${key}`);
            localStorage.removeItem(key);
          }
        } catch (error) {
          console.warn(`Removing corrupted data for key: ${key}`, error);
          localStorage.removeItem(key);
        }
      }
    });
  } catch (error) {
    console.error('Error clearing invalid localStorage data:', error);
  }
}

// Clear invalid data on module load
if (typeof window !== 'undefined') {
  clearInvalidLocalStorageData();
}
