import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Next.js 16 renamed the middleware.ts file convention to proxy.ts (the
// `proxy` export replaces `middleware`) — see node_modules/next/dist/docs/
// 01-app/03-api-reference/03-file-conventions/proxy.md. This runs on every
// matched request, refreshes the Supabase session cookie, and redirects
// unauthenticated visitors away from protected routes.
const PROTECTED_PREFIXES = ['/account'];

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    // Fails open on missing config so a broken env var doesn't lock out
    // every route; createServerSupabaseClient() throws loudly elsewhere.
    return response;
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // getClaims() verifies the JWT signature rather than trusting a cookie
  // value, per @supabase/ssr's documented recommendation over getSession().
  const { data: claims } = await supabase.auth.getClaims();

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => request.nextUrl.pathname === prefix || request.nextUrl.pathname.startsWith(`${prefix}/`)
  );

  if (isProtected && !claims) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    // Match all paths except static assets, images, and metadata files —
    // running the session refresh on those would be wasted work and could
    // interfere with them loading.
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
