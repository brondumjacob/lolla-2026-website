import { createBrowserClient } from '@supabase/ssr';

// Client-Component Supabase client — session lives in cookies managed by
// proxy.ts, so auth state here stays in sync across tabs/reloads without a
// server round-trip. Used only where 'use client' components need auth
// (AuthStatus, GoogleSignInButton) so the static content pages aren't
// affected.
export function createBrowserSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. ' +
        'Set these in web/.env.local (see web/.env.local.example).'
    );
  }

  return createBrowserClient(url, key);
}
