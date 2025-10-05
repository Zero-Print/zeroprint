import { test, expect } from '@playwright/test';

test('WalletCard visual regression', async ({ page }) => {
  await page.goto('/storybook?path=/story/walletcard--default');
  await expect(page.locator('[data-testid="wallet-card"]')).toHaveScreenshot('wallet-card.png');
});

test('ChartCard visual regression', async ({ page }) => {
  await page.goto('/storybook?path=/story/chartcard--default');
  await expect(page.locator('[data-testid="chart-card"]')).toHaveScreenshot('chart-card.png');
});

test('DigitalTwinSimulator visual regression', async ({ page }) => {
  await page.goto('/storybook?path=/story/digitaltwin--default');
  await expect(page.locator('[data-testid="digital-twin"]')).toHaveScreenshot('digital-twin.png');
});

test('Dashboard layout visual regression', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveScreenshot('dashboard-layout.png');
});