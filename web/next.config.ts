import type { NextConfig } from 'next';

// Ported verbatim from build.js's HEADERS_CONTENT (dist/_headers on the
// static site) — same header set, same report-only CSP posture. Not
// re-evaluated/tightened here; that's a deliberate follow-up once DNS
// cutover happens and it's clear which Cloudflare-specific allowances
// (cloudflareinsights.com) still apply once Cloudflare runs DNS-only in
// front of Vercel rather than proxying.
const CSP =
  "default-src 'self'; " +
  "script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com https://pagead2.googlesyndication.com https://*.googlesyndication.com https://*.google.com https://*.doubleclick.net https://*.adtrafficquality.google; " +
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
  'font-src https://fonts.gstatic.com; ' +
  "img-src 'self' data: https:; " +
  "connect-src 'self' https://cloudflareinsights.com https://static.cloudflareinsights.com https://*.googlesyndication.com https://*.google.com https://*.doubleclick.net https://*.adtrafficquality.google; " +
  'frame-src https://*.googlesyndication.com https://*.doubleclick.net https://*.google.com https://*.adtrafficquality.google; ' +
  "object-src 'none'; base-uri 'self'";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'geolocation=(), camera=(), microphone=()' },
          { key: 'Content-Security-Policy-Report-Only', value: CSP },
        ],
      },
    ];
  },
};

export default nextConfig;
