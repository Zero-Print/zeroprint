import { test, expect } from '@playwright/test';

// Visual regression tests for game components
test.describe('Game Components Visual Regression', () => {
  // Quiz Game UI
  test('QuizGameUI visual regression', async ({ page }) => {
    await page.goto('/games/play/eco-quiz');
    await page.waitForSelector('[data-testid="quiz-question"]');
    await expect(page).toHaveScreenshot('quiz-game-ui.png');
  });

  // Drag and Drop Game UI
  test('DragDropGameUI visual regression', async ({ page }) => {
    await page.goto('/games/play/bin-sorter-master');
    await page.waitForSelector('[data-testid="drag-drop-area"]');
    await expect(page).toHaveScreenshot('dragdrop-game-ui.png');
  });

  // Memory Game UI
  test('MemoryGameUI visual regression', async ({ page }) => {
    await page.goto('/games/play/energy-memory-match');
    await page.waitForSelector('[data-testid="memory-game-board"]');
    await expect(page).toHaveScreenshot('memory-game-ui.png');
  });

  // Puzzle Game UI
  test('PuzzleGameUI visual regression', async ({ page }) => {
    await page.goto('/games/play/climate-puzzle');
    await page.waitForSelector('[data-testid="puzzle-game-board"]');
    await expect(page).toHaveScreenshot('puzzle-game-ui.png');
  });

  // Simulation Game UI
  test('SimulationGameUI visual regression', async ({ page }) => {
    await page.goto('/games/play/carbon-footprint-calculator');
    await page.waitForSelector('[data-testid="simulation-controls"]');
    await expect(page).toHaveScreenshot('simulation-game-ui.png');
  });

  // Game completion state
  test('Game completion UI visual regression', async ({ page }) => {
    // Navigate to a quick game
    await page.goto('/games/play/eco-quiz');
    
    // Complete the game (simplified for test)
    await page.waitForSelector('[data-testid="quiz-question"]');
    
    // Select all answers (this is a simplified approach)
    const answerButtons = await page.$$('[data-testid="answer-option"]');
    if (answerButtons.length > 0) {
      await answerButtons[0].click();
    }
    
    // Wait for completion screen
    await page.waitForSelector('[data-testid="game-completion"]', { timeout: 10000 });
    
    // Take screenshot of completion state
    await expect(page).toHaveScreenshot('game-completion-ui.png');
  });

  // Game components in different viewport sizes
  test('Game components responsive design', async ({ page }) => {
    // Test on mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/games/play/eco-quiz');
    await page.waitForSelector('[data-testid="quiz-question"]');
    await expect(page).toHaveScreenshot('quiz-game-mobile.png');
    
    // Test on tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/games/play/bin-sorter-master');
    await page.waitForSelector('[data-testid="drag-drop-area"]');
    await expect(page).toHaveScreenshot('dragdrop-game-tablet.png');
  });

  // Dark mode testing for game components
  test('Game components in dark mode', async ({ page }) => {
    // Enable dark mode
    await page.goto('/settings');
    await page.waitForSelector('[data-testid="theme-toggle"]');
    await page.click('[data-testid="theme-toggle"]');
    
    // Test a game in dark mode
    await page.goto('/games/play/eco-quiz');
    await page.waitForSelector('[data-testid="quiz-question"]');
    await expect(page).toHaveScreenshot('quiz-game-dark-mode.png');
  });
});