export interface Game {
  id: string;
  name: string;
  description: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  imageUrl?: string;
  timeEstimate: number; // in minutes
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GameProgress {
  id: string;
  userId: string;
  gameId: string;
  progress: number; // 0-100
  score: number;
  startedAt: string;
  completedAt?: string;
  metadata?: Record<string, any>;
}

export interface GameReward {
  id: string;
  gameId: string;
  name: string;
  description: string;
  requiredScore: number;
  healCoins: number;
  badgeUrl?: string;
}