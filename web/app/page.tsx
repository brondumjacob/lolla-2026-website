import type { Metadata } from 'next';
import Link from 'next/link';
import { getArtistsWithGenres } from '@/lib/data';
import LineupExplorer from '@/components/LineupExplorer';
import { SITE_URL } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Lolla Lineup 2026 — Complete Lineup with Streaming Links',
  description:
    'The complete Lollapalooza 2026 lineup with direct streaming links. 172 artists, searchable by genre and day. Grant Park, Chicago — July 30 to August 2.',
  keywords:
    'lollapalooza 2026, lolla lineup, lollapalooza artists, chicago music festival, grant park, charli xcx, lorde, tate mcrae',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Lolla Lineup 2026',
    description: 'The complete Lollapalooza 2026 lineup with direct streaming links. 172 artists, searchable by genre. Grant Park, Chicago — July 30 to August 2.',
    url: SITE_URL,
    siteName: 'Lolla Lineup 2026',
    images: ['/lineup.png'],
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lolla Lineup 2026',
    description: 'The complete Lollapalooza 2026 lineup with direct streaming links. 172 artists, searchable by genre. Grant Park, Chicago — July 30 to August 2.',
    images: ['/lineup.png'],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Lolla Lineup 2026',
  url: SITE_URL,
  description: 'The complete Lollapalooza 2026 lineup with direct streaming links. 172 artists, searchable by genre and day.',
  publisher: {
    '@type': 'Organization',
    name: 'Lolla Lineup 2026',
    url: SITE_URL,
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
] as const;

export default async function HomePage() {
  const artists = await getArtistsWithGenres();

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Prompt 2 redesign: the homepage editorial essay and the large
          .guide-cards boxes were removed from here — not deleted. The prose
          already had a fuller, more specific treatment on the destination
          guide pages (who-to-see's day-by-day sections, first-timers-guide's
          "The Basics", lolla-history's 1991 origin story, genre-guide's
          genre-by-genre breakdown) — see CLAUDE.md for exactly what was
          verified where. The lineup/guide destinations are still one click
          away via this pill strip, the hamburger menu, and the footer. */}
      <nav className="explore-strip" aria-label="Explore more">
        {EXPLORE_LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="explore-pill">
            {link.label}
          </Link>
        ))}
      </nav>

      <LineupExplorer artists={artists} />
    </>
  );
}
