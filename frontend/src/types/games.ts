// Base Game Engine Types for ZeroPrint Sustainability Games
// Supports Quiz, Drag-Drop Sorter, and Simulation/Calculator engines

export type GameEngineType = 'quiz' | 'dragdrop' | 'simulation';
export type GameCategory = 'solar' | 'city' | 'waste' | 'energy' | 'housing' | 'oil' | 'transport';
export type GameDifficulty = 'easy' | 'medium' | 'hard';

// Main Game type
export type Game = BaseGameConfig;

// Base Game Configuration
export interface BaseGameConfig {
  id: string;
  title: string;
  description: string;
  type: GameEngineType;
  category: GameCategory;
  difficulty: GameDifficulty;
  coins: number;
  maxScore: number;
  estimatedTime: number; // in minutes
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  rewards?: any[]; // Game rewards
}

// Quiz Engine Types
export interface QuizQuestion {
  id: string;
  question: string;
  type: 'single' | 'multiple';
  options: QuizOption[];
  answers: QuizAnswer[]; // Alias for options
  correctAnswers: string[]; // option IDs
  correctAnswerExplanation?: string; // Alias for explanation
  explanation?: string;
  timeLimit?: number; // seconds per question
  coinsPerCorrect: number;
  points?: number; // Alias for coinsPerCorrect
  category?: string; // Question category
  difficulty?: 'easy' | 'medium' | 'hard'; // Question difficulty
  image?: string; // Alias for media.url
  media?: {
    type: 'image' | 'video';
    url: string;
    alt?: string;
  };
}

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizConfig {
  questions: QuizQuestion[];
  timeLimit?: number; // overall time limit in seconds
  randomizeQuestions?: boolean;
  randomizeOptions?: boolean;
  showExplanations?: boolean;
  passingScore?: number; // percentage
}

export interface QuizGameConfig extends BaseGameConfig {
  type: 'quiz';
  config: QuizConfig;
}

// Drag-Drop Engine Types
export interface DragDropItem {
  id: string;
  content: string;
  image?: string;
  category?: string;
  type?: string;
  position: { x: number; y: number };
  currentPosition: { x: number; y: number }; // Alias for position
  correctPosition: { x: number; y: number };
  isPlaced: boolean;
  isInCorrectPosition: boolean; // Computed property
  icon?: string;
  label?: string;
  metadata?: Record<string, any>;
}

export interface DragDropTarget {
  id: string;
  label: string;
  image?: string;
  position: { x: number; y: number };
  acceptedCategories?: string[];
  maxItems?: number;
  isOccupied: boolean;
  assignedItemId?: string;
  category?: string;
  type?: string;
  icon?: string;
}

export interface DragDropMapping {
  itemId: string;
  targetId: string;
  isCorrect: boolean;
  points: number;
}

export interface DragDropConfig {
  items: DragDropItem[];
  targets: DragDropTarget[];
  correctMappings: DragDropMapping[];
  categories: string[];
  gameMode: 'sorting' | 'matching' | 'puzzle';
  allowMultipleAttempts?: boolean;
  showFeedback?: boolean;
  timeLimit?: number;
}

export interface DragDropGameConfig extends BaseGameConfig {
  type: 'dragdrop';
  config: DragDropConfig;
  dragDropConfig: DragDropConfig; // Alias for config
}

// Simulation Engine Types
export interface SimulationInput {
  id: string;
  label: string;
  type: 'slider' | 'toggle' | 'text' | 'select';
  defaultValue: number | string | boolean;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  options?: { value: string | number; label: string }[];
  description?: string;
}

export interface SimulationFormula {
  id: string;
  name: string;
  formula: string; // JavaScript expression
  unit: string;
  description?: string;
}

export interface SimulationOutput {
  id: string;
  label: string;
  type: 'number' | 'chart' | 'text' | 'progress';
  formulaId: string;
  format?: 'currency' | 'percentage' | 'decimal';
  chartType?: 'bar' | 'line' | 'pie' | 'doughnut';
  color?: string;
  unit?: string;
}

export interface Objective {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  validation: {
    min?: number;
    max?: number;
    step?: number;
  };
  isCompleted: boolean;
  points: number;
}

export interface SimulationConfig {
  inputs: SimulationInput[];
  formulas: SimulationFormula[];
  outputs: SimulationOutput[];
  objectives?: Objective[];
  completionCriteria?: {
    minInputsUsed?: number;
    targetValues?: Record<string, number>;
  };
  timeLimit?: number;
}

export interface SimulationGameConfig extends BaseGameConfig {
  type: 'simulation';
  config: SimulationConfig;
  simulationConfig: SimulationConfig; // Alias for config
}

export interface MemoryGameConfig extends Omit<BaseGameConfig, 'type'> {
  type: 'memory';
  config: MemoryConfig;
  memoryConfig: MemoryConfig; // Alias for config
}

export interface PuzzleGameConfig extends Omit<BaseGameConfig, 'type'> {
  type: 'puzzle';
  config: PuzzleConfig;
  puzzleConfig: PuzzleConfig; // Alias for config
}

// Union type for all game configs
export type GameConfig = QuizGameConfig | DragDropGameConfig | SimulationGameConfig | MemoryGameConfig | PuzzleGameConfig;

// Game State Interfaces
export interface MemoryGameState {
  gameId: string;
  userId: string;
  cards: MemoryCard[];
  flippedCards: string[];
  matchedPairs: string[];
  matchedCards: string[]; // Alias for matchedPairs
  moves: number;
  score: number;
  isComplete: boolean;
  currentRound: number;
  maxRounds: number;
  timeRemaining?: number;
  timeBonus?: number;
  currentStep?: number;
}

export interface PuzzleGameState {
  gameId: string;
  userId: string;
  pieces: PuzzlePiece[];
  emptyPosition: { row: number; col: number };
  moves: number;
  isComplete: boolean;
  gridSize: number;
  puzzleType: 'jigsaw' | 'sliding';
  showFeedback: boolean;
  feedbackMessage: string;
  selectedPiece: string | null;
  currentStep?: number;
}

export interface DragDropGameState {
  gameId: string;
  userId: string;
  items: DragDropItem[];
  targets: DragDropTarget[];
  correctMappings: DragDropMapping[];
  score: number;
  isComplete: boolean;
  feedback: Record<string, { isCorrect: boolean; message: string }>;
  completedPairs: number;
  canSubmit: boolean;
  currentStep?: number;
}

export interface QuizGameState {
  gameId: string;
  userId: string;
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  currentQuestion: number; // Alias for currentQuestionIndex
  answers: Record<string, { submittedAnswer: string | string[]; isCorrect: boolean }>;
  score: number;
  isComplete: boolean;
  timeRemaining?: number;
  currentStep?: number;
}

export interface DragDropMapping {
  itemId: string;
  targetId: string;
  points: number;
}

// Game State Management
export interface GameState {
  gameId: string;
  userId: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'abandoned';
  score: number;
  maxScore: number;
  coinsEarned: number;
  startedAt?: string;
  completedAt?: string;
  currentStep?: number;
  totalSteps: number;
  answers?: Record<string, any>;
  timeRemaining?: number;
  attempts: number;
}

// Game Results
export interface GameResult {
  gameId: string;
  userId: string;
  score: number;
  maxScore: number;
  percentage: number;
  coinsEarned: number;
  completionTime: number; // in seconds
  attempts: number;
  answers: Record<string, any>;
  feedback?: string;
  achievements?: string[];
}

// Game Events
export type GameEvent = 
  | { type: 'GAME_STARTED'; payload: { gameId: string; userId: string } }
  | { type: 'ANSWER_SUBMITTED'; payload: { questionId: string; answer: any; isCorrect: boolean } }
  | { type: 'ITEM_DROPPED'; payload: { itemId: string; targetId: string; isCorrect: boolean } }
  | { type: 'INPUT_CHANGED'; payload: { inputId: string; value: any } }
  | { type: 'GAME_COMPLETED'; payload: GameResult }
  | { type: 'GAME_ABANDONED'; payload: { gameId: string; reason?: string } }
  | { type: 'TIMER_TICK'; payload: { timeRemaining: number } }
  | { type: 'TIMER_EXPIRED'; payload: { gameId: string } };

// Game Engine Interface
export interface GameEngine<T extends GameConfig = GameConfig> {
  config: T;
  state: GameState;
  
  // Core methods
  initialize(config: T, userId: string): void;
  start(): void;
  processEvent(event: GameEvent): void;
  calculateScore(): number;
  complete(): GameResult;
  abandon(reason?: string): void;
  
  // State management
  getState(): GameState;
  updateState(updates: Partial<GameState>): void;
  
  // Validation
  validateAnswer(questionId: string, answer: any): boolean;
  validateDrop(itemId: string, targetId: string): boolean;
  validateInput(inputId: string, value: any): boolean;
}

// Leaderboard Types
export interface LeaderboardEntry {
  userId: string;
  userName: string;
  score: number;
  coinsEarned: number;
  gamesCompleted: number;
  rank: number;
  avatar?: string;
}

export interface Leaderboard {
  scope: 'global' | 'category' | 'game' | 'weekly' | 'monthly';
  category?: GameCategory;
  gameId?: string;
  entries: LeaderboardEntry[];
  lastUpdated: string;
}

// Activity Log Types
export interface GameActivityLog {
  logId: string;
  userId: string;
  gameId: string;
  action: 'started' | 'completed' | 'abandoned' | 'score_submitted';
  details: Record<string, any>;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

// Audit Log Types
export interface GameAuditLog {
  auditId: string;
  userId: string;
  action: 'earnCoins' | 'updateScore' | 'updateLeaderboard';
  gameId: string;
  before: Record<string, any>;
  after: Record<string, any>;
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
}

// Security Types
export interface AntiAbuseConfig {
  dailyCoinLimit: number;
  maxAttemptsPerGame: number;
  minTimeBetweenAttempts: number; // in seconds
  duplicateSubmissionWindow: number; // in seconds
  suspiciousActivityThreshold: number;
}

export interface GameSecurityCheck {
  userId: string;
  gameId: string;
  timestamp: string;
  checks: {
    dailyLimitExceeded: boolean;
    tooManyAttempts: boolean;
    tooFastCompletion: boolean;
    duplicateSubmission: boolean;
    suspiciousPattern: boolean;
  };
  allowed: boolean;
  reason?: string;
}

// Additional missing types
export interface MemoryCard {
  id: string;
  content: string;
  isFlipped: boolean;
  isMatched: boolean;
  isSelected: boolean;
  position: number;
  icon?: string; // For icon-based memory cards
  label?: string; // For text-based memory cards
}

export interface PuzzlePiece {
  id: string;
  image: string;
  position: { x: number; y: number };
  currentPosition: { x: number; y: number }; // Alias for position
  correctPosition: { x: number; y: number };
  isPlaced: boolean;
  isInCorrectPosition: boolean; // Computed property
  isDragging: boolean;
  shape: string;
  content?: string; // For text-based puzzle pieces
}

export interface QuizAnswer {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation?: string;
}

// Additional missing types
export interface PuzzleConfig {
  id: string;
  title: string;
  image: string;
  pieces: PuzzlePiece[];
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit?: number;
  coinsPerCompletion: number;
}

export interface MemoryConfig {
  id: string;
  title: string;
  cards: MemoryCard[];
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit?: number;
  coinsPerCompletion: number;
  gridSize: number; // Grid size for memory game
}