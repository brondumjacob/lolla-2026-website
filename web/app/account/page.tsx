import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import SignOutButton from '@/components/SignOutButton';

export const metadata: Metadata = {
  title: 'Account — Lolla Lineup 2026',
  robots: { index: false, follow: false },
  alternates: { canonical: '/account' },
};

export default async function AccountPage() {
  const supabase = await createServerSupabaseClient();

  // proxy.ts already redirects anonymous requests away from /account, but a
  // Server Function invoked directly bypasses proxy's matcher — Next's own
  // proxy.md docs call out re-checking auth here rather than relying on
  // proxy alone.
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims) {
    redirect('/login?next=/account');
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="wrap account-wrap">
      <h1>Account</h1>
      <p className="account-email">{user?.email}</p>

      <div className="account-panel">
        <h2>Your lineup &amp; schedules</h2>
        <p>
          Your starred artists sync to your account automatically — <Link href="/my-lineup">view your lineup</Link>.
          Multi-day schedules land here in a later phase of the migration.
        </p>
      </div>

      <SignOutButton />
    </div>
  );
}
