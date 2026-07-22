import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/constants';

// App Router file convention — serves /sitemap.xml. Public, indexable routes
// only; the noindex routes (/account, /my-lineup, /login, /schedule/[day])
// are deliberately excluded — see app/robots.ts for the matching disallow list.
const PUBLIC_ROUTES = [
  '',
  '/lineup',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
  '/who-to-see',
  '/genre-guide',
  '/undercard-picks',
  '/lolla-history',
  '/first-timers-guide',
  '/faq',
  '/this-week',
  '/schedule',
];

// Bump this when a significant content pass ships across these routes —
// gives search/AI crawlers a freshness signal beyond changeFrequency alone.
// This is the fallback for any route not listed in ROUTE_LAST_MODIFIED below.
const CONTENT_LAST_MODIFIED = '2026-07-22';

// The 5 long-form guide pages each carry their own `dateModified` in their
// Article JSON-LD (see lib/structured-data.ts's articleJsonLd + each page's
// own jsonLd options) — reuse those exact dates here instead of the coarse
// site-wide fallback, so the sitemap's freshness signal doesn't drift from
// what the page's own structured data claims.
const ROUTE_LAST_MODIFIED: Record<string, string> = {
  '/who-to-see': '2026-04-11',
  '/undercard-picks': '2026-04-11',
  '/first-timers-guide': '2026-04-11',
  '/genre-guide': '2026-07-11',
  '/lolla-history': '2026-07-11',
};

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: ROUTE_LAST_MODIFIED[path] ?? CONTENT_LAST_MODIFIED,
    changeFrequency: 'weekly',
    priority: path === '' ? 1 : path === '/lineup' ? 0.9 : 0.7,
  }));
}
