import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Server Component / Server Action / Route Handler Supabase client, bound to
// the request's cookies via next/headers. setAll can throw when called from
// a Server Component (which can't write response cookies) — proxy.ts already
// refreshes the session on every request, so that failure is safe to ignore
// here rather than surface as an error.
export async function createServerSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. ' +
        'Set these in web/.env.local (see web/.env.local.example).'
    );
  }

  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Called from a Server Component — proxy.ts handles session refresh.
        }
      },
    },
  });
}
