import { Timestamp } from 'firebase/firestore';

// Complete seed data for testing
export const seedData = {
  users: [
    { id: 'citizen-1', email: 'citizen@test.com', role: 'citizen' },
    { id: 'admin-1', email: 'admin@test.com', role: 'admin' }
  ],
  games: [{ id: 'game-1', title: 'Carbon Quiz', type: 'quiz' }],
  wallets: [{ userId: 'citizen-1', healCoins: 100, inrBalance: 50 }]
};

// User types and roles
export const TEST_USERS = {
  citizen: {
    id: 'test-citizen-1',
    email: 'citizen@test.com',
    name: 'Test Citizen',
    role: 'citizen',
    phone: '+1234567890',
    address: {
      street: '123 Test Street',
      city: 'Test City',
      state: 'Test State',
      zipCode: '12345',
      country: 'Test Country',
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
    isActive: true,
    preferences: {
      notifications: true,
      theme: 'light',
      language: 'en',
    },
  },
  school: {
    id: 'test-school-1',
    email: 'school@test.com',
    name: 'Test Elementary School',
    role: 'school',
    phone: '+1234567891',
    address: {
      street: '456 Education Ave',
      city: 'Learning City',
      state: 'Knowledge State',
      zipCode: '54321',
      country: 'Test Country',
    },
    schoolInfo: {
      type: 'elementary',
      studentCount: 500,
      gradeRange: 'K-5',
      principal: 'Dr. Test Principal',
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
    isActive: true,
  },
  msme: {
    id: 'test-msme-1',
    email: 'msme@test.com',
    name: 'Test MSME Business',
    role: 'msme',
    phone: '+1234567892',
    address: {
      street: '789 Business Blvd',
      city: 'Commerce City',
      state: 'Trade State',
      zipCode: '98765',
      country: 'Test Country',
    },
    businessInfo: {
      type: 'manufacturing',
      employeeCount: 25,
      industry: 'textiles',
      registrationNumber: 'MSME123456',
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
    isActive: true,
  },
  govt: {
    id: 'test-govt-1',
    email: 'govt@test.com',
    name: 'Test Government Official',
    role: 'govt',
    phone: '+1234567893',
    address: {
      street: '101 Government Plaza',
      city: 'Capital City',
      state: 'Admin State',
      zipCode: '11111',
      country: 'Test Country',
    },
    govtInfo: {
      department: 'Environmental Affairs',
      position: 'Ward Officer',
      wardNumber: 'W001',
      jurisdiction: 'Test Ward',
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
    isActive: true,
  },
  admin: {
    id: 'test-admin-1',
    email: 'admin@test.com',
    name: 'Test Admin',
    role: 'admin',
    phone: '+1234567894',
    permissions: ['all'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
    isActive: true,
  },
};

// Wallet data
export const TEST_WALLETS = {
  'test-citizen-1': {
    id: 'wallet-citizen-1',
    userId: 'test-citizen-1',
    healCoins: 150,
    balance: 150, // Keep for backward compatibility
    totalEarned: 200,
    totalSpent: 50,
    dailyLimit: 100,
    monthlyLimit: 1000,
    dailySpent: 10,
    monthlySpent: 50,
    lastResetDate: new Date('2024-01-15'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
  },
  'test-school-1': {
    id: 'wallet-school-1',
    userId: 'test-school-1',
    healCoins: 300,
    balance: 300, // Keep for backward compatibility
    totalEarned: 400,
    totalSpent: 100,
    dailyLimit: 200,
    monthlyLimit: 2000,
    dailySpent: 20,
    monthlySpent: 100,
    lastResetDate: new Date('2024-01-15'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
  },
  'test-admin-1': {
    id: 'wallet-admin-1',
    userId: 'test-admin-1',
    healCoins: 1000,
    balance: 1000, // Keep for backward compatibility
    totalEarned: 1000,
    totalSpent: 0,
    dailyLimit: 1000,
    monthlyLimit: 10000,
    dailySpent: 0,
    monthlySpent: 0,
    lastResetDate: new Date('2024-01-15'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
  },
};

// Games and questions
export const TEST_GAMES = [
  {
    id: 'game-quiz-1',
    title: 'Environmental Awareness Quiz',
    description: 'Test your knowledge about environmental conservation',
    type: 'quiz',
    category: 'environment',
    difficulty: 'easy',
    coinsReward: 10,
    timeLimit: 300, // 5 minutes
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'game-dragdrop-1',
    title: 'Waste Sorting Challenge',
    description: 'Sort waste items into correct recycling bins',
    type: 'dragdrop',
    category: 'recycling',
    difficulty: 'medium',
    coinsReward: 15,
    timeLimit: 180, // 3 minutes
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'game-simulation-1',
    title: 'Carbon Footprint Simulator',
    description: 'Simulate daily activities and see their carbon impact',
    type: 'simulation',
    category: 'carbon',
    difficulty: 'hard',
    coinsReward: 20,
    timeLimit: 600, // 10 minutes
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
  },
];

export const TEST_QUESTIONS = [
  {
    id: 'q1',
    gameId: 'game-quiz-1',
    question: 'What is the main cause of global warming?',
    options: ['Greenhouse gas emissions', 'Solar radiation', 'Ocean currents', 'Volcanic activity'],
    correctAnswer: 0,
    explanation:
      'Greenhouse gas emissions from human activities are the primary cause of global warming.',
    points: 10,
  },
  {
    id: 'q2',
    gameId: 'game-quiz-1',
    question: 'Which of these is a renewable energy source?',
    options: ['Coal', 'Natural gas', 'Solar power', 'Nuclear power'],
    correctAnswer: 2,
    explanation: 'Solar power is a renewable energy source that harnesses energy from the sun.',
    points: 10,
  },
  {
    id: 'q3',
    gameId: 'game-quiz-1',
    question: "What percentage of Earth's water is freshwater?",
    options: ['3%', '10%', '25%', '50%'],
    correctAnswer: 0,
    explanation: "Only about 3% of Earth's water is freshwater, making it a precious resource.",
    points: 10,
  },
];

// Rewards and vouchers
export const TEST_REWARDS = [
  {
    id: 'reward-voucher-1',
    title: 'Eco-Friendly Product Voucher',
    description: '₹100 off on sustainable products',
    type: 'voucher',
    value: 100,
    coinsCost: 50,
    category: 'shopping',
    vendor: 'EcoStore',
    expiryDays: 30,
    isActive: true,
    stock: 100,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'reward-donation-1',
    title: 'Tree Plantation Donation',
    description: 'Plant a tree in your name',
    type: 'donation',
    value: 50,
    coinsCost: 25,
    category: 'environment',
    vendor: 'GreenEarth Foundation',
    isActive: true,
    stock: 1000,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
  },
];

// Ward and location data
export const TEST_WARD = {
  id: 'ward-001',
  name: 'Test Ward 1',
  number: 'W001',
  city: 'Test City',
  state: 'Test State',
  population: 50000,
  area: 25.5, // sq km
  coordinates: {
    lat: 40.7128,
    lng: -74.006,
  },
  boundaries: [
    { lat: 40.71, lng: -74.01 },
    { lat: 40.715, lng: -74.01 },
    { lat: 40.715, lng: -74.002 },
    { lat: 40.71, lng: -74.002 },
  ],
  officer: 'test-govt-1',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-15'),
};

// Tracker mock data
export const TEST_CARBON_LOGS = [
  {
    id: 'carbon-1',
    userId: 'test-citizen-1',
    date: '2024-01-15',
    category: 'transportation',
    activity: 'Car commute',
    amount: 5.2,
    unit: 'kg CO2',
    description: 'Daily commute to office',
    createdAt: new Date('2024-01-15T08:00:00Z'),
  },
  {
    id: 'carbon-2',
    userId: 'test-citizen-1',
    date: '2024-01-14',
    category: 'energy',
    activity: 'Electricity usage',
    amount: 12.8,
    unit: 'kg CO2',
    description: 'Home electricity consumption',
    createdAt: new Date('2024-01-14T20:00:00Z'),
  },
];

export const TEST_MOOD_LOGS = [
  {
    id: 'mood-1',
    userId: 'test-citizen-1',
    date: '2024-01-15',
    mood: 'happy',
    energy: 8,
    stress: 3,
    sleep: 7.5,
    notes: 'Great day at work, feeling productive',
    activities: ['exercise', 'meditation'],
    createdAt: new Date('2024-01-15T20:00:00Z'),
  },
  {
    id: 'mood-2',
    userId: 'test-citizen-1',
    date: '2024-01-14',
    mood: 'neutral',
    energy: 6,
    stress: 5,
    sleep: 6,
    notes: 'Average day, some work stress',
    activities: ['reading'],
    createdAt: new Date('2024-01-14T21:30:00Z'),
  },
];

export const TEST_ANIMAL_LOGS = [
  {
    id: 'animal-1',
    userId: 'test-citizen-1',
    date: '2024-01-15',
    species: 'Robin',
    scientificName: 'Turdus migratorius',
    location: 'Central Park, NYC',
    coordinates: { lat: 40.7829, lng: -73.9654 },
    count: 3,
    behavior: 'foraging',
    habitat: 'urban park',
    weather: 'sunny',
    temperature: 15,
    notes: 'Spotted near the pond area',
    photos: ['robin1.jpg'],
    createdAt: new Date('2024-01-15T08:30:00Z'),
  },
];

export const TEST_TRANSPORT_LOGS = [
  {
    id: 'transport-1',
    userId: 'test-citizen-1',
    date: '2024-01-15',
    mode: 'bicycle',
    distance: 8.5,
    duration: 25,
    route: 'Home to Office',
    startLocation: 'Brooklyn Heights',
    endLocation: 'Manhattan Financial District',
    cost: 0,
    carbonSaved: 2.1,
    calories: 180,
    weather: 'sunny',
    notes: 'Great bike ride across Brooklyn Bridge',
    createdAt: new Date('2024-01-15T08:00:00Z'),
  },
];

// MSME ESG data
export const TEST_ESG_REPORTS = [
  {
    id: 'esg-1',
    msmeId: 'test-msme-1',
    month: '2024-01',
    environmental: {
      energyConsumption: 1250, // kWh
      waterUsage: 500, // liters
      wasteGenerated: 25, // kg
      carbonEmissions: 850, // kg CO2
      renewableEnergyPercent: 15,
    },
    social: {
      employeeSatisfaction: 8.2,
      trainingHours: 120,
      safetyIncidents: 0,
      communityInvestment: 5000, // INR
    },
    governance: {
      boardMeetings: 4,
      auditCompliance: 95,
      ethicsTraining: true,
      transparencyScore: 8.5,
    },
    overallScore: 7.8,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
  },
];

// Payment and subscription data
export const TEST_PAYMENTS = [
  {
    id: 'payment-1',
    userId: 'test-citizen-1',
    orderId: 'order_test_123456789',
    paymentId: 'pay_test_123456789',
    amount: 50000, // paise
    currency: 'INR',
    status: 'captured',
    method: 'card',
    description: 'Premium subscription',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
];

export const TEST_SUBSCRIPTIONS = [
  {
    id: 'sub-1',
    userId: 'test-citizen-1',
    plan: 'premium',
    status: 'active',
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-02-15'),
    amount: 500, // INR
    paymentId: 'payment-1',
    features: ['unlimited_games', 'premium_rewards', 'analytics'],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
];

// Audit logs
export const TEST_AUDIT_LOGS = [
  {
    id: 'audit-1',
    userId: 'test-citizen-1',
    action: 'COINS_EARNED',
    resource: 'wallet',
    resourceId: 'wallet-citizen-1',
    details: {
      gameId: 'game-quiz-1',
      coinsEarned: 10,
      previousBalance: 140,
      newBalance: 150,
    },
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0 (Test Browser)',
    timestamp: new Date('2024-01-15T10:30:00Z'),
  },
  {
    id: 'audit-2',
    userId: 'test-citizen-1',
    action: 'COINS_REDEEMED',
    resource: 'wallet',
    resourceId: 'wallet-citizen-1',
    details: {
      rewardId: 'reward-voucher-1',
      coinsSpent: 50,
      previousBalance: 150,
      newBalance: 100,
    },
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0 (Test Browser)',
    timestamp: new Date('2024-01-15T15:45:00Z'),
  },
];

// Helper function to convert dates to Firestore Timestamps
export function convertToFirestoreTimestamp(data: any): any {
  if (data instanceof Date) {
    return Timestamp.fromDate(data);
  }

  if (Array.isArray(data)) {
    return data.map(convertToFirestoreTimestamp);
  }

  if (data && typeof data === 'object') {
    const converted: any = {};
    for (const [key, value] of Object.entries(data)) {
      converted[key] = convertToFirestoreTimestamp(value);
    }
    return converted;
  }

  return data;
}

// Export all test data
export const ALL_TEST_DATA = {
  users: TEST_USERS,
  wallets: TEST_WALLETS,
  games: TEST_GAMES,
  questions: TEST_QUESTIONS,
  rewards: TEST_REWARDS,
  ward: TEST_WARD,
  carbonLogs: TEST_CARBON_LOGS,
  moodLogs: TEST_MOOD_LOGS,
  animalLogs: TEST_ANIMAL_LOGS,
  transportLogs: TEST_TRANSPORT_LOGS,
  esgReports: TEST_ESG_REPORTS,
  payments: TEST_PAYMENTS,
  subscriptions: TEST_SUBSCRIPTIONS,
  auditLogs: TEST_AUDIT_LOGS,
};
