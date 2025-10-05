import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter } from 'k6/metrics';

// Custom metrics
const successfulCompletions = new Counter('successful_completions');
const failedCompletions = new Counter('failed_completions');
const coinsAwarded = new Counter('coins_awarded');

export let options = {
  vus: 100,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    http_req_failed: ['rate<0.1'],
    'successful_completions': ['count>500'],
    'coins_awarded': ['count>0']
  }
};

// Helper function to generate random game data
function getRandomGameData() {
  const games = [
    'eco-quiz',
    'waste-sort',
    'carbon-simulator',
    'energy-puzzle',
    'water-conservation'
  ];
  
  const gameId = games[Math.floor(Math.random() * games.length)];
  const score = Math.floor(Math.random() * 100) + 1;
  const completionTime = Math.floor(Math.random() * 180) + 30; // 30-210 seconds
  
  return {
    gameId,
    score,
    maxScore: 100,
    completionTime
  };
}

export default function() {
  // Get auth token (simulated - in real test would use actual auth)
  const authResponse = http.post('http://localhost:3000/api/auth/login', JSON.stringify({
    email: `test${__VU}@example.com`, // Use VU number to create unique users
    password: 'password123'
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
  
  check(authResponse, {
    'login successful': (r) => r.status === 200,
    'has auth token': (r) => JSON.parse(r.body).token !== undefined
  });
  
  if (authResponse.status !== 200) {
    failedCompletions.add(1);
    console.log(`Login failed for VU ${__VU}`);
    return;
  }
  
  const token = JSON.parse(authResponse.body).token;
  
  // Generate random game data
  const payload = getRandomGameData();
  
  // Submit game completion
  const response = http.post('http://localhost:3000/api/games/complete', JSON.stringify(payload), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  
  const success = check(response, {
    'status is 200': (r) => r.status === 200,
    'coins awarded': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.coinsEarned > 0;
      } catch (e) {
        return false;
      }
    }
  });
  
  if (success) {
    successfulCompletions.add(1);
    try {
      const coinsEarned = JSON.parse(response.body).coinsEarned;
      coinsAwarded.add(coinsEarned);
    } catch (e) {
      // Handle parsing error
    }
  } else {
    failedCompletions.add(1);
    console.log(`Game completion failed for VU ${__VU}: ${response.status} ${response.body}`);
  }
  
  // Add random sleep to simulate real user behavior
  sleep(Math.random() * 2 + 1); // 1-3 seconds
}

// Optional setup and teardown functions
export function setup() {
  // Setup code here (runs once before the test)
  console.log('Starting load test for game completion endpoints');
  
  // Could pre-create test users here if needed
  return {};
}

export function teardown(data) {
  // Teardown code here (runs once after the test)
  console.log('Load test completed');
}