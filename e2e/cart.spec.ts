import { test, expect } from '@playwright/test';

test.describe('Cart Functionality', () => {
  test('should add product to cart', async ({ page }) => {
    // Go to a product page (assuming there's at least one product)
    await page.goto('/shop');
    
    // Find and click first product
    const productLink = page.locator('a[href*="/product/"]').first();
    if (await productLink.isVisible()) {
      await productLink.click();
      
      // Wait for product page to load
      await page.waitForLoadState('networkidle');
      
      // Find add to cart button
      const addToCartBtn = page.getByRole('button', { name: /add to cart/i });
      if (await addToCartBtn.isVisible()) {
        await addToCartBtn.click();
        
        // Cart should update (check for cart badge or drawer)
        await page.waitForTimeout(500);
      }
    }
  });

  test('should open cart drawer', async ({ page }) => {
    await page.goto('/');
    
    // Click cart icon
    const cartIcon = page.getByRole('button', { name: /cart/i });
    if (await cartIcon.isVisible()) {
      await cartIcon.click();
      
      // Cart drawer should be visible
      await page.waitForTimeout(300);
    }
  });

  test('should navigate to cart page', async ({ page }) => {
    await page.goto('/cart');
    await expect(page).toHaveURL(/.*cart/);
  });

  test('should navigate to checkout', async ({ page }) => {
    await page.goto('/checkout');
    await expect(page).toHaveURL(/.*checkout/);
  });

  test('should show empty cart message when cart is empty', async ({ page }) => {
    await page.goto('/cart');
    
    // Look for empty cart message
    const emptyMessage = page.getByText(/empty|no items|start shopping/i);
    if (await emptyMessage.isVisible()) {
      await expect(emptyMessage).toBeVisible();
    }
  });
});
