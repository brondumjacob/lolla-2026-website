import type { Metadata } from 'next';
import Link from 'next/link';
import { getArtistsWithGenres } from '@/lib/data';
import LineupExplorer from '@/components/LineupExplorer';
import { SITE_URL } from '@/lib/constants';
import { FESTIVAL } from '@/lib/festival';
import { isFestivalOver } from '@/lib/festival-status';
import { collectionPageJsonLd, jsonLdScript } from '@/lib/structured-data';

// Hourly ISR: the SoundCloud search link (see lib/soundcloud.ts) needs its
// "has the festival ended" check to flip on its own after FESTIVAL.endDate
// without a manual redeploy. Without revalidate this page would otherwise
// stay statically frozen at whatever `festivalIsOver` was at the last build.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: `Full ${FESTIVAL.fullName} Lineup — Every Artist, Direct Streaming Links`,
  description: `Browse the complete ${FESTIVAL.fullName} lineup — search by name, filter by day or genre, and jump straight to each artist's Spotify, Apple Music, and YouTube Music page. ${FESTIVAL.venue}, ${FESTIVAL.city} — ${FESTIVAL.datesDisplay}.`,
  keywords: `${FESTIVAL.name.toLowerCase()} ${FESTIVAL.year} lineup, ${FESTIVAL.name.toLowerCase()} artists, full lineup, ${FESTIVAL.city.toLowerCase()} music festival, charli xcx, lorde, tate mcrae`,
  alternates: { canonical: '/lineup' },
  openGraph: {
    title: `Full Lineup — ${FESTIVAL.siteName}`,
    description: `Browse the complete ${FESTIVAL.fullName} lineup with direct streaming links, searchable by genre and day.`,
    url: `${SITE_URL}/lineup`,
    siteName: FESTIVAL.siteName,
    images: [{ url: '/lineup.jpg', width: 1200, height: 1500, alt: `${FESTIVAL.fullName} lineup poster` }],
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: `Full Lineup — ${FESTIVAL.siteName}`,
    description: `Browse the complete ${FESTIVAL.fullName} lineup with direct streaming links, searchable by genre.`,
    images: ['/lineup.jpg'],
  },
};

// Compact pill strip replacing the old large .guide-cards boxes — every guide
// is still one click away, it just doesn't cost a full card's worth of
// vertical space anymore. All are also reachable from the hamburger menu
// (Nav.tsx) and the footer; this is the in-flow, above-the-grid version.
// Moved here verbatim from the old homepage (page.tsx) when the lineup grid
// split off /lineup — see CLAUDE.md's "5-Second Rule" landing-page pass.
const EXPLORE_LINKS = [
  { href: '/this-week', label: 'This Week' },
  { href: '/who-to-see', label: 'Who To See' },
  { href: '/first-timers-guide', label: "First Timer's Guide" },
  { href: '/undercard-picks', label: 'Undercard Picks' },
  { href: '/genre-guide', label: 'Genre Guide' },
  { href: '/lolla-history', label: 'Lolla History' },
  { href: '/faq', label: 'FAQ' },
] as const;

export default async function LineupPage() {
  const artists = await getArtistsWithGenres();
  const festivalIsOver = isFestivalOver(new Date());

  return (
    <>
      {/* CollectionPage/ItemList schema for this page — the MusicFestival
          entity itself (all 172 performers, per-day sub-events) lives on the
          landing page (`/`, see app/page.tsx); this describes the grid page,
          referencing that WebSite by @id rather than re-declaring it. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(collectionPageJsonLd(artists)) }}
      />

      <LineupExplorer
        artists={artists}
        festivalIsOver={festivalIsOver}
        exploreSlot={
          /* key silences React's dev warning for server-created elements
             rendered into a client component's child list (RSC deserialization
             drops the static-children flag). */
          <nav key="explore-strip" className="explore-strip" aria-label="Explore more">
            {EXPLORE_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="explore-pill">
                {link.label}
              </Link>
            ))}
          </nav>
        }
      />
    </>
  );
}
