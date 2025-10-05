# End-to-End Testing Guide

This guide covers the end-to-end testing setup using Playwright for the
ZeroPrint frontend application.

## Overview

Playwright is configured to test the application across multiple browsers and
devices, ensuring comprehensive coverage of user interactions and workflows.

## Setup

### Prerequisites

- Node.js 18+ installed
- All project dependencies installed (`npm install`)

### Installation

Playwright is already configured in this project. To install browsers:

```bash
npx playwright install
```

## Configuration

The Playwright configuration is located in `playwright.config.ts` and includes:

- **Test Directory**: `./tests/e2e`
- **Browsers**: Chromium, Firefox, WebKit
- **Mobile Testing**: Mobile Chrome (Pixel 5), Mobile Safari (iPhone 12)
- **Base URL**: `http://localhost:3000`
- **Reporters**: HTML reporter for detailed results

## Running Tests

### Basic Commands

```bash
# Run all E2E tests
npm run test:e2e

# Run tests with UI mode (interactive)
npm run test:e2e:ui

# Run tests in headed mode (visible browser)
npm run test:e2e:headed

# Run specific test file
npx playwright test tests/e2e/auth.spec.ts

# Run tests on specific browser
npx playwright test --project=chromium
```

### Development Workflow

1. **Start the development server**:

   ```bash
   npm run dev
   ```

2. **Run tests in watch mode**:

   ```bash
   npx playwright test --ui
   ```

3. **Debug failing tests**:
   ```bash
   npx playwright test --debug
   ```

## Test Structure

### Current Test Files

1. **`auth.spec.ts`** - Authentication flow testing
   - Login form validation
   - Successful authentication
   - Error handling
   - Session management

2. **`carbon-tracker.spec.ts`** - Carbon tracker functionality
   - Dashboard display
   - Adding new entries
   - Form validation
   - Data persistence

3. **`example.spec.ts`** - Setup verification
   - Basic Playwright functionality
   - Browser compatibility

### Writing New Tests

#### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup before each test
    await page.goto('/your-page');
    await page.waitForLoadState('networkidle');
  });

  test('should perform specific action', async ({ page }) => {
    // Test implementation
    await expect(page.getByRole('button', { name: /click me/i })).toBeVisible();
  });
});
```

#### Best Practices

1. **Use semantic selectors**:

   ```typescript
   // Good
   page.getByRole('button', { name: /submit/i });
   page.getByLabel('Email address');
   page.getByText('Welcome back');

   // Avoid
   page.locator('#submit-btn');
   page.locator('.email-input');
   ```

2. **Wait for elements properly**:

   ```typescript
   // Wait for network to be idle
   await page.waitForLoadState('networkidle');

   // Wait for specific element
   await expect(page.getByText('Loading...')).not.toBeVisible();
   ```

3. **Use data-testid for complex selectors**:

   ```typescript
   // In component
   <button data-testid="submit-form">Submit</button>

   // In test
   page.getByTestId('submit-form')
   ```

## Page Object Model

For complex applications, consider using the Page Object Model:

```typescript
// pages/LoginPage.ts
export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.page.getByLabel('Email').fill(email);
    await this.page.getByLabel('Password').fill(password);
    await this.page.getByRole('button', { name: /sign in/i }).click();
  }

  async expectLoginError() {
    await expect(this.page.getByText(/invalid credentials/i)).toBeVisible();
  }
}

// In test file
test('should login successfully', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('user@example.com', 'password');
  await expect(page).toHaveURL('/dashboard');
});
```

## Testing Strategies

### 1. Critical User Journeys

Focus on the most important user flows:

- User registration and login
- Core feature usage (carbon tracking)
- Data persistence and retrieval

### 2. Cross-Browser Testing

Ensure compatibility across:

- Desktop browsers (Chrome, Firefox, Safari)
- Mobile browsers (iOS Safari, Android Chrome)

### 3. Responsive Design Testing

Test different viewport sizes:

```typescript
test('should work on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  // Test mobile-specific behavior
});
```

### 4. Accessibility Testing

Include basic accessibility checks:

```typescript
test('should be accessible', async ({ page }) => {
  await page.goto('/dashboard');

  // Check for proper heading structure
  const h1 = page.locator('h1');
  await expect(h1).toBeVisible();

  // Check for alt text on images
  const images = page.locator('img');
  for (const img of await images.all()) {
    await expect(img).toHaveAttribute('alt');
  }
});
```

## Debugging

### Visual Debugging

```bash
# Run with headed browser
npx playwright test --headed

# Run in debug mode
npx playwright test --debug

# Generate trace files
npx playwright test --trace on
```

### Screenshots and Videos

Playwright automatically captures:

- Screenshots on failure
- Videos for failed tests
- Traces for debugging

Access these in the `test-results` directory.

### Playwright Inspector

Use the inspector for step-by-step debugging:

```bash
npx playwright test --debug
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

## Performance Testing

### Basic Performance Checks

```typescript
test('should load quickly', async ({ page }) => {
  const startTime = Date.now();
  await page.goto('/dashboard');
  await page.waitForLoadState('networkidle');
  const loadTime = Date.now() - startTime;

  expect(loadTime).toBeLessThan(3000); // 3 seconds
});
```

### Lighthouse Integration

```typescript
import { playAudit } from 'playwright-lighthouse';

test('should meet performance standards', async ({ page }) => {
  await page.goto('/dashboard');

  const audit = await playAudit({
    page,
    thresholds: {
      performance: 80,
      accessibility: 90,
      'best-practices': 80,
      seo: 80,
    },
  });

  expect(audit.lhr.categories.performance.score * 100).toBeGreaterThan(80);
});
```

## Troubleshooting

### Common Issues

1. **Timeouts**
   - Increase timeout in config
   - Use proper wait strategies
   - Check network conditions

2. **Flaky Tests**
   - Add proper waits
   - Use retry mechanisms
   - Avoid hard-coded delays

3. **Element Not Found**
   - Verify selectors
   - Check element visibility
   - Ensure proper page load

### Environment Issues

```bash
# Clear browser cache
npx playwright install --force

# Update browsers
npx playwright install

# Check system requirements
npx playwright install --dry-run
```

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Best Practices Guide](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-playwright)
- [Debugging Guide](https://playwright.dev/docs/debug)

## Contributing

When adding new E2E tests:

1. Follow the existing test structure
2. Use descriptive test names
3. Include proper setup and teardown
4. Add comments for complex interactions
5. Ensure tests are deterministic
6. Test across multiple browsers when relevant

## Maintenance

Regular maintenance tasks:

1. **Update Playwright**: `npm update @playwright/test`
2. **Update browsers**: `npx playwright install`
3. **Review test results**: Check for flaky tests
4. **Performance monitoring**: Track test execution times
5. **Coverage analysis**: Ensure critical paths are tested
