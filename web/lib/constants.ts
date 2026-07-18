export interface DayMeta {
  name: string;
  date: string;
  short: string;
  colorClass: string;
}

export const DAY_META: Record<number, DayMeta> = {
  1: { name: 'THURSDAY', date: 'JUL 30', short: 'THU 7/30', colorClass: 'day-1' },
  2: { name: 'FRIDAY', date: 'JUL 31', short: 'FRI 7/31', colorClass: 'day-2' },
  3: { name: 'SATURDAY', date: 'AUG 1', short: 'SAT 8/1', colorClass: 'day-3' },
  4: { name: 'SUNDAY', date: 'AUG 2', short: 'SUN 8/2', colorClass: 'day-4' },
};

export const SITE_URL = 'https://www.lolla2026lineup.com';
export const ADSENSE_CLIENT = 'ca-pub-1043428205440255';
// Festival identity (name, dates, venue, slug, FAQ copy) lives in
// lib/festival.ts's FESTIVAL config, not here — this file stays pure infra.
