import { test, expect } from '@playwright/test';
import {
  loadEnvLocal,
  createConfirmedTestUser,
  deleteTestUser,
  passwordSignIn,
  buildSessionCookie,
} from './helpers/supabase-admin';

loadEnvLocal();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// This spec is the Final Phase's single continuous-session proof: unlike
// auth.spec.ts / favorites.spec.ts / schedule.spec.ts (each of which tests
// one feature in isolation, anonymously), this one carries a single signed-in
// identity through the entire journey in one pass — sign up, star artists,
// build two schedules, export, sign out, sign back in, and confirm nothing
// was lost — to prove the features actually compose across a real session
// boundary, not just individually.
test.describe('Final Phase — full account journey', () => {
  test.skip(
    !SUPABASE_URL || !ANON_KEY || !SERVICE_ROLE_KEY,
    'Requires SUPABASE_SERVICE_ROLE_KEY in web/.env.local (Project Settings > API > service_role, ' +
      'dashboard-only — never commit it, never prefix it NEXT_PUBLIC_). Google OAuth is this app\'s ' +
      'only sign-in method and has no automatable test-mode path (no test consent screen, no service ' +
      "account grant flow) — same limitation auth.spec.ts / favorites.spec.ts / schedule.spec.ts already " +
      'document. This test works around it the standard documented Supabase way: an admin-confirmed ' +
      'throwaway account is created via the Admin API and its session is injected as a cookie in the exact ' +
      "format @supabase/ssr's browser client writes after a real sign-in — everything after that point " +
      '(starring, building, saving, exporting, signing out, signing back in) runs through real UI ' +
      'interactions against the real deployed backend, not mocks.'
  );

  const runId = Date.now();
  const email = `e2e-full-journey-${runId}@example.com`;
  const password = `E2E-Test-${runId}-Passw0rd!`;
  let userId: string | undefined;

  test.beforeAll(async () => {
    userId = await createConfirmedTestUser(email, password);
  });

  test.afterAll(async () => {
    if (userId) await deleteTestUser(userId);
  });

  test('sign up, star artists, build 2 schedules, export PNG, log out, log back in — all data persists', async ({
    page,
    context,
    baseURL,
  }) => {
    test.setTimeout(90_000);

    // ---- "Sign up" ----
    // Stands in for a first-time Google OAuth sign-in: a brand-new
    // auth.users row, session injected exactly as @supabase/ssr would store
    // it after the real redirect. See the skip reason above for why the
    // actual Google consent screen can't be driven here.
    const signUpSession = await passwordSignIn(SUPABASE_URL!, ANON_KEY!, email, password);
    await context.addCookies([buildSessionCookie(baseURL!, SUPABASE_URL!, signUpSession)]);

    await page.goto('/');
    await expect(page.getByText(email)).toBeVisible();

    // ---- Star two artists ----
    // Star toggles live on the artist grid, which moved to /lineup when the
    // "5-second rule" landing-page pass split it off '/' — see homepage.spec.ts.
    await page.goto('/lineup');
    const stars = page.locator('.star-toggle');
    await stars.nth(0).click();
    await stars.nth(1).click();
    await expect(page.locator('.nav-mylineup .mylineup-count')).toHaveText('2');

    await page.goto('/my-lineup');
    await expect(page.locator('.mylineup-row')).toHaveCount(2);
    const starredNames = await page.locator('.mylineup-row .ml-name').allTextContents();
    expect(starredNames).toHaveLength(2);

    // ---- Build 2 schedules on the same day (Thursday) ----
    // Both pairs below are known-stable Thursday entries in
    // public/schedule-data.js (verified directly against the file, not
    // assumed) — same stability rationale schedule.spec.ts already uses for
    // KIM THEORY / PEARLY DROPS.
    await page.goto('/schedule/thursday');

    await page.getByRole('button', { name: /KIM THEORY/i }).click();
    await page.getByRole('button', { name: /PEARLY DROPS/i }).click();
    await expect(page.locator('.sb-count')).toContainText('2 selected');

    const nameInput = page.locator('.sb-switcher input');
    await nameInput.fill('E2E Morning Set');
    await page.getByRole('button', { name: 'Save as new' }).click();
    await expect(page.getByText('Schedule saved')).toBeVisible();
    await expect(page.getByRole('button', { name: 'E2E Morning Set' })).toBeVisible();

    // Start schedule 2: "+ New" resets the working draft without touching
    // schedule 1, which should already be saved and untouched.
    await page.getByRole('button', { name: '+ New' }).click();
    await expect(page.locator('.sb-count')).toContainText('No artists selected');

    await page.getByRole('button', { name: /ASHA BANKS/i }).click();
    await page.getByRole('button', { name: /FAOUZIA/i }).click();
    await expect(page.locator('.sb-count')).toContainText('2 selected');

    await nameInput.fill('E2E Afternoon Set');
    await page.getByRole('button', { name: 'Save as new' }).click();
    await expect(page.getByText('Schedule saved')).toBeVisible();

    // Both schedules now coexist as separate switcher pills for this user.
    await expect(page.getByRole('button', { name: 'E2E Morning Set' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'E2E Afternoon Set' })).toBeVisible();

    // ---- Export PNG ----
    // The automation environment can't observe an OS-level file save (same
    // documented gap as the Phase 6 report), so — matching that report's own
    // verification method — this intercepts the anchor click snapdom.download()
    // triggers and confirms it carries a real PNG data payload and the
    // expected filename, rather than asserting on a file landing on disk.
    await page.evaluate(() => {
      (window as unknown as { __exportCapture: unknown[] }).__exportCapture = [];
      const origClick = HTMLAnchorElement.prototype.click;
      HTMLAnchorElement.prototype.click = function (this: HTMLAnchorElement) {
        (window as unknown as { __exportCapture: unknown[] }).__exportCapture.push({
          href: this.href.slice(0, 40),
          download: this.download,
        });
        return origClick.call(this);
      };
    });

    await page.getByRole('button', { name: 'Build my route' }).click();
    await expect(page.locator('.sb-results')).toBeVisible();
    await page.getByRole('button', { name: 'Export PNG' }).click();

    await expect
      .poll(() => page.evaluate(() => (window as unknown as { __exportCapture: Array<{ download: string }> }).__exportCapture.length))
      .toBeGreaterThan(0);
    const captured = await page.evaluate(
      () => (window as unknown as { __exportCapture: Array<{ href: string; download: string }> }).__exportCapture
    );
    expect(captured[0].download).toBe('lolla-2026-thursday-schedule.png');
    expect(captured[0].href.startsWith('data:image/png')).toBe(true);

    // ---- Log out ----
    await page.getByRole('button', { name: /sign out/i }).click();
    await page.waitForURL('/');
    await expect(page.getByRole('link', { name: 'Sign in' })).toBeVisible();

    // ---- Log back in ----
    // A second, independent password-grant call — a genuinely new sign-in,
    // not a reuse of the first session's tokens.
    const signBackInSession = await passwordSignIn(SUPABASE_URL!, ANON_KEY!, email, password);
    await context.addCookies([buildSessionCookie(baseURL!, SUPABASE_URL!, signBackInSession)]);

    // ---- Confirm favorites survived the round trip ----
    await page.goto('/my-lineup');
    await expect(page.locator('.mylineup-row')).toHaveCount(2);
    const namesAfterRelogin = await page.locator('.mylineup-row .ml-name').allTextContents();
    expect(namesAfterRelogin.sort()).toEqual(starredNames.sort());

    // ---- Confirm both schedules survived the round trip ----
    await page.goto('/schedule/thursday');
    await expect(page.getByRole('button', { name: 'E2E Morning Set' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'E2E Afternoon Set' })).toBeVisible();

    await page.getByRole('button', { name: 'E2E Morning Set' }).click();
    await expect(page.locator('.sb-count')).toContainText('2 selected');
    await expect(page.getByRole('button', { name: /KIM THEORY/i })).toHaveClass(/sel/);
    await expect(page.getByRole('button', { name: /PEARLY DROPS/i })).toHaveClass(/sel/);

    await page.getByRole('button', { name: 'E2E Afternoon Set' }).click();
    await expect(page.locator('.sb-count')).toContainText('2 selected');
    await expect(page.getByRole('button', { name: /ASHA BANKS/i })).toHaveClass(/sel/);
    await expect(page.getByRole('button', { name: /FAOUZIA/i })).toHaveClass(/sel/);
  });
});
