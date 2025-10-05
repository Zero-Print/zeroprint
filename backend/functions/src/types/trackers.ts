/**
 * ZeroPrint Tracker Types
 *
 * This file contains TypeScript interfaces for all tracking modules
 * including carbon footprint, mental health, animal welfare,
 * digital twin simulations, and MSME reporting.
 */

// ============================================================================
// CARBON FOOTPRINT TRACKING
// ============================================================================

export type CarbonActionType = "transport" | "energy" | "waste" | "water";

export interface CarbonLog {
  logId: string;
  userId: string;
  actionType: CarbonActionType;
  value: number; // km, kWh, kg, L
  co2Saved: number; // in kg CO2 equivalent
  coinsEarned: number;
  timestamp: string;
  createdAt: string;
  updatedAt?: string;
  verified: boolean;
  verificationMethod?: "manual" | "automatic" | "third_party";
  // Auditability and source attribution
  source?: "api" | "mock";
  isAuditable?: boolean;
  transportMode?: "walk" | "cycle" | "public_transport" | "electric_vehicle"; // Direct property for compatibility
  metadata?: {
    transportMode?: "walk" | "cycle" | "public_transport" | "electric_vehicle";
    energySource?: "solar" | "wind" | "grid" | "battery";
    wasteType?: "plastic" | "organic" | "electronic" | "paper";
    waterAction?: "rainwater_harvest" | "greywater_reuse" | "conservation";
    location?: {
      latitude: number;
      longitude: number;
      address?: string;
    };
    deviceId?: string;
    photos?: string[]; // URLs to verification photos
  };
}

export interface CarbonCategory {
  categoryId: string;
  name: string;
  actionType: CarbonLog["actionType"];
  unit: string; // "km", "kWh", "kg", "L"
  co2Factor: number; // CO2 saved per unit
  coinsFactor: number; // HealCoins earned per unit
  maxDailyValue: number;
  description: string;
  isActive: boolean;
  createdAt: string;
}

export interface CarbonLogFormData {
  actionType: CarbonLog["actionType"];
  value: number;
  metadata?: CarbonLog["metadata"];
}

// ============================================================================
// MENTAL HEALTH TRACKING
// ============================================================================

export interface MentalHealthLog {
  logId: string;
  userId: string;
  moodScore: number; // 1-10 scale
  stressLevel: number; // 1-10 scale
  sleepHours: number;
  exerciseMinutes: number;
  meditationMinutes: number;
  socialInteractions: number;
  notes?: string;
  timestamp: string;
  createdAt: string;
  updatedAt?: string;
  tags?: string[];
  triggers?: string[];
  copingStrategies?: string[];
  ecoScoreRef?: string;
}

export interface MentalHealthInsight {
  insightId: string;
  userId: string;
  type: "trend" | "recommendation" | "alert" | "achievement";
  title: string;
  description: string;
  severity: "low" | "medium" | "high";
  actionable: boolean;
  recommendations?: string[];
  createdAt: string;
  expiresAt?: string;
  acknowledged: boolean;
}

// ============================================================================
// ANIMAL WELFARE TRACKING
// ============================================================================

export type AnimalWelfareActionType = "feeding" | "shelter" | "medical" | "rescue" | "adoption" | "awareness";

export interface AnimalWelfareLog {
  logId: string;
  userId: string;
  actionType: AnimalWelfareActionType;
  animalType: string; // e.g., "dog", "cat", "bird", etc.
  count: number; // number of animals helped
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  description?: string;
  impact: number; // calculated impact score
  coinsEarned: number;
  verified: boolean;
  verificationMethod?: "manual" | "automatic" | "third_party";
  photos?: string[]; // URLs to verification photos
  timestamp: string;
  createdAt: string;
  updatedAt?: string;
  metadata?: Record<string, any>;
}

// ============================================================================
// DIGITAL TWIN SIMULATIONS
// ============================================================================

export type SimulationType = "urban" | "building" | "industrial" | "agricultural" | "water";

export interface DigitalTwinSimulation {
  simulationId: string;
  userId: string;
  entityId?: string; // organization or government entity
  simulationType: SimulationType;
  name: string;
  description?: string;
  parameters: Record<string, any>; // simulation parameters
  results: {
    carbonReduction: number;
    energySavings: number;
    waterSavings: number;
    costSavings: number;
    otherMetrics?: Record<string, number>;
  };
  status: "pending" | "running" | "completed" | "failed";
  startTime?: string;
  endTime?: string;
  createdAt: string;
  updatedAt?: string;
  sharedWith?: string[]; // user IDs with access
  visualizationUrl?: string; // URL to visualization
  metadata?: Record<string, any>;
}

// ============================================================================
// MSME REPORTING
// ============================================================================

export type MSMEReportType = "sustainability" | "carbon" | "energy" | "water" | "waste" | "social";

export interface MSMEReport {
  reportId: string;
  userId: string;
  orgId: string;
  reportType: MSMEReportType;
  reportingPeriod: {
    startDate: string;
    endDate: string;
  };
  metrics: {
    carbonFootprint?: number;
    energyConsumption?: number;
    waterUsage?: number;
    wasteGenerated?: number;
    recyclingRate?: number;
    renewableEnergyPercentage?: number;
    sustainabilityScore?: number;
    socialImpactScore?: number;
    otherMetrics?: Record<string, number>;
  };
  goals: {
    carbonReduction?: number;
    energyEfficiency?: number;
    waterConservation?: number;
    wasteReduction?: number;
    otherGoals?: Record<string, number>;
  };
  initiatives: Array<{
    name: string;
    description: string;
    status: "planned" | "in_progress" | "completed";
    impact?: Record<string, number>;
  }>;
  certifications?: string[];
  status: "draft" | "submitted" | "approved" | "rejected";
  submittedAt?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt?: string;
  metadata?: Record<string, any>;
}
