/**
 * Feature Flag System
 * Controls external provider integrations and feature toggles
 */

export interface FeatureFlag {
  name: string;
  enabled: boolean;
  description: string;
  modules: string[];
  conditions?: Record<string, any>;
}

// Default feature flags
const defaultFlags: FeatureFlag[] = [
  {
    name: 'notifications_email',
    enabled: true,
    description: 'Email notifications via SendGrid',
    modules: ['notifications'],
  },
  {
    name: 'notifications_sms',
    enabled: false,
    description: 'SMS notifications via Twilio',
    modules: ['notifications'],
  },
  {
    name: 'notifications_push',
    enabled: true,
    description: 'Push notifications via FCM',
    modules: ['notifications'],
  },
  {
    name: 'csr_partners',
    enabled: false,
    description: 'CSR partner integrations for rewards',
    modules: ['rewards', 'integrations'],
  },
  {
    name: 'geo_services',
    enabled: false,
    description: 'Geographic services for ward mapping',
    modules: ['dashboards', 'trackers'],
  },
  {
    name: 'advanced_analytics',
    enabled: true,
    description: 'Advanced analytics and reporting',
    modules: ['admin', 'dashboards'],
  },
  {
    name: 'fraud_detection',
    enabled: true,
    description: 'Fraud detection and prevention',
    modules: ['wallet', 'security'],
  },
  {
    name: 'dpdp_compliance',
    enabled: true,
    description: 'DPDP compliance features',
    modules: ['admin', 'security'],
  },
];

class FeatureFlagManager {
  private flags: Map<string, FeatureFlag> = new Map();

  constructor(initialFlags: FeatureFlag[] = defaultFlags) {
    initialFlags.forEach(flag => {
      this.flags.set(flag.name, flag);
    });
  }

  /**
   * Check if a feature flag is enabled
   */
  isEnabled(flagName: string, context?: Record<string, any>): boolean {
    const flag = this.flags.get(flagName);
    if (!flag) return false;

    // Check basic enabled status
    if (!flag.enabled) return false;

    // Check conditions if provided
    if (flag.conditions && context) {
      return this.evaluateConditions(flag.conditions, context);
    }

    return true;
  }

  /**
   * Get all flags for a specific module
   */
  getFlagsForModule(module: string): FeatureFlag[] {
    return Array.from(this.flags.values()).filter(flag => 
      flag.modules.includes(module)
    );
  }

  /**
   * Update a feature flag
   */
  updateFlag(flagName: string, updates: Partial<FeatureFlag>): void {
    const flag = this.flags.get(flagName);
    if (flag) {
      this.flags.set(flagName, { ...flag, ...updates });
    }
  }

  /**
   * Add a new feature flag
   */
  addFlag(flag: FeatureFlag): void {
    this.flags.set(flag.name, flag);
  }

  /**
   * Remove a feature flag
   */
  removeFlag(flagName: string): void {
    this.flags.delete(flagName);
  }

  /**
   * Get all feature flags
   */
  getAllFlags(): FeatureFlag[] {
    return Array.from(this.flags.values());
  }

  /**
   * Evaluate conditions for a feature flag
   */
  private evaluateConditions(conditions: Record<string, any>, context: Record<string, any>): boolean {
    for (const [key, expectedValue] of Object.entries(conditions)) {
      const actualValue = context[key];
      
      if (typeof expectedValue === 'object' && expectedValue !== null) {
        // Handle range conditions
        if (expectedValue.min !== undefined && actualValue < expectedValue.min) {
          return false;
        }
        if (expectedValue.max !== undefined && actualValue > expectedValue.max) {
          return false;
        }
      } else if (actualValue !== expectedValue) {
        return false;
      }
    }
    
    return true;
  }
}

// Create singleton instance
const featureFlags = new FeatureFlagManager();

export default featureFlags;

// Convenience functions
export const isFeatureEnabled = (flagName: string, context?: Record<string, any>): boolean => {
  return featureFlags.isEnabled(flagName, context);
};

export const getModuleFlags = (module: string): FeatureFlag[] => {
  return featureFlags.getFlagsForModule(module);
};

// Specific feature checks
export const isEmailNotificationsEnabled = (): boolean => {
  return isFeatureEnabled('notifications_email');
};

export const isSMSNotificationsEnabled = (): boolean => {
  return isFeatureEnabled('notifications_sms');
};

export const isPushNotificationsEnabled = (): boolean => {
  return isFeatureEnabled('notifications_push');
};

export const isCSRPartnersEnabled = (): boolean => {
  return isFeatureEnabled('csr_partners');
};

export const isGeoServicesEnabled = (): boolean => {
  return isFeatureEnabled('geo_services');
};

export const isAdvancedAnalyticsEnabled = (): boolean => {
  return isFeatureEnabled('advanced_analytics');
};

export const isFraudDetectionEnabled = (): boolean => {
  return isFeatureEnabled('fraud_detection');
};

export const isDPDPComplianceEnabled = (): boolean => {
  return isFeatureEnabled('dpdp_compliance');
};
