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
  '/schedule',
];

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: 'weekly',
    priority: path === '' ? 1 : 0.7,
  }));
}
