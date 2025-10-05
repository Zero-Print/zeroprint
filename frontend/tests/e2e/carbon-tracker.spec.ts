import { test, expect } from '@playwright/test';
import { setupResilientTest } from './utils/resilient-navigation';

test.describe('Carbon Tracker E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Set longer timeout for navigation
    test.setTimeout(60000);
    
    // Use resilient navigation setup
    await setupResilientTest(page, '/dashboard/carbon-tracker');
  });

  test('should display carbon tracker dashboard', async ({ page }) => {
    // Check main heading
    await expect(page.getByRole('heading', { name: /carbon footprint tracker/i })).toBeVisible();

    // Check statistics cards
    await expect(page.getByText(/total emissions/i)).toBeVisible();
    await expect(page.getByText(/this month/i)).toBeVisible();

    // Check add entry button
    await expect(page.getByRole('button', { name: /add entry/i })).toBeVisible();
  });

  test('should add a new carbon entry', async ({ page }) => {
    // Click add entry button
    await page.getByRole('button', { name: /add entry/i }).click();

    // Wait for modal to open
    await expect(page.getByText(/add carbon entry/i)).toBeVisible();

    // Fill out the form
    await page.getByLabel(/activity type/i).selectOption('transportation');
    await page.getByLabel(/amount/i).fill('15.5');
    await page.getByLabel(/unit/i).selectOption('km');
    await page.getByLabel(/description/i).fill('Bus commute to work');

    // Submit the form
    await page.getByRole('button', { name: /save entry/i }).click();

    // Wait for modal to close
    await expect(page.getByText(/add carbon entry/i)).not.toBeVisible();

    // Verify the entry appears in the list
    await expect(page.getByText(/bus commute to work/i)).toBeVisible();
    await expect(page.getByText(/15.5/)).toBeVisible();
  });

  test('should validate form inputs', async ({ page }) => {
    // Click add entry button
    await page.getByRole('button', { name: /add entry/i }).click();

    // Try to submit without filling required fields
    await page.getByRole('button', { name: /save entry/i }).click();

    // Check for validation errors
    await expect(page.getByText(/activity type is required/i)).toBeVisible();
    await expect(page.getByText(/amount is required/i)).toBeVisible();
  });

  test('should filter entries by activity type', async ({ page }) => {
    // Wait for entries to load
    await page.waitForSelector('[data-testid="carbon-entries-list"]');

    // Use filter dropdown
    await page.getByLabel(/filter by activity/i).selectOption('transportation');

    // Wait for filter to apply
    await page.waitForTimeout(500);

    // Check that only transportation entries are visible
    const entries = page.locator('[data-testid="carbon-entry"]');
    await expect(entries).toHaveCount(await entries.count());

    // Verify all visible entries are transportation
    const transportationEntries = entries.filter({ hasText: /transportation/i });
    await expect(transportationEntries).toHaveCount(await entries.count());
  });

  test('should delete a carbon entry', async ({ page }) => {
    // Wait for entries to load
    await page.waitForSelector('[data-testid="carbon-entries-list"]');

    // Get initial entry count
    const initialCount = await page.locator('[data-testid="carbon-entry"]').count();

    // Click delete button on first entry
    await page
      .locator('[data-testid="carbon-entry"]')
      .first()
      .getByRole('button', { name: /delete/i })
      .click();

    // Confirm deletion
    await expect(page.getByText(/confirm deletion/i)).toBeVisible();
    await page.getByRole('button', { name: /confirm/i }).click();

    // Wait for deletion to complete
    await page.waitForTimeout(1000);

    // Verify entry count decreased
    const newCount = await page.locator('[data-testid="carbon-entry"]').count();
    expect(newCount).toBe(initialCount - 1);
  });

  test('should display carbon statistics correctly', async ({ page }) => {
    // Check statistics are displayed
    await expect(page.getByTestId('total-emissions')).toBeVisible();
    await expect(page.getByTestId('monthly-emissions')).toBeVisible();
    await expect(page.getByTestId('emissions-trend')).toBeVisible();

    // Verify statistics have numeric values
    const totalEmissions = await page.getByTestId('total-emissions').textContent();
    expect(totalEmissions).toMatch(/\d+(\.\d+)?\s*kg\s*co2/i);
  });

  test('should export carbon data', async ({ page }) => {
    // Set up download promise
    const downloadPromise = page.waitForEvent('download');

    // Click export button
    await page.getByRole('button', { name: /export data/i }).click();

    // Wait for download
    const download = await downloadPromise;

    // Verify download
    expect(download.suggestedFilename()).toMatch(/carbon-data.*\.csv/);
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check that mobile layout is applied
    await expect(page.getByRole('heading', { name: /carbon footprint tracker/i })).toBeVisible();

    // Check that add entry button is still accessible
    await expect(page.getByRole('button', { name: /add entry/i })).toBeVisible();

    // Verify statistics cards stack vertically
    const statsCards = page.locator('[data-testid="stats-card"]');
    const firstCard = statsCards.first();
    const secondCard = statsCards.nth(1);

    const firstCardBox = await firstCard.boundingBox();
    const secondCardBox = await secondCard.boundingBox();

    // On mobile, cards should stack (second card should be below first)
    expect(secondCardBox?.y).toBeGreaterThan(firstCardBox?.y + firstCardBox?.height);
  });

  test('should handle offline state', async ({ page }) => {
    // Go offline
    await page.context().setOffline(true);

    // Try to add an entry
    await page.getByRole('button', { name: /add entry/i }).click();
    await page.getByLabel(/activity type/i).selectOption('transportation');
    await page.getByLabel(/amount/i).fill('10');
    await page.getByRole('button', { name: /save entry/i }).click();

    // Should show offline message
    await expect(page.getByText(/offline.*try again/i)).toBeVisible();

    // Go back online
    await page.context().setOffline(false);

    // Retry should work
    await page.getByRole('button', { name: /retry/i }).click();
    await expect(page.getByText(/add carbon entry/i)).not.toBeVisible();
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Start from add entry button
    await page.getByRole('button', { name: /add entry/i }).focus();

    // Tab through interactive elements
    await page.keyboard.press('Tab');
    await expect(page.getByLabel(/filter by activity/i)).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: /export data/i })).toBeFocused();

    // Test keyboard activation
    await page.keyboard.press('Enter');
    // Export should be triggered (download event would occur)
  });

  test('should persist data across page reloads', async ({ page }) => {
    // Add an entry
    await page.getByRole('button', { name: /add entry/i }).click();
    await page.getByLabel(/activity type/i).selectOption('transportation');
    await page.getByLabel(/amount/i).fill('20');
    await page.getByLabel(/description/i).fill('Test persistence entry');
    await page.getByRole('button', { name: /save entry/i }).click();

    // Wait for entry to be saved
    await expect(page.getByText(/test persistence entry/i)).toBeVisible();

    // Reload the page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify the entry is still there
    await expect(page.getByText(/test persistence entry/i)).toBeVisible();
  });
});
