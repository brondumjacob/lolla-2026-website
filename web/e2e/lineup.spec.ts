import { test, expect } from '@playwright/test';

// Moved from e2e/homepage.spec.ts when the "5-second rule" landing-page pass
// split the full lineup grid off '/' onto its own route. Same
// LineupExplorer.tsx/ArtistCard.tsx component, same behavior — only the URL
// changed. See components/Landing.tsx, app/lineup/page.tsx, and CLAUDE.md.
test.describe('/lineup — full lineup grid', () => {
  test('hero, info-box, headliner row, and the unified artist grid all render', async ({ page }) => {
    await page.goto('/lineup');

    await expect(page.getByRole('heading', { level: 1 })).toContainText('LOLLAPALOOZA');
    await expect(page.locator('.info-box')).toContainText('172');
    await expect(page.locator('.info-box')).toContainText('JUL 30');

    const headlinerCount = await page.locator('.hl-feature-card').count();
    expect(headlinerCount).toBeGreaterThan(0);
    expect(headlinerCount).toBeLessThan(10); // headliners are a small, fixed tier

    const gridCardCount = await page.locator('.artist-card').count();
    expect(gridCardCount).toBeGreaterThan(100); // majors + undercards, ~167 combined
  });

  test('search narrows the grid case-insensitively (confirms the existing substring-match behavior still works)', async ({
    page,
  }) => {
    await page.goto('/lineup');

    await page.getByPlaceholder('Search artists by name…').fill('lorde');
    await expect(page.locator('.hl-feature-card', { hasText: 'Lorde' })).toBeVisible();

    const visibleCount = await page.locator('.artist-card:visible').count();
    expect(visibleCount).toBe(0); // Lorde is a headliner, not in the major/undercard grid

    await page.getByRole('button', { name: 'Clear search' }).click();
    await expect(page.getByPlaceholder('Search artists by name…')).toHaveValue('');
  });

  // The WebSite SearchAction (lib/structured-data.ts) points at
  // /lineup?search={term} — confirms that's a real, working deep link, not
  // just a schema.org claim (see LineupExplorer.tsx's ?search= handling).
  test('?search= URL param seeds the search box (SearchAction deep link)', async ({ page }) => {
    await page.goto('/lineup?search=lorde');
    await expect(page.getByPlaceholder('Search artists by name…')).toHaveValue('lorde');
    await expect(page.locator('.hl-feature-card', { hasText: 'Lorde' })).toBeVisible();
  });

  test('day pill filters the grid down', async ({ page }) => {
    await page.goto('/lineup');

    const allCount = await page.locator('.artist-card').count();
    await page.getByRole('button', { name: 'THU 7/30' }).click();
    await expect(page.getByRole('button', { name: 'THU 7/30' })).toHaveAttribute('aria-pressed', 'true');

    const thursdayCount = await page.locator('.artist-card').count();
    expect(thursdayCount).toBeLessThan(allCount);
    expect(thursdayCount).toBeGreaterThan(0);
  });

  test('genre pill filters the grid down', async ({ page }) => {
    await page.goto('/lineup');

    const allCount = await page.locator('.artist-card').count();
    const firstGenre = page.locator('.genre-pill').nth(1); // index 0 is "All Genres"
    await firstGenre.click();
    await expect(firstGenre).toHaveAttribute('aria-pressed', 'true');

    const filteredCount = await page.locator('.artist-card').count();
    expect(filteredCount).toBeLessThan(allCount);
  });

  test('mobile viewport: the grid renders 2 columns', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/lineup');

    const cards = page.locator('.artist-card');
    const box0 = await cards.nth(0).boundingBox();
    const box1 = await cards.nth(1).boundingBox();
    const box2 = await cards.nth(2).boundingBox();
    expect(box0 && box1).toBeTruthy();
    // Card 1 sits beside card 0 (same row); card 2 wraps to the next row.
    expect(Math.abs((box0?.y ?? 0) - (box1?.y ?? 1))).toBeLessThan(5);
    expect((box2?.y ?? 0)).toBeGreaterThan((box0?.y ?? 0) + 10);
  });

  // Regression tests for the mobile UX pass. The original 2-col check above
  // compared row positions only, so it passed while the grid's right column
  // rendered clipped off the viewport edge (grid items default min-width:auto
  // and the 44px star + 3×44px stream buttons couldn't shrink to the track).
  test('mobile viewport: nothing overflows the viewport horizontally — grid columns, cards, and hero wordmark all fit', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/lineup');

    // Page-level: no sideways scroll at all.
    const widths = await page.evaluate(() => ({
      scrollW: document.documentElement.scrollWidth,
      clientW: document.documentElement.clientWidth,
    }));
    expect(widths.scrollW).toBe(widths.clientW);

    // Grid-level: a right-column card's right edge sits inside the viewport,
    // and the wordmark doesn't clip inside its own box.
    const secondCard = await page.locator('.artist-card').nth(1).boundingBox();
    expect(secondCard).toBeTruthy();
    expect((secondCard?.x ?? 0) + (secondCard?.width ?? 9999)).toBeLessThanOrEqual(390);

    const heroClips = await page
      .locator('.hero-title')
      .evaluate((el) => el.scrollWidth > el.clientWidth + 1);
    expect(heroClips).toBe(false);
  });

  test('mobile viewport: headliners are a horizontal snap carousel and the last card is reachable', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/lineup');

    const feature = page.locator('.headliner-feature');
    const scrolls = await feature.evaluate((el) => el.scrollWidth > el.clientWidth);
    expect(scrolls).toBe(true); // overflows sideways instead of stacking

    const total = await page.locator('.hl-feature-card').count();
    await feature.evaluate((el) => { el.scrollLeft = el.scrollWidth; });
    const lastVisible = await page
      .locator('.hl-feature-card')
      .nth(total - 1)
      .evaluate((el, vw) => {
        const b = el.getBoundingClientRect();
        return b.left >= -1 && b.right <= vw + 1;
      }, 390);
    expect(lastVisible).toBe(true);
  });

  test('mobile viewport: hero renders before the explore strip (top-clutter fix)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/lineup');

    const heroBox = await page.locator('.hero').boundingBox();
    const stripBox = await page.locator('.explore-strip').boundingBox();
    expect(heroBox && stripBox).toBeTruthy();
    expect(heroBox?.y ?? 9999).toBeLessThan(stripBox?.y ?? 0);
  });
});
