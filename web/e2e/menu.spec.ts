import { test, expect } from '@playwright/test';

// Prompt 2 redesign requirement: every public (and account) route on the site
// must be reachable from the nav — desktop pills/dropdowns above 768px, the
// hamburger's grouped panel below it. See Nav.tsx / NavDropdown.tsx and
// CLAUDE.md's redesign notes.
//
// '/' (the landing page) is intentionally excluded from both grouped-route
// lists below — the "5-second rule" landing-page pass moved the full lineup
// grid to /lineup, and '/' is reachable only via the always-visible
// .nav-home wordmark logo (not a dropdown/panel link), same pattern as
// /my-lineup and /account. See the dedicated .nav-home assertion in each
// test below.
const ALL_ROUTES = [
  '/lineup',
  '/my-lineup',
  '/who-to-see',
  '/first-timers-guide',
  '/undercard-picks',
  '/genre-guide',
  '/lolla-history',
  '/this-week',
  '/schedule',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
  '/account',
];

// /my-lineup and /account are intentionally NOT part of the grouped
// GUIDES/ABOUT dropdowns on desktop — they're reachable via their own
// always-visible pills (.nav-mylineup and AuthStatus's sign-in/account link),
// a pre-existing pattern this redesign didn't change. The mobile hamburger
// panel folds them into the grouped list instead (see the test below), which
// is what satisfies the plan's literal "every route reachable from the
// hamburger menu" requirement.
const DESKTOP_GROUPED_ROUTES = ALL_ROUTES.filter((r) => r !== '/my-lineup' && r !== '/account');

test.describe('Prompt 2 — navigation completeness and accessibility', () => {
  test('desktop nav (top-level pills + Guides/About dropdowns) links to every guide/content route', async ({
    page,
  }) => {
    await page.goto('/');

    const hrefs = new Set<string>();
    for (const link of await page.locator('.nav-links-desktop a[href]').all()) {
      hrefs.add(await link.getAttribute('href'));
    }

    // Guides and About are collapsed behind dropdown triggers — open each to
    // reveal their links before collecting hrefs.
    for (const label of ['GUIDES', 'ABOUT']) {
      await page.getByRole('button', { name: label }).click();
      for (const link of await page.locator('.nav-dropdown-panel.open a[href]').all()) {
        hrefs.add(await link.getAttribute('href'));
      }
      await page.keyboard.press('Escape');
    }

    for (const route of DESKTOP_GROUPED_ROUTES) {
      expect(hrefs, `desktop nav is missing a link to ${route}`).toContain(route);
    }

    // /my-lineup still has its own dedicated, always-visible pill on desktop.
    await expect(page.locator('.nav-mylineup')).toHaveAttribute('href', '/my-lineup');
    // '/' (the landing page) is reachable via the wordmark logo, not a dropdown link.
    await expect(page.locator('.nav-home')).toHaveAttribute('href', '/');
  });

  test('mobile hamburger panel links to every route, grouped', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const hamburger = page.getByRole('button', { name: 'Menu' });
    await expect(hamburger).toHaveAttribute('aria-expanded', 'false');
    await hamburger.click();
    await expect(hamburger).toHaveAttribute('aria-expanded', 'true');

    const panel = page.locator('#mobile-nav-panel');
    await expect(panel).toBeVisible();

    const hrefs = new Set<string>();
    for (const link of await panel.locator('a[href]').all()) {
      hrefs.add(await link.getAttribute('href'));
    }
    for (const route of ALL_ROUTES) {
      expect(hrefs, `mobile hamburger panel is missing a link to ${route}`).toContain(route);
    }
    // '/' (the landing page) is reachable via the wordmark logo, not the panel.
    await expect(page.locator('.nav-home')).toHaveAttribute('href', '/');
  });

  test('mobile panel: Escape closes it and returns focus to the hamburger button', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const hamburger = page.getByRole('button', { name: 'Menu' });
    await hamburger.click();
    await expect(page.locator('#mobile-nav-panel')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(hamburger).toHaveAttribute('aria-expanded', 'false');
    await expect(hamburger).toBeFocused();
  });

  test('mobile panel: focus is trapped — Tab from the last link wraps to the first', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const hamburger = page.getByRole('button', { name: 'Menu' });
    await hamburger.click();
    const panel = page.locator('#mobile-nav-panel');
    await expect(panel).toBeVisible();

    const links = panel.locator('a');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);

    // Focus starts on the first link on open (see Nav.tsx's focus-trap effect).
    await expect(links.first()).toBeFocused();

    // Shift+Tab from the first link should wrap to the last.
    await page.keyboard.press('Shift+Tab');
    await expect(links.last()).toBeFocused();

    // Tab from the last link should wrap back to the first.
    await page.keyboard.press('Tab');
    await expect(links.first()).toBeFocused();
  });
});
