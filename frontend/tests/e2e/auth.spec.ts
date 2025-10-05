import { test, expect } from '@playwright/test';
import { setupResilientTest } from './utils/resilient-navigation';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Set longer timeout for navigation
    test.setTimeout(60000);
    
    // Use resilient navigation setup
    await setupResilientTest(page, '/');
  });

  test('should display login page for unauthenticated users', async ({ page }) => {
    // Should redirect to login or show login form
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('should validate login form inputs', async ({ page }) => {
    // Try to submit empty form
    await page.getByRole('button', { name: /sign in/i }).click();

    // Should show validation errors
    await expect(page.getByText(/email is required/i)).toBeVisible();
    await expect(page.getByText(/password is required/i)).toBeVisible();

    // Try invalid email format
    await page.getByLabel(/email/i).fill('invalid-email');
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page.getByText(/invalid email format/i)).toBeVisible();
  });

  test('should handle login with valid credentials', async ({ page }) => {
    // Fill login form with test credentials
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('testpassword123');

    // Submit form
    await page.getByRole('button', { name: /sign in/i }).click();

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText(/welcome back/i)).toBeVisible();
  });

  test('should handle login with invalid credentials', async ({ page }) => {
    // Fill login form with invalid credentials
    await page.getByLabel(/email/i).fill('wrong@example.com');
    await page.getByLabel(/password/i).fill('wrongpassword');

    // Submit form
    await page.getByRole('button', { name: /sign in/i }).click();

    // Should show error message
    await expect(page.getByText(/invalid credentials/i)).toBeVisible();

    // Should stay on login page
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
  });

  test('should navigate to signup page', async ({ page }) => {
    // Click signup link
    await page.getByRole('link', { name: /sign up/i }).click();

    // Should navigate to signup page
    await expect(page.getByRole('heading', { name: /create account/i })).toBeVisible();
    await expect(page.getByLabel(/full name/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByLabel(/confirm password/i)).toBeVisible();
  });

  test('should validate signup form', async ({ page }) => {
    // Navigate to signup
    await page.getByRole('link', { name: /sign up/i }).click();

    // Try to submit empty form
    await page.getByRole('button', { name: /create account/i }).click();

    // Should show validation errors
    await expect(page.getByText(/name is required/i)).toBeVisible();
    await expect(page.getByText(/email is required/i)).toBeVisible();
    await expect(page.getByText(/password is required/i)).toBeVisible();

    // Test password confirmation
    await page.getByLabel(/password/i).fill('password123');
    await page.getByLabel(/confirm password/i).fill('different123');
    await page.getByRole('button', { name: /create account/i }).click();

    await expect(page.getByText(/passwords do not match/i)).toBeVisible();
  });

  test('should create new account successfully', async ({ page }) => {
    // Navigate to signup
    await page.getByRole('link', { name: /sign up/i }).click();

    // Fill signup form
    await page.getByLabel(/full name/i).fill('Test User');
    await page.getByLabel(/email/i).fill('newuser@example.com');
    await page.getByLabel(/password/i).fill('newpassword123');
    await page.getByLabel(/confirm password/i).fill('newpassword123');

    // Submit form
    await page.getByRole('button', { name: /create account/i }).click();

    // Should redirect to dashboard or show success message
    await expect(page.getByText(/account created successfully/i)).toBeVisible();
  });

  test('should handle forgot password flow', async ({ page }) => {
    // Click forgot password link
    await page.getByRole('link', { name: /forgot password/i }).click();

    // Should show forgot password form
    await expect(page.getByRole('heading', { name: /reset password/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();

    // Submit email
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByRole('button', { name: /send reset link/i }).click();

    // Should show success message
    await expect(page.getByText(/reset link sent/i)).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // First login
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('testpassword123');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Wait for dashboard to load
    await expect(page).toHaveURL(/\/dashboard/);

    // Click user menu
    await page.getByTestId('user-menu').click();

    // Click logout
    await page.getByRole('menuitem', { name: /logout/i }).click();

    // Should redirect to login page
    await expect(page).toHaveURL(/\/auth\/login/);
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
  });

  test('should persist authentication across page reloads', async ({ page }) => {
    // Login
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('testpassword123');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Wait for dashboard
    await expect(page).toHaveURL(/\/dashboard/);

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should still be authenticated
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByTestId('user-menu')).toBeVisible();
  });

  test('should redirect to intended page after login', async ({ page }) => {
    // Try to access protected page directly
    await page.goto('/dashboard/carbon-tracker');

    // Should redirect to login
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();

    // Login
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('testpassword123');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Should redirect to originally requested page
    await expect(page).toHaveURL(/\/dashboard\/carbon-tracker/);
  });

  test('should handle session expiration', async ({ page }) => {
    // Login first
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('testpassword123');
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page).toHaveURL(/\/dashboard/);

    // Simulate session expiration by clearing storage
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // Try to navigate to protected page
    await page.goto('/dashboard/carbon-tracker');

    // Should redirect to login
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
  });

  test('should support social login options', async ({ page }) => {
    // Check for social login buttons
    await expect(page.getByRole('button', { name: /continue with google/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /continue with github/i })).toBeVisible();

    // Click Google login (would open popup in real scenario)
    await page.getByRole('button', { name: /continue with google/i }).click();

    // In test environment, this might show a mock or redirect
    // The actual implementation would depend on your auth provider
  });

  test('should be accessible via keyboard navigation', async ({ page }) => {
    // Tab through form elements
    await page.keyboard.press('Tab');
    await expect(page.getByLabel(/email/i)).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.getByLabel(/password/i)).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: /sign in/i })).toBeFocused();

    // Should be able to submit with Enter
    await page.getByLabel(/email/i).fill('citizen@test.com');
    await page.getByLabel(/password/i).fill('testpassword123');
    await page.getByRole('button', { name: /sign in/i }).focus();
    await page.keyboard.press('Enter');

    await expect(page).toHaveURL(/\/trackers\/carbon/);
  });
});
