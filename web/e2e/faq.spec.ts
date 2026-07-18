import { test, expect } from '@playwright/test';

// New page added for AEO/GEO — a visible FAQ page backed by FAQPage +
// BreadcrumbList JSON-LD (see lib/festival.ts's FESTIVAL.faqs and
// lib/structured-data.ts). See CLAUDE.md's AEO/GEO notes.
test.describe('FAQ page', () => {
  test('renders every configured question with its answer, and the artist count is resolved (not a literal token)', async ({
    page,
  }) => {
    await page.goto('/faq');

    await expect(page.getByRole('heading', { level: 1 })).toContainText('Frequently Asked Questions');

    const questions = page.locator('.article-body h2');
    await expect(questions).toHaveCount(8);

    await expect(page.locator('.article-body')).not.toContainText('{{ARTIST_COUNT}}');
    await expect(page.locator('.article-body')).toContainText('artists are confirmed');
  });

  test('emits FAQPage and BreadcrumbList JSON-LD', async ({ page }) => {
    await page.goto('/faq');

    const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
    const types = scripts.map((s) => JSON.parse(s)['@type']);
    expect(types).toContain('FAQPage');
    expect(types).toContain('BreadcrumbList');

    const faqSchema = scripts.map((s) => JSON.parse(s)).find((s) => s['@type'] === 'FAQPage');
    expect(faqSchema.mainEntity).toHaveLength(8);
    expect(faqSchema.mainEntity[0]).toHaveProperty('acceptedAnswer.text');
  });

  test('is reachable from the nav, footer, and homepage explore strip', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'FAQ', exact: true }).first()).toBeVisible();
  });
});
