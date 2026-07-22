import { test, expect } from '@playwright/test';

const STORAGE_KEY = 'lolla-my-lineup-v1';

test.describe('Phase 5 favorites — anonymous localStorage flow', () => {
  // The star toggles live on the artist grid, which moved to /lineup when the
  // "5-second rule" landing-page pass split it off '/' (see e2e/lineup.spec.ts).
  test('starring an artist on /lineup updates the nav counter and localStorage without redirecting to /login', async ({
    page,
  }) => {
    await page.goto('/lineup');

    const firstStar = page.locator('.star-toggle').first();
    await expect(firstStar).toBeVisible();
    await firstStar.click();

    await expect(page).toHaveURL('/lineup');
    await expect(page.locator('.nav-mylineup .mylineup-count')).toHaveText('1');

    const stored = await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY);
    expect(JSON.parse(stored ?? '[]')).toHaveLength(1);
  });

  test('/my-lineup renders artists seeded in localStorage, sorted by day', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(
      ({ key, names }) => localStorage.setItem(key, JSON.stringify(names)),
      { key: STORAGE_KEY, names: ['Lorde', 'The Smashing Pumpkins'] }
    );

    await page.goto('/my-lineup');

    const rows = page.locator('.mylineup-row');
    await expect(rows).toHaveCount(2);
    await expect(rows.nth(0)).toContainText('Lorde');
    await expect(rows.nth(0)).toContainText('THU');
    await expect(rows.nth(1)).toContainText('The Smashing Pumpkins');
    await expect(rows.nth(1)).toContainText('FRI');
  });

  test('/my-lineup shows the empty state when no favorites are stored', async ({ page }) => {
    await page.goto('/my-lineup');
    await expect(page.getByText("You haven't starred anything yet")).toBeVisible();
  });

  test('un-starring from /my-lineup removes the row and updates the count', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(
      ({ key, names }) => localStorage.setItem(key, JSON.stringify(names)),
      { key: STORAGE_KEY, names: ['Lorde'] }
    );

    await page.goto('/my-lineup');
    await expect(page.locator('.mylineup-row')).toHaveCount(1);

    await page.locator('.mylineup-row .star-toggle').click();

    await expect(page.getByText("You haven't starred anything yet")).toBeVisible();
    await expect(page.locator('.nav-mylineup .mylineup-count')).toHaveText('0');
  });
});

// Authenticated merge (localStorage -> user_favorites on sign-in) is not
// covered here: Google OAuth has no automatable test path in this repo (no
// email/password provider, no service-role test session) — see the Phase 5
// execution notes in 2026-07-09_lolla-accounts-migration-plan.md for the
// manual + Supabase MCP verification actually performed instead.
