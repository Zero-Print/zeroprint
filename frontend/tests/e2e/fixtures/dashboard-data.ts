/**
 * Dashboard Test Fixtures
 * Mock data and test configurations for dashboard E2E tests
 */

// ============================================================================
// LEADERBOARD TEST DATA
// ============================================================================

export const MOCK_LEADERBOARD_ENTRIES = [
  {
    id: 'user_1',
    name: 'Alice Johnson',
    score: 1250,
    rank: 1,
    entityType: 'individual',
    category: 'carbon',
    scope: 'global',
    avatar: '/avatars/alice.jpg',
    location: 'San Francisco, CA',
    achievements: ['Carbon Champion', 'Eco Warrior'],
    trend: 'up',
    weeklyChange: 15
  },
  {
    id: 'user_2',
    name: 'Bob Smith',
    score: 1180,
    rank: 2,
    entityType: 'individual',
    category: 'carbon',
    scope: 'global',
    avatar: '/avatars/bob.jpg',
    location: 'New York, NY',
    achievements: ['Green Commuter'],
    trend: 'stable',
    weeklyChange: 2
  },
  {
    id: 'org_1',
    name: 'EcoTech Solutions',
    score: 2500,
    rank: 1,
    entityType: 'organization',
    category: 'unified',
    scope: 'global',
    avatar: '/avatars/ecotech.jpg',
    location: 'Austin, TX',
    achievements: ['Corporate Leader', 'Innovation Award'],
    trend: 'up',
    weeklyChange: 25,
    employeeCount: 150
  },
  {
    id: 'user_3',
    name: 'Carol Davis',
    score: 950,
    rank: 3,
    entityType: 'individual',
    category: 'mental_health',
    scope: 'local',
    avatar: '/avatars/carol.jpg',
    location: 'Portland, OR',
    achievements: ['Mindfulness Master'],
    trend: 'up',
    weeklyChange: 8
  },
  {
    id: 'user_4',
    name: 'David Wilson',
    score: 875,
    rank: 4,
    entityType: 'individual',
    category: 'animal_welfare',
    scope: 'global',
    avatar: '/avatars/david.jpg',
    location: 'Denver, CO',
    achievements: ['Animal Advocate'],
    trend: 'down',
    weeklyChange: -5
  }
];

export const MOCK_LEADERBOARD_METADATA = {
  total: 1250,
  page: 1,
  pageSize: 20,
  totalPages: 63,
  lastUpdated: new Date().toISOString(),
  filters: {
    entityType: 'all',
    scope: 'global',
    category: 'unified',
    timeframe: 'week'
  },
  stats: {
    averageScore: 756,
    topScore: 2500,
    participantCount: 1250,
    newThisWeek: 45
  }
};

// ============================================================================
// WIDGET TEST DATA
// ============================================================================

export const MOCK_WIDGET_DATA = {
  carbon: {
    title: 'Carbon Impact Leaders',
    entries: MOCK_LEADERBOARD_ENTRIES.filter(e => e.category === 'carbon').slice(0, 5),
    userRank: 15,
    userScore: 650,
    totalParticipants: 500
  },
  mental_health: {
    title: 'Mental Wellness Champions',
    entries: MOCK_LEADERBOARD_ENTRIES.filter(e => e.category === 'mental_health').slice(0, 5),
    userRank: 8,
    userScore: 820,
    totalParticipants: 300
  },
  animal_welfare: {
    title: 'Animal Welfare Heroes',
    entries: MOCK_LEADERBOARD_ENTRIES.filter(e => e.category === 'animal_welfare').slice(0, 5),
    userRank: 22,
    userScore: 450,
    totalParticipants: 200
  },
  unified: {
    title: 'Overall Impact Leaders',
    entries: MOCK_LEADERBOARD_ENTRIES.slice(0, 5),
    userRank: 12,
    userScore: 1920,
    totalParticipants: 1250
  }
};

// ============================================================================
// REAL-TIME TEST DATA
// ============================================================================

export const MOCK_REALTIME_UPDATES = [
  {
    id: 'update_1',
    type: 'score_change',
    userId: 'user_1',
    oldScore: 1235,
    newScore: 1250,
    change: 15,
    timestamp: new Date().toISOString(),
    reason: 'Carbon tracking entry'
  },
  {
    id: 'update_2',
    type: 'rank_change',
    userId: 'user_2',
    oldRank: 3,
    newRank: 2,
    timestamp: new Date().toISOString(),
    reason: 'Score improvement'
  },
  {
    id: 'update_3',
    type: 'new_entry',
    userId: 'user_5',
    score: 425,
    rank: 45,
    timestamp: new Date().toISOString(),
    reason: 'First leaderboard entry'
  }
];

export const MOCK_OPTIMISTIC_UPDATES = [
  {
    id: 'opt_1',
    type: 'score_increase',
    userId: 'current_user',
    expectedChange: 25,
    timestamp: new Date().toISOString(),
    action: 'carbon_entry_added',
    status: 'pending'
  },
  {
    id: 'opt_2',
    type: 'rank_improvement',
    userId: 'current_user',
    expectedRankChange: -2,
    timestamp: new Date().toISOString(),
    action: 'mental_health_milestone',
    status: 'confirmed'
  }
];

// ============================================================================
// EXPORT TEST DATA
// ============================================================================

export const MOCK_EXPORT_CONFIGS = {
  pdf: {
    format: 'pdf',
    filename: 'leaderboard_report.pdf',
    options: {
      includeCharts: true,
      includeSummary: true,
      includeMetadata: true,
      pageSize: 'A4',
      orientation: 'portrait'
    },
    expectedSize: '2.5MB',
    expectedPages: 15
  },
  excel: {
    format: 'excel',
    filename: 'leaderboard_data.xlsx',
    options: {
      includeFormulas: true,
      includePivotTables: true,
      includeCharts: false,
      multipleSheets: true
    },
    expectedSize: '1.8MB',
    expectedSheets: 4
  },
  csv: {
    format: 'csv',
    filename: 'leaderboard_raw.csv',
    options: {
      includeHeaders: true,
      delimiter: ',',
      encoding: 'utf-8'
    },
    expectedSize: '150KB',
    expectedRows: 1251 // Including header
  }
};

// ============================================================================
// TRACKER INTEGRATION TEST DATA
// ============================================================================

export const MOCK_TRACKER_DATA = {
  carbon: {
    recentEntries: [
      {
        id: 'carbon_1',
        amount: 50,
        category: 'transportation',
        subcategory: 'public_transit',
        date: new Date().toISOString(),
        impact: 25,
        verified: true
      },
      {
        id: 'carbon_2',
        amount: 30,
        category: 'energy',
        subcategory: 'renewable',
        date: new Date(Date.now() - 86400000).toISOString(),
        impact: 15,
        verified: false
      }
    ],
    totalImpact: 1250,
    weeklyGoal: 100,
    progress: 75
  },
  mental_health: {
    recentEntries: [
      {
        id: 'mental_1',
        mood: 8,
        activity: 'meditation',
        duration: 30,
        date: new Date().toISOString(),
        notes: 'Morning meditation session'
      },
      {
        id: 'mental_2',
        mood: 7,
        activity: 'exercise',
        duration: 45,
        date: new Date(Date.now() - 86400000).toISOString(),
        notes: 'Evening yoga'
      }
    ],
    averageMood: 7.5,
    weeklyGoal: 5,
    sessionsCompleted: 4
  },
  animal_welfare: {
    recentEntries: [
      {
        id: 'animal_1',
        action: 'volunteer',
        organization: 'Local Animal Shelter',
        duration: 120,
        impact: 75,
        date: new Date().toISOString()
      },
      {
        id: 'animal_2',
        action: 'donation',
        organization: 'Wildlife Conservation',
        amount: 50,
        impact: 25,
        date: new Date(Date.now() - 172800000).toISOString()
      }
    ],
    totalImpact: 450,
    monthlyGoal: 200,
    progress: 225
  }
};

// ============================================================================
// ERROR SCENARIOS
// ============================================================================

export const MOCK_ERROR_RESPONSES = {
  network_failure: {
    status: 0,
    message: 'Network request failed',
    type: 'NetworkError'
  },
  server_error: {
    status: 500,
    message: 'Internal server error',
    type: 'ServerError',
    details: 'Database connection failed'
  },
  unauthorized: {
    status: 401,
    message: 'Unauthorized access',
    type: 'AuthError',
    details: 'Token expired'
  },
  rate_limit: {
    status: 429,
    message: 'Too many requests',
    type: 'RateLimitError',
    retryAfter: 60
  },
  validation_error: {
    status: 400,
    message: 'Invalid filter combination',
    type: 'ValidationError',
    details: 'Organization scope cannot be used with individual entity type'
  }
};

// ============================================================================
// PERFORMANCE BENCHMARKS
// ============================================================================

export const PERFORMANCE_THRESHOLDS = {
  pageLoad: {
    dashboard: 3000, // 3 seconds
    leaderboard: 2000, // 2 seconds
    export: 5000 // 5 seconds
  },
  rendering: {
    filterApplication: 1000, // 1 second
    dataRefresh: 1500, // 1.5 seconds
    pagination: 500 // 0.5 seconds
  },
  network: {
    apiResponse: 2000, // 2 seconds
    exportGeneration: 10000, // 10 seconds
    realtimeUpdate: 100 // 100ms
  }
};

// ============================================================================
// ACCESSIBILITY TEST DATA
// ============================================================================

export const ACCESSIBILITY_REQUIREMENTS = {
  keyboardNavigation: {
    requiredElements: [
      'filter-section',
      'leaderboard-table',
      'pagination',
      'export-button',
      'refresh-button'
    ],
    tabOrder: [
      'entity-type-filter',
      'scope-filter',
      'category-filter',
      'timeframe-filter',
      'apply-filters-button',
      'leaderboard-search',
      'sort-by-score',
      'leaderboard-entry',
      'pagination-prev',
      'pagination-next',
      'export-button'
    ]
  },
  ariaLabels: {
    'leaderboard-table': 'Leaderboard rankings table',
    'filter-section': 'Leaderboard filters',
    'export-button': 'Export leaderboard data',
    'refresh-button': 'Refresh leaderboard data',
    'pagination': 'Leaderboard pagination'
  },
  screenReader: {
    announcements: [
      'Leaderboard data refreshed',
      'Filters applied',
      'Export started',
      'Page navigation'
    ]
  }
};

// ============================================================================
// TEST CONFIGURATIONS
// ============================================================================

export const TEST_CONFIGS = {
  viewports: {
    mobile: { width: 375, height: 667 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1280, height: 720 },
    large: { width: 1920, height: 1080 }
  },
  browsers: ['chromium', 'firefox', 'webkit'],
  timeouts: {
    short: 5000,
    medium: 10000,
    long: 30000
  },
  retries: {
    ci: 2,
    local: 0
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function generateMockLeaderboardData(count: number = 50) {
  return Array.from({ length: count }, (_, i) => ({
    id: `user_${i + 1}`,
    name: `Test User ${i + 1}`,
    score: Math.floor(Math.random() * 1000) + 100,
    rank: i + 1,
    entityType: ['individual', 'organization'][Math.floor(Math.random() * 2)],
    category: ['carbon', 'mental_health', 'animal_welfare', 'unified'][Math.floor(Math.random() * 4)],
    scope: ['global', 'local', 'organization'][Math.floor(Math.random() * 3)],
    avatar: `/avatars/user_${i + 1}.jpg`,
    location: `City ${i + 1}`,
    achievements: [`Achievement ${i + 1}`],
    trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)],
    weeklyChange: Math.floor(Math.random() * 40) - 20
  }));
}

export function createMockApiResponse(data: any, metadata?: any) {
  return {
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      success: true,
      data,
      metadata: metadata || MOCK_LEADERBOARD_METADATA,
      timestamp: new Date().toISOString()
    })
  };
}

export function createErrorResponse(errorType: keyof typeof MOCK_ERROR_RESPONSES) {
  const error = MOCK_ERROR_RESPONSES[errorType];
  return {
    status: error.status,
    contentType: 'application/json',
    body: JSON.stringify({
      success: false,
      error: error.message,
      type: error.type,
      details: error.details || null,
      timestamp: new Date().toISOString()
    })
  };
}