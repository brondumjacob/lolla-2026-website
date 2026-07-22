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

// Mobile reflow: below 768px the horizontal-scroll timetable (.sb-gridouter)
// is replaced by a stage-picker + vertical list (.sb-mobile-only) — see
// ScheduleBuilder.tsx and CLAUDE.md's mobile schedule-builder pass. The
// desktop grid tests above run at Playwright's default (desktop) viewport and
// are unaffected — .sb-mobile-only is display:none there.
test.describe('Schedule builder — mobile reflow', () => {
  test('mobile viewport: the stage list replaces the horizontal grid', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/schedule/thursday');

    await expect(page.locator('.sb-mobile-only')).toBeVisible();
    await expect(page.locator('.sb-gridouter')).toBeHidden();
  });

  test('mobile viewport: switching the stage select changes the listed sets', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/schedule/thursday');

    const select = page.locator('#sb-stage-select');
    const options = await select.locator('option').allTextContents();
    expect(options.length).toBeGreaterThan(1);

    const firstStageNames = await page.locator('.sb-ml-item .sb-ml-name').allTextContents();
    await select.selectOption({ index: 1 });
    const secondStageNames = await page.locator('.sb-ml-item .sb-ml-name').allTextContents();
    expect(secondStageNames).not.toEqual(firstStageNames);
  });

  test('mobile viewport: tapping a set in the list selects it, same as the desktop grid', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/schedule/thursday');

    // AIRBNB is KIM THEORY's stage (see the fixture comment at the top of
    // this file) — select it via the stage dropdown's value (the raw stage
    // name, independent of the region-suffixed visible label/column order).
    await page.locator('#sb-stage-select').selectOption('AIRBNB');
    const item = page.locator('.sb-ml-item', { hasText: 'KIM THEORY' });
    await expect(item).toBeVisible();
    await item.click();

    await expect(item).toHaveClass(/sel/);
    await expect(page.locator('.sb-count')).toContainText('1 selected');
  });

  // Live conflict feedback on the mobile list — the desktop grid shows a
  // clash for free via spatial overlap in the timeline; the mobile list
  // (one stage at a time) has no equivalent, so a selected, clashing set
  // gets an explicit "⚠ Conflict" label plus a count in .sb-count.
  test('mobile viewport: selecting two clashing sets on different stages shows a live conflict indicator', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/schedule/thursday');

    await page.locator('#sb-stage-select').selectOption('AIRBNB');
    await page.locator('.sb-ml-item', { hasText: 'KIM THEORY' }).click();

    await page.locator('#sb-stage-select').selectOption('ALLIANZ');
    const pearlyDrops = page.locator('.sb-ml-item', { hasText: 'PEARLY DROPS' });
    await pearlyDrops.click();

    await expect(pearlyDrops.locator('.sb-ml-clash')).toBeVisible();
    await expect(pearlyDrops.locator('.sb-ml-clash')).toContainText('Conflict');
    // The count is "sets currently in a clash", not "clash pairs" — one
    // pairwise clash between two sets counts both of them.
    await expect(page.locator('.sb-count')).toContainText('2 conflicts');
  });

  test('mobile viewport: nothing overflows the viewport horizontally', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/schedule/thursday');

    const widths = await page.evaluate(() => ({
      scrollW: document.documentElement.scrollWidth,
      clientW: document.documentElement.clientWidth,
    }));
    expect(widths.scrollW).toBe(widths.clientW);
  });
});

// Authenticated multi-schedule create/name/delete is not covered here: Google
// OAuth has no automatable test path in this repo (no email/password
// provider, no service-role test session) — same limitation Phase 5's
// e2e/favorites.spec.ts documents. That flow, plus the RLS join-policy
// cross-user isolation on schedule_artists, was instead verified manually
// via claude-in-chrome + Supabase MCP simulated-JWT queries — see the Phase
// 6 execution notes in 2026-07-09_lolla-accounts-migration-plan.md.

// "Plan my schedule" floating widget (public/schedule-planner.js) on the
// /schedule hub — distinct from the per-day builder above. Covers the
// 2026-07 cutoff-bug fix and the search-feedback/typeahead/favorites/a11y
// additions. KIM THEORY is reused as the deterministic real-artist fixture
// (same stable Thursday-noon set the conflict test above relies on).
test.describe('Smart schedule planner (/schedule floating widget)', () => {
  test('opens without clipping the header or input', async ({ page }) => {
    await page.goto('/schedule');
    await page.getByRole('button', { name: /PLAN MY SCHEDULE/i }).click();

    await expect(page.getByText('Plan my schedule', { exact: true })).toBeVisible();
    await expect(page.getByPlaceholder(/Lorde, Charli XCX/i)).toBeVisible();

    // Regression guard: a pill radius (999px) on this rectangular panel is
    // exactly what clipped the header/input before the 2026-07 fix.
    const radius = await page.locator('#plannerPanel').evaluate((el) => getComputedStyle(el).borderRadius);
    expect(radius).not.toContain('999');
  });

  test('shows a per-query chip and summary for matched and unmatched searches', async ({ page }) => {
    await page.goto('/schedule');
    await page.getByRole('button', { name: /PLAN MY SCHEDULE/i }).click();
    await page.getByPlaceholder(/Lorde, Charli XCX/i).fill('Kim Theory, zzznotarealartist');
    await page.getByRole('button', { name: 'PLAN IT →' }).click();

    await expect(page.locator('.planner-summary')).toContainText('Found 1 of 2');
    await expect(page.locator('.planner-chip-match')).toContainText('KIM THEORY');
    await expect(page.locator('.planner-chip-miss')).toContainText('zzznotarealartist');
    await expect(page.locator('.planner-chip-miss')).toContainText('not found');
  });

  test('typeahead suggests real artist names and selecting one fills the input', async ({ page }) => {
    await page.goto('/schedule');
    await page.getByRole('button', { name: /PLAN MY SCHEDULE/i }).click();
    const input = page.getByPlaceholder(/Lorde, Charli XCX/i);
    await input.fill('Kim The');

    const suggestion = page.locator('.planner-suggest-item', { hasText: 'KIM THEORY' });
    await expect(suggestion).toBeVisible();
    await suggestion.click();

    await expect(input).toHaveValue('KIM THEORY, ');
  });

  test('the clear button empties the input and hides results', async ({ page }) => {
    await page.goto('/schedule');
    await page.getByRole('button', { name: /PLAN MY SCHEDULE/i }).click();
    const input = page.getByPlaceholder(/Lorde, Charli XCX/i);
    await input.fill('Kim Theory');
    await page.getByRole('button', { name: 'PLAN IT →' }).click();
    await expect(page.locator('#plannerResults')).toBeVisible();

    await page.getByRole('button', { name: 'Clear search' }).click();
    await expect(input).toHaveValue('');
    await expect(page.locator('#plannerResults')).toBeHidden();
  });

  test('Escape closes the panel and returns focus to the toggle button', async ({ page }) => {
    await page.goto('/schedule');
    const fab = page.getByRole('button', { name: /PLAN MY SCHEDULE/i });
    await fab.click();
    await expect(page.locator('#plannerPanel')).toHaveClass(/open/);

    await page.keyboard.press('Escape');
    await expect(page.locator('#plannerPanel')).not.toHaveClass(/open/);
    await expect(fab).toBeFocused();
  });

  test('shows a favorites-prefill button when My Lineup has stars, and searching it works', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('lolla-my-lineup-v1', JSON.stringify(['KIM THEORY']));
    });
    await page.goto('/schedule');
    await page.getByRole('button', { name: /PLAN MY SCHEDULE/i }).click();

    const favButton = page.getByRole('button', { name: /Add my 1.*favorite/i });
    await expect(favButton).toBeVisible();
    await favButton.click();

    await expect(page.locator('.planner-chip-match')).toContainText('KIM THEORY');
  });

  test('becomes a full-width bottom sheet on mobile so it can never clip the viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/schedule');
    await page.getByRole('button', { name: /PLAN MY SCHEDULE/i }).click();

    const box = await page.locator('#plannerPanel').boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.x).toBeCloseTo(0, 0);
      expect(box.width).toBeCloseTo(390, 0);
      // Anchored via bottom:0 — the panel's bottom edge must sit flush with
      // the viewport bottom regardless of content height.
      expect(box.y + box.height).toBeGreaterThanOrEqual(844 - 2);
    }
  });
});
