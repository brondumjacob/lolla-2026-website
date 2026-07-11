'use server';

import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { FavoriteNameListSchema, FavoriteArtistRowSchema } from '@/lib/types';
import { FESTIVAL_SLUG } from '@/lib/constants';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface SyncFavoritesResult {
  favorites: string[];
  unmatched: string[];
}

async function getFestivalId(supabase: SupabaseClient): Promise<string> {
  const { data, error } = await supabase.from('festivals').select('id').eq('slug', FESTIVAL_SLUG).single();
  if (error || !data) {
    throw new Error(`Failed to resolve festival "${FESTIVAL_SLUG}": ${error?.message}`);
  }
  return data.id;
}

async function getOwnFavoriteNames(supabase: SupabaseClient, userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('user_favorites')
    .select('artist_id, artists!inner(name)')
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Failed to load favorites: ${error.message}`);
  }

  const rows = (data ?? []).map((row) =>
    FavoriteArtistRowSchema.parse({
      artist_id: row.artist_id,
      name: (row.artists as unknown as { name: string }).name,
    })
  );
  return rows.map((row) => row.name);
}

// Merges localStorage favorite names into `user_favorites` for the current
// authenticated user. Safe to call on every sign-in: the table's
// unique(user_id, artist_id) constraint plus `ignoreDuplicates` make this
// idempotent, so repeat logins never create duplicate rows. Matches by
// artist name (not slug) — the live artists table has no duplicate names,
// and name is what localStorage already stores (see Phase 5 execution notes
// in 2026-07-09_lolla-accounts-migration-plan.md for the full rationale).
export async function syncFavorites(rawNames: string[]): Promise<SyncFavoritesResult> {
  const names = FavoriteNameListSchema.parse(rawNames);
  const supabase = await createServerSupabaseClient();

  const { data: claims } = await supabase.auth.getClaims();
  if (!claims) {
    // Anonymous — nothing to sync; the caller keeps using localStorage as-is.
    return { favorites: names, unmatched: [] };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { favorites: names, unmatched: [] };
  }

  if (names.length === 0) {
    return { favorites: await getOwnFavoriteNames(supabase, user.id), unmatched: [] };
  }

  const festivalId = await getFestivalId(supabase);
  const { data: artistRows, error: artistsError } = await supabase
    .from('artists')
    .select('id, name')
    .eq('festival_id', festivalId)
    .in('name', names);

  if (artistsError) {
    throw new Error(`Failed to resolve favorite artist names: ${artistsError.message}`);
  }

  const idByName = new Map((artistRows ?? []).map((a) => [a.name, a.id]));
  const matchedIds: string[] = [];
  const unmatched: string[] = [];
  for (const name of names) {
    const id = idByName.get(name);
    if (id) matchedIds.push(id);
    else unmatched.push(name);
  }

  if (unmatched.length > 0) {
    console.warn(
      `syncFavorites: ${unmatched.length} localStorage favorite(s) did not match any artist: ${unmatched.join(', ')}`
    );
  }

  if (matchedIds.length > 0) {
    const { error: upsertError } = await supabase
      .from('user_favorites')
      .upsert(
        matchedIds.map((artist_id) => ({ user_id: user.id, artist_id })),
        { onConflict: 'user_id,artist_id', ignoreDuplicates: true }
      );
    if (upsertError) {
      throw new Error(`Failed to sync favorites: ${upsertError.message}`);
    }
  }

  return { favorites: await getOwnFavoriteNames(supabase, user.id), unmatched };
}

// Adds or removes a single favorite for the current authenticated user.
// No-op (returns false) when signed out — the client falls back to
// localStorage-only for anonymous stars rather than forcing a login.
export async function setFavorite(rawName: string, on: boolean): Promise<boolean> {
  const name = z.string().min(1).parse(rawName);
  const supabase = await createServerSupabaseClient();

  const { data: claims } = await supabase.auth.getClaims();
  if (!claims) return false;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const festivalId = await getFestivalId(supabase);
  const { data: artist, error: artistError } = await supabase
    .from('artists')
    .select('id')
    .eq('festival_id', festivalId)
    .eq('name', name)
    .maybeSingle();

  if (artistError || !artist) {
    console.warn(`setFavorite: no artist found for name "${name}"`, artistError);
    return false;
  }

  if (on) {
    const { error } = await supabase
      .from('user_favorites')
      .upsert({ user_id: user.id, artist_id: artist.id }, { onConflict: 'user_id,artist_id', ignoreDuplicates: true });
    if (error) {
      console.warn(`setFavorite: upsert failed for "${name}"`, error);
      return false;
    }
  } else {
    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('artist_id', artist.id);
    if (error) {
      console.warn(`setFavorite: delete failed for "${name}"`, error);
      return false;
    }
  }

  return true;
}
