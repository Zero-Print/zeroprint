import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');
const requestCount = new Counter('requests');

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 10 }, // Ramp up to 10 users
    { duration: '5m', target: 10 }, // Stay at 10 users
    { duration: '2m', target: 20 }, // Ramp up to 20 users
    { duration: '5m', target: 20 }, // Stay at 20 users
    { duration: '2m', target: 50 }, // Ramp up to 50 users
    { duration: '5m', target: 50 }, // Stay at 50 users
    { duration: '2m', target: 0 }, // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests must complete below 2s
    http_req_failed: ['rate<0.05'], // Error rate must be below 5%
    errors: ['rate<0.05'], // Custom error rate below 5%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// Test data
const testUsers = [
  { email: 'test1@example.com', password: 'password123' },
  { email: 'test2@example.com', password: 'password123' },
  { email: 'test3@example.com', password: 'password123' },
];

export function setup() {
  console.log('Starting load test setup...');

  // Verify the application is running
  const response = http.get(`${BASE_URL}/`);
  check(response, {
    'Application is running': r => r.status === 200,
  });

  return { baseUrl: BASE_URL };
}

export default function (data) {
  const user = testUsers[Math.floor(Math.random() * testUsers.length)];

  // Test scenario: User journey through the application
  testHomepage(data.baseUrl);
  sleep(1);

  testAuthentication(data.baseUrl, user);
  sleep(1);

  testDashboard(data.baseUrl);
  sleep(1);

  testTrackers(data.baseUrl);
  sleep(1);

  testGames(data.baseUrl);
  sleep(1);

  testWallet(data.baseUrl);
  sleep(2);
}

function testHomepage(baseUrl) {
  const response = http.get(`${baseUrl}/`);

  const success = check(response, {
    'Homepage loads successfully': r => r.status === 200,
    'Homepage contains title': r => r.body.includes('ZeroPrint'),
    'Response time < 1s': r => r.timings.duration < 1000,
  });

  errorRate.add(!success);
  responseTime.add(response.timings.duration);
  requestCount.add(1);
}

function testAuthentication(baseUrl, user) {
  // Login page
  let response = http.get(`${baseUrl}/auth/login`);

  let success = check(response, {
    'Login page loads': r => r.status === 200,
    'Login form present': r => r.body.includes('email') && r.body.includes('password'),
  });

  errorRate.add(!success);
  responseTime.add(response.timings.duration);
  requestCount.add(1);

  // Simulate login (if API endpoints are available)
  const loginPayload = JSON.stringify({
    email: user.email,
    password: user.password,
  });

  const loginParams = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  response = http.post(`${baseUrl}/api/auth/login`, loginPayload, loginParams);

  success = check(response, {
    'Login API responds': r => r.status === 200 || r.status === 401, // 401 is expected for test users
    'Login response time < 2s': r => r.timings.duration < 2000,
  });

  errorRate.add(!success);
  responseTime.add(response.timings.duration);
  requestCount.add(1);
}

function testDashboard(baseUrl) {
  const response = http.get(`${baseUrl}/dashboard`);

  const success = check(response, {
    'Dashboard loads': r => r.status === 200 || r.status === 302, // 302 redirect to login is acceptable
    'Dashboard response time < 1.5s': r => r.timings.duration < 1500,
  });

  errorRate.add(!success);
  responseTime.add(response.timings.duration);
  requestCount.add(1);
}

function testTrackers(baseUrl) {
  const trackerPages = ['/trackers/carbon', '/trackers/mental-health', '/trackers/animal-welfare'];

  trackerPages.forEach(page => {
    const response = http.get(`${baseUrl}${page}`);

    const success = check(response, {
      [`${page} loads`]: r => r.status === 200 || r.status === 302,
      [`${page} response time < 1.5s`]: r => r.timings.duration < 1500,
    });

    errorRate.add(!success);
    responseTime.add(response.timings.duration);
    requestCount.add(1);

    sleep(0.5);
  });
}

function testGames(baseUrl) {
  const gamePages = ['/games', '/games/quiz', '/games/memory'];

  gamePages.forEach(page => {
    const response = http.get(`${baseUrl}${page}`);

    const success = check(response, {
      [`${page} loads`]: r => r.status === 200 || r.status === 302,
      [`${page} response time < 2s`]: r => r.timings.duration < 2000,
    });

    errorRate.add(!success);
    responseTime.add(response.timings.duration);
    requestCount.add(1);

    sleep(0.5);
  });
}

function testWallet(baseUrl) {
  const walletPages = ['/wallet', '/wallet/redeem'];

  walletPages.forEach(page => {
    const response = http.get(`${baseUrl}${page}`);

    const success = check(response, {
      [`${page} loads`]: r => r.status === 200 || r.status === 302,
      [`${page} response time < 1.5s`]: r => r.timings.duration < 1500,
    });

    errorRate.add(!success);
    responseTime.add(response.timings.duration);
    requestCount.add(1);

    sleep(0.5);
  });
}

function testAPIEndpoints(baseUrl) {
  const apiEndpoints = [
    '/api/health',
    '/api/trackers/carbon',
    '/api/games/leaderboard',
    '/api/wallet/balance',
  ];

  apiEndpoints.forEach(endpoint => {
    const response = http.get(`${baseUrl}${endpoint}`);

    const success = check(response, {
      [`API ${endpoint} responds`]: r => r.status < 500, // Any status below 500 is acceptable
      [`API ${endpoint} response time < 1s`]: r => r.timings.duration < 1000,
    });

    errorRate.add(!success);
    responseTime.add(response.timings.duration);
    requestCount.add(1);

    sleep(0.2);
  });
}

export function teardown(data) {
  console.log('Load test completed');
  console.log(`Total requests: ${requestCount.count}`);
  console.log(`Error rate: ${(errorRate.rate * 100).toFixed(2)}%`);
  console.log(`Average response time: ${responseTime.avg.toFixed(2)}ms`);
}
