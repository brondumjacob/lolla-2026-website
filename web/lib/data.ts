import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createBuildTimeClient } from './supabase';
import { ArtistRecordSchema, GenreRecordSchema, type ArtistWithGenre } from './types';
import { FESTIVAL_SLUG } from './constants';

interface LegacyArtist {
  n: string;
  g: string;
}

// Cross-checks fetched primary genres against the already-corrected repo-root
// artists.js (Phase 2 output). If seed_genres.sql hasn't been applied to the
// live database yet, the fetched artist_genres rows will still carry the old
// pre-audit placeholder genres — this catches that mismatch loudly at build
// time instead of silently shipping wrong genre data. Not a hard build
// failure (the pages should still build for local iteration), just a very
// visible warning.
//
// Uses node:vm rather than require()/createRequire: Next.js 16 builds with
// Turbopack by default, and Turbopack statically analyzes require() calls at
// bundle time — it can't resolve a path computed at runtime that points
// outside this project (artists.js lives one directory up, in the static
// site's repo root). vm.runInNewContext sidesteps module resolution
// entirely, which is what we want for a one-off trusted local file read.
function warnIfGenresLookStale(artists: ArtistWithGenre[]): void {
  const artistsJsPath = path.join(process.cwd(), '..', 'artists.js');

  let legacy: LegacyArtist[];
  try {
    const source = fs.readFileSync(artistsJsPath, 'utf8');
    const sandbox: { window: { ARTISTS?: LegacyArtist[] }; module: { exports?: unknown } } = {
      window: {},
      module: {},
    };
    vm.createContext(sandbox);
    vm.runInContext(source, sandbox, { filename: artistsJsPath });
    legacy = sandbox.window.ARTISTS ?? [];
  } catch {
    // Cross-check is best-effort; don't block the build if artists.js can't be loaded.
    return;
  }

  const legacyByName = new Map(legacy.map((a) => [a.n, a.g]));
  let mismatches = 0;
  for (const artist of artists) {
    const expected = legacyByName.get(artist.name);
    if (expected && expected !== artist.genre) mismatches++;
  }

  const mismatchRatio = artists.length > 0 ? mismatches / artists.length : 0;
  if (mismatchRatio > 0.1) {
    console.warn(
      `WARNING: ${mismatches}/${artists.length} artists have a primary genre in Supabase that ` +
        `doesn't match the audited artists.js. This usually means seed_genres.sql has not been ` +
        `applied to the live database yet (see 2026-07-09_lolla-accounts-migration-plan.md Status ` +
        `section) — the site will build, but with pre-audit placeholder genres.`
    );
  }
}

export async function getArtistsWithGenres(): Promise<ArtistWithGenre[]> {
  const supabase = createBuildTimeClient();

  const { data: festival, error: festivalError } = await supabase
    .from('festivals')
    .select('id')
    .eq('slug', FESTIVAL_SLUG)
    .single();

  if (festivalError || !festival) {
    throw new Error(`Failed to load festival "${FESTIVAL_SLUG}" from Supabase: ${festivalError?.message}`);
  }

  const { data: artistRows, error: artistsError } = await supabase
    .from('artists')
    .select('id, slug, name, tier, day, popularity, description, spotify_url, apple_url, youtube_url')
    .eq('festival_id', festival.id);

  if (artistsError) {
    throw new Error(`Failed to load artists from Supabase: ${artistsError.message}`);
  }

  const { data: genreRows, error: genresError } = await supabase
    .from('artist_genres')
    .select('artist_id, genre, is_primary')
    .eq('is_primary', true);

  if (genresError) {
    throw new Error(`Failed to load artist_genres from Supabase: ${genresError.message}`);
  }

  const artists = (artistRows ?? []).map((row) => ArtistRecordSchema.parse(row));
  const genres = (genreRows ?? []).map((row) => GenreRecordSchema.parse(row));
  const primaryGenreByArtistId = new Map(genres.map((g) => [g.artist_id, g.genre]));

  const merged: ArtistWithGenre[] = artists.map((artist) => ({
    ...artist,
    genre: primaryGenreByArtistId.get(artist.id) ?? 'Unknown',
  }));

  warnIfGenresLookStale(merged);

  return merged;
}
