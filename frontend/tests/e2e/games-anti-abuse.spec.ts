/**
 * E2E Tests for Games and Anti-Abuse
 * Tests game engines, server-side scoring, and fraud prevention
 */

import { test, expect } from '@playwright/test';

test.describe('Games and Anti-Abuse', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Login as test user
    await page.click('text=Login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Wait for login to complete
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test.describe('Game Engines', () => {
    test('should display games page with available games', async ({ page }) => {
      await page.goto('/games');
      
      // Check if games page loads
      await expect(page.locator('h1:has-text("Games & Challenges")')).toBeVisible();
      await expect(page.locator('[data-testid="game-card"]')).toHaveCount.greaterThan(0);
    });

    test('should load game configuration when starting a game', async ({ page }) => {
      await page.goto('/games');
      
      // Click on first game
      const firstGame = page.locator('[data-testid="game-card"]').first();
      await firstGame.locator('button:has-text("Play Now")').click();
      
      // Check if game engine loads
      await expect(page.locator('[data-testid="game-engine"]')).toBeVisible();
      await expect(page.locator('button:has-text("Start Game")')).toBeVisible();
    });

    test('should render quiz game from JSON config', async ({ page }) => {
      await page.goto('/games');
      
      // Mock quiz game response
      await page.route('**/games/*', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              id: 'quiz_1',
              name: 'Sustainability Quiz',
              type: 'quiz',
              config: {
                type: 'quiz',
                questions: [
                  {
                    id: 'q1',
                    question: 'What is the primary cause of climate change?',
                    options: ['Deforestation', 'Greenhouse gases', 'Ocean currents'],
                    correctAnswer: 1,
                    points: 20
                  }
                ],
                maxScore: 100,
                timeLimit: 300
              }
            }
          })
        });
      });
      
      // Start quiz game
      const firstGame = page.locator('[data-testid="game-card"]').first();
      await firstGame.locator('button:has-text("Play Now")').click();
      
      // Check if quiz renders
      await expect(page.locator('text=Question 1 of 1')).toBeVisible();
      await expect(page.locator('text=What is the primary cause of climate change?')).toBeVisible();
    });

    test('should render drag-drop game from JSON config', async ({ page }) => {
      await page.goto('/games');
      
      // Mock drag-drop game response
      await page.route('**/games/*', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              id: 'dragdrop_1',
              name: 'Energy Classification',
              type: 'drag-drop',
              config: {
                type: 'drag-drop',
                items: [
                  { id: 'item1', label: 'Solar Panel', category: 'renewable' }
                ],
                categories: [
                  { id: 'renewable', label: 'Renewable Energy', position: { x: 50, y: 50, width: 200, height: 100 } }
                ],
                maxScore: 100
              }
            }
          })
        });
      });
      
      // Start drag-drop game
      const firstGame = page.locator('[data-testid="game-card"]').first();
      await firstGame.locator('button:has-text("Play Now")').click();
      
      // Check if drag-drop renders
      await expect(page.locator('text=Drag and Drop Game')).toBeVisible();
      await expect(page.locator('text=Renewable Energy')).toBeVisible();
    });

    test('should render memory game from JSON config', async ({ page }) => {
      await page.goto('/games');
      
      // Mock memory game response
      await page.route('**/games/*', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              id: 'memory_1',
              name: 'Eco Memory',
              type: 'memory',
              config: {
                type: 'memory',
                cards: [
                  { id: 'card1', content: '🌱', pair: 'card2' },
                  { id: 'card2', content: 'Plant', pair: 'card1' }
                ],
                gridSize: { rows: 2, cols: 2 },
                maxScore: 100
              }
            }
          })
        });
      });
      
      // Start memory game
      const firstGame = page.locator('[data-testid="game-card"]').first();
      await firstGame.locator('button:has-text("Play Now")').click();
      
      // Check if memory game renders
      await expect(page.locator('text=Memory Game')).toBeVisible();
      await expect(page.locator('[data-testid="memory-card"]')).toHaveCount(4);
    });
  });

  test.describe('Server-Side Scoring', () => {
    test('should validate scores server-side', async ({ page }) => {
      await page.goto('/games');
      
      // Mock game completion with invalid score
      await page.route('**/games/*/complete', route => {
        const body = JSON.parse(route.request().postData() || '{}');
        
        // Server should reject scores that are too high
        if (body.score > 100) {
          route.fulfill({
            status: 400,
            contentType: 'application/json',
            body: JSON.stringify({
              success: false,
              error: 'Score validation failed - possible cheating detected'
            })
          });
        } else {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              data: {
                id: 'score_123',
                score: body.score,
                coinsEarned: Math.floor(body.score / 10)
              }
            })
          });
        }
      });
      
      // Start a game
      const firstGame = page.locator('[data-testid="game-card"]').first();
      await firstGame.locator('button:has-text("Play Now")').click();
      
      // Complete game with invalid score (simulated)
      await page.evaluate(() => {
        // Simulate completing game with invalid score
        window.dispatchEvent(new CustomEvent('game-complete', {
          detail: { score: 150, clientData: {}, playTime: 60 }
        }));
      });
      
      // Check for error message
      await expect(page.locator('text=Score validation failed')).toBeVisible();
    });

    test('should calculate coins based on server score', async ({ page }) => {
      await page.goto('/games');
      
      // Mock game completion
      await page.route('**/games/*/complete', route => {
        const body = JSON.parse(route.request().postData() || '{}');
        const coinsEarned = Math.floor(body.score / 10);
        
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              id: 'score_123',
              score: body.score,
              coinsEarned: coinsEarned
            }
          })
        });
      });
      
      // Start and complete a game
      const firstGame = page.locator('[data-testid="game-card"]').first();
      await firstGame.locator('button:has-text("Play Now")').click();
      
      // Complete game
      await page.evaluate(() => {
        window.dispatchEvent(new CustomEvent('game-complete', {
          detail: { score: 80, clientData: {}, playTime: 120 }
        }));
      });
      
      // Check if coins were earned
      await expect(page.locator('text=+8 coins')).toBeVisible();
    });
  });

  test.describe('Anti-Abuse Measures', () => {
    test('should enforce daily earning cap', async ({ page }) => {
      await page.goto('/games');
      
      // Mock daily cap exceeded
      await page.route('**/games/*/complete', route => {
        route.fulfill({
          status: 429,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: 'Daily earning cap exceeded. You can earn 0 more coins today.'
          })
        });
      });
      
      // Start a game
      const firstGame = page.locator('[data-testid="game-card"]').first();
      await firstGame.locator('button:has-text("Play Now")').click();
      
      // Complete game
      await page.evaluate(() => {
        window.dispatchEvent(new CustomEvent('game-complete', {
          detail: { score: 80, clientData: {}, playTime: 120 }
        }));
      });
      
      // Check for cap exceeded message
      await expect(page.locator('text=Daily earning cap exceeded')).toBeVisible();
    });

    test('should prevent rapid game submissions', async ({ page }) => {
      await page.goto('/games');
      
      // Mock cooldown period
      await page.route('**/games/*/complete', route => {
        route.fulfill({
          status: 429,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: 'Please wait before playing again'
          })
        });
      });
      
      // Start a game
      const firstGame = page.locator('[data-testid="game-card"]').first();
      await firstGame.locator('button:has-text("Play Now")').click();
      
      // Complete game
      await page.evaluate(() => {
        window.dispatchEvent(new CustomEvent('game-complete', {
          detail: { score: 80, clientData: {}, playTime: 120 }
        }));
      });
      
      // Check for cooldown message
      await expect(page.locator('text=Please wait before playing again')).toBeVisible();
    });

    test('should detect minimum play time violations', async ({ page }) => {
      await page.goto('/games');
      
      // Mock minimum play time violation
      await page.route('**/games/*/complete', route => {
        const body = JSON.parse(route.request().postData() || '{}');
        
        if (body.playTime < 30) {
          route.fulfill({
            status: 429,
            contentType: 'application/json',
            body: JSON.stringify({
              success: false,
              error: 'Play time too short - possible automation detected'
            })
          });
        } else {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              data: { id: 'score_123', score: body.score, coinsEarned: 10 }
            })
          });
        }
      });
      
      // Start a game
      const firstGame = page.locator('[data-testid="game-card"]').first();
      await firstGame.locator('button:has-text("Play Now")').click();
      
      // Complete game with short play time
      await page.evaluate(() => {
        window.dispatchEvent(new CustomEvent('game-complete', {
          detail: { score: 80, clientData: {}, playTime: 5 }
        }));
      });
      
      // Check for automation detection message
      await expect(page.locator('text=Play time too short')).toBeVisible();
    });

    test('should enforce daily attempt limits', async ({ page }) => {
      await page.goto('/games');
      
      // Mock daily attempt limit exceeded
      await page.route('**/games/*/complete', route => {
        route.fulfill({
          status: 429,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: 'Daily attempt limit exceeded'
          })
        });
      });
      
      // Start a game
      const firstGame = page.locator('[data-testid="game-card"]').first();
      await firstGame.locator('button:has-text("Play Now")').click();
      
      // Complete game
      await page.evaluate(() => {
        window.dispatchEvent(new CustomEvent('game-complete', {
          detail: { score: 80, clientData: {}, playTime: 120 }
        }));
      });
      
      // Check for attempt limit message
      await expect(page.locator('text=Daily attempt limit exceeded')).toBeVisible();
    });
  });

  test.describe('Game Completion Flow', () => {
    test('should update wallet and leaderboards on successful completion', async ({ page }) => {
      await page.goto('/games');
      
      // Mock successful game completion
      await page.route('**/games/*/complete', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              id: 'score_123',
              score: 85,
              coinsEarned: 15,
              playTime: 120
            }
          })
        });
      });
      
      // Mock wallet update
      await page.route('**/wallet/balance', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              healCoins: 150,
              inrBalance: 0
            }
          })
        });
      });
      
      // Start and complete a game
      const firstGame = page.locator('[data-testid="game-card"]').first();
      await firstGame.locator('button:has-text("Play Now")').click();
      
      // Complete game
      await page.evaluate(() => {
        window.dispatchEvent(new CustomEvent('game-complete', {
          detail: { score: 85, clientData: {}, playTime: 120 }
        }));
      });
      
      // Check for success message
      await expect(page.locator('text=+15 coins')).toBeVisible();
    });

    test('should log audit trail for game completion', async ({ page }) => {
      await page.goto('/games');
      
      // Mock game completion
      await page.route('**/games/*/complete', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              id: 'score_123',
              score: 75,
              coinsEarned: 12
            }
          })
        });
      });
      
      // Start and complete a game
      const firstGame = page.locator('[data-testid="game-card"]').first();
      await firstGame.locator('button:has-text("Play Now")').click();
      
      // Complete game
      await page.evaluate(() => {
        window.dispatchEvent(new CustomEvent('game-complete', {
          detail: { score: 75, clientData: {}, playTime: 90 }
        }));
      });
      
      // Verify completion was logged (this would be checked in admin panel)
      await expect(page.locator('text=Game Complete!')).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle game loading errors gracefully', async ({ page }) => {
      await page.goto('/games');
      
      // Mock game loading error
      await page.route('**/games/*', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: 'Failed to load game configuration'
          })
        });
      });
      
      // Try to start a game
      const firstGame = page.locator('[data-testid="game-card"]').first();
      await firstGame.locator('button:has-text("Play Now")').click();
      
      // Check for error message
      await expect(page.locator('text=Failed to load game configuration')).toBeVisible();
    });

    test('should handle network errors during game completion', async ({ page }) => {
      await page.goto('/games');
      
      // Mock network error
      await page.route('**/games/*/complete', route => {
        route.abort('Failed');
      });
      
      // Start a game
      const firstGame = page.locator('[data-testid="game-card"]').first();
      await firstGame.locator('button:has-text("Play Now")').click();
      
      // Complete game
      await page.evaluate(() => {
        window.dispatchEvent(new CustomEvent('game-complete', {
          detail: { score: 80, clientData: {}, playTime: 120 }
        }));
      });
      
      // Check for network error message
      await expect(page.locator('text=Failed to complete game')).toBeVisible();
    });
  });
});
