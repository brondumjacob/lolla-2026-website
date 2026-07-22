'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase-browser';

// A slim, tertiary sign-in prompt below the two primary action cards — split
// out as its own client component so Landing.tsx itself can stay a server
// component (mirrors AuthStatus.tsx's getUser()/onAuthStateChange pattern;
// see that file's comment on why getUser() rather than getClaims() is
// correct for display-only UI). Deliberately NOT a third landing-action-card:
// an /impeccable critique of the first cut of this page flagged that giving
// sign-in equal visual weight to "View the Lineup"/"Build Your Schedule"
// undersold the hierarchy — sign-in is optional (accounts save the
// experience, they don't gate it), so it should read as lighter than the two
// real features, not compete with them.
export default function LandingAuthCard() {
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

  if (!loaded) {
    // Reserve the row's height while auth state resolves so the page doesn't
    // jump — signed-out copy is the safe default render, not a link yet.
    return (
      <p className="landing-signin-row" aria-hidden="true">
        Want to save your schedule and favorites? <span className="landing-signin-link">Sign in</span>
      </p>
    );
  }

  if (!email) {
    return (
      <p className="landing-signin-row">
        Want to save your schedule and favorites?{' '}
        <Link href="/login" className="landing-signin-link">
          Sign in →
        </Link>
      </p>
    );
  }

  return (
    <p className="landing-signin-row">
      Signed in as {email}.{' '}
      <Link href="/account" className="landing-signin-link">
        My account →
      </Link>
    </p>
  );
}
