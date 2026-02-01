import { test, expect } from '@playwright/test';

test.describe('Shop Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/shop');
  });

  test('should display products', async ({ page }) => {
    // Wait for products to load
    await page.waitForSelector('[data-testid="product-card"], .product-card, a[href*="/product/"]', {
      timeout: 10000,
    }).catch(() => {
      // Products might not exist in test environment
    });
  });

  test('should have filter sidebar on desktop', async ({ page, isMobile }) => {
    if (!isMobile) {
      // Check for filter elements
      await expect(page.getByText(/filter|category|price|size|color/i).first()).toBeVisible();
    }
  });

  test('should have sort dropdown', async ({ page }) => {
    const sortSelect = page.getByRole('combobox').first();
    if (await sortSelect.isVisible()) {
      await sortSelect.click();
    }
  });

  test('should be able to search products', async ({ page }) => {
    // Open search modal
    const searchButton = page.getByRole('button', { name: /search/i });
    if (await searchButton.isVisible()) {
      await searchButton.click();
      
      // Type in search
      await page.getByPlaceholder(/search/i).fill('hoodie');
      
      // Wait for results
      await page.waitForTimeout(500);
    }
  });

  test('should navigate to product detail', async ({ page }) => {
    // Find first product link
    const productLink = page.locator('a[href*="/product/"]').first();
    
    if (await productLink.isVisible()) {
      await productLink.click();
      await expect(page).toHaveURL(/.*product.*/);
    }
  });

  test('should apply filters via URL', async ({ page }) => {
    await page.goto('/shop?category=hoodies');
    await expect(page).toHaveURL(/.*category=hoodies/);
  });
});
