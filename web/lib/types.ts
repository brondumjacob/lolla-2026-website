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
