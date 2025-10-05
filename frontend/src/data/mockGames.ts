import { Game, GameProgress } from '@/modules/games/types';

export const mockGames: Game[] = [
  {
    id: 'game1',
    title: 'Carbon Footprint Quiz',
    description: 'Test your knowledge about carbon footprints and learn how to reduce yours.',
    type: 'quiz',
    category: 'carbon',
    difficulty: 'easy',
    coins: 50,
    maxScore: 100,
    estimatedTime: 10,
    isActive: true,
    createdAt: '2023-05-15T10:00:00Z',
    updatedAt: '2023-05-15T10:00:00Z',
  },
  {
    id: 'game2',
    title: 'Waste Sorting Challenge',
    description: 'Sort different types of waste correctly to earn points and learn about recycling.',
    type: 'dragdrop',
    category: 'waste',
    difficulty: 'medium',
    coins: 75,
    maxScore: 150,
    estimatedTime: 15,
    isActive: true,
    createdAt: '2023-05-20T14:30:00Z',
    updatedAt: '2023-05-20T14:30:00Z',
  },
  {
    id: 'game3',
    title: 'Energy Saver Simulation',
    description: 'Manage a virtual home and make decisions to reduce energy consumption.',
    type: 'simulation',
    category: 'energy',
    difficulty: 'hard',
    coins: 100,
    maxScore: 200,
    estimatedTime: 20,
    isActive: true,
    createdAt: '2023-06-01T09:15:00Z',
    updatedAt: '2023-06-01T09:15:00Z',
  },
  {
    id: 'game4',
    title: 'Water Conservation Adventure',
    description: 'Embark on an adventure to learn about water conservation techniques.',
    type: 'quiz',
    category: 'water',
    difficulty: 'medium',
    coins: 80,
    maxScore: 160,
    estimatedTime: 12,
    isActive: true,
    createdAt: '2023-06-10T11:45:00Z',
    updatedAt: '2023-06-10T11:45:00Z',
  },
  {
    id: 'game5',
    title: 'Sustainable City Builder',
    description: 'Build a sustainable city while balancing resources and environmental impact.',
    type: 'simulation',
    category: 'city',
    difficulty: 'hard',
    coins: 120,
    maxScore: 240,
    estimatedTime: 25,
    isActive: false,
    createdAt: '2023-06-15T16:20:00Z',
    updatedAt: '2023-06-15T16:20:00Z',
  }
];

export const mockGameProgress: Record<string, GameProgress> = {
  'game1': {
    id: 'progress1',
    gameId: 'game1',
    userId: 'user123',
    progress: 90,
    score: 45,
    startedAt: '2023-05-18T15:10:00Z',
    completedAt: '2023-05-18T15:30:00Z',
    metadata: {
      maxScore: 50,
      rewards: [
        {
          id: 'reward1',
          type: 'points',
          amount: 45,
          description: 'Quiz completion points',
          awardedAt: '2023-05-18T15:30:00Z'
        },
        {
          id: 'reward2',
          type: 'badge',
          badgeId: 'carbon_expert',
          description: 'Carbon Expert Badge',
          awardedAt: '2023-05-18T15:30:00Z'
        }
      ]
    }
  },
  'game2': {
    id: 'progress2',
    gameId: 'game2',
    userId: 'user123',
    progress: 35,
    score: 35,
    startedAt: '2023-06-05T10:20:00Z',
    metadata: {
      maxScore: 75,
      rewards: []
    }
  },
  'game3': {
    id: 'progress3',
    gameId: 'game3',
    userId: 'user123',
    progress: 0,
    score: 0,
    startedAt: '2023-06-10T14:00:00Z',
    metadata: {
      maxScore: 100,
      rewards: []
    }
  },
  'game4': {
    id: 'progress4',
    gameId: 'game4',
    userId: 'user123',
    progress: 0,
    score: 0,
    startedAt: '2023-06-12T11:30:00Z',
    metadata: {
      maxScore: 80,
      rewards: []
    }
  }
};