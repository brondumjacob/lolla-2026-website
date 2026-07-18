import type { Metadata } from 'next';
import Link from 'next/link';
import { getArtistsWithGenres } from '@/lib/data';
import { DAY_META } from '@/lib/constants';
import Countdown from '@/components/Countdown';
import { SITE_URL } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'This Week at Lolla 2026 — Countdown & Day-by-Day Headliners',
  description:
    'Countdown to Lollapalooza 2026 and a day-by-day breakdown of every headliner across Thursday through Sunday, July 30 – August 2 at Grant Park, Chicago.',
  alternates: { canonical: '/this-week' },
  openGraph: {
    title: 'This Week at Lolla 2026',
    description: 'Countdown to Lollapalooza 2026 and a day-by-day breakdown of every headliner, Thursday through Sunday.',
    url: `${SITE_URL}/this-week`,
    siteName: 'Lolla Lineup 2026',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'This Week at Lolla 2026',
    description: 'Countdown to Lollapalooza 2026 and a day-by-day breakdown of every headliner.',
  },
};

export default async function ThisWeekPage() {
  const artists = await getArtistsWithGenres();
  const headliners = artists.filter((a) => a.tier === 'headliner');

  return (
    <div className="wrap this-week-wrap">
      <div className="tag">Jul 30 – Aug 2, 2026 · Grant Park, Chicago</div>
      <h1>This Week at Lolla 2026</h1>
      <p>
        Four days, 172 artists, eight stages. Here&apos;s the countdown and a day-by-day look at who&apos;s
        headlining, so you can see the whole weekend at a glance before you dive into the{' '}
        <Link href="/">full lineup</Link> or start on your <Link href="/schedule">schedule</Link>.
      </p>

      <Countdown />

      <div className="this-week-days">
        {[1, 2, 3, 4].map((d) => {
          const meta = DAY_META[d];
          const allOnDay = artists.filter((a) => a.day === d);
          const headlinersOnDay = headliners.filter((a) => a.day === d);
          return (
            <div key={d} className={`tw-day-card tw-day-${d}`}>
              <div className="tw-day-top">
                <div>
                  <div className="tw-day-name">{meta.name}</div>
                  <div className="tw-day-date">{meta.date}, 2026</div>
                </div>
                <div className="tw-day-count">
                  <span className="tw-day-count-num">{allOnDay.length}</span>
                  <span className="tw-day-count-label">artists</span>
                </div>
              </div>
              <div className="tw-day-headliners">{headlinersOnDay.map((h) => h.name).join(' · ') || 'TBA'}</div>
              <Link href={`/schedule/${meta.name.toLowerCase()}`} className="tw-day-cta">
                Build {meta.name.toLowerCase()} →
              </Link>
            </div>
          );
        })}
      </div>

      <p>
        Want recommendations beyond the headliners? Read <Link href="/who-to-see">Who To See at Lolla 2026</Link>{' '}
        for day-by-day picks, or browse the <Link href="/">full searchable lineup</Link>.
      </p>
    </div>
  );
}
