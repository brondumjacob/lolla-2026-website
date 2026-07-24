import { test, expect } from '@playwright/test';

// Covers the SoundCloud search-link feature (lib/soundcloud.ts,
// lib/festival-status.ts): a 4th stream button shown only on
// Electronic/EDM/Hip-Hop artist cards, searching "<Artist> live" before the
// festival ends and "<Artist> Lollapalooza 2026" after. These tests run
// pre-festival (current date is well before 2026-08-02), so they only assert
// the "live" branch — the post-festival branch can't be exercised through the
// live site until after 2026-08-02 and this repo has no unit-test runner
// (Playwright E2E only); `soundcloudUrlForArtist`/`isFestivalOver` are pure
// functions with no I/O, so if that branch ever needs re-verifying it's a
// one-line manual check (call them directly with a post-festival Date).
test.describe('SoundCloud search link on artist cards', () => {
  test('an Electronic/EDM/Hip-Hop artist card has a SoundCloud button searching "<name> live"', async ({ page }) => {
    await page.goto('/lineup');

    // Alison Wonderland (EDM, major tier) — a stable, real fixture from artists.js.
    const card = page.locator('.artist-card', { hasText: 'Alison Wonderland' });
    await expect(card).toBeVisible();

    const scLink = card.getByRole('link', { name: /SoundCloud/i });
    await expect(scLink).toBeVisible();
    await expect(scLink).toHaveAttribute('href', /soundcloud\.com\/search\?q=Alison\+Wonderland\+live/);
  });

  test('a non-electronic/hip-hop artist card has no SoundCloud button', async ({ page }) => {
    await page.goto('/lineup');

    // 5 Seconds of Summer (Rock, major tier) — should get Spotify/Apple/YouTube
    // only, per SOUNDCLOUD_GENRES in lib/soundcloud.ts.
    const card = page.locator('.artist-card', { hasText: '5 Seconds of Summer' });
    await expect(card).toBeVisible();
    await expect(card.getByRole('link', { name: /SoundCloud/i })).toHaveCount(0);
  });

  test('mobile viewport: a 4-button electronic card does not overflow its grid column', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/lineup');

    const card = page.locator('.artist-card', { hasText: 'Alison Wonderland' });
    await expect(card).toBeVisible();

    const box = await card.boundingBox();
    expect(box).toBeTruthy();
    // Right edge of the card must stay inside the 390px viewport — the same
    // assertion style as lineup.spec.ts's existing no-horizontal-overflow
    // test, applied here to the specific card that gained a 4th button.
    expect((box?.x ?? 0) + (box?.width ?? 9999)).toBeLessThanOrEqual(390);

    const overflows = await card.locator('.streaming-links').evaluate((el) => el.scrollWidth > el.clientWidth + 1);
    expect(overflows).toBe(false);
  });

  // MyLineupList.tsx is a separate call site from ArtistCard.tsx (both wired
  // to soundcloudUrlForArtist independently in this feature) — worth its own
  // check rather than assuming the /lineup grid's behavior carries over.
  test('/my-lineup also shows the SoundCloud button for a starred electronic artist', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(
      ({ key, names }) => localStorage.setItem(key, JSON.stringify(names)),
      { key: 'lolla-my-lineup-v1', names: ['Alison Wonderland'] }
    );

    await page.goto('/my-lineup');
    const row = page.locator('.mylineup-row', { hasText: 'Alison Wonderland' });
    await expect(row).toBeVisible();
    await expect(row.getByRole('link', { name: /SoundCloud/i })).toHaveAttribute(
      'href',
      /soundcloud\.com\/search\?q=Alison\+Wonderland\+live/
    );
  });
});
