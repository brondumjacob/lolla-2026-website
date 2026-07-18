import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/constants';

// App Router file convention — serves /sitemap.xml. Public, indexable routes
// only; the noindex routes (/account, /my-lineup, /login, /schedule/[day])
// are deliberately excluded — see app/robots.ts for the matching disallow list.
const PUBLIC_ROUTES = [
  '',
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
const CONTENT_LAST_MODIFIED = '2026-07-18';

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: CONTENT_LAST_MODIFIED,
    changeFrequency: 'weekly',
    priority: path === '' ? 1 : 0.7,
  }));
}
