import type { ArtistWithGenre } from './types';

export interface HeroHeadliners {
  shown: ArtistWithGenre[];
  remaining: number;
}

/** Top 4 headliners by popularity — the hero "proof line" data (see
    LineupExplorer.tsx's original comment on why this exists: instant lineup
    credibility, fully server-rendered/crawlable). Shared by the landing page
    (components/Landing.tsx) and the /lineup explorer so both compute the
    exact same ranking instead of two copies of the same sort/slice logic. */
export function getHeroHeadliners(artists: ArtistWithGenre[]): HeroHeadliners {
  const headliners = artists.filter((a) => a.tier === 'headliner');
  const sorted = [...headliners].sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));
  const shown = sorted.slice(0, 4);
  return { shown, remaining: sorted.length - shown.length };
}
