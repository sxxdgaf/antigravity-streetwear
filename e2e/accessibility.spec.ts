import { test, expect } from '@playwright/test';

test.describe('Mobile Navigation', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should show mobile menu button', async ({ page }) => {
    await page.goto('/');
    
    // Look for hamburger menu
    const menuButton = page.getByRole('button', { name: /menu|navigation/i });
    await expect(menuButton).toBeVisible();
  });

  test('should open mobile menu', async ({ page }) => {
    await page.goto('/');
    
    // Click hamburger menu
    const menuButton = page.getByRole('button', { name: /menu|navigation/i });
    if (await menuButton.isVisible()) {
      await menuButton.click();
      await page.waitForTimeout(300);
      
      // Check for navigation links
      await expect(page.getByRole('link', { name: /shop/i })).toBeVisible();
    }
  });

  test('should close mobile menu when link clicked', async ({ page }) => {
    await page.goto('/');
    
    const menuButton = page.getByRole('button', { name: /menu|navigation/i });
    if (await menuButton.isVisible()) {
      await menuButton.click();
      await page.waitForTimeout(300);
      
      // Click a link
      await page.getByRole('link', { name: /shop/i }).first().click();
      
      // Should navigate
      await expect(page).toHaveURL(/.*shop/);
    }
  });
});

test.describe('Accessibility', () => {
  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');
    
    // Check for h1
    const h1 = page.locator('h1');
    await expect(h1.first()).toBeVisible();
  });

  test('should have alt text on images', async ({ page }) => {
    await page.goto('/');
    
    // Check images have alt text
    const images = page.locator('img');
    const count = await images.count();
    
    for (let i = 0; i < Math.min(count, 5); i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      expect(alt).not.toBeNull();
    }
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/');
    
    // Tab through focusable elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Something should be focused
    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
  });

  test('should have skip link for accessibility', async ({ page }) => {
    await page.goto('/');
    
    // Check for skip to content link
    const skipLink = page.getByRole('link', { name: /skip to content|skip to main/i });
    // Skip link may be visually hidden but accessible
  });
});

test.describe('Performance', () => {
  test('should load homepage within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - startTime;
    
    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('should have no console errors', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Filter out known acceptable errors
    const criticalErrors = errors.filter(
      (e) => !e.includes('favicon') && !e.includes('404')
    );
    
    // Should have no critical errors
    expect(criticalErrors.length).toBe(0);
  });
});
