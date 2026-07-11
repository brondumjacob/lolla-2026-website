import { NextResponse, type NextRequest } from 'next/server';
import { createBuildTimeClient } from '@/lib/supabase';

// Vercel sends CRON_SECRET as a Bearer token on every scheduled invocation
// (see vercel.json's `crons` entry) — this is Vercel's documented way to
// distinguish a real cron trigger from a public unauthenticated hit on the
// same URL. A cheap read against a public-read table is enough to register
// as database activity and keep the Supabase Free tier project from
// auto-pausing after 7 days of inactivity.
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  const supabase = createBuildTimeClient();
  const { error } = await supabase.from('festivals').select('id').limit(1).single();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
