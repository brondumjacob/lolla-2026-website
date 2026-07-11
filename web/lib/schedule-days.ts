// Pure, client-safe schedule day metadata — deliberately split out of
// lib/schedule-data.ts, which imports node:fs/node:vm to read
// public/schedule-data.js at build time. ScheduleBuilder.tsx ('use client')
// needs SCHEDULE_DAYS/scheduleDayMetaBySlug for its day-switcher UI; if it
// imported them from schedule-data.ts directly, Turbopack would try to
// bundle that file's node:fs import into the client chunk and fail
// ("the chunking context does not support external modules: node:fs").
// Keeping this data in its own module with zero Node imports avoids that
// entirely, without needing a server-only boundary marker.
export interface ScheduleDayMeta {
  slug: 'thursday' | 'friday' | 'saturday' | 'sunday';
  day: number;
  big: string;
  dateLine: string;
  defaultMode: 'foot' | 'cart';
}

// Full-length day labels + the original builders' per-day defaults (Friday
// alone defaulted to VIP/golf-cart mode — see the source HTML's DAY object).
// Deliberately separate from lib/constants.ts's DAY_META, which other
// components already depend on for its short-form shape.
export const SCHEDULE_DAYS: ScheduleDayMeta[] = [
  { slug: 'thursday', day: 1, big: 'THURSDAY', dateLine: 'JULY 30, 2026 · GRANT PARK, CHICAGO', defaultMode: 'foot' },
  { slug: 'friday', day: 2, big: 'FRIDAY', dateLine: 'JULY 31, 2026 · GRANT PARK, CHICAGO', defaultMode: 'cart' },
  { slug: 'saturday', day: 3, big: 'SATURDAY', dateLine: 'AUGUST 1, 2026 · GRANT PARK, CHICAGO', defaultMode: 'foot' },
  { slug: 'sunday', day: 4, big: 'SUNDAY', dateLine: 'AUGUST 2, 2026 · GRANT PARK, CHICAGO', defaultMode: 'foot' },
];

export function scheduleDayMetaBySlug(slug: string): ScheduleDayMeta | undefined {
  return SCHEDULE_DAYS.find((d) => d.slug === slug);
}
