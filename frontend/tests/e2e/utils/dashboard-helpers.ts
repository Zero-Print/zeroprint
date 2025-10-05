/**
 * Dashboard E2E Test Utilities
 * Helper functions for testing dashboard functionality
 */

import { Page, expect } from '@playwright/test';

// ============================================================================
// AUTHENTICATION HELPERS
// ============================================================================

export async function loginAsUser(page: Page, userType: 'admin' | 'user' | 'organization' = 'user') {
  const credentials = {
    admin: { email: 'admin@test.com', password: 'testpassword123' },
    user: { email: 'citizen@test.com', password: 'testpassword123' },
    organization: { email: 'school@test.com', password: 'testpassword123' }
  };

  const { email, password } = credentials[userType];

  await page.goto('/auth/login');
  await page.fill('[data-testid="email-input"]', email);
  await page.fill('[data-testid="password-input"]', password);
  await page.click('[data-testid="login-submit-button"]');
  
  // Wait for dashboard to load
  await expect(page.locator('[data-testid="dashboard"]')).toBeVisible();
}

export async function logout(page: Page) {
  await page.click('[data-testid="user-menu"]');
  await page.click('[data-testid="logout-button"]');
  await expect(page.locator('[data-testid="login-form"]')).toBeVisible();
}

// ============================================================================
// LEADERBOARD HELPERS
// ============================================================================

export interface LeaderboardFilters {
  entityType?: 'individual' | 'organization' | 'community';
  scope?: 'global' | 'local' | 'organization' | 'personal';
  category?: 'carbon' | 'mental_health' | 'animal_welfare' | 'unified';
  timeframe?: 'day' | 'week' | 'month' | 'quarter' | 'year' | 'all_time';
}

export async function applyLeaderboardFilters(page: Page, filters: LeaderboardFilters) {
  if (filters.entityType) {
    await page.selectOption('[data-testid="entity-type-filter"]', filters.entityType);
  }
  if (filters.scope) {
    await page.selectOption('[data-testid="scope-filter"]', filters.scope);
  }
  if (filters.category) {
    await page.selectOption('[data-testid="category-filter"]', filters.category);
  }
  if (filters.timeframe) {
    await page.selectOption('[data-testid="timeframe-filter"]', filters.timeframe);
  }
  
  await page.click('[data-testid="apply-filters-button"]');
  
  // Wait for results to load
  await expect(page.locator('[data-testid="leaderboard-entries"]')).toBeVisible();
}

export async function waitForLeaderboardLoad(page: Page) {
  await expect(page.locator('[data-testid="leaderboard-loading"]')).not.toBeVisible();
  await expect(page.locator('[data-testid="leaderboard-entries"]')).toBeVisible();
}

export async function getLeaderboardEntryCount(page: Page): Promise<number> {
  await waitForLeaderboardLoad(page);
  const entries = await page.locator('[data-testid="leaderboard-entry"]').count();
  return entries;
}

export async function searchLeaderboard(page: Page, query: string) {
  await page.fill('[data-testid="leaderboard-search"]', query);
  await page.keyboard.press('Enter');
  await waitForLeaderboardLoad(page);
}

export async function sortLeaderboard(page: Page, sortBy: 'score' | 'name' | 'rank') {
  await page.click(`[data-testid="sort-by-${sortBy}"]`);
  await waitForLeaderboardLoad(page);
}

// ============================================================================
// REAL-TIME HELPERS
// ============================================================================

export async function checkRealtimeStatus(page: Page) {
  const liveIndicator = page.locator('[data-testid="live-indicator"]');
  await expect(liveIndicator).toBeVisible();
  
  const isLive = await liveIndicator.evaluate(el => 
    el.classList.contains('bg-green-500')
  );
  
  return isLive;
}

export async function waitForOptimisticUpdate(page: Page) {
  // Wait for optimistic indicator to appear
  await expect(page.locator('[data-testid="optimistic-indicator"]')).toBeVisible();
  
  // Wait for it to disappear (update resolved)
  await expect(page.locator('[data-testid="optimistic-indicator"]')).not.toBeVisible();
}

export async function triggerManualRefresh(page: Page) {
  await page.click('[data-testid="refresh-button"]');
  
  // Wait for loading state
  await expect(page.locator('[data-testid="refresh-button"] svg')).toHaveClass(/animate-spin/);
  
  // Wait for completion
  await expect(page.locator('[data-testid="refresh-button"] svg')).not.toHaveClass(/animate-spin/);
}

// ============================================================================
// EXPORT HELPERS
// ============================================================================

export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv';
  includeCharts?: boolean;
  includeSummary?: boolean;
  includeFormulas?: boolean;
  includePivotTables?: boolean;
}

export async function exportLeaderboard(page: Page, options: ExportOptions) {
  const downloadPromise = page.waitForEvent('download');
  
  // Click appropriate export button
  await page.click(`[data-testid="export-${options.format}-button"]`);
  
  // Wait for export modal
  await expect(page.locator('[data-testid="export-modal"]')).toBeVisible();
  
  // Configure options
  if (options.includeCharts) {
    await page.check('[data-testid="include-charts"]');
  }
  if (options.includeSummary) {
    await page.check('[data-testid="include-summary"]');
  }
  if (options.includeFormulas) {
    await page.check('[data-testid="include-formulas"]');
  }
  if (options.includePivotTables) {
    await page.check('[data-testid="include-pivot-tables"]');
  }
  
  // Start export
  await page.click('[data-testid="start-export-button"]');
  
  // Wait for download
  const download = await downloadPromise;
  
  // Verify export completion
  await expect(page.locator('[data-testid="export-success"]')).toBeVisible();
  
  return download;
}

export async function waitForExportCompletion(page: Page) {
  await expect(page.locator('[data-testid="export-progress"]')).toBeVisible();
  await expect(page.locator('[data-testid="export-success"]')).toBeVisible();
}

// ============================================================================
// TRACKER INTEGRATION HELPERS
// ============================================================================

export async function addTrackerEntry(page: Page, tracker: 'carbon' | 'mental_health' | 'animal_welfare', data: any) {
  await page.click(`[data-testid="quick-add-${tracker}"]`);
  
  switch (tracker) {
    case 'carbon':
      await page.fill('[data-testid="carbon-amount"]', data.amount.toString());
      await page.selectOption('[data-testid="carbon-category"]', data.category);
      break;
    case 'mental_health':
      await page.selectOption('[data-testid="mood-rating"]', data.mood.toString());
      await page.fill('[data-testid="activity-duration"]', data.duration.toString());
      break;
    case 'animal_welfare':
      await page.selectOption('[data-testid="welfare-action"]', data.action);
      await page.fill('[data-testid="impact-score"]', data.impact.toString());
      break;
  }
  
  await page.click('[data-testid="save-entry-button"]');
  
  // Wait for success confirmation
  await expect(page.locator('[data-testid="entry-saved-success"]')).toBeVisible();
}

export async function navigateToTrackerDashboard(page: Page, tracker: 'carbon' | 'mental_health' | 'animal_welfare' | 'unified') {
  if (tracker === 'unified') {
    await page.click('[data-testid="unified-dashboard-link"]');
    await expect(page.locator('[data-testid="unified-dashboard"]')).toBeVisible();
  } else {
    await page.click(`[data-testid="${tracker}-tracker-link"]`);
    await expect(page.locator(`[data-testid="${tracker}-tracker-dashboard"]`)).toBeVisible();
  }
}

export async function checkCrossTrackerSync(page: Page) {
  // Get initial unified score
  const initialScore = await page.locator('[data-testid="total-impact-score"]').textContent();
  
  // Add an entry to any tracker
  await addTrackerEntry(page, 'carbon', { amount: 50, category: 'transportation' });
  
  // Check if unified score updated
  await expect(page.locator('[data-testid="total-impact-score"]')).not.toHaveText(initialScore || '');
  
  return true;
}

// ============================================================================
// PERFORMANCE HELPERS
// ============================================================================

export async function measurePageLoadTime(page: Page, url: string): Promise<number> {
  const startTime = Date.now();
  await page.goto(url);
  await expect(page.locator('[data-testid="dashboard"]')).toBeVisible();
  return Date.now() - startTime;
}

export async function measureRenderTime(page: Page, action: () => Promise<void>): Promise<number> {
  const startTime = Date.now();
  await action();
  return Date.now() - startTime;
}

export async function checkMobileResponsiveness(page: Page) {
  // Set mobile viewport
  await page.setViewportSize({ width: 375, height: 667 });
  
  // Check mobile-specific elements
  await expect(page.locator('[data-testid="mobile-dashboard"]')).toBeVisible();
  await expect(page.locator('[data-testid="mobile-navigation"]')).toBeVisible();
  
  // Reset to desktop
  await page.setViewportSize({ width: 1280, height: 720 });
}

// ============================================================================
// ERROR HANDLING HELPERS
// ============================================================================

export async function simulateNetworkFailure(page: Page, endpoint: string) {
  await page.route(`**${endpoint}**`, route => route.abort());
}

export async function restoreNetworkConnection(page: Page, endpoint: string) {
  await page.unroute(`**${endpoint}**`);
}

export async function checkErrorState(page: Page) {
  await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
}

export async function checkEmptyState(page: Page) {
  await expect(page.locator('[data-testid="empty-state"]')).toBeVisible();
  await expect(page.locator('[data-testid="empty-state-action"]')).toBeVisible();
}

export async function mockEmptyResponse(page: Page, endpoint: string) {
  await page.route(`**${endpoint}**`, route => 
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: { entries: [] }, metadata: { total: 0 } })
    })
  );
}

// ============================================================================
// ACCESSIBILITY HELPERS
// ============================================================================

export async function checkKeyboardNavigation(page: Page) {
  // Start from first focusable element
  await page.keyboard.press('Tab');
  const firstFocus = await page.locator(':focus').getAttribute('data-testid');
  
  // Navigate through several elements
  for (let i = 0; i < 10; i++) {
    await page.keyboard.press('Tab');
    const currentFocus = page.locator(':focus');
    await expect(currentFocus).toBeVisible();
  }
  
  return firstFocus;
}

export async function checkAriaLabels(page: Page) {
  // Check required ARIA attributes
  await expect(page.locator('[data-testid="leaderboard-table"]')).toHaveAttribute('role', 'table');
  await expect(page.locator('[data-testid="filter-section"]')).toHaveAttribute('role', 'region');
  await expect(page.locator('[data-testid="export-button"]')).toHaveAttribute('aria-label');
}

export async function checkScreenReaderAnnouncements(page: Page) {
  // Trigger an action that should announce
  await page.click('[data-testid="refresh-button"]');
  
  // Check for live region updates
  await expect(page.locator('[aria-live="polite"]')).toContainText('Refreshing');
}

export async function enableHighContrastMode(page: Page) {
  await page.emulateMedia({ colorScheme: 'dark', forcedColors: 'active' });
}

// ============================================================================
// DATA VALIDATION HELPERS
// ============================================================================

export async function validateLeaderboardEntry(page: Page, index: number, expectedData: any) {
  const entry = page.locator(`[data-testid="leaderboard-entry"]:nth-child(${index + 1})`);
  
  if (expectedData.name) {
    await expect(entry.locator('[data-testid="entry-name"]')).toContainText(expectedData.name);
  }
  if (expectedData.score) {
    await expect(entry.locator('[data-testid="entry-score"]')).toContainText(expectedData.score.toString());
  }
  if (expectedData.rank) {
    await expect(entry.locator('[data-testid="entry-rank"]')).toContainText(expectedData.rank.toString());
  }
}

export async function validateFilterState(page: Page, expectedFilters: LeaderboardFilters) {
  if (expectedFilters.entityType) {
    await expect(page.locator('[data-testid="entity-type-filter"]')).toHaveValue(expectedFilters.entityType);
  }
  if (expectedFilters.scope) {
    await expect(page.locator('[data-testid="scope-filter"]')).toHaveValue(expectedFilters.scope);
  }
  if (expectedFilters.category) {
    await expect(page.locator('[data-testid="category-filter"]')).toHaveValue(expectedFilters.category);
  }
  if (expectedFilters.timeframe) {
    await expect(page.locator('[data-testid="timeframe-filter"]')).toHaveValue(expectedFilters.timeframe);
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export async function waitForStableState(page: Page, timeout: number = 5000) {
  // Wait for any loading indicators to disappear
  await expect(page.locator('[data-testid*="loading"]')).not.toBeVisible({ timeout });
  
  // Wait for any animations to complete
  await page.waitForTimeout(500);
}

export async function takeScreenshotOnFailure(page: Page, testName: string) {
  const screenshot = await page.screenshot({ fullPage: true });
  return screenshot;
}

export function generateTestData(type: 'leaderboard' | 'tracker' | 'export') {
  const baseData = {
    leaderboard: {
      entries: Array.from({ length: 10 }, (_, i) => ({
        id: `user_${i + 1}`,
        name: `Test User ${i + 1}`,
        score: Math.floor(Math.random() * 1000) + 100,
        rank: i + 1,
        category: ['carbon', 'mental_health', 'animal_welfare'][i % 3]
      }))
    },
    tracker: {
      carbon: { amount: 50, category: 'transportation' },
      mental_health: { mood: 8, duration: 30 },
      animal_welfare: { action: 'volunteer', impact: 75 }
    },
    export: {
      filename: `test_export_${Date.now()}`,
      format: 'pdf',
      options: { includeCharts: true, includeSummary: true }
    }
  };
  
  return baseData[type];
}