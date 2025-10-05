export interface Transaction {
  id: string;
  userId: string;
  type: 'earn' | 'spend';
  amount: number;
  description: string;
  category: string;
  timestamp: string;
  status: 'pending' | 'completed' | 'failed';
  metadata?: Record<string, any>;
}

export const mockTransactions: Transaction[] = [
  {
    id: 'tx1',
    userId: 'user123',
    type: 'earn',
    amount: 45,
    description: 'Carbon Footprint Quiz completion',
    category: 'game',
    timestamp: '2023-05-18T15:30:00Z',
    status: 'completed',
    metadata: {
      gameId: 'game1',
      score: 45
    }
  },
  {
    id: 'tx2',
    userId: 'user123',
    type: 'earn',
    amount: 25,
    description: 'Daily public transport usage',
    category: 'activity',
    timestamp: '2023-06-01T18:45:00Z',
    status: 'completed',
    metadata: {
      activityId: 'act1',
      distance: 8.5
    }
  },
  {
    id: 'tx3',
    userId: 'user123',
    type: 'earn',
    amount: 30,
    description: 'Recycling challenge completion',
    category: 'challenge',
    timestamp: '2023-06-05T14:20:00Z',
    status: 'completed',
    metadata: {
      challengeId: 'chl1',
      items: 15
    }
  },
  {
    id: 'tx4',
    userId: 'user123',
    type: 'spend',
    amount: 50,
    description: 'Eco-friendly product discount',
    category: 'reward',
    timestamp: '2023-06-10T11:15:00Z',
    status: 'completed',
    metadata: {
      rewardId: 'rwd1',
      merchant: 'Green Store'
    }
  },
  {
    id: 'tx5',
    userId: 'user123',
    type: 'earn',
    amount: 15,
    description: 'Water usage reduction',
    category: 'activity',
    timestamp: '2023-06-15T09:30:00Z',
    status: 'completed',
    metadata: {
      activityId: 'act2',
      reduction: 25
    }
  },
  {
    id: 'tx6',
    userId: 'user123',
    type: 'spend',
    amount: 75,
    description: 'Tree planting donation',
    category: 'donation',
    timestamp: '2023-06-20T16:45:00Z',
    status: 'completed',
    metadata: {
      donationId: 'don1',
      trees: 3
    }
  },
  {
    id: 'tx7',
    userId: 'user123',
    type: 'earn',
    amount: 20,
    description: 'Energy saving achievement',
    category: 'activity',
    timestamp: '2023-06-25T13:10:00Z',
    status: 'completed',
    metadata: {
      activityId: 'act3',
      reduction: 15
    }
  },
  {
    id: 'tx8',
    userId: 'user123',
    type: 'earn',
    amount: 35,
    description: 'Waste Sorting Challenge progress',
    category: 'game',
    timestamp: '2023-06-05T10:30:00Z',
    status: 'pending',
    metadata: {
      gameId: 'game2',
      score: 35
    }
  }
];