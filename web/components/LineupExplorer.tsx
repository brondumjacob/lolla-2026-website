'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { ArtistWithGenre } from '@/lib/types';
import { DAY_META } from '@/lib/constants';
import StarToggle from './StarToggle';
import StreamingLinks from './StreamingLinks';
import ArtistCard from './ArtistCard';

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
          <p className="hero-eyebrow">Chicago, Illinois · Grant Park</p>
          <h1 className="hero-title">
            LOLLA<span className="accent-word">PA</span>LOOZA
          </h1>
          <p className="hero-subtitle">
            Browse all 172 artists, stream every act, and build your day-by-day schedule.
          </p>
          <Link href="/schedule" className="hero-cta">
            Build your schedule →
          </Link>
        </div>
      </header>

      {/* Compact replacement for the old poster image — dates/venue/stats at a
          glance, so the site's purpose is obvious in ~5 seconds without a
          672×840 image to load. Not sticky itself; the search+filter controls
          directly below it are (see .filter-bar), preserving the sticky
          search behavior fixed in an earlier pass (see CLAUDE.md changelog). */}
      <div className="info-box">
        <div className="info-box-when">
          <div className="info-box-dates">JUL 30 – AUG 2, 2026</div>
          <div className="info-box-venue">Grant Park · Chicago</div>
        </div>
        <div className="info-box-stats">
          <div className="info-stat">
            <span className="info-stat-num">{artists.length}</span>
            <span className="info-stat-label">Artists</span>
          </div>
          <div className="info-stat">
            <span className="info-stat-num">8</span>
            <span className="info-stat-label">Stages</span>
          </div>
          <div className="info-stat">
            <span className="info-stat-num">4</span>
            <span className="info-stat-label">Days</span>
          </div>
        </div>
      </div>

      <div className="filter-bar">
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

        {/* Toggle-button groups, not content lists — aria-pressed carries the
            state semantics, so these deliberately skip role="list"/"listitem"
            (which don't support aria-pressed on their children). */}
        <div className="filter-bar-days" aria-label="Filter by day">
          <button
            className={`day-pill${activeDay === 0 ? ' is-active' : ''}`}
            aria-pressed={activeDay === 0}
            onClick={() => toggleDay(0)}
          >
            All Days
          </button>
          {[1, 2, 3, 4].map((d) => (
            <button
              key={d}
              className={`day-pill day-pill-${d}${activeDay === d ? ' is-active' : ''}`}
              aria-pressed={activeDay === d}
              onClick={() => toggleDay(d)}
            >
              {DAY_META[d].short}
            </button>
          ))}
        </div>

        <div className="filter-bar-genres" aria-label="Filter by genre">
          <button
            className={`genre-pill${activeGenre === '' ? ' is-active' : ''}`}
            aria-pressed={activeGenre === ''}
            onClick={() => toggleGenre('')}
          >
            All Genres
          </button>
          {genreCounts.map(([genre, count]) => (
            <button
              key={genre}
              className={`genre-pill${activeGenre === genre ? ' is-active' : ''}`}
              aria-pressed={activeGenre === genre}
              onClick={() => toggleGenre(genre)}
            >
              {genre} <span className="genre-pill-count">{count}</span>
            </button>
          ))}
        </div>
      </div>

      <main className="main-col" id="main-content">
        <div className="section-divider" aria-hidden="true">
          <span className="section-divider-label">HEADLINERS</span>
        </div>
        <div className="headliner-feature" role="list" aria-label="Headlining artists">
          {visibleHeadliners.map((a) => (
            <div className="hl-feature-card" role="listitem" key={a.id}>
              <div className="hl-feature-top">
                <span className={`day-badge day-${a.day}`}>{DAY_META[a.day].short}</span>
                <StarToggle artistName={a.name} />
              </div>
              <div className="hl-feature-name">{a.name}</div>
              {a.description && <p className="hl-feature-desc">{a.description}</p>}
              <StreamingLinks
                artistName={a.name}
                spotifyUrl={a.spotify_url}
                appleUrl={a.apple_url}
                youtubeUrl={a.youtube_url}
              />
            </div>
          ))}
        </div>
        {visibleHeadliners.length === 0 && <p className="no-results-msg visible">No headliners match this filter.</p>}

        <div className="section-divider" aria-hidden="true">
          <span className="section-divider-label">THE LINEUP</span>
        </div>
        <div className="artist-grid" role="list" aria-label="Major and undercard artists">
          {visibleMajors.map((a) => (
            <ArtistCard artist={a} variant="major" key={a.id} />
          ))}
          {visibleUndercards.map((a) => (
            <ArtistCard artist={a} variant="undercard" key={a.id} />
          ))}
        </div>
        {visibleMajors.length === 0 && visibleUndercards.length === 0 && (
          <p className="no-results-msg visible">No artists match this filter.</p>
        )}
      </main>
    </div>
  );
}
