import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/constants';

// App Router file convention — serves /robots.txt. See
// node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/robots.md.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/account', '/my-lineup', '/login', '/auth/', '/api/'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
