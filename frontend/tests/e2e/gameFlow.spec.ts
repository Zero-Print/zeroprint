import { test, expect } from '@playwright/test';

test.describe('Game Flow Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // Verify login was successful
    await expect(page.locator('[data-testid="user-profile"]')).toBeVisible();
  });

  test('Complete game flow: play → earn coins → leaderboard update', async ({ page }) => {
    await page.goto('/games/play/eco-quiz');
    
    // Play game
    await page.click('[data-testid="answer-option-0"]');
    await page.click('[data-testid="submit-answer"]');
    
    // Verify completion
    await expect(page.locator('[data-testid="game-result"]')).toBeVisible();
    await expect(page.locator('[data-testid="coins-earned"]')).toContainText('10');
    
    // Check wallet updated
    await page.goto('/wallet');
    await expect(page.locator('[data-testid="wallet-balance"]')).toContainText('10');
  });

  test('Complete drag-drop game and verify wallet update', async ({ page }) => {
    await page.goto('/games/play/waste-sort');
    
    // Play drag-drop game
    const dragItem = page.locator('[data-testid="drag-item-0"]');
    const dropTarget = page.locator('[data-testid="drop-target-recycle"]');
    
    await dragItem.dragTo(dropTarget);
    await page.click('[data-testid="check-answers"]');
    
    // Verify completion
    await expect(page.locator('[data-testid="game-result"]')).toBeVisible();
    await expect(page.locator('[data-testid="coins-earned"]')).toContainText('15');
    
    // Check wallet updated
    await page.goto('/wallet');
    await expect(page.locator('[data-testid="wallet-balance"]')).toContainText('15');
  });

  test('Complete simulation game and verify leaderboard update', async ({ page }) => {
    await page.goto('/games/play/carbon-simulator');
    
    // Interact with simulation controls
    await page.fill('[data-testid="simulation-input-energy"]', '50');
    await page.fill('[data-testid="simulation-input-transport"]', '30');
    await page.click('[data-testid="run-simulation"]');
    
    // Submit results
    await page.click('[data-testid="submit-simulation"]');
    
    // Verify completion
    await expect(page.locator('[data-testid="game-result"]')).toBeVisible();
    await expect(page.locator('[data-testid="coins-earned"]')).toContainText('20');
    
    // Check leaderboard updated
    await page.goto('/leaderboard');
    await expect(page.locator('[data-testid="leaderboard-entry"]:has-text("test@example.com")')).toBeVisible();
  });

  test('Verify daily limit enforcement', async ({ page }) => {
    // Play the same game multiple times to hit daily limit
    for (let i = 0; i < 5; i++) {
      await page.goto('/games/play/eco-quiz');
      
      // Play game
      await page.click('[data-testid="answer-option-0"]');
      await page.click('[data-testid="submit-answer"]');
      
      // Verify completion
      await expect(page.locator('[data-testid="game-result"]')).toBeVisible();
    }
    
    // Try one more time - should see limit message
    await page.goto('/games/play/eco-quiz');
    await page.click('[data-testid="answer-option-0"]');
    await page.click('[data-testid="submit-answer"]');
    
    // Verify limit message
    await expect(page.locator('[data-testid="daily-limit-message"]')).toBeVisible();
  });

  test('Verify game history tracking', async ({ page }) => {
    // Play a game
    await page.goto('/games/play/eco-quiz');
    await page.click('[data-testid="answer-option-0"]');
    await page.click('[data-testid="submit-answer"]');
    
    // Check game history
    await page.goto('/profile/game-history');
    await expect(page.locator('[data-testid="game-history-item"]:has-text("eco-quiz")')).toBeVisible();
    await expect(page.locator('[data-testid="game-history-score"]')).toBeVisible();
  });
});