import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = { 
  vus: 50,
  duration: '1m',
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.01']    // Less than 1% of requests should fail
  }
};

export default function earnCoinsStressTest() {
  const payload = JSON.stringify({
    userId: `user-${__VU}-${__ITER}`,
    activityId: 'eco-challenge',
    coinsEarned: 5
  });
  
  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  const response = http.post('http://localhost:3000/api/wallet/earn', payload, params);
  
  check(response, {
    'status is 200': (r) => r.status === 200,
    'transaction recorded': (r) => r.json().success === true,
  });
  
  sleep(1);
}