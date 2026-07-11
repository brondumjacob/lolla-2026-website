import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// Google redirects here with a PKCE `code` after Supabase's own
// /auth/v1/callback step. Exchanging it here (server-side) lets
// @supabase/ssr write the session cookie via next/headers' cookies().
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  const loginUrl = new URL('/login', origin);
  loginUrl.searchParams.set('error', 'auth_callback_failed');
  return NextResponse.redirect(loginUrl);
}
