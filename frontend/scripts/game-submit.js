import http from 'k6/http';
import { check } from 'k6';

export const options = { vus: 10, duration: '30s' };

export default function submitGame() {
  const response = http.post('http://localhost:3000/api/games/submit', {
    gameId: 'test-game',
    score: 100,
    userId: 'test-user'
  });
  check(response, { 'status is 200': (r) => r.status === 200 });
}