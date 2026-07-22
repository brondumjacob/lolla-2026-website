import type { Metadata } from 'next';
import { getArtistsWithGenres } from '@/lib/data';
import Landing from '@/components/Landing';
import { SITE_URL } from '@/lib/constants';
import { FESTIVAL } from '@/lib/festival';
import { websiteJsonLd, musicFestivalJsonLd, faqPageJsonLd, resolveFaqs, jsonLdScript } from '@/lib/structured-data';

export const metadata: Metadata = {
  title: `${FESTIVAL.siteName} — Lineup, Schedule Builder & Streaming Links`,
  description: `${FESTIVAL.fullName} at a glance — the full lineup, a real day-by-day schedule builder, and direct streaming links. ${FESTIVAL.venue}, ${FESTIVAL.city} — ${FESTIVAL.datesDisplay}.`,
  keywords: `${FESTIVAL.name.toLowerCase()} ${FESTIVAL.year}, lolla lineup, ${FESTIVAL.name.toLowerCase()} schedule, ${FESTIVAL.city.toLowerCase()} music festival, ${FESTIVAL.venue.toLowerCase()}`,
  alternates: { canonical: '/' },
  openGraph: {
    title: FESTIVAL.siteName,
    description: `${FESTIVAL.fullName} at a glance — the full lineup, a real day-by-day schedule builder, and direct streaming links. ${FESTIVAL.venue}, ${FESTIVAL.city} — ${FESTIVAL.datesDisplay}.`,
    url: SITE_URL,
    siteName: FESTIVAL.siteName,
    images: [{ url: '/lineup.jpg', width: 1200, height: 1500, alt: `${FESTIVAL.fullName} lineup poster` }],
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: FESTIVAL.siteName,
    description: `${FESTIVAL.fullName} at a glance — the full lineup, a schedule builder, and direct streaming links.`,
    images: ['/lineup.jpg'],
  },
};

export default async function HomePage() {
  const artists = await getArtistsWithGenres();
  const faqs = resolveFaqs(FESTIVAL.faqs, artists.length);

  return (
    <>
      {/* WebSite + Organization entity graph (with SearchAction) — see
          lib/structured-data.ts. This is the canonical page for the site's
          own identity. */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(websiteJsonLd()) }} />
      {/* MusicFestival schema — dates, venue, every artist as a performer, and
          one MusicEvent sub-event per festival day. The main AEO/GEO addition:
          this is the structured data an AI Overview or answer engine would
          need to cite "who's playing Lollapalooza 2026" or "who plays
          Saturday" directly, without crawling the whole filtered grid (that
          now lives at /lineup — see app/lineup/page.tsx's CollectionPage
          schema for the page-level equivalent there). Kept on the landing
          page since this is the canonical URL for the festival entity. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(musicFestivalJsonLd(artists)) }}
      />
      {/* FAQPage — duplicated from /faq (same FESTIVAL.faqs source) because
          the landing page is the page most likely to be surfaced by an AI
          answer engine; having the FAQ answers structured here too raises the
          odds they get cited directly. */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(faqPageJsonLd(faqs)) }} />

      <Landing artists={artists} />
    </>
  );
}
