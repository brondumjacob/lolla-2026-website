import type { Metadata } from 'next';
import Link from 'next/link';
import { getArtistsWithGenres } from '@/lib/data';
import LineupExplorer from '@/components/LineupExplorer';
import EditorialToggle from '@/components/EditorialToggle';
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

export default async function HomePage() {
  const artists = await getArtistsWithGenres();

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="editorial-intro">
        <h2 className="editorial-title">THE 2026 LINEUP, UNPACKED</h2>
        <p>
          Lollapalooza returns to Grant Park for its 2026 edition with one of the most genre-diverse lineups in the
          festival&apos;s history. Spread across four days — Thursday, July 30 through Sunday, August 2 — the bill runs
          172 artists deep, from arena-headlining pop acts to underground electronic producers playing their first
          major U.S. festival slot.
        </p>
        <p>
          The festival unfolds across eight stages inside Grant Park&apos;s 319 acres on Chicago&apos;s lakefront,
          with the city&apos;s skyline as a backdrop for every set. General admission, GA+, and VIP tiers are all
          available for single days or the full four-day run, and gates open at 11 AM each day with music running
          until 10 PM.
        </p>
        <EditorialToggle>
          <p>
            The headliner tier alone tells the story of where popular music stands in 2026. Charli XCX rides the
            cultural momentum of <em>brat</em> into a Friday night headline set. Lorde brings a decade of critically
            acclaimed alt-pop to open the festival on Thursday. K-Pop is represented at the top with Jennie&apos;s
            solo headline on Saturday, while The Smashing Pumpkins offer a direct line back to Lollapalooza&apos;s
            1990s origins — the band played the festival&apos;s original touring lineup in 1994. Sunday closes with
            Tate McRae&apos;s arena-pop spectacle alongside The XX&apos;s minimalist indie, a pairing that captures
            the festival&apos;s range in a single evening.
          </p>
          <p>
            Below the headliners, the lineup rewards exploration. The major tier includes Freddie Gibbs and Clipse
            for hip-hop purists, Turnstile for the hardcore-crossover crowd, and Ethel Cain&apos;s gothic Americana
            for anyone who wants to feel something. The undercard is where Lolla 2026 quietly stacks its strongest
            hand — Little Simz, Wolf Alice, Paris Paloma, and Geese are all artists playing stages smaller than their
            talent warrants. That&apos;s the real opportunity: catching tomorrow&apos;s headliners on today&apos;s
            side stages.
          </p>
          <p>
            Lollapalooza&apos;s genre range didn&apos;t happen by accident — it&apos;s been the festival&apos;s
            defining trait since Perry Farrell built the original touring bill in 1991. Read the full{' '}
            <Link href="/lolla-history">history of Lollapalooza</Link> for how a one-off farewell tour became a
            Chicago institution, or dig into our <Link href="/genre-guide">genre-by-genre breakdown</Link> of
            everything on this year&apos;s bill.
          </p>
          <p>
            Use the filters below to explore the full lineup by day, genre, or tier. Every artist links directly to
            Spotify, Apple Music, and YouTube Music so you can start building your personal schedule now.
          </p>
        </EditorialToggle>
      </div>

      <div className="guide-cards">
        <Link href="/who-to-see" className="guide-card">
          <div className="guide-card-title">WHO TO SEE</div>
          <div className="guide-card-desc">Day-by-day recommendations across every genre, from headliners to hidden gems.</div>
        </Link>
        <Link href="/first-timers-guide" className="guide-card">
          <div className="guide-card-title">FIRST TIMER&apos;S GUIDE</div>
          <div className="guide-card-desc">Everything you need to know about Grant Park, transit, what to bring, and pacing yourself.</div>
        </Link>
        <Link href="/undercard-picks" className="guide-card">
          <div className="guide-card-title">UNDERCARD PICKS</div>
          <div className="guide-card-desc">10 lesser-known artists worth rearranging your schedule for.</div>
        </Link>
        <Link href="/schedule" className="guide-card">
          <div className="guide-card-title">SCHEDULE BUILDER</div>
          <div className="guide-card-desc">Build your day-by-day route. Pick artists, flag must-sees, detect conflicts, and print your plan.</div>
        </Link>
      </div>

      <LineupExplorer artists={artists} />
    </>
  );
}
