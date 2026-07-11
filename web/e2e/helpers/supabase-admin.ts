import { createClient } from '@supabase/supabase-js';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

// Playwright's test runner is a plain Node process — it doesn't go through
// Next.js's automatic .env.local loading, so the same file the app already
// reads from (web/.env.local, gitignored, never committed) needs to be
// parsed here too before any test can reach the real Supabase project.
export function loadEnvLocal(): void {
  const envPath = path.resolve(__dirname, '../../.env.local');
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, 'utf-8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}

function projectRef(supabaseUrl: string): string {
  const match = supabaseUrl.match(/^https:\/\/([a-z0-9]+)\.supabase\.co/);
  if (!match) throw new Error(`Could not parse project ref from ${supabaseUrl}`);
  return match[1];
}

export interface TestSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at?: number;
  token_type: string;
  user: { id: string; email?: string };
}

function adminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not configured');
  }
  return createClient(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
}

// Creates a real, admin-confirmed auth user via the Supabase Admin API.
// Google OAuth — this app's only sign-in method — has no automatable test
// path (no test-mode consent screen, no service account grant flow), so
// this is the standard documented Supabase pattern for E2E-testing an
// authenticated app: bootstrap a throwaway account server-side, then drive
// everything after that through real UI interactions against the real
// backend. See full-journey.spec.ts's skip reason for the full rationale.
export async function createConfirmedTestUser(email: string, password: string): Promise<string> {
  const { data, error } = await adminClient().auth.admin.createUser({ email, password, email_confirm: true });
  if (error || !data.user) throw new Error(`Failed to create test user: ${error?.message}`);
  return data.user.id;
}

export async function deleteTestUser(userId: string): Promise<void> {
  await adminClient().auth.admin.deleteUser(userId);
}

// A real password-grant sign-in against the live Supabase Auth API — the
// same HTTP call @supabase/ssr's browser client makes internally on any
// sign-in. There's no email/password form in this app's UI to drive it
// through (Google OAuth only, per Phase 4), so it's invoked directly here;
// everything downstream in the test still goes through real UI.
export async function passwordSignIn(
  supabaseUrl: string,
  anonKey: string,
  email: string,
  password: string
): Promise<TestSession> {
  const client = createClient(supabaseUrl, anonKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error || !data.session) throw new Error(`Password sign-in failed: ${error?.message}`);
  return data.session as TestSession;
}

// Reproduces the exact cookie @supabase/ssr's createBrowserClient writes
// after a successful sign-in (name `sb-<project-ref>-auth-token`, value
// `base64-` + base64url-encoded session JSON), so the app's real
// cookie-reading server code (proxy.ts, server actions, RSC data fetches)
// treats this precisely like any other authenticated session — nothing
// about the app is bypassed except the OAuth consent screen itself.
export function buildSessionCookie(baseURL: string, supabaseUrl: string, session: TestSession) {
  const ref = projectRef(supabaseUrl);
  const value = 'base64-' + Buffer.from(JSON.stringify(session), 'utf-8').toString('base64url');
  return {
    url: baseURL,
    name: `sb-${ref}-auth-token`,
    value,
    httpOnly: false,
    secure: baseURL.startsWith('https'),
  };
}
