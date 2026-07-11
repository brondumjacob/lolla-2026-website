'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase-browser';
import SignOutButton from './SignOutButton';

// Display-only: uses getUser()/onAuthStateChange (fresh session data) rather
// than getClaims(), which is reserved for the security-relevant decision in
// proxy.ts per @supabase/ssr's documented getClaims-vs-getUser guidance.
export default function AuthStatus() {
  const [email, setEmail] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();

    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
      setLoaded(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user.email ?? null);
      setLoaded(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!loaded) return null;

  if (!email) {
    return (
      <Link href="/login" className="nav-signin">
        Sign in
      </Link>
    );
  }

  return (
    <div className="nav-auth">
      <Link href="/account" className="nav-account" title={email}>
        {email}
      </Link>
      <SignOutButton />
    </div>
  );
}
