import { http, HttpResponse } from 'msw';

/**
 * MSW Request Handlers
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
  rest.post('/api/auth/login', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        user: mockUser,
        token: 'mock-jwt-token',
      })
    );
  }),

  rest.post('/api/auth/register', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        success: true,
        user: mockUser,
        token: 'mock-jwt-token',
      })
    );
  }),

  rest.post('/api/auth/logout', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        message: 'Logged out successfully',
      })
    );
  }),

  rest.post('/api/auth/forgot-password', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        message: 'Password reset link sent to your email',
      })
    );
  }),

  rest.post('/api/auth/reset-password', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        message: 'Password updated successfully',
      })
    );
  }),

  rest.get('/api/auth/me', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        user: mockUser,
      })
    );
  }),

  // User profile endpoints
  rest.get('/api/user/profile', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        user: mockUser,
      })
    );
  }),

  rest.put('/api/user/profile', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        user: { ...mockUser, ...req.body },
      })
    );
  }),

  // Carbon tracker endpoints
  rest.get('/api/trackers/carbon/activities', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        activities: mockActivities,
        totalCarbonSaved: 7.7,
        totalActivities: mockActivities.length,
      })
    );
  }),

  rest.post('/api/trackers/carbon/activities', (req, res, ctx) => {
    const newActivity = {
      id: `activity-${Date.now()}`,
      ...req.body,
      userId: 'test-user-id',
      carbonSaved: 2.1,
    };

    return res(
      ctx.status(201),
      ctx.json({
        success: true,
        activity: newActivity,
        tokensEarned: 10,
      })
    );
  }),

  rest.get('/api/trackers/carbon/analytics', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        analytics: {
          totalCarbonSaved: 7.7,
          weeklyTrend: [1.2, 2.1, 1.8, 2.6],
          topActivities: ['transportation', 'energy'],
          monthlyGoalProgress: 65,
        },
      })
    );
  }),

  rest.post('/api/trackers/carbon/goals', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        success: true,
        goal: {
          id: 'goal-1',
          ...req.body,
          userId: 'test-user-id',
          progress: 0,
        },
      })
    );
  }),

  // Mental health tracker endpoints
  rest.get('/api/trackers/mental-health/moods', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        moods: mockMoodEntries,
      })
    );
  }),

  rest.post('/api/trackers/mental-health/moods', (req, res, ctx) => {
    const newMood = {
      id: `mood-${Date.now()}`,
      ...req.body,
      userId: 'test-user-id',
    };

    return res(
      ctx.status(201),
      ctx.json({
        success: true,
        mood: newMood,
      })
    );
  }),

  rest.post('/api/trackers/mental-health/meditation', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        success: true,
        session: {
          id: `session-${Date.now()}`,
          ...req.body,
          userId: 'test-user-id',
        },
        tokensEarned: 5,
      })
    );
  }),

  rest.get('/api/trackers/mental-health/insights', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        insights: {
          averageMood: 4.2,
          moodTrend: 'improving',
          recommendations: [
            'Continue your meditation practice',
            'Try outdoor activities for better mood',
          ],
          patterns: {
            bestDays: ['Monday', 'Friday'],
            challengingDays: ['Wednesday'],
          },
        },
      })
    );
  }),

  // Animal welfare tracker endpoints
  rest.get('/api/trackers/animal-welfare/activities', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        activities: [
          {
            id: 'animal-1',
            type: 'volunteer',
            organization: 'Local Animal Shelter',
            hours: 3,
            description: 'Dog walking and feeding',
            date: '2024-01-15',
            userId: 'test-user-id',
          },
        ],
      })
    );
  }),

  rest.post('/api/trackers/animal-welfare/activities', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        success: true,
        activity: {
          id: `animal-${Date.now()}`,
          ...req.body,
          userId: 'test-user-id',
        },
        tokensEarned: 15,
      })
    );
  }),

  rest.post('/api/trackers/animal-welfare/donations', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        success: true,
        donation: {
          id: `donation-${Date.now()}`,
          ...req.body,
          userId: 'test-user-id',
        },
      })
    );
  }),

  // Gaming endpoints
  rest.get('/api/games/quizzes', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
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
      })
    );
  }),

  rest.get('/api/games/quizzes/:id', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        quiz: {
          id: req.params.id,
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
      })
    );
  }),

  rest.post('/api/games/quizzes/:id/submit', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        score: 80,
        correctAnswers: 4,
        totalQuestions: 5,
        tokensEarned: 20,
      })
    );
  }),

  rest.get('/api/games/challenges', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        challenges: [
          {
            id: 'challenge-1',
            title: 'Eco Week Challenge',
            description: 'Complete eco-friendly activities for a week',
            duration: '7 days',
            reward: 100,
            participants: 1250,
          },
        ],
      })
    );
  }),

  rest.post('/api/games/challenges/:id/join', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        message: 'Successfully joined challenge',
      })
    );
  }),

  rest.get('/api/games/leaderboard', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        leaderboard: [
          { rank: 1, name: 'EcoWarrior', points: 2500 },
          { rank: 2, name: 'GreenThumb', points: 2200 },
          { rank: 3, name: 'Test User', points: 1800 },
        ],
        userRank: 3,
      })
    );
  }),

  rest.get('/api/games/achievements', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        achievements: [
          {
            id: 'achievement-1',
            title: 'First Steps',
            description: 'Complete your first carbon activity',
            earned: true,
            earnedAt: '2024-01-15',
          },
          {
            id: 'achievement-2',
            title: 'Quiz Master',
            description: 'Score 100% on a sustainability quiz',
            earned: false,
          },
        ],
      })
    );
  }),

  // Wallet endpoints
  rest.get('/api/wallet', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        wallet: mockWallet,
      })
    );
  }),

  rest.post('/api/wallet/setup', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        success: true,
        wallet: {
          ...mockWallet,
          ...req.body,
        },
      })
    );
  }),

  rest.post('/api/wallet/add-funds', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        transaction: {
          id: `tx-${Date.now()}`,
          type: 'deposit',
          amount: req.body.amount,
          status: 'completed',
        },
        newBalance: mockWallet.balance + req.body.amount,
      })
    );
  }),

  rest.get('/api/wallet/transactions', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        transactions: mockWallet.transactions,
      })
    );
  }),

  rest.post('/api/wallet/purchase', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        transaction: {
          id: `tx-${Date.now()}`,
          type: 'purchase',
          amount: req.body.amount,
          item: req.body.item,
          status: 'completed',
        },
      })
    );
  }),

  // Marketplace endpoints
  rest.get('/api/marketplace/items', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        items: [
          {
            id: 'item-1',
            name: 'Eco-friendly Water Bottle',
            description: 'Sustainable bamboo water bottle',
            price: 25,
            tokenPrice: 50,
            category: 'lifestyle',
            image: 'https://example.com/bottle.jpg',
          },
          {
            id: 'item-2',
            name: 'Tree Planting Certificate',
            description: 'Plant a tree in your name',
            price: 10,
            tokenPrice: 20,
            category: 'environment',
            image: 'https://example.com/tree.jpg',
          },
        ],
      })
    );
  }),

  // Carbon offset endpoints
  rest.get('/api/offset-marketplace', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        projects: [
          {
            id: 'offset-1',
            name: 'Reforestation Project',
            description: 'Plant trees in the Amazon rainforest',
            pricePerTon: 15,
            location: 'Brazil',
            certification: 'Gold Standard',
            image: 'https://example.com/forest.jpg',
          },
        ],
      })
    );
  }),

  rest.post('/api/offset-marketplace/purchase', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        certificate: {
          id: `cert-${Date.now()}`,
          project: req.body.projectId,
          amount: req.body.amount,
          price: req.body.price,
          certificateUrl: 'https://example.com/certificate.pdf',
        },
      })
    );
  }),

  // ESG endpoints
  rest.get('/api/esg/assessment', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        assessment: {
          id: 'assessment-1',
          environmentalScore: 75,
          socialScore: 80,
          governanceScore: 70,
          overallScore: 75,
          lastUpdated: '2024-01-15',
        },
      })
    );
  }),

  rest.post('/api/esg/assessment', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        success: true,
        assessment: {
          id: `assessment-${Date.now()}`,
          ...req.body,
          overallScore: 75,
          recommendations: [
            'Improve energy efficiency',
            'Enhance employee diversity programs',
            'Increase board transparency',
          ],
        },
      })
    );
  }),

  rest.post('/api/esg/report/generate', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        reportId: `report-${Date.now()}`,
        status: 'generating',
        estimatedTime: '5 minutes',
      })
    );
  }),

  rest.get('/api/esg/report/:id', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        report: {
          id: req.params.id,
          status: 'completed',
          downloadUrl: 'https://example.com/esg-report.pdf',
          generatedAt: '2024-01-15T10:00:00Z',
        },
      })
    );
  }),

  rest.post('/api/esg/certification/apply', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        success: true,
        application: {
          id: `app-${Date.now()}`,
          status: 'submitted',
          estimatedReviewTime: '2-3 weeks',
        },
      })
    );
  }),

  // Payment endpoints
  rest.post('/api/payment/process', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        paymentId: `payment-${Date.now()}`,
        status: 'completed',
        amount: req.body.amount,
      })
    );
  }),

  rest.post('/api/payment/stripe/create-intent', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        clientSecret: 'pi_mock_client_secret',
        paymentIntentId: 'pi_mock_payment_intent',
      })
    );
  }),

  // Notification endpoints
  rest.get('/api/notifications', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        notifications: [
          {
            id: 'notif-1',
            title: 'Goal Achievement',
            message: 'You reached your weekly carbon reduction goal!',
            type: 'success',
            read: false,
            createdAt: '2024-01-15T09:00:00Z',
          },
        ],
      })
    );
  }),

  rest.put('/api/notifications/:id/read', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        message: 'Notification marked as read',
      })
    );
  }),

  // Analytics endpoints
  rest.get('/api/analytics/dashboard', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        analytics: {
          totalCarbonSaved: 125.5,
          totalTokensEarned: 450,
          activitiesCompleted: 28,
          challengesWon: 3,
          weeklyProgress: [10, 15, 12, 18, 22, 16, 20],
          topCategories: ['transportation', 'energy', 'waste'],
        },
      })
    );
  }),

  // File upload endpoints
  rest.post('/api/upload', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        fileUrl: 'https://example.com/uploaded-file.jpg',
        fileId: `file-${Date.now()}`,
      })
    );
  }),

  // Error simulation endpoints for testing
  rest.get('/api/test/error', (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({
        success: false,
        error: 'Simulated server error',
      })
    );
  }),

  rest.get('/api/test/slow', (req, res, ctx) => {
    return res(
      ctx.delay(5000),
      ctx.status(200),
      ctx.json({
        success: true,
        message: 'Slow response',
      })
    );
  }),
];
