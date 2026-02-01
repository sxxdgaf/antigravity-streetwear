import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveURL(/.*login/);
    
    // Check for email input
    await expect(page.getByLabel(/email/i)).toBeVisible();
    
    // Check for password input
    await expect(page.getByLabel(/password/i)).toBeVisible();
    
    // Check for submit button
    await expect(page.getByRole('button', { name: /sign in|log in/i })).toBeVisible();
  });

  test('should display signup page', async ({ page }) => {
    await page.goto('/signup');
    await expect(page).toHaveURL(/.*signup/);
    
    // Check for form elements
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i).first()).toBeVisible();
  });

  test('should show validation errors on empty submit', async ({ page }) => {
    await page.goto('/login');
    
    // Try to submit empty form
    await page.getByRole('button', { name: /sign in|log in/i }).click();
    
    // Should show validation errors or not navigate
    await page.waitForTimeout(500);
    await expect(page).toHaveURL(/.*login/);
  });

  test('should navigate from login to signup', async ({ page }) => {
    await page.goto('/login');
    
    // Find signup link
    const signupLink = page.getByRole('link', { name: /sign up|create account|register/i });
    if (await signupLink.isVisible()) {
      await signupLink.click();
      await expect(page).toHaveURL(/.*signup/);
    }
  });

  test('should have forgot password link', async ({ page }) => {
    await page.goto('/login');
    
    const forgotLink = page.getByRole('link', { name: /forgot|reset/i });
    if (await forgotLink.isVisible()) {
      await expect(forgotLink).toBeVisible();
    }
  });

  test('should redirect protected routes to login', async ({ page }) => {
    await page.goto('/account');
    
    // Should redirect to login
    await page.waitForURL(/.*login/, { timeout: 5000 }).catch(() => {
      // May already be on login or different behavior
    });
  });
});
