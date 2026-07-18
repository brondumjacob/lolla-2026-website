import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/constants';

const DISALLOW = ['/account', '/my-lineup', '/login', '/auth/', '/api/'];

// GEO: explicitly allow the major AI/answer-engine crawlers so this site's
// content can be ingested and cited by AI Overviews, ChatGPT, Perplexity, and
// Claude — same disallow list as the general '*' rule, just named so intent
// is unambiguous rather than relying on the wildcard rule to cover them.
const AI_CRAWLERS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'anthropic-ai',
  'Claude-Web',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'CCBot',
  'Applebot-Extended',
  'Amazonbot',
  'cohere-ai',
  'Meta-ExternalAgent',
];

// App Router file convention — serves /robots.txt. See
// node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/robots.md.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: DISALLOW },
      { userAgent: AI_CRAWLERS, allow: '/', disallow: DISALLOW },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
