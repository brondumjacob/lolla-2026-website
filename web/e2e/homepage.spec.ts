import { test, expect } from '@playwright/test';

// Prompt 2 redesign: hero + info-box + sticky filter-bar + headliner feature
// row + one unified major/undercard grid, no sidebar. See
// components/LineupExplorer.tsx / ArtistCard.tsx and CLAUDE.md's redesign notes.
test.describe('Prompt 2 — homepage layout and lineup grid', () => {
  test('hero, info-box, and CTA render; the old sidebar/poster are gone', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { level: 1 })).toContainText('LOLLAPALOOZA');
    await expect(page.getByRole('link', { name: /Build your schedule/i })).toHaveAttribute('href', '/schedule');

    await expect(page.locator('.info-box')).toContainText('172');
    await expect(page.locator('.info-box')).toContainText('JUL 30');

    // Retired in the redesign — content moved to /this-week and the guide pages.
    await expect(page.locator('.sidebar')).toHaveCount(0);
    await expect(page.locator('.hero-og-img')).toHaveCount(0);
    await expect(page.locator('.guide-cards')).toHaveCount(0);
  });

  test('headliner feature row and the unified artist grid both render artists', async ({ page }) => {
    await page.goto('/');

    const headlinerCount = await page.locator('.hl-feature-card').count();
    expect(headlinerCount).toBeGreaterThan(0);
    expect(headlinerCount).toBeLessThan(10); // headliners are a small, fixed tier

    const gridCardCount = await page.locator('.artist-card').count();
    expect(gridCardCount).toBeGreaterThan(100); // majors + undercards, ~167 combined
  });

  test('search narrows the grid case-insensitively (confirms the existing substring-match behavior still works)', async ({
    page,
  }) => {
    await page.goto('/');

    await page.getByPlaceholder('Search artists by name…').fill('lorde');
    await expect(page.locator('.hl-feature-card', { hasText: 'Lorde' })).toBeVisible();

    const visibleCount = await page.locator('.artist-card:visible').count();
    expect(visibleCount).toBe(0); // Lorde is a headliner, not in the major/undercard grid

    await page.getByRole('button', { name: 'Clear search' }).click();
    await expect(page.getByPlaceholder('Search artists by name…')).toHaveValue('');
  });

  test('day pill filters the grid down', async ({ page }) => {
    await page.goto('/');

    const allCount = await page.locator('.artist-card').count();
    await page.getByRole('button', { name: 'THU 7/30' }).click();
    await expect(page.getByRole('button', { name: 'THU 7/30' })).toHaveAttribute('aria-pressed', 'true');

    const thursdayCount = await page.locator('.artist-card').count();
    expect(thursdayCount).toBeLessThan(allCount);
    expect(thursdayCount).toBeGreaterThan(0);
  });

  test('genre pill filters the grid down', async ({ page }) => {
    await page.goto('/');

    const allCount = await page.locator('.artist-card').count();
    const firstGenre = page.locator('.genre-pill').nth(1); // index 0 is "All Genres"
    await firstGenre.click();
    await expect(firstGenre).toHaveAttribute('aria-pressed', 'true');

    const filteredCount = await page.locator('.artist-card').count();
    expect(filteredCount).toBeLessThan(allCount);
  });

  test('mobile viewport: the grid renders 2 columns', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const cards = page.locator('.artist-card');
    const box0 = await cards.nth(0).boundingBox();
    const box1 = await cards.nth(1).boundingBox();
    const box2 = await cards.nth(2).boundingBox();
    expect(box0 && box1).toBeTruthy();
    // Card 1 sits beside card 0 (same row); card 2 wraps to the next row.
    expect(Math.abs((box0?.y ?? 0) - (box1?.y ?? 1))).toBeLessThan(5);
    expect((box2?.y ?? 0)).toBeGreaterThan((box0?.y ?? 0) + 10);
  });
});
