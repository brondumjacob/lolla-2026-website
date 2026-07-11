import { test, expect } from '@playwright/test';

test.describe('Phase 4 auth — anonymous access', () => {
  test('visiting /account while logged out redirects to /login with a next param', async ({ page }) => {
    await page.goto('/account');
    await expect(page).toHaveURL(/\/login\?next=%2Faccount/);
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
  });

  test('/login renders the Google sign-in button', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('button', { name: /Continue with Google/i })).toBeVisible();
  });

  test('nav shows a sign-in link when logged out', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'Sign in' })).toBeVisible();
  });
});
