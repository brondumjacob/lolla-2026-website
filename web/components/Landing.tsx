import Link from 'next/link';
import type { ArtistWithGenre } from '@/lib/types';
import { FESTIVAL, wordmarkParts } from '@/lib/festival';
import { getHeroHeadliners } from '@/lib/hero-headliners';
import LandingAuthCard from './LandingAuthCard';

interface LandingProps {
  artists: ArtistWithGenre[];
}

// The "5-second rule" landing page: hero (eyebrow, wordmark, one-line
// subhead, headliner proof line) + compact info-box, then two primary
// actions — View Lineup, Build Schedule — plus a lighter-weight sign-in
// prompt below them, and nothing else competing for attention. Sign-in is
// deliberately NOT a third equal-weight card: it's a tertiary, optional
// action (accounts enhance the experience by saving it, they don't gate it —
// see PRODUCT.md), so making it visually compete with the two real features
// undersold the hierarchy (found in an /impeccable critique of the first cut
// of this page, which used 3 identical cards). This is deliberately NOT the
// old homepage: the full 172-artist grid + filter bar live at /lineup now
// (see app/lineup/page.tsx and app/page.tsx). A server component except for
// the one element that needs live auth state (LandingAuthCard).
export default function Landing({ artists }: LandingProps) {
  const [wordmarkPre, wordmarkAccent, wordmarkPost] = wordmarkParts(FESTIVAL.wordmark);
  const heroHeadliners = getHeroHeadliners(artists);

  return (
    <div className="page-wrapper landing-wrapper">
      <header className="hero" role="banner">
        <div className="hero-inner">
          <p className="hero-eyebrow">
            {FESTIVAL.city}, {FESTIVAL.region} · {FESTIVAL.venue}
          </p>
          <h1 className="hero-title">
            {wordmarkPre}
            <span className="accent-word">{wordmarkAccent}</span>
            {wordmarkPost}
          </h1>
          <p className="hero-subtitle">
            {FESTIVAL.taglineBeforeCount} {artists.length} {FESTIVAL.taglineAfterCount}
          </p>
          {heroHeadliners.shown.length > 0 && (
            <p className="hero-headliners">
              Headlined by {heroHeadliners.shown.map((a) => a.name).join(' · ')}
              {heroHeadliners.remaining > 0
                ? ` + ${heroHeadliners.remaining} more artist${heroHeadliners.remaining === 1 ? '' : 's'}`
                : ''}
              .
            </p>
          )}
        </div>
      </header>

      <main id="main-content">
        <div className="info-box">
          <div className="info-box-when">
            <div className="info-box-dates">{FESTIVAL.datesDisplay}</div>
            <div className="info-box-venue">
              {FESTIVAL.venue} · {FESTIVAL.city}
            </div>
          </div>
          <div className="info-box-stats">
            <div className="info-stat">
              <span className="info-stat-num">{artists.length}</span>
              <span className="info-stat-label">Artists</span>
            </div>
            <div className="info-stat">
              <span className="info-stat-num">{FESTIVAL.stages}</span>
              <span className="info-stat-label">Stages</span>
            </div>
            <div className="info-stat">
              <span className="info-stat-num">{FESTIVAL.days}</span>
              <span className="info-stat-label">Days</span>
            </div>
          </div>
        </div>

        <nav className="landing-actions" aria-label="Main actions">
          <Link href="/lineup" className="landing-action-card landing-action-primary">
            <span className="landing-action-title">View the Lineup</span>
            <span className="landing-action-desc">
              {`Browse all ${artists.length} artists — search by name, filter by day or genre, and link straight to Spotify, Apple Music & YouTube.`}
            </span>
            <span className="landing-action-cta">Explore lineup →</span>
          </Link>
          <Link href="/schedule" className="landing-action-card">
            <span className="landing-action-title">Build Your Schedule</span>
            <span className="landing-action-desc">
              Pick sets across all four days, catch time conflicts before they happen, and print a walking route.
            </span>
            <span className="landing-action-cta">Start planning →</span>
          </Link>
        </nav>

        <LandingAuthCard />

        <p className="landing-footnote">
          An unofficial fan guide — not affiliated with {FESTIVAL.name}. Want more? See{' '}
          <Link href="/this-week">This Week</Link>, <Link href="/who-to-see">Who To See</Link>, or the{' '}
          <Link href="/faq">FAQ</Link>.
        </p>
      </main>
    </div>
  );
}
