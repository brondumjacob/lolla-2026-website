import { z } from 'zod';

// Validates rows read back from Supabase (an external system boundary) before
// they flow into page rendering — per this repo's coding-style convention of
// schema-validating data at system boundaries rather than trusting it blindly.

export const ArtistRecordSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  tier: z.enum(['headliner', 'major', 'undercard']),
  day: z.number().int().min(1).max(4),
  popularity: z.number().int().nullable(),
  description: z.string().nullable(),
  spotify_url: z.string().nullable(),
  apple_url: z.string().nullable(),
  youtube_url: z.string().nullable(),
});
export type ArtistRecord = z.infer<typeof ArtistRecordSchema>;

export const GenreRecordSchema = z.object({
  artist_id: z.string(),
  genre: z.string(),
  is_primary: z.boolean(),
});
export type GenreRecord = z.infer<typeof GenreRecordSchema>;

// The shape pages actually render with — an artist merged with its primary
// genre, matching the flat `g` field the static site's markup/CSS already
// keys off of (data-genre attributes, .major-genre text, etc).
export const ArtistWithGenreSchema = ArtistRecordSchema.extend({
  genre: z.string(),
});
export type ArtistWithGenre = z.infer<typeof ArtistWithGenreSchema>;

// Input to the favorites sync/toggle server actions — validated before it
// ever reaches a Supabase query, since it originates from localStorage (an
// external, user-writable boundary).
export const FavoriteNameListSchema = z.array(z.string().min(1)).max(1000);

// A `user_favorites` row joined back to its artist name, the shape the
// favorites server actions read/return.
export const FavoriteArtistRowSchema = z.object({
  artist_id: z.string(),
  name: z.string(),
});
export type FavoriteArtistRow = z.infer<typeof FavoriteArtistRowSchema>;

// A set entry from public/schedule-data.js's window.SCHEDULE (191 rows) —
// read at build time via node:vm (same technique as lib/data.ts's
// warnIfGenresLookStale, see lib/schedule-data.ts) and validated before it
// flows into the schedule builder. start/end are minutes since midnight.
export const ScheduleSetSchema = z.object({
  name: z.string().min(1),
  day: z.number().int().min(1).max(4),
  dayName: z.string(),
  stage: z.string(),
  start: z.number().int().min(0),
  end: z.number().int().min(0),
  region: z.string(),
  open: z.boolean(),
  disp: z.string(),
});
export type ScheduleSet = z.infer<typeof ScheduleSetSchema>;

// A `user_schedules` row — one named, saved schedule for a user+day.
export const ScheduleRecordSchema = z.object({
  id: z.string(),
  day: z.number().int().min(1).max(4),
  name: z.string(),
});
export type ScheduleRecord = z.infer<typeof ScheduleRecordSchema>;

// A `schedule_artists` row joined back to its artist name, the shape the
// schedule server actions read/return (mirrors FavoriteArtistRowSchema, plus
// the must-see flag — see supabase/migrations/0002_schedule_artists_must_see.sql).
export const ScheduleArtistRowSchema = z.object({
  artist_id: z.string(),
  name: z.string(),
  is_must_see: z.boolean(),
});
export type ScheduleArtistRow = z.infer<typeof ScheduleArtistRowSchema>;

// Input to the schedule create/save server actions — validated before it
// ever reaches a Supabase query, since it originates from client state that
// traces back to localStorage (an external, user-writable boundary).
export const ScheduleSetInputSchema = z
  .array(
    z.object({
      name: z.string().min(1),
      must: z.boolean(),
    })
  )
  .max(200);
export type ScheduleSetInput = z.infer<typeof ScheduleSetInputSchema>;
