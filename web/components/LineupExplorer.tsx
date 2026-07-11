'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ArtistWithGenre } from '@/lib/types';
import { DAY_META } from '@/lib/constants';
import StarToggle from './StarToggle';
import StreamingLinks from './StreamingLinks';

interface LineupExplorerProps {
  artists: ArtistWithGenre[];
}

function passesFilter(artist: ArtistWithGenre, activeDay: number, activeGenre: string, activeSearch: string) {
  const dayOk = activeDay === 0 || artist.day === activeDay;
  const genreOk = activeGenre === '' || artist.genre === activeGenre;
  const searchOk = activeSearch === '' || artist.name.toLowerCase().includes(activeSearch);
  return dayOk && genreOk && searchOk;
}

export default function LineupExplorer({ artists }: LineupExplorerProps) {
  const [activeDay, setActiveDay] = useState(0); // 0 = all
  const [activeGenre, setActiveGenre] = useState(''); // '' = all
  const [searchQuery, setSearchQuery] = useState(''); // raw input value
  const activeSearch = searchQuery.trim().toLowerCase();

  const headliners = useMemo(() => artists.filter((a) => a.tier === 'headliner'), [artists]);
  const majors = useMemo(() => artists.filter((a) => a.tier === 'major'), [artists]);
  const undercards = useMemo(() => artists.filter((a) => a.tier === 'undercard'), [artists]);

  const visibleHeadliners = useMemo(
    () => headliners.filter((a) => passesFilter(a, activeDay, activeGenre, activeSearch)),
    [headliners, activeDay, activeGenre, activeSearch]
  );
  const visibleMajors = useMemo(
    () => majors.filter((a) => passesFilter(a, activeDay, activeGenre, activeSearch)),
    [majors, activeDay, activeGenre, activeSearch]
  );
  const visibleUndercards = useMemo(
    () => undercards.filter((a) => passesFilter(a, activeDay, activeGenre, activeSearch)),
    [undercards, activeDay, activeGenre, activeSearch]
  );

  // Genre counts computed from the day-filtered pool only, matching the
  // original renderGenreList() behavior (genre picker narrows by day first).
  const genreCounts = useMemo(() => {
    const pool = activeDay === 0 ? artists : artists.filter((a) => a.day === activeDay);
    const counts = new Map<string, number>();
    for (const a of pool) counts.set(a.genre, (counts.get(a.genre) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [artists, activeDay]);

  function toggleDay(d: number) {
    setActiveDay((prev) => (prev === d && d !== 0 ? 0 : d));
    setActiveGenre('');
  }

  function toggleGenre(g: string) {
    setActiveGenre((prev) => (prev === g ? '' : g));
  }

  return (
    <div className="page-wrapper">
      <header className="hero" role="banner">
        <div className="hero-inner">
          <div className="hero-left">
            <p className="hero-eyebrow">Chicago, Illinois · Grant Park</p>
            <h1 className="hero-title">
              LOLLA<span className="accent-word">PA</span>LOOZA
            </h1>
            <p className="hero-subtitle">The Complete 2026 Lineup — 172 Artists Across 4 Days</p>
          </div>
          <div className="hero-right">
            <div className="hero-dates">
              JUL 30 — AUG 2
              <br />
              2026
            </div>
            <div className="hero-venue">Grant Park · Chicago</div>
          </div>
        </div>
        <div className="hero-meta">
          <div>
            <div className="hero-artists-count">{artists.length} Artists</div>
            <div className="hero-artists-label">Confirmed Lineup</div>
          </div>
          <div className="hero-sep" aria-hidden="true"></div>
          <div>
            <div className="hero-artists-count">8 Stages</div>
            <div className="hero-artists-label">4 Days</div>
          </div>
          <div className="hero-sep" aria-hidden="true"></div>
          <div>
            <div className="hero-artists-count">100K+</div>
            <div className="hero-artists-label">Daily Capacity</div>
          </div>
        </div>
        <div className="hero-og-img">
          {/* eslint-disable-next-line @next/next/no-img-element -- static poster asset, not worth next/image's runtime optimization overhead here */}
          <img
            src="/lineup.png"
            alt="Lollapalooza 2026 lineup poster — 172 artists, Grant Park Chicago, July 30 to August 2"
            width={600}
            height={315}
            loading="eager"
            style={{ width: '100%', maxWidth: 600, height: 'auto', display: 'block', margin: '1.5rem auto 0', border: '3px solid #000', boxShadow: '6px 6px 0 #000' }}
          />
        </div>
      </header>

      <div className="two-col">
        <main className="main-col" id="main-content">
          <div className="artist-search-wrap">
            <input
              type="text"
              className="artist-search"
              placeholder="Search artists by name…"
              aria-label="Search artists by name"
              autoComplete="off"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              className={`artist-search-clear${searchQuery !== '' ? ' visible' : ''}`}
              aria-label="Clear search"
              title="Clear search"
              onClick={() => setSearchQuery('')}
            >
              ✕
            </button>
          </div>

          <div className="genre-strip" id="genre-strip" role="list" aria-label="Filter by genre">
            <button
              className={`genre-strip-pill${activeGenre === '' ? ' is-active' : ''}`}
              role="listitem"
              onClick={() => toggleGenre('')}
            >
              ALL GENRES
            </button>
            {genreCounts.map(([genre]) => (
              <button
                key={genre}
                className={`genre-strip-pill${activeGenre === genre ? ' is-active' : ''}`}
                role="listitem"
                onClick={() => toggleGenre(genre)}
              >
                {genre}
              </button>
            ))}
          </div>

          <div className="section-divider" aria-hidden="true">
            <span className="section-divider-label">HEADLINERS</span>
          </div>
          <div role="list" aria-label="Headlining artists">
            {visibleHeadliners.map((a) => (
              <div className="headliner-row" role="listitem" key={a.id}>
                <div className="headliner-accent" aria-hidden="true"></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="headliner-name">{a.name}</div>
                  {a.description && (
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'rgba(0,0,0,0.5)', marginTop: '0.2rem', lineHeight: 1.4 }}>
                      {a.description}
                    </div>
                  )}
                </div>
                <div className="headliner-meta">
                  <span className={`day-badge day-${a.day}`}>{DAY_META[a.day].short}</span>
                  <StarToggle artistName={a.name} />
                  <StreamingLinks artistName={a.name} spotifyUrl={a.spotify_url} appleUrl={a.apple_url} youtubeUrl={a.youtube_url} />
                </div>
              </div>
            ))}
          </div>
          {visibleHeadliners.length === 0 && <p className="no-results-msg visible">No headliners match this filter.</p>}

          <div className="section-divider" aria-hidden="true">
            <span className="section-divider-label">MAJOR ACTS</span>
          </div>
          <div className="majors-grid" role="list" aria-label="Major acts">
            {visibleMajors.map((a) => (
              <div className="major-card" role="listitem" key={a.id}>
                <div className="major-card-top">
                  <div>
                    <div className="major-name">{a.name}</div>
                    <div className="major-genre">{a.genre}</div>
                  </div>
                </div>
                {a.description && (
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'rgba(0,0,0,0.45)', lineHeight: 1.4, marginBottom: '0.5rem' }}>
                    {a.description}
                  </div>
                )}
                <div className="major-card-bottom">
                  <span className={`day-badge day-${a.day}`}>{DAY_META[a.day].short}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <StarToggle artistName={a.name} />
                    <StreamingLinks artistName={a.name} spotifyUrl={a.spotify_url} appleUrl={a.apple_url} youtubeUrl={a.youtube_url} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          {visibleMajors.length === 0 && <p className="no-results-msg visible">No major acts match this filter.</p>}

          <div className="section-divider" aria-hidden="true">
            <span className="section-divider-label">UNDERCARD</span>
          </div>
          <ul className="undercards-list" role="list" aria-label="Undercard artists">
            {visibleUndercards.map((a, i) => (
              <li className="undercard-item" role="listitem" key={a.id}>
                <div className="undercard-row">
                  <span className="undercard-num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="undercard-name">{a.name}</span>
                  <span className="undercard-genre">{a.genre}</span>
                  <span className={`day-badge day-${a.day}`}>{DAY_META[a.day].short}</span>
                  <div className="undercard-links" aria-label={`Streaming links for ${a.name}`}>
                    <StarToggle artistName={a.name} />
                    <StreamingLinks artistName={a.name} spotifyUrl={a.spotify_url} appleUrl={a.apple_url} youtubeUrl={a.youtube_url} />
                  </div>
                </div>
                {a.description && <div className="undercard-desc">{a.description}</div>}
              </li>
            ))}
          </ul>
          {visibleUndercards.length === 0 && <p className="no-results-msg visible">No undercards match this filter.</p>}
        </main>

        <aside className="sidebar" aria-label="Festival schedule and navigation">
          <div className="sidebar-header">
            <div className="sidebar-title">THIS WEEK</div>
            <div className="sidebar-subtitle">Jul 30 – Aug 2, 2026</div>
          </div>

          <div>
            {[1, 2, 3, 4].map((d) => {
              const meta = DAY_META[d];
              const allOnDay = artists.filter((a) => a.day === d);
              const headlinersOnDay = headliners.filter((a) => a.day === d);
              const isActive = activeDay === d;
              return (
                <div
                  key={d}
                  className={`day-panel day-panel-${d}${isActive ? ' is-active' : ''}`}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isActive}
                  aria-label={`Filter to ${meta.name} ${meta.date}. ${allOnDay.length} artists.`}
                  onClick={() => toggleDay(d)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleDay(d);
                    }
                  }}
                >
                  <div className="day-panel-inner">
                    <div className="dp-top">
                      <div>
                        <div className="dp-day">{meta.name}</div>
                        <div className="dp-date">{meta.date}</div>
                      </div>
                      <div className="dp-count">
                        <span className="dp-count-num">{allOnDay.length}</span>
                        <span className="dp-count-label">artists</span>
                      </div>
                    </div>
                    <div className="dp-headliners">{headlinersOnDay.map((h) => h.name).join(' · ') || 'TBA'}</div>
                  </div>
                  <div className="dp-active-indicator" aria-hidden="true">
                    <span className="dp-active-dot"></span> ACTIVE FILTER
                  </div>
                </div>
              );
            })}
          </div>

          <div className="sidebar-section">
            <div className="sidebar-section-title">BY GENRE</div>
            <ul className="genre-list" role="list" aria-label="Filter by genre">
              {genreCounts.map(([genre, count], i) => (
                <li
                  key={genre}
                  className={`genre-item${activeGenre === genre ? ' is-active' : ''}`}
                  role="listitem"
                  tabIndex={0}
                  aria-label={`Filter by ${genre}, ${count} artists`}
                  aria-current={activeGenre === genre ? 'true' : undefined}
                  onClick={() => toggleGenre(genre)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleGenre(genre);
                    }
                  }}
                >
                  <span className="genre-num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="genre-name">{genre}</span>
                  <span className="genre-count">{count}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-section-title">JUMP TO DAY</div>
            <div className="quick-filters">
              <div className="filter-row">
                <button
                  className={`quick-filter-btn qf-all${activeDay === 0 ? ' is-active' : ''}`}
                  aria-pressed={activeDay === 0}
                  aria-label="Show all days"
                  onClick={() => toggleDay(0)}
                >
                  ALL DAYS
                </button>
              </div>
              <div className="filter-row">
                {[1, 2, 3, 4].map((d) => (
                  <button
                    key={d}
                    className={`quick-filter-btn qf-${d}${activeDay === d ? ' is-active' : ''}`}
                    aria-pressed={activeDay === d}
                    aria-label={`Filter to ${DAY_META[d].name}`}
                    onClick={() => toggleDay(d)}
                  >
                    {DAY_META[d].short}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Countdown />
        </aside>
      </div>
    </div>
  );
}

function Countdown() {
  const [remaining, setRemaining] = useState<{ days: string; hours: string; mins: string; secs: string }>({
    days: '--',
    hours: '--',
    mins: '--',
    secs: '--',
  });

  useEffect(() => {
    function update() {
      const target = new Date('2026-07-30T12:00:00-05:00').getTime();
      const diff = target - Date.now();
      if (diff <= 0) {
        setRemaining({ days: '00', hours: '00', mins: '00', secs: '00' });
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      setRemaining({
        days: String(days).padStart(3, '0'),
        hours: String(hours).padStart(2, '0'),
        mins: String(mins).padStart(2, '0'),
        secs: String(secs).padStart(2, '0'),
      });
    }
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="countdown-block" aria-label="Countdown to Lollapalooza 2026">
      <div className="countdown-label">Countdown to Lolla 2026</div>
      <div className="countdown-grid">
        <div className="cd-unit">
          <span className="cd-num">{remaining.days}</span>
          <span className="cd-label">Days</span>
        </div>
        <div className="cd-unit">
          <span className="cd-num">{remaining.hours}</span>
          <span className="cd-label">Hours</span>
        </div>
        <div className="cd-unit">
          <span className="cd-num">{remaining.mins}</span>
          <span className="cd-label">Mins</span>
        </div>
        <div className="cd-unit">
          <span className="cd-num">{remaining.secs}</span>
          <span className="cd-label">Secs</span>
        </div>
      </div>
    </div>
  );
}
