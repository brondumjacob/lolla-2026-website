import type { Metadata } from 'next';
import { getArtistsWithGenres } from '@/lib/data';
import MyLineupList from '@/components/MyLineupList';

export const metadata: Metadata = {
  title: 'My Lineup — Lolla Lineup 2026',
  description: "Your personal Lollapalooza 2026 lineup — the artists you've starred.",
  robots: { index: false, follow: false },
};

// Public route, not auth-protected: anonymous visitors see their
// localStorage-only picks, signed-in visitors see their Supabase-synced
// favorites — both resolved client-side by MyLineupList via useFavorites().
// The artist list itself is fetched at build time, same as the homepage, so
// this page still prerenders statically.
export default async function MyLineupPage() {
  const artists = await getArtistsWithGenres();

  return (
    <div className="wrap" style={{ maxWidth: 760 }}>
      <MyLineupList artists={artists} />
    </div>
  );
}
