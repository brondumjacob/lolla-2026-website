import type { Metadata } from 'next';
import { getArtistsWithGenres } from '@/lib/data';
import { isFestivalOver } from '@/lib/festival-status';
import MyLineupList from '@/components/MyLineupList';

export const metadata: Metadata = {
  title: 'My Lineup — Lolla Lineup 2026',
  description: "Your personal Lollapalooza 2026 lineup — the artists you've starred.",
  robots: { index: false, follow: false },
  alternates: { canonical: '/my-lineup' },
};

// See app/lineup/page.tsx for why this needs hourly ISR — same SoundCloud
// cutover check, same need to flip automatically without a redeploy.
export const revalidate = 3600;

// Public route, not auth-protected: anonymous visitors see their
// localStorage-only picks, signed-in visitors see their Supabase-synced
// favorites — both resolved client-side by MyLineupList via useFavorites().
// The artist list itself is fetched at request time on an hourly ISR cache
// (see `revalidate` above) — previously build-time-only/fully static, changed
// so the SoundCloud cutover check below refreshes without a redeploy.
export default async function MyLineupPage() {
  const artists = await getArtistsWithGenres();
  const festivalIsOver = isFestivalOver(new Date());

  return (
    <div className="wrap" style={{ maxWidth: 760 }}>
      <MyLineupList artists={artists} festivalIsOver={festivalIsOver} />
    </div>
  );
}
