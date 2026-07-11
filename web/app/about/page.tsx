import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_URL } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'About — Lolla Lineup 2026',
  description:
    'About Lolla Lineup 2026 — an unofficial fan-made guide to the complete Lollapalooza 2026 lineup with streaming links, editorial guides, and festival tips.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About — Lolla Lineup 2026',
    description:
      'About Lolla Lineup 2026 — an unofficial fan-made guide to the complete Lollapalooza 2026 lineup with streaming links, editorial guides, and festival tips.',
    url: `${SITE_URL}/about`,
    siteName: 'Lolla Lineup 2026',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'About — Lolla Lineup 2026',
    description: 'An unofficial fan-made guide to the complete Lollapalooza 2026 lineup.',
  },
};

export default function AboutPage() {
  return (
    <>
      <div className="wrap">
        <h1>About Lolla Lineup 2026</h1>
        <div className="tag">An unofficial fan-made lineup guide</div>

        <h2>Why This Site Exists</h2>
        <p>
          When the Lollapalooza 2026 lineup dropped, we did what everyone does — scrolled through the poster,
          recognized some names, and immediately started searching for the rest. The problem is that a festival
          poster doesn&apos;t tell you anything about 172 artists. You can&apos;t click a name on an image. You
          can&apos;t filter by genre or day. You can&apos;t quickly preview an artist you&apos;ve never heard of.
        </p>
        <p>
          We built this site to solve that specific problem. Every artist on the Lollapalooza 2026 lineup is listed
          here with a direct link to their Spotify and Apple Music pages. Search by name, filter by genre, tier, or
          day, and start listening immediately. The goal is simple: help you discover more music and build a better
          schedule before you get to Grant Park.
        </p>

        <h2>What You&apos;ll Find Here</h2>
        <p>
          The <Link href="/">lineup page</Link> is the core of the site — a complete, searchable directory of all 172
          artists with streaming links, filterable by genre (Pop, Rock, Hip-Hop, Electronic, EDM, Indie, K-Pop, R&amp;B,
          and more), by tier (Headliners, Major Acts, Undercard), and by day (Thursday through Sunday).
        </p>
        <p>
          Beyond the lineup, we&apos;ve written original editorial guides to help you get more out of the festival.
          Our <Link href="/who-to-see">Who To See</Link> guide breaks down each day with specific recommendations and
          schedule conflict warnings. The <Link href="/first-timers-guide">First Timer&apos;s Guide</Link> covers everything
          practical — transit, what to bring, food, safety, and how to pace yourself across four days. And our{' '}
          <Link href="/undercard-picks">Undercard Picks</Link> spotlight ten lesser-known artists worth rearranging your
          schedule for.
        </p>

        <h2>How It&apos;s Built</h2>
        <p>
          This site is intentionally simple. It&apos;s a static site — plain HTML, CSS, and JavaScript with no
          server-side code, no frameworks, and no build process. Artist data lives in a single JavaScript file that
          drives the interactive lineup. The site loads fast, works on any device, and doesn&apos;t require an
          account or personal information. We believe a festival guide should be fast, accessible, and free.
        </p>

        <h2>Accuracy and Updates</h2>
        <p>
          The lineup information is based on the official Lollapalooza 2026 announcement from March 2026, including
          the day-by-day schedule (Thursday July 30 through Sunday August 2). Stage assignments are not yet included
          as they have not been officially released. If you notice any errors, missing artists, or broken links, we
          want to hear about it.
        </p>

        <h2>Affiliate Links and Advertising</h2>
        <p>
          This site includes affiliate links to ticket vendors (Ticketmaster, StubHub, and SeatGeek). If you purchase
          tickets through these links, we may earn a small commission at no extra cost to you. This helps cover the
          costs of building and maintaining the site. We also display advertisements through Google AdSense. We will
          never compromise editorial content to serve advertisers, and our recommendations are based solely on the
          music.
        </p>

        <h2>Disclaimer</h2>
        <p>
          This is an unofficial, fan-made resource and is not affiliated with, endorsed by, or connected to
          Lollapalooza, C3 Presents, Live Nation, Spotify, or Apple Music. All artist names and lineup information
          are sourced from publicly available announcements. All trademarks belong to their respective owners.
        </p>

        <h2>For Official Information</h2>
        <p>
          For official tickets, schedules, and festival information, visit{' '}
          <a href="https://www.lollapalooza.com" target="_blank" rel="noopener">
            lollapalooza.com
          </a>
          .
        </p>

        <h2>Contact</h2>
        <p>
          Questions, corrections, or feedback? Reach us at{' '}
          <a href="mailto:jacob.t.brondum@gmail.com">jacob.t.brondum@gmail.com</a>.
        </p>
      </div>

      <div className="ad-space">{/* AD SPACE */}</div>
    </>
  );
}
