import { createClient } from '@supabase/supabase-js';

// Build-time-only client for static generation of public content pages.
// festivals/artists/artist_genres are public-read tables (see
// supabase/migrations/0001_init.sql), so the publishable/anon key is
// sufficient here — no @supabase/ssr / cookie-bound client needed until
// Phase 4 wires up authenticated routes.
export function createBuildTimeClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. ' +
        'Set these in web/.env.local (see web/.env.local.example) before running `next build` or `next dev`.'
    );
  }

  return createClient(url, key);
}
