import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_URL } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Terms of Use — Lolla Lineup 2026',
  description: 'Terms of use for Lolla Lineup 2026, an unofficial fan-made guide to the Lollapalooza 2026 lineup.',
  alternates: { canonical: '/terms' },
  openGraph: {
    title: 'Terms of Use — Lolla Lineup 2026',
    description: 'Terms of use for Lolla Lineup 2026, an unofficial fan-made guide to the Lollapalooza 2026 lineup.',
    url: `${SITE_URL}/terms`,
    siteName: 'Lolla Lineup 2026',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Terms of Use — Lolla Lineup 2026',
    description: 'Terms of use for Lolla Lineup 2026.',
  },
};

export default function TermsPage() {
  return (
    <>
      <div className="wrap">
        <h1>Terms of Use</h1>
        <div className="updated">Last updated: May 17, 2026</div>

        <h2>About This Site</h2>
        <p>
          Lolla Lineup 2026 is an independent, fan-made guide to the 2026 Lollapalooza festival. It is not affiliated
          with, endorsed by, or sponsored by Lollapalooza, C3 Presents, Live Nation, Spotify, Apple Music, or any
          artist listed.
        </p>

        <h2>Use of Content</h2>
        <p>
          Content on this site is provided for personal, non-commercial informational use. Artist names, song
          titles, and trademarks belong to their respective owners. Lineup information is sourced from publicly
          available announcements and may change.
        </p>

        <h2>No Warranty</h2>
        <p>
          We try to keep information accurate, but we make no warranty that listings, dates, set times, or links are
          correct or current. Always confirm festival details at{' '}
          <a href="https://www.lollapalooza.com" rel="noopener" target="_blank">
            lollapalooza.com
          </a>{' '}
          before making travel or purchase decisions.
        </p>

        <h2>External Links</h2>
        <p>This site links to third-party services including Spotify, Apple Music, YouTube Music, and ticket vendors. We are not responsible for the content, accuracy, or practices of those sites.</p>

        <h2>Affiliate Disclosure</h2>
        <p>
          This site may contain affiliate links to ticket vendors. We may earn a commission if you purchase through
          these links, at no additional cost to you. See our <Link href="/privacy">Privacy Policy</Link> for details.
        </p>

        <h2>Changes</h2>
        <p>We may update these terms at any time. Continued use of the site constitutes acceptance of the current terms.</p>

        <h2>Contact</h2>
        <p>
          Questions about these terms? <Link href="/contact">Contact us</Link>.
        </p>
      </div>

      <div className="ad-space">{/* AD SPACE */}</div>
    </>
  );
}
