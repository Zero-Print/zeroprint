import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');
const requestCount = new Counter('requests');
const spikeRecoveryTime = new Trend('spike_recovery_time');

// Spike test configuration - sudden traffic surges
export const options = {
  stages: [
    { duration: '1m', target: 10 }, // Normal load
    { duration: '30s', target: 10 }, // Stay at normal load
    { duration: '30s', target: 500 }, // SPIKE! Sudden surge to 500 users
    { duration: '2m', target: 500 }, // Maintain spike
    { duration: '30s', target: 10 }, // Drop back to normal
    { duration: '2m', target: 10 }, // Recovery period
    { duration: '30s', target: 1000 }, // BIGGER SPIKE! 1000 users
    { duration: '1m', target: 1000 }, // Maintain bigger spike
    { duration: '30s', target: 10 }, // Drop back to normal
    { duration: '3m', target: 10 }, // Extended recovery
    { duration: '30s', target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<10000'], // 95% of requests must complete below 10s (very relaxed for spikes)
    http_req_failed: ['rate<0.2'], // Error rate must be below 20% (relaxed for spikes)
    errors: ['rate<0.2'], // Custom error rate below 20%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export function setup() {
  console.log('Starting spike test setup...');

  // Verify the application is running
  const response = http.get(`${BASE_URL}/`);
  check(response, {
    'Application is running': r => r.status === 200,
  });

  return {
    baseUrl: BASE_URL,
    startTime: Date.now(),
  };
}

export default function (data) {
  const currentTime = Date.now();
  const elapsedMinutes = (currentTime - data.startTime) / (1000 * 60);

  // Different behavior during spike periods
  if (isSpikeTime(elapsedMinutes)) {
    // During spike: focus on critical paths
    spikeCriticalPath(data.baseUrl);
  } else {
    // Normal time: regular user journey
    normalUserJourney(data.baseUrl);
  }

  // Minimal sleep during spikes
  const sleepTime = isSpikeTime(elapsedMinutes) ? Math.random() * 0.5 : Math.random() * 2;
  sleep(sleepTime);
}

function isSpikeTime(elapsedMinutes) {
  // Spike periods: 1.5-4.5 minutes and 7-8 minutes
  return (
    (elapsedMinutes >= 1.5 && elapsedMinutes <= 4.5) || (elapsedMinutes >= 7 && elapsedMinutes <= 8)
  );
}

function spikeCriticalPath(baseUrl) {
  // During spikes, focus on the most critical user paths
  const criticalPaths = [
    () => testHomepageSpike(baseUrl),
    () => testAuthenticationSpike(baseUrl),
    () => testDashboardSpike(baseUrl),
    () => testAPIHealthSpike(baseUrl),
  ];

  // Execute one random critical path
  const randomPath = criticalPaths[Math.floor(Math.random() * criticalPaths.length)];
  randomPath();
}

function normalUserJourney(baseUrl) {
  // Normal user journey during non-spike periods
  testHomepage(baseUrl);
  sleep(0.5);

  if (Math.random() < 0.7) {
    testAuthentication(baseUrl);
    sleep(0.5);

    testDashboard(baseUrl);
    sleep(0.5);

    if (Math.random() < 0.5) {
      testTrackers(baseUrl);
    } else {
      testGames(baseUrl);
    }
  }
}

function testHomepageSpike(baseUrl) {
  const startTime = Date.now();
  const response = http.get(`${baseUrl}/`);
  const endTime = Date.now();

  const success = check(response, {
    'Homepage spike test': r => r.status === 200,
    'Homepage spike < 8s': r => r.timings.duration < 8000,
  });

  errorRate.add(!success);
  responseTime.add(response.timings.duration);
  requestCount.add(1);

  // Track spike recovery
  if (response.timings.duration > 2000) {
    spikeRecoveryTime.add(endTime - startTime);
  }
}

function testAuthenticationSpike(baseUrl) {
  const loginPayload = JSON.stringify({
    email: `spike-test-${Math.floor(Math.random() * 10000)}@example.com`,
    password: 'password123',
  });

  const loginParams = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const startTime = Date.now();
  const response = http.post(`${baseUrl}/api/auth/login`, loginPayload, loginParams);
  const endTime = Date.now();

  const success = check(response, {
    'Auth spike test': r => r.status < 500,
    'Auth spike < 5s': r => r.timings.duration < 5000,
  });

  errorRate.add(!success);
  responseTime.add(response.timings.duration);
  requestCount.add(1);

  if (response.timings.duration > 3000) {
    spikeRecoveryTime.add(endTime - startTime);
  }
}

function testDashboardSpike(baseUrl) {
  const startTime = Date.now();
  const response = http.get(`${baseUrl}/dashboard`);
  const endTime = Date.now();

  const success = check(response, {
    'Dashboard spike test': r => r.status < 500,
    'Dashboard spike < 8s': r => r.timings.duration < 8000,
  });

  errorRate.add(!success);
  responseTime.add(response.timings.duration);
  requestCount.add(1);

  if (response.timings.duration > 3000) {
    spikeRecoveryTime.add(endTime - startTime);
  }
}

function testAPIHealthSpike(baseUrl) {
  const startTime = Date.now();
  const response = http.get(`${baseUrl}/api/health`);
  const endTime = Date.now();

  const success = check(response, {
    'API health spike test': r => r.status === 200,
    'API health spike < 3s': r => r.timings.duration < 3000,
  });

  errorRate.add(!success);
  responseTime.add(response.timings.duration);
  requestCount.add(1);

  if (response.timings.duration > 1000) {
    spikeRecoveryTime.add(endTime - startTime);
  }
}

function testHomepage(baseUrl) {
  const response = http.get(`${baseUrl}/`);

  const success = check(response, {
    'Homepage normal': r => r.status === 200,
    'Homepage normal < 2s': r => r.timings.duration < 2000,
  });

  errorRate.add(!success);
  responseTime.add(response.timings.duration);
  requestCount.add(1);
}

function testAuthentication(baseUrl) {
  const response = http.get(`${baseUrl}/auth/login`);

  const success = check(response, {
    'Auth page normal': r => r.status === 200,
    'Auth page normal < 2s': r => r.timings.duration < 2000,
  });

  errorRate.add(!success);
  responseTime.add(response.timings.duration);
  requestCount.add(1);
}

function testDashboard(baseUrl) {
  const response = http.get(`${baseUrl}/dashboard`);

  const success = check(response, {
    'Dashboard normal': r => r.status === 200 || r.status === 302,
    'Dashboard normal < 2s': r => r.timings.duration < 2000,
  });

  errorRate.add(!success);
  responseTime.add(response.timings.duration);
  requestCount.add(1);
}

function testTrackers(baseUrl) {
  const trackerPages = ['/trackers/carbon', '/trackers/mental-health'];
  const randomPage = trackerPages[Math.floor(Math.random() * trackerPages.length)];

  const response = http.get(`${baseUrl}${randomPage}`);

  const success = check(response, {
    [`${randomPage} normal`]: r => r.status === 200 || r.status === 302,
    [`${randomPage} normal < 2s`]: r => r.timings.duration < 2000,
  });

  errorRate.add(!success);
  responseTime.add(response.timings.duration);
  requestCount.add(1);
}

function testGames(baseUrl) {
  const gamePages = ['/games', '/games/quiz'];
  const randomPage = gamePages[Math.floor(Math.random() * gamePages.length)];

  const response = http.get(`${baseUrl}${randomPage}`);

  const success = check(response, {
    [`${randomPage} normal`]: r => r.status === 200 || r.status === 302,
    [`${randomPage} normal < 2s`]: r => r.timings.duration < 2000,
  });

  errorRate.add(!success);
  responseTime.add(response.timings.duration);
  requestCount.add(1);
}

// Spike-specific scenarios
function testConcurrentSpike(baseUrl) {
  // Simulate multiple concurrent requests during spike
  const requests = [
    { method: 'GET', url: `${baseUrl}/` },
    { method: 'GET', url: `${baseUrl}/dashboard` },
    { method: 'GET', url: `${baseUrl}/api/health` },
  ];

  const responses = http.batch(requests);

  responses.forEach((response, index) => {
    const success = check(response, {
      [`Concurrent spike ${index}`]: r => r.status < 500,
      [`Concurrent spike ${index} < 10s`]: r => r.timings.duration < 10000,
    });

    errorRate.add(!success);
    responseTime.add(response.timings.duration);
    requestCount.add(1);
  });
}

function testResourceIntensiveSpike(baseUrl) {
  // Test resource-intensive operations during spike
  const heavyOperations = [
    `${baseUrl}/api/reports/generate`,
    `${baseUrl}/api/analytics/dashboard`,
    `${baseUrl}/api/export/data`,
  ];

  const randomOperation = heavyOperations[Math.floor(Math.random() * heavyOperations.length)];

  const startTime = Date.now();
  const response = http.get(randomOperation);
  const endTime = Date.now();

  const success = check(response, {
    'Heavy operation spike': r => r.status < 500,
    'Heavy operation spike < 15s': r => r.timings.duration < 15000,
  });

  errorRate.add(!success);
  responseTime.add(response.timings.duration);
  requestCount.add(1);

  if (response.timings.duration > 5000) {
    spikeRecoveryTime.add(endTime - startTime);
  }
}

export function teardown(data) {
  console.log('Spike test completed');
  console.log(`Total requests: ${requestCount.count}`);
  console.log(`Error rate: ${(errorRate.rate * 100).toFixed(2)}%`);
  console.log(`Average response time: ${responseTime.avg.toFixed(2)}ms`);
  console.log(`95th percentile response time: ${responseTime.p95.toFixed(2)}ms`);

  if (spikeRecoveryTime.count > 0) {
    console.log(`Average spike recovery time: ${spikeRecoveryTime.avg.toFixed(2)}ms`);
  }

  // Spike test analysis
  if (errorRate.rate > 0.2) {
    console.log(
      '⚠️  High error rate during spike test - system may not handle traffic spikes well'
    );
  }

  if (responseTime.p95 > 10000) {
    console.log('⚠️  Very high response times during spike test - consider scaling strategies');
  }

  if (spikeRecoveryTime.avg > 5000) {
    console.log('⚠️  Slow recovery from spikes - consider auto-scaling and caching improvements');
  }

  console.log('Spike test analysis complete');
}
