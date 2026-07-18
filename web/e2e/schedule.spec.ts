import { test, expect } from '@playwright/test';

const DRAFT_KEY = 'lolla-schedule-draft-v1';

// KIM THEORY (AIRBNB, 12:00-12:30) and PEARLY DROPS (ALLIANZ, 12:00-12:45)
// both play Thursday (day 1) starting at noon — a known, stable overlap in
// public/schedule-data.js, used here to deterministically trigger conflict
// detection without depending on lineup data that could change.
test.describe('Phase 6 schedule builder — anonymous localStorage flow', () => {
  test('selecting two overlapping sets flags a conflict and persists the draft', async ({ page }) => {
    await page.goto('/schedule/thursday');

    await page.getByRole('button', { name: /KIM THEORY/i }).click();
    await page.getByRole('button', { name: /PEARLY DROPS/i }).click();

    await expect(page.locator('.sb-count')).toContainText('2 selected');

    await page.getByRole('button', { name: 'Build my route' }).click();

    await expect(page.locator('.sb-results')).toBeVisible();
    await expect(page.locator('.sb-rconf')).toHaveText('CONFLICT');
    await expect(page.locator('.sb-summ')).toContainText('contains time clashes');

    // Export controls are present for an anonymous session — building and
    // exporting doesn't require an account (Phase 6 decision #2).
    await expect(page.getByRole('button', { name: 'Export PNG' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Export HTML' })).toBeVisible();

    // Never redirected to /login — anonymous building/exporting is allowed.
    await expect(page).toHaveURL(/\/schedule\/thursday$/);

    const draft = await page.evaluate((key) => localStorage.getItem(key), DRAFT_KEY);
    const parsed = JSON.parse(draft ?? '{}');
    const names = (parsed['1'] ?? []).map((s: { name: string }) => s.name);
    expect(names).toContain('KIM THEORY');
    expect(names).toContain('PEARLY DROPS');
  });

  test('un-selecting a set updates the count and clears from the draft', async ({ page }) => {
    await page.goto('/schedule/thursday');

    const kimTheory = page.getByRole('button', { name: /KIM THEORY/i });
    await kimTheory.click();
    await expect(page.locator('.sb-count')).toContainText('1 selected');

    await kimTheory.click();
    await expect(page.locator('.sb-count')).toContainText('No artists selected');

    const draft = await page.evaluate((key) => localStorage.getItem(key), DRAFT_KEY);
    const parsed = JSON.parse(draft ?? '{}');
    expect(parsed['1'] ?? []).toHaveLength(0);
  });

  test('marking a must-see star persists it and shows the MUST-SEE tag in results', async ({ page }) => {
    await page.goto('/schedule/thursday');

    const kimTheory = page.getByRole('button', { name: /KIM THEORY/i });
    await kimTheory.click();
    await kimTheory.getByRole('button', { name: 'Mark as must-see' }).click();

    await expect(page.locator('.sb-count')).toContainText('1 must-see');

    await page.getByRole('button', { name: 'Build my route' }).click();
    await expect(page.locator('.sb-rtag.must')).toHaveText('MUST-SEE');
  });

  test('the schedule hub links to the new /schedule/[day] routes, not the retired static pages', async ({ page }) => {
    await page.goto('/schedule');
    // Case-insensitive: "Build →" is stored normal-case in markup and rendered
    // uppercase via CSS text-transform (SEO quick-wins pass, see CLAUDE.md),
    // so the accessible name is no longer literal all-caps.
    await expect(page.getByRole('link', { name: /THURSDAY.*BUILD/is })).toHaveAttribute('href', '/schedule/thursday');
  });
});

// Authenticated multi-schedule create/name/delete is not covered here: Google
// OAuth has no automatable test path in this repo (no email/password
// provider, no service-role test session) — same limitation Phase 5's
// e2e/favorites.spec.ts documents. That flow, plus the RLS join-policy
// cross-user isolation on schedule_artists, was instead verified manually
// via claude-in-chrome + Supabase MCP simulated-JWT queries — see the Phase
// 6 execution notes in 2026-07-09_lolla-accounts-migration-plan.md.
