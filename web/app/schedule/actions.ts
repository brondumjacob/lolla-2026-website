'use server';

import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { ScheduleSetInputSchema, ScheduleRecordSchema, ScheduleArtistRowSchema, type ScheduleSetInput } from '@/lib/types';
import { FESTIVAL_SLUG } from '@/lib/constants';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface ScheduleWithSets {
  id: string;
  day: number;
  name: string;
  sets: { name: string; must: boolean }[];
}

export interface SaveScheduleResult {
  scheduleId: string;
  unmatched: string[];
}

async function getFestivalId(supabase: SupabaseClient): Promise<string> {
  const { data, error } = await supabase.from('festivals').select('id').eq('slug', FESTIVAL_SLUG).single();
  if (error || !data) {
    throw new Error(`Failed to resolve festival "${FESTIVAL_SLUG}": ${error?.message}`);
  }
  return data.id;
}

// Resolves set names (as they appear in public/schedule-data.js, UPPERCASE)
// to artist IDs case-insensitively — the live `artists` table stores names
// title-cased ("Lorde"), not uppercase ("LORDE"). Fetches the full
// festival-scoped artist roster once (~172 rows) and matches in memory
// rather than N per-name queries or a per-name `ilike`. Sets that don't
// match any lineup artist (Kidzapalooza / side-stage acts not in `artists`,
// per Phase 6's decision #3) come back in `unmatched` and are dropped, never
// silently discarded without a trace.
async function resolveSetArtistIds(
  supabase: SupabaseClient,
  festivalId: string,
  sets: ScheduleSetInput
): Promise<{ matched: { artist_id: string; must: boolean }[]; unmatched: string[] }> {
  if (sets.length === 0) return { matched: [], unmatched: [] };

  const { data: artistRows, error } = await supabase.from('artists').select('id, name').eq('festival_id', festivalId);
  if (error) {
    throw new Error(`Failed to load artists for schedule matching: ${error.message}`);
  }

  const idByUpperName = new Map((artistRows ?? []).map((a) => [a.name.toUpperCase(), a.id]));
  const matched: { artist_id: string; must: boolean }[] = [];
  const unmatched: string[] = [];

  for (const set of sets) {
    const id = idByUpperName.get(set.name.toUpperCase());
    if (id) matched.push({ artist_id: id, must: set.must });
    else unmatched.push(set.name);
  }

  return { matched, unmatched };
}

async function getSchedulesForDay(supabase: SupabaseClient, userId: string, day: number): Promise<ScheduleWithSets[]> {
  const { data, error } = await supabase
    .from('user_schedules')
    .select('id, day, name, schedule_artists(artist_id, is_must_see, artists!inner(name))')
    .eq('user_id', userId)
    .eq('day', day)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to load schedules: ${error.message}`);
  }

  return (data ?? []).map((row) => {
    const schedule = ScheduleRecordSchema.parse({ id: row.id, day: row.day, name: row.name });
    const rawSets = (row.schedule_artists ?? []) as unknown as {
      artist_id: string;
      is_must_see: boolean;
      artists: { name: string } | { name: string }[];
    }[];
    const sets = rawSets.map((s) => {
      const artistRow = Array.isArray(s.artists) ? s.artists[0] : s.artists;
      const parsed = ScheduleArtistRowSchema.parse({
        artist_id: s.artist_id,
        name: artistRow.name,
        is_must_see: s.is_must_see,
      });
      return { name: parsed.name, must: parsed.is_must_see };
    });
    return { ...schedule, sets };
  });
}

// Lists the current user's saved schedules for one festival day, each with
// its resolved set names + must-see flags. Returns [] for anonymous callers
// (the client falls back to the localStorage draft — see
// lib/schedules-storage.ts) rather than throwing, matching setFavorite's
// anonymous-no-op convention.
export async function listSchedules(rawDay: number): Promise<ScheduleWithSets[]> {
  const day = z.number().int().min(1).max(4).parse(rawDay);
  const supabase = await createServerSupabaseClient();

  const { data: claims } = await supabase.auth.getClaims();
  if (!claims) return [];

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  return getSchedulesForDay(supabase, user.id, day);
}

// Creates a new named schedule for the current user on the given day, with
// the given set of artists. No-op (throws) if called anonymously — the
// client only offers "save" once signed in.
export async function createSchedule(rawDay: number, rawName: string, rawSets: ScheduleSetInput): Promise<SaveScheduleResult> {
  const day = z.number().int().min(1).max(4).parse(rawDay);
  const name = z.string().min(1).max(200).parse(rawName);
  const sets = ScheduleSetInputSchema.parse(rawSets);

  const supabase = await createServerSupabaseClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims) {
    throw new Error('createSchedule: must be signed in to save a schedule');
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('createSchedule: must be signed in to save a schedule');
  }

  const festivalId = await getFestivalId(supabase);

  const { data: scheduleRow, error: insertError } = await supabase
    .from('user_schedules')
    .insert({ user_id: user.id, festival_id: festivalId, day, name })
    .select('id')
    .single();

  if (insertError || !scheduleRow) {
    throw new Error(`Failed to create schedule: ${insertError?.message}`);
  }

  const { matched, unmatched } = await resolveSetArtistIds(supabase, festivalId, sets);
  if (unmatched.length > 0) {
    console.warn(`createSchedule: ${unmatched.length} set(s) did not match any artist: ${unmatched.join(', ')}`);
  }

  if (matched.length > 0) {
    const { error: setsError } = await supabase.from('schedule_artists').insert(
      matched.map((m) => ({ schedule_id: scheduleRow.id, artist_id: m.artist_id, is_must_see: m.must }))
    );
    if (setsError) {
      throw new Error(`Failed to save schedule sets: ${setsError.message}`);
    }
  }

  return { scheduleId: scheduleRow.id, unmatched };
}

// Renames a schedule and replaces its set list with `sets` — upserts sets
// still present (idempotent via schedule_artists' unique(schedule_id,
// artist_id)), deletes sets that were removed. RLS's join-based policy on
// schedule_artists (via user_schedules.user_id) is the real ownership
// enforcement; this action doesn't need its own pre-check for that.
export async function saveSchedule(
  rawScheduleId: string,
  rawName: string,
  rawSets: ScheduleSetInput
): Promise<SaveScheduleResult> {
  const scheduleId = z.string().min(1).parse(rawScheduleId);
  const name = z.string().min(1).max(200).parse(rawName);
  const sets = ScheduleSetInputSchema.parse(rawSets);

  const supabase = await createServerSupabaseClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims) {
    throw new Error('saveSchedule: must be signed in');
  }

  const { error: renameError } = await supabase.from('user_schedules').update({ name }).eq('id', scheduleId);
  if (renameError) {
    throw new Error(`Failed to rename schedule: ${renameError.message}`);
  }

  const festivalId = await getFestivalId(supabase);
  const { matched, unmatched } = await resolveSetArtistIds(supabase, festivalId, sets);
  if (unmatched.length > 0) {
    console.warn(`saveSchedule: ${unmatched.length} set(s) did not match any artist: ${unmatched.join(', ')}`);
  }

  const keepIds = new Set(matched.map((m) => m.artist_id));

  const { data: existingRows, error: existingError } = await supabase
    .from('schedule_artists')
    .select('artist_id')
    .eq('schedule_id', scheduleId);
  if (existingError) {
    throw new Error(`Failed to load existing schedule sets: ${existingError.message}`);
  }

  const toDelete = (existingRows ?? []).map((r) => r.artist_id).filter((id) => !keepIds.has(id));
  if (toDelete.length > 0) {
    const { error: deleteError } = await supabase
      .from('schedule_artists')
      .delete()
      .eq('schedule_id', scheduleId)
      .in('artist_id', toDelete);
    if (deleteError) {
      throw new Error(`Failed to remove schedule sets: ${deleteError.message}`);
    }
  }

  if (matched.length > 0) {
    const { error: upsertError } = await supabase
      .from('schedule_artists')
      .upsert(
        matched.map((m) => ({ schedule_id: scheduleId, artist_id: m.artist_id, is_must_see: m.must })),
        { onConflict: 'schedule_id,artist_id' }
      );
    if (upsertError) {
      throw new Error(`Failed to save schedule sets: ${upsertError.message}`);
    }
  }

  return { scheduleId, unmatched };
}

export async function renameSchedule(rawScheduleId: string, rawName: string): Promise<void> {
  const scheduleId = z.string().min(1).parse(rawScheduleId);
  const name = z.string().min(1).max(200).parse(rawName);

  const supabase = await createServerSupabaseClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims) {
    throw new Error('renameSchedule: must be signed in');
  }

  const { error } = await supabase.from('user_schedules').update({ name }).eq('id', scheduleId);
  if (error) {
    throw new Error(`Failed to rename schedule: ${error.message}`);
  }
}

// Deletes a saved schedule. schedule_artists rows cascade automatically
// (schedule_id references user_schedules(id) on delete cascade).
export async function deleteSchedule(rawScheduleId: string): Promise<void> {
  const scheduleId = z.string().min(1).parse(rawScheduleId);

  const supabase = await createServerSupabaseClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims) {
    throw new Error('deleteSchedule: must be signed in');
  }

  const { error } = await supabase.from('user_schedules').delete().eq('id', scheduleId);
  if (error) {
    throw new Error(`Failed to delete schedule: ${error.message}`);
  }
}
