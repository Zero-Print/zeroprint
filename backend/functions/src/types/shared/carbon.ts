/**
 * Shared Carbon Types
 * Used by both frontend and backend
 */

export type CarbonActionType = "transport" | "energy" | "waste" | "water";

export type TransportMode =
  | "walking"
  | "cycling"
  | "public_transport"
  | "car"
  | "flight";

export interface CarbonLog {
  logId: string;
  userId: string;
  activity: string;
  category: string;
  amount: number;
  unit: string;
  carbonFootprint: number;
  description?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface BackendCarbonLog extends CarbonLog {
  actionType?: CarbonActionType;
  value?: number;
  co2Saved?: number;
  coinsEarned?: number;
  timestamp?: string;
  verified?: boolean;
  verificationMethod?: "manual" | "automatic" | "third_party";
  metadata?: {
    transportMode?: TransportMode;
    energySource?: "solar" | "wind" | "grid" | "battery";
    wasteType?: "plastic" | "organic" | "electronic" | "paper";
    waterAction?: "rainwater_harvest" | "greywater_reuse" | "conservation";
    location?: {
      latitude: number;
      longitude: number;
      address?: string;
    };
    deviceId?: string;
    photos?: string[];
  };
}
