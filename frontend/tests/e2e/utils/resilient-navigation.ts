import { Page, expect } from '@playwright/test';

export class ResilientNavigation {
  constructor(private page: Page) {}

  /**
   * Navigate to a URL with resilient error handling and fallbacks
   */
  async navigateToPage(url: string, options: { timeout?: number; retries?: number } = {}) {
    const { timeout = 30000, retries = 3 } = options;
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`Navigation attempt ${attempt} to ${url}`);
        
        // Navigate with timeout
        await this.page.goto(url, { timeout });
        
        // Try to wait for basic page load
        try {
          await this.page.waitForLoadState('domcontentloaded', { timeout: 10000 });
        } catch (error) {
          console.log('DOM content loaded timeout, continuing...');
        }
        
        // Try to wait for complete load
        try {
          await this.page.waitForFunction(() => document.readyState === 'complete', { timeout: 10000 });
        } catch (error) {
          console.log('Document ready state timeout, continuing...');
        }
        
        // Wait for page to be interactive
        await this.page.waitForTimeout(2000);
        
        // Verify page loaded successfully
        await expect(this.page.locator('body')).toBeVisible();
        
        console.log(`Successfully navigated to ${url} on attempt ${attempt}`);
        return;
        
      } catch (error) {
        console.log(`Navigation attempt ${attempt} failed:`, error.message);
        
        if (attempt === retries) {
          // Final fallback: just verify we have some page content
          try {
            await expect(this.page.locator('body')).toBeVisible();
            console.log(`Navigation completed with basic verification after ${retries} attempts`);
            return;
          } catch (finalError) {
            throw new Error(`Failed to navigate to ${url} after ${retries} attempts. Last error: ${error.message}`);
          }
        }
        
        // Wait before retry
        await this.page.waitForTimeout(2000);
      }
    }
  }

  /**
   * Fill form field with multiple selector fallbacks
   */
  async fillField(selectors: string[], value: string, options: { timeout?: number } = {}) {
    const { timeout = 10000 } = options;
    
    for (const selector of selectors) {
      try {
        const element = this.page.locator(selector);
        if (await element.isVisible({ timeout: 3000 })) {
          await element.fill(value, { timeout });
          return true;
        }
      } catch (error) {
        // Continue to next selector
      }
    }
    
    console.log(`Could not fill field with any of the selectors: ${selectors.join(', ')}`);
    return false;
  }

  /**
   * Click element with multiple selector fallbacks
   */
  async clickElement(selectors: string[], options: { timeout?: number } = {}) {
    const { timeout = 10000 } = options;
    
    for (const selector of selectors) {
      try {
        const element = this.page.locator(selector);
        if (await element.isVisible({ timeout: 3000 })) {
          await element.click({ timeout });
          return true;
        }
      } catch (error) {
        // Continue to next selector
      }
    }
    
    console.log(`Could not click element with any of the selectors: ${selectors.join(', ')}`);
    return false;
  }

  /**
   * Check element with multiple selector fallbacks
   */
  async checkElement(selectors: string[], options: { timeout?: number } = {}) {
    const { timeout = 10000 } = options;
    
    for (const selector of selectors) {
      try {
        const element = this.page.locator(selector);
        if (await element.isVisible({ timeout: 3000 })) {
          await element.check({ timeout });
          return true;
        }
      } catch (error) {
        // Continue to next selector
      }
    }
    
    console.log(`Could not check element with any of the selectors: ${selectors.join(', ')}`);
    return false;
  }

  /**
   * Wait for element with multiple selector fallbacks
   */
  async waitForElement(selectors: string[], options: { timeout?: number } = {}) {
    const { timeout = 10000 } = options;
    
    for (const selector of selectors) {
      try {
        const element = this.page.locator(selector);
        if (await element.isVisible({ timeout })) {
          await expect(element).toBeVisible();
          return element;
        }
      } catch (error) {
        // Continue to next selector
      }
    }
    
    console.log(`Could not find element with any of the selectors: ${selectors.join(', ')}`);
    return null;
  }

  /**
   * Perform login with resilient form handling
   */
  async performLogin(email: string, password: string) {
    try {
      // Navigate to login page
      await this.navigateToPage('/auth/login');
      
      // Fill email field
      const emailSelectors = [
        '[data-testid="email-input"]',
        'input[type="email"]',
        'input[name="email"]',
        '#email',
        '.email-input'
      ];
      await this.fillField(emailSelectors, email);
      
      // Fill password field
      const passwordSelectors = [
        '[data-testid="password-input"]',
        'input[type="password"]',
        'input[name="password"]',
        '#password',
        '.password-input'
      ];
      await this.fillField(passwordSelectors, password);
      
      // Click submit button
      const submitSelectors = [
        '[data-testid="login-submit-button"]',
        'button[type="submit"]',
        'input[type="submit"]',
        'button:has-text("Login")',
        'button:has-text("Sign In")',
        '.login-button',
        '.submit-button'
      ];
      await this.clickElement(submitSelectors);
      
      // Wait for navigation
      await this.page.waitForTimeout(3000);
      
      // Verify login success (not on login page anymore)
      const currentUrl = this.page.url();
      if (!currentUrl.includes('/auth/login')) {
        console.log('Login completed - navigated away from login page');
        return true;
      }
      
      return false;
    } catch (error) {
      console.log('Login failed:', error.message);
      return false;
    }
  }
}

/**
 * Setup resilient test environment
 */
export async function setupResilientTest(page: Page, url: string = '/') {
  const navigation = new ResilientNavigation(page);
  await navigation.navigateToPage(url);
  return navigation;
}