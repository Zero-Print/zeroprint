export interface TrackerEntry {
  id: string;
  userId: string;
  type: 'carbon' | 'water' | 'energy' | 'waste';
  value: number;
  unit: string;
  date: string;
  source: 'manual' | 'automatic' | 'imported';
  notes?: string;
  metadata?: Record<string, any>;
}

export const mockTrackerEntries: TrackerEntry[] = [
  // Carbon tracker entries
  {
    id: 'carbon1',
    userId: 'user123',
    type: 'carbon',
    value: 5.2,
    unit: 'kg',
    date: '2023-06-01T00:00:00Z',
    source: 'manual',
    notes: 'Daily commute by car'
  },
  {
    id: 'carbon2',
    userId: 'user123',
    type: 'carbon',
    value: 2.8,
    unit: 'kg',
    date: '2023-06-02T00:00:00Z',
    source: 'manual',
    notes: 'Used public transport instead of car'
  },
  {
    id: 'carbon3',
    userId: 'user123',
    type: 'carbon',
    value: 3.1,
    unit: 'kg',
    date: '2023-06-03T00:00:00Z',
    source: 'manual',
    notes: 'Mixed transportation'
  },
  {
    id: 'carbon4',
    userId: 'user123',
    type: 'carbon',
    value: 1.5,
    unit: 'kg',
    date: '2023-06-04T00:00:00Z',
    source: 'manual',
    notes: 'Worked from home'
  },
  {
    id: 'carbon5',
    userId: 'user123',
    type: 'carbon',
    value: 4.7,
    unit: 'kg',
    date: '2023-06-05T00:00:00Z',
    source: 'manual',
    notes: 'Long drive for meeting'
  },
  
  // Water tracker entries
  {
    id: 'water1',
    userId: 'user123',
    type: 'water',
    value: 120,
    unit: 'liters',
    date: '2023-06-01T00:00:00Z',
    source: 'manual',
    notes: 'Regular usage'
  },
  {
    id: 'water2',
    userId: 'user123',
    type: 'water',
    value: 95,
    unit: 'liters',
    date: '2023-06-02T00:00:00Z',
    source: 'manual',
    notes: 'Shorter showers'
  },
  {
    id: 'water3',
    userId: 'user123',
    type: 'water',
    value: 105,
    unit: 'liters',
    date: '2023-06-03T00:00:00Z',
    source: 'manual',
    notes: 'Regular usage'
  },
  {
    id: 'water4',
    userId: 'user123',
    type: 'water',
    value: 90,
    unit: 'liters',
    date: '2023-06-04T00:00:00Z',
    source: 'manual',
    notes: 'Used water-saving techniques'
  },
  {
    id: 'water5',
    userId: 'user123',
    type: 'water',
    value: 110,
    unit: 'liters',
    date: '2023-06-05T00:00:00Z',
    source: 'manual',
    notes: 'Regular usage'
  },
  
  // Energy tracker entries
  {
    id: 'energy1',
    userId: 'user123',
    type: 'energy',
    value: 8.5,
    unit: 'kWh',
    date: '2023-06-01T00:00:00Z',
    source: 'automatic',
    notes: 'Regular usage',
    metadata: {
      source: 'smart_meter'
    }
  },
  {
    id: 'energy2',
    userId: 'user123',
    type: 'energy',
    value: 7.2,
    unit: 'kWh',
    date: '2023-06-02T00:00:00Z',
    source: 'automatic',
    notes: 'Reduced AC usage',
    metadata: {
      source: 'smart_meter'
    }
  },
  {
    id: 'energy3',
    userId: 'user123',
    type: 'energy',
    value: 7.8,
    unit: 'kWh',
    date: '2023-06-03T00:00:00Z',
    source: 'automatic',
    notes: 'Regular usage',
    metadata: {
      source: 'smart_meter'
    }
  },
  {
    id: 'energy4',
    userId: 'user123',
    type: 'energy',
    value: 6.9,
    unit: 'kWh',
    date: '2023-06-04T00:00:00Z',
    source: 'automatic',
    notes: 'Used energy-efficient appliances',
    metadata: {
      source: 'smart_meter'
    }
  },
  {
    id: 'energy5',
    userId: 'user123',
    type: 'energy',
    value: 8.1,
    unit: 'kWh',
    date: '2023-06-05T00:00:00Z',
    source: 'automatic',
    notes: 'Regular usage',
    metadata: {
      source: 'smart_meter'
    }
  },
  
  // Waste tracker entries
  {
    id: 'waste1',
    userId: 'user123',
    type: 'waste',
    value: 1.2,
    unit: 'kg',
    date: '2023-06-01T00:00:00Z',
    source: 'manual',
    notes: 'Regular waste'
  },
  {
    id: 'waste2',
    userId: 'user123',
    type: 'waste',
    value: 0.8,
    unit: 'kg',
    date: '2023-06-02T00:00:00Z',
    source: 'manual',
    notes: 'Reduced packaging'
  },
  {
    id: 'waste3',
    userId: 'user123',
    type: 'waste',
    value: 1.0,
    unit: 'kg',
    date: '2023-06-03T00:00:00Z',
    source: 'manual',
    notes: 'Regular waste'
  },
  {
    id: 'waste4',
    userId: 'user123',
    type: 'waste',
    value: 0.7,
    unit: 'kg',
    date: '2023-06-04T00:00:00Z',
    source: 'manual',
    notes: 'Composted food waste'
  },
  {
    id: 'waste5',
    userId: 'user123',
    type: 'waste',
    value: 0.9,
    unit: 'kg',
    date: '2023-06-05T00:00:00Z',
    source: 'manual',
    notes: 'Regular waste'
  }
];