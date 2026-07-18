import type { Metadata } from 'next';
import Link from 'next/link';
import { getArtistsWithGenres } from '@/lib/data';
import LineupExplorer from '@/components/LineupExplorer';
import { SITE_URL } from '@/lib/constants';
import { FESTIVAL } from '@/lib/festival';
import { websiteJsonLd, musicFestivalJsonLd } from '@/lib/structured-data';

export const metadata: Metadata = {
  title: `${FESTIVAL.siteName} — Complete Lineup with Streaming Links`,
  description: `The complete ${FESTIVAL.fullName} lineup with direct streaming links. Searchable by genre and day. ${FESTIVAL.venue}, ${FESTIVAL.city} — ${FESTIVAL.datesDisplay}.`,
  keywords: `${FESTIVAL.name.toLowerCase()} ${FESTIVAL.year}, lolla lineup, ${FESTIVAL.name.toLowerCase()} artists, ${FESTIVAL.city.toLowerCase()} music festival, ${FESTIVAL.venue.toLowerCase()}, charli xcx, lorde, tate mcrae`,
  alternates: { canonical: '/' },
  openGraph: {
    title: FESTIVAL.siteName,
    description: `The complete ${FESTIVAL.fullName} lineup with direct streaming links, searchable by genre. ${FESTIVAL.venue}, ${FESTIVAL.city} — ${FESTIVAL.datesDisplay}.`,
    url: SITE_URL,
    siteName: FESTIVAL.siteName,
    images: ['/lineup.png'],
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: FESTIVAL.siteName,
    description: `The complete ${FESTIVAL.fullName} lineup with direct streaming links, searchable by genre. ${FESTIVAL.venue}, ${FESTIVAL.city} — ${FESTIVAL.datesDisplay}.`,
    images: ['/lineup.png'],
  },
};

// Compact pill strip replacing the old large .guide-cards boxes — every guide
// is still one click away, it just doesn't cost a full card's worth of
// vertical space anymore. All are also reachable from the hamburger menu
// (Nav.tsx) and the footer; this is the in-flow, above-the-lineup version.
const EXPLORE_LINKS = [
  { href: '/this-week', label: 'This Week' },
  { href: '/who-to-see', label: 'Who To See' },
  { href: '/first-timers-guide', label: "First Timer's Guide" },
  { href: '/undercard-picks', label: 'Undercard Picks' },
  { href: '/genre-guide', label: 'Genre Guide' },
  { href: '/lolla-history', label: 'Lolla History' },
  { href: '/faq', label: 'FAQ' },
] as const;

export default async function HomePage() {
  const artists = await getArtistsWithGenres();

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd()) }} />
      {/* MusicFestival schema — dates, venue, every artist as a performer, and
          one MusicEvent sub-event per festival day. The main AEO/GEO addition:
          this is the structured data an AI Overview or answer engine would
          need to cite "who's playing Lollapalooza 2026" or "who plays
          Saturday" directly, without crawling the whole filtered grid. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(musicFestivalJsonLd(artists)) }}
      />

      {/* Prompt 2 redesign: the homepage editorial essay and the large
          .guide-cards boxes were removed from here — not deleted. The prose
          already had a fuller, more specific treatment on the destination
          guide pages (who-to-see's day-by-day sections, first-timers-guide's
          "The Basics", lolla-history's 1991 origin story, genre-guide's
          genre-by-genre breakdown) — see CLAUDE.md for exactly what was
          verified where. The lineup/guide destinations are still one click
          away via this pill strip, the hamburger menu, and the footer.

          Passed as a slot so it renders below the hero + info-box instead of
          above the hero — at phone widths the strip wrapped to three rows of
          pills before the site's own name was visible (mobile UX pass). */}
      <LineupExplorer
        artists={artists}
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
