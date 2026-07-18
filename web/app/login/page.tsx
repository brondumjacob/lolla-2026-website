import type { Metadata } from 'next';
import GoogleSignInButton from '@/components/GoogleSignInButton';

export const metadata: Metadata = {
  title: 'Sign In — Lolla Lineup 2026',
  description: 'Sign in to save your favorite artists and build your Lollapalooza 2026 schedule.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/login' },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;

  return (
    <div className="wrap login-wrap">
      <div className="login-card">
        <h1>Sign in</h1>
        <p className="login-sub">Save your favorite artists and build a schedule across all four days.</p>

        {error && <p className="login-error">Something went wrong signing you in. Please try again.</p>}

        <GoogleSignInButton next={next} />

        {/* Email/password sign-in is deferred until custom SMTP (Resend) is
            configured — Supabase's built-in email provider caps at 2/hour,
            see 2026-07-09_lolla-accounts-migration-plan.md. Google OAuth is
            not subject to that cap, so it's the only method for now. */}
      </div>
    </div>
  );
}
