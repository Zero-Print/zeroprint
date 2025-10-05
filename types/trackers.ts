export interface CarbonLog {
  logId: string;
  userId: string;
  actionType: 'transport' | 'energy' | 'waste' | 'water';
  value: number; // km, kWh, kg, L
  co2Saved: number;
  coinsEarned: number;
  timestamp: string;
}

export interface MentalHealthLog {
  logId: string;
  userId: string;
  mood: number; // 1–5
  note?: string;
  ecoMindScore: number;
  timestamp: string;
}

export interface AnimalWelfareLog {
  logId: string;
  userId: string;
  actions: string[]; // ["fedStray", "crueltyFree", "noPlastic"]
  kindnessScore: number;
  coinsEarned: number;
  timestamp: string;
}

export interface DigitalTwinSimulation {
  simId: string;
  userId: string;
  inputConfig: Record<string, any>;
  results: {
    co2Saved: number;
    energySaved: number;
    comparison: any;
  };
  createdAt: string;
}

export interface MSMEReport {
  reportId: string;
  orgId: string;
  month: string;
  energyUsage: number;
  wasteGenerated: number;
  transportFuel: number;
  sustainabilityScore: number;
  reportUrl: string; // link to generated PDF
  createdAt: string;
}


