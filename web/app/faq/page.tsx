import type { Metadata } from 'next';
import Link from 'next/link';
import { getArtistsWithGenres } from '@/lib/data';
import { SITE_URL } from '@/lib/constants';
import { FESTIVAL } from '@/lib/festival';
import { faqPageJsonLd, breadcrumbJsonLd, resolveFaqs } from '@/lib/structured-data';

export const metadata: Metadata = {
  title: `${FESTIVAL.fullName} FAQ — Dates, Venue, Lineup & Schedule`,
  description: `Answers to the most common questions about ${FESTIVAL.fullName}: dates, venue, headliners, gate times, streaming, and the schedule builder.`,
  alternates: { canonical: '/faq' },
  openGraph: {
    title: `${FESTIVAL.fullName} FAQ`,
    description: `Dates, venue, headliners, gate times, and how to plan your ${FESTIVAL.shortName} schedule.`,
    url: `${SITE_URL}/faq`,
    siteName: FESTIVAL.siteName,
    images: ['/lineup.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${FESTIVAL.fullName} FAQ`,
    description: `Dates, venue, headliners, gate times, and how to plan your ${FESTIVAL.shortName} schedule.`,
    images: ['/lineup.png'],
  },
};

// This page exists primarily for AEO/GEO — FAQPage schema is one of the
// highest-leverage structured-data types for getting cited by AI answer
// engines (Google AI Overviews, ChatGPT, Perplexity, Claude). Content is
// config-driven (FESTIVAL.faqs in lib/festival.ts) so it templates directly
// to the next festival; the artist count is resolved from live data here so
// it never drifts out of sync with what's actually in Supabase.
export default async function FaqPage() {
  const artists = await getArtistsWithGenres();
  const faqs = resolveFaqs(FESTIVAL.faqs, artists.length);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageJsonLd(faqs)) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: 'Home', url: SITE_URL },
              { name: 'FAQ', url: `${SITE_URL}/faq` },
            ])
          ),
        }}
      />

      <div className="article-wrap">
        <div className="article-header">
          <h1 className="article-title">{FESTIVAL.fullName} — Frequently Asked Questions</h1>
          <div className="article-meta">Dates, venue, lineup, and planning basics</div>
        </div>

        <p className="article-intro">
          Quick answers to the questions we hear most about {FESTIVAL.fullName} — when it is, where it&apos;s held,
          who&apos;s playing, and how to use this site to plan your weekend.
        </p>

        <div className="article-body">
          {faqs.map((faq) => (
            <div key={faq.q}>
              <h2>{faq.q}</h2>
              <p>{faq.a}</p>
            </div>
          ))}

          <p>
            Check the <Link href="/">full lineup</Link>, read our{' '}
            <Link href="/first-timers-guide">first timer&apos;s guide</Link>, or start building your{' '}
            <Link href="/schedule">schedule</Link>.
          </p>
        </div>
      </div>
    </>
  );
}
