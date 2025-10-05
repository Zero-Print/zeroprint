import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');
const requestCount = new Counter('requests');

// Stress test configuration - pushing beyond normal capacity
export const options = {
  stages: [
    { duration: '2m', target: 50 }, // Ramp up to 50 users
    { duration: '5m', target: 50 }, // Stay at 50 users
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 200 }, // Ramp up to 200 users
    { duration: '5m', target: 200 }, // Stay at 200 users
    { duration: '2m', target: 300 }, // Ramp up to 300 users (stress point)
    { duration: '5m', target: 300 }, // Stay at 300 users
    { duration: '2m', target: 400 }, // Ramp up to 400 users (breaking point)
    { duration: '5m', target: 400 }, // Stay at 400 users
    { duration: '10m', target: 0 }, // Gradual ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<5000'], // 95% of requests must complete below 5s (relaxed for stress)
    http_req_failed: ['rate<0.1'], // Error rate must be below 10% (relaxed for stress)
    errors: ['rate<0.1'], // Custom error rate below 10%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export function setup() {
  console.log('Starting stress test setup...');

  // Verify the application is running
  const response = http.get(`${BASE_URL}/`);
  check(response, {
    'Application is running': r => r.status === 200,
  });

  return { baseUrl: BASE_URL };
}

export default function (data) {
  // Stress test focuses on high-traffic scenarios
  const scenario = Math.random();

  if (scenario < 0.3) {
    // 30% - Heavy homepage traffic
    stressHomepage(data.baseUrl);
  } else if (scenario < 0.5) {
    // 20% - Authentication stress
    stressAuthentication(data.baseUrl);
  } else if (scenario < 0.7) {
    // 20% - Dashboard and tracker stress
    stressDashboardAndTrackers(data.baseUrl);
  } else if (scenario < 0.85) {
    // 15% - Game and wallet stress
    stressGamesAndWallet(data.baseUrl);
  } else {
    // 15% - API stress testing
    stressAPIEndpoints(data.baseUrl);
  }

  // Shorter sleep times to increase load
  sleep(Math.random() * 2);
}

function stressHomepage(baseUrl) {
  // Rapid homepage requests
  for (let i = 0; i < 3; i++) {
    const response = http.get(`${baseUrl}/`);

    const success = check(response, {
      'Homepage stress test': r => r.status === 200,
      'Homepage under stress < 3s': r => r.timings.duration < 3000,
    });

    errorRate.add(!success);
    responseTime.add(response.timings.duration);
    requestCount.add(1);

    sleep(0.1);
  }
}

function stressAuthentication(baseUrl) {
  // Simulate multiple login attempts
  const loginPayload = JSON.stringify({
    email: `stress-test-${Math.floor(Math.random() * 1000)}@example.com`,
    password: 'password123',
  });

  const loginParams = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // Multiple rapid login attempts
  for (let i = 0; i < 2; i++) {
    const response = http.post(`${baseUrl}/api/auth/login`, loginPayload, loginParams);

    const success = check(response, {
      'Auth stress test': r => r.status < 500, // Accept 4xx errors
      'Auth under stress < 3s': r => r.timings.duration < 3000,
    });

    errorRate.add(!success);
    responseTime.add(response.timings.duration);
    requestCount.add(1);

    sleep(0.2);
  }
}

function stressDashboardAndTrackers(baseUrl) {
  const pages = [
    '/dashboard',
    '/trackers/carbon',
    '/trackers/mental-health',
    '/trackers/animal-welfare',
  ];

  // Rapid page navigation
  pages.forEach(page => {
    const response = http.get(`${baseUrl}${page}`);

    const success = check(response, {
      [`${page} stress test`]: r => r.status < 500,
      [`${page} under stress < 4s`]: r => r.timings.duration < 4000,
    });

    errorRate.add(!success);
    responseTime.add(response.timings.duration);
    requestCount.add(1);

    sleep(0.1);
  });
}

function stressGamesAndWallet(baseUrl) {
  const pages = ['/games', '/games/quiz', '/games/memory', '/wallet', '/wallet/redeem'];

  // Simulate heavy game and wallet usage
  pages.forEach(page => {
    const response = http.get(`${baseUrl}${page}`);

    const success = check(response, {
      [`${page} stress test`]: r => r.status < 500,
      [`${page} under stress < 4s`]: r => r.timings.duration < 4000,
    });

    errorRate.add(!success);
    responseTime.add(response.timings.duration);
    requestCount.add(1);

    sleep(0.1);
  });
}

function stressAPIEndpoints(baseUrl) {
  const apiEndpoints = [
    { method: 'GET', url: '/api/health' },
    { method: 'GET', url: '/api/trackers/carbon' },
    { method: 'GET', url: '/api/games/leaderboard' },
    { method: 'GET', url: '/api/wallet/balance' },
    { method: 'POST', url: '/api/trackers/carbon', payload: { activity: 'transport', value: 10 } },
    { method: 'POST', url: '/api/games/score', payload: { gameId: 'quiz', score: 100 } },
  ];

  // Rapid API calls
  apiEndpoints.forEach(endpoint => {
    let response;

    if (endpoint.method === 'GET') {
      response = http.get(`${baseUrl}${endpoint.url}`);
    } else if (endpoint.method === 'POST') {
      const payload = JSON.stringify(endpoint.payload);
      const params = {
        headers: {
          'Content-Type': 'application/json',
        },
      };
      response = http.post(`${baseUrl}${endpoint.url}`, payload, params);
    }

    const success = check(response, {
      [`API ${endpoint.url} stress test`]: r => r.status < 500,
      [`API ${endpoint.url} under stress < 2s`]: r => r.timings.duration < 2000,
    });

    errorRate.add(!success);
    responseTime.add(response.timings.duration);
    requestCount.add(1);

    sleep(0.05);
  });
}

// Additional stress scenarios
function stressConcurrentUsers(baseUrl) {
  // Simulate concurrent user actions
  const actions = [
    () => http.get(`${baseUrl}/dashboard`),
    () => http.get(`${baseUrl}/trackers/carbon`),
    () => http.get(`${baseUrl}/games`),
    () => http.get(`${baseUrl}/wallet`),
  ];

  // Execute multiple actions rapidly
  actions.forEach(action => {
    const response = action();

    const success = check(response, {
      'Concurrent user stress': r => r.status < 500,
      'Concurrent response < 5s': r => r.timings.duration < 5000,
    });

    errorRate.add(!success);
    responseTime.add(response.timings.duration);
    requestCount.add(1);
  });
}

function stressDataSubmission(baseUrl) {
  // Stress test data submission endpoints
  const submissions = [
    {
      url: '/api/trackers/carbon',
      payload: {
        activities: Array.from({ length: 10 }, (_, i) => ({
          type: 'transport',
          value: Math.random() * 100,
          timestamp: new Date().toISOString(),
        })),
      },
    },
    {
      url: '/api/trackers/mental-health',
      payload: {
        entries: Array.from({ length: 5 }, (_, i) => ({
          mood: Math.floor(Math.random() * 10) + 1,
          notes: `Stress test entry ${i}`,
          timestamp: new Date().toISOString(),
        })),
      },
    },
  ];

  submissions.forEach(submission => {
    const payload = JSON.stringify(submission.payload);
    const params = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const response = http.post(`${baseUrl}${submission.url}`, payload, params);

    const success = check(response, {
      [`Data submission ${submission.url} stress`]: r => r.status < 500,
      [`Data submission response < 3s`]: r => r.timings.duration < 3000,
    });

    errorRate.add(!success);
    responseTime.add(response.timings.duration);
    requestCount.add(1);

    sleep(0.1);
  });
}

export function teardown(data) {
  console.log('Stress test completed');
  console.log(`Total requests: ${requestCount.count}`);
  console.log(`Error rate: ${(errorRate.rate * 100).toFixed(2)}%`);
  console.log(`Average response time: ${responseTime.avg.toFixed(2)}ms`);
  console.log(`95th percentile response time: ${responseTime.p95.toFixed(2)}ms`);

  // Log stress test results
  if (errorRate.rate > 0.1) {
    console.log('⚠️  High error rate detected during stress test');
  }

  if (responseTime.p95 > 5000) {
    console.log('⚠️  High response times detected during stress test');
  }

  console.log('Stress test analysis complete');
}
