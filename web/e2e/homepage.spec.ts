import { test, expect } from '@playwright/test';

// "5-second rule" landing-page pass: '/' is no longer the lineup grid — it's
// a compact landing page (hero + info-box + two primary action cards: View
// Lineup, Build Schedule — plus a lighter-weight sign-in prompt below them,
// not a third equal-weight card; see components/LandingAuthCard.tsx's comment
// on why) whose whole job is a 5-second read. The full grid + filter bar
// moved to /lineup (see e2e/lineup.spec.ts, which carries the old grid/
// filter/mobile-overflow test suite this file used to have). See
// components/Landing.tsx and CLAUDE.md's "5-Second Rule" notes.
test.describe('Landing page — 5-second rule', () => {
  test('hero, info-box, and exactly two primary action cards render; no grid on this page', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { level: 1 })).toContainText('LOLLAPALOOZA');
    await expect(page.locator('.info-box')).toContainText('172');
    await expect(page.locator('.info-box')).toContainText('JUL 30');

    const actions = page.locator('.landing-actions');
    const cards = actions.locator('.landing-action-card');
    await expect(cards).toHaveCount(2);
    await expect(actions.getByRole('link', { name: /View the Lineup/i })).toHaveAttribute('href', '/lineup');
    await expect(actions.getByRole('link', { name: /Build Your Schedule/i })).toHaveAttribute('href', '/schedule');

    // The full grid lives at /lineup now, not here.
    await expect(page.locator('.artist-grid')).toHaveCount(0);
    await expect(page.locator('.filter-bar')).toHaveCount(0);
  });

  // Scoped to .landing-signin-row — the nav's own AuthStatus pill also
  // renders a "Sign in" link on every page, so an unscoped role query would
  // be ambiguous.
  test('sign-in prompt links to /login when signed out', async ({ page }) => {
    await page.goto('/');
    const signIn = page.locator('.landing-signin-row').getByRole('link', { name: /^Sign in/i });
    await expect(signIn).toHaveAttribute('href', '/login');
  });

  // 5-second-rule pass: the hero proves the lineup with a data-driven
  // headliner line instead of just a wordmark + stat numbers.
  test('hero headliner proof line renders real headliner names', async ({ page }) => {
    await page.goto('/');

    const proof = page.locator('.hero-headliners');
    await expect(proof).toBeVisible();
    await expect(proof).toContainText('Headlined by');
  });

  test('mobile viewport: nothing overflows the viewport horizontally', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const widths = await page.evaluate(() => ({
      scrollW: document.documentElement.scrollWidth,
      clientW: document.documentElement.clientWidth,
    }));
    expect(widths.scrollW).toBe(widths.clientW);

    const heroClips = await page.locator('.hero-title').evaluate((el) => el.scrollWidth > el.clientWidth + 1);
    expect(heroClips).toBe(false);

    // The two action cards stack to one column and none clip the viewport.
    const cardBoxes = await page.locator('.landing-action-card').all();
    for (const card of cardBoxes) {
      const box = await card.boundingBox();
      expect(box).toBeTruthy();
      expect((box?.x ?? 0) + (box?.width ?? 9999)).toBeLessThanOrEqual(390);
    }
  });
});
