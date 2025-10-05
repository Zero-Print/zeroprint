import { http, HttpResponse } from 'msw';

/**
 * MSW v2 Request Handlers
 *
 * This module contains all the mock request handlers for API endpoints
 * used during testing. These handlers simulate real API responses.
 */

// Mock data
const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  role: 'user',
  avatar: 'https://example.com/avatar.jpg',
  createdAt: '2024-01-01T00:00:00Z',
  preferences: {
    theme: 'light',
    notifications: true,
    language: 'en',
  },
};

const mockActivities = [
  {
    id: 'activity-1',
    type: 'transportation',
    mode: 'bicycle',
    distance: 10,
    carbonSaved: 2.5,
    date: '2024-01-15',
    userId: 'test-user-id',
  },
  {
    id: 'activity-2',
    type: 'energy',
    action: 'solar_panel_usage',
    amount: 15,
    carbonSaved: 5.2,
    date: '2024-01-14',
    userId: 'test-user-id',
  },
];

const mockMoodEntries = [
  {
    id: 'mood-1',
    mood: 'happy',
    notes: 'Had a great day',
    activities: ['exercise', 'meditation'],
    date: '2024-01-15',
    userId: 'test-user-id',
  },
];

const mockWallet = {
  id: 'wallet-1',
  userId: 'test-user-id',
  balance: 150.5,
  tokenBalance: 250,
  currency: 'USD',
  transactions: [
    {
      id: 'tx-1',
      type: 'earned',
      amount: 10,
      description: 'Carbon activity reward',
      date: '2024-01-15',
    },
  ],
};

export const handlers = [
  // Authentication endpoints
  http.post('/api/auth/login', () => {
    return HttpResponse.json({
      success: true,
      user: mockUser,
      token: 'mock-jwt-token',
    });
  }),

  http.post('/api/auth/register', () => {
    return HttpResponse.json({
      success: true,
      user: mockUser,
      token: 'mock-jwt-token',
    });
  }),

  http.post('/api/auth/logout', () => {
    return HttpResponse.json({
      success: true,
      message: 'Logged out successfully',
    });
  }),

  http.post('/api/auth/forgot-password', () => {
    return HttpResponse.json({
      success: true,
      message: 'Password reset link sent to your email',
    });
  }),

  http.post('/api/auth/reset-password', () => {
    return HttpResponse.json({
      success: true,
      message: 'Password updated successfully',
    });
  }),

  http.get('/api/auth/me', () => {
    return HttpResponse.json({
      success: true,
      user: mockUser,
    });
  }),

  // User profile endpoints
  http.get('/api/user/profile', () => {
    return HttpResponse.json({
      success: true,
      user: mockUser,
    });
  }),

  http.put('/api/user/profile', () => {
    return HttpResponse.json({
      success: true,
      user: mockUser,
    });
  }),

  // Carbon tracker endpoints
  http.get('/api/trackers/carbon/activities', () => {
    return HttpResponse.json({
      success: true,
      activities: mockActivities,
      totalCarbonSaved: 7.7,
      totalActivities: mockActivities.length,
    });
  }),

  http.post('/api/trackers/carbon/activities', () => {
    return HttpResponse.json({
      success: true,
      activity: {
        id: `activity-${Date.now()}`,
        userId: 'test-user-id',
        carbonSaved: 2.1,
      },
      tokensEarned: 10,
    });
  }),

  http.get('/api/trackers/carbon/analytics', () => {
    return HttpResponse.json({
      success: true,
      analytics: {
        totalCarbonSaved: 7.7,
        weeklyTrend: [1.2, 2.1, 1.8, 2.6],
        topActivities: ['transportation', 'energy'],
        monthlyGoalProgress: 65,
      },
    });
  }),

  // Mental health tracker endpoints
  http.get('/api/trackers/mental-health/moods', () => {
    return HttpResponse.json({
      success: true,
      moods: mockMoodEntries,
    });
  }),

  http.post('/api/trackers/mental-health/moods', () => {
    return HttpResponse.json({
      success: true,
      mood: {
        id: `mood-${Date.now()}`,
        userId: 'test-user-id',
      },
    });
  }),

  // Wallet endpoints
  http.get('/api/wallet', () => {
    return HttpResponse.json({
      success: true,
      wallet: mockWallet,
    });
  }),

  http.post('/api/wallet/setup', () => {
    return HttpResponse.json({
      success: true,
      wallet: mockWallet,
    });
  }),

  // Gaming endpoints
  http.get('/api/games/quizzes', () => {
    return HttpResponse.json({
      success: true,
      quizzes: [
        {
          id: 'quiz-1',
          title: 'Sustainability Quiz',
          description: 'Test your knowledge about sustainability',
          questions: 10,
          difficulty: 'medium',
        },
      ],
    });
  }),

  http.get('/api/games/quizzes/:id', ({ params }) => {
    return HttpResponse.json({
      success: true,
      quiz: {
        id: params.id,
        title: 'Sustainability Quiz',
        questions: [
          {
            id: 'q1',
            question: 'What is the most effective way to reduce carbon footprint?',
            options: ['Use renewable energy', 'Drive less', 'Eat less meat', 'All of the above'],
            correctAnswer: 3,
          },
        ],
      },
    });
  }),

  http.post('/api/games/quizzes/:id/submit', () => {
    return HttpResponse.json({
      success: true,
      score: 80,
      correctAnswers: 4,
      totalQuestions: 5,
      tokensEarned: 20,
    });
  }),

  // Error simulation endpoints for testing
  http.get('/api/test/error', () => {
    return HttpResponse.json(
      {
        success: false,
        error: 'Simulated server error',
      },
      { status: 500 }
    );
  }),

  http.get('/api/test/slow', async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return HttpResponse.json({
      success: true,
      message: 'Slow response',
    });
  }),
];
