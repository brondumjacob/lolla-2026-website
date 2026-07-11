import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_URL } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Privacy Policy — Lolla Lineup 2026',
  description: 'Privacy policy for Lolla Lineup 2026, including information about cookies, analytics, advertising, and affiliate links.',
  alternates: { canonical: '/privacy' },
  openGraph: {
    title: 'Privacy Policy — Lolla Lineup 2026',
    description: 'Privacy policy for Lolla Lineup 2026, including information about cookies, analytics, advertising, and affiliate links.',
    url: `${SITE_URL}/privacy`,
    siteName: 'Lolla Lineup 2026',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Privacy Policy — Lolla Lineup 2026',
    description: 'Privacy policy for Lolla Lineup 2026.',
  },
};

export default function PrivacyPage() {
  return (
    <>
      <div className="wrap">
        <h1>Privacy Policy</h1>
        <div className="updated">Last updated: March 2026</div>

        <h2>What This Site Does</h2>
        <p>
          Lolla Lineup 2026 is a static, fan-made website that displays the Lollapalooza 2026 lineup with links to
          streaming platforms. We do not operate user accounts, collect personal information, or store any data
          about visitors on our own servers.
        </p>

        <h2>Analytics</h2>
        <p>
          We may use privacy-respecting analytics tools (such as Google Analytics or Cloudflare Web Analytics) to
          understand general traffic patterns like page views and referring sources. These tools may use cookies or
          similar technologies. No personally identifiable information is collected by us through these tools.
        </p>

        <h2>Advertising</h2>
        <p>
          This site may display advertisements served by third-party ad networks, including Google AdSense. These
          services may use cookies and similar tracking technologies to serve ads based on your browsing history. You
          can learn more about how Google uses your data at{' '}
          <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener">
            Google&apos;s partner sites policy
          </a>
          .
        </p>
        <p>
          You can opt out of personalized advertising by visiting{' '}
          <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener">
            Google Ad Settings
          </a>{' '}
          or{' '}
          <a href="https://optout.aboutads.info/" target="_blank" rel="noopener">
            aboutads.info
          </a>
          .
        </p>

        <h2>Affiliate Links</h2>
        <p>
          This site contains affiliate links to ticket vendors, including Ticketmaster (via Impact), StubHub (via
          Partnerize), and SeatGeek (via Impact). When you click on a ticket link and make a purchase, we may earn a
          commission at no additional cost to you. These affiliate relationships do not influence our editorial
          content or artist recommendations.
        </p>
        <p>Affiliate links are clearly identified in the ticket purchase sections of the site. We only link to legitimate, established ticket vendors.</p>

        <h2>External Links</h2>
        <p>
          This site links to Spotify, Apple Music, Lollapalooza.com, and ticket vendors. These third-party sites have
          their own privacy policies that we do not control. We encourage you to review their policies before using
          their services.
        </p>

        <h2>Cookies</h2>
        <p>This site itself does not set cookies. However, third-party services embedded on this site (advertising, analytics, fonts) may set their own cookies as described above.</p>

        <h2>Children</h2>
        <p>This site is not directed to children under 13. We do not knowingly collect information from children.</p>

        <h2>Changes</h2>
        <p>We may update this policy from time to time. Changes will be reflected on this page with an updated date.</p>

        <h2>Contact</h2>
        <p>
          Questions about this privacy policy can be directed to the site operator at{' '}
          <a href="mailto:jacob.t.brondum@gmail.com">jacob.t.brondum@gmail.com</a> or via the{' '}
          <Link href="/about">About page</Link>.
        </p>
      </div>

      <div className="ad-space">{/* AD SPACE */}</div>
    </>
  );
}
