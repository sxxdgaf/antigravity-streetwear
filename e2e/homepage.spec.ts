import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the brand logo', async ({ page }) => {
    await expect(page.getByRole('link', { name: /antigravity/i })).toBeVisible();
  });

  test('should have navigation links', async ({ page }) => {
    await expect(page.getByRole('link', { name: /shop/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /collections/i })).toBeVisible();
  });

  test('should navigate to shop page', async ({ page }) => {
    await page.getByRole('link', { name: /shop/i }).first().click();
    await expect(page).toHaveURL(/.*shop/);
  });

  test('should have hero section', async ({ page }) => {
    // Check for hero content
    await expect(page.locator('section').first()).toBeVisible();
  });

  test('should display featured products section', async ({ page }) => {
    // Scroll to products section
    await page.evaluate(() => window.scrollTo(0, 500));
    
    // Wait for products to load
    await page.waitForTimeout(1000);
  });

  test('should have footer with links', async ({ page }) => {
    const footer = page.locator('footer');
    await footer.scrollIntoViewIfNeeded();
    await expect(footer).toBeVisible();
  });
});
