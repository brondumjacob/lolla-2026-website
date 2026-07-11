import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setsForDay } from '@/lib/schedule-data';
import { SCHEDULE_DAYS, scheduleDayMetaBySlug } from '@/lib/schedule-days';
import ScheduleBuilder from '@/components/ScheduleBuilder';

// Prerenders all 4 day slugs at build time so the shell stays statically
// generated (matches this app's convention of keeping content pages
// static — see /my-lineup's precedent from Phase 5). This is the first
// dynamic route in the app.
export function generateStaticParams() {
  return SCHEDULE_DAYS.map((d) => ({ day: d.slug }));
}

function dayLabel(big: string): string {
  return big.charAt(0) + big.slice(1).toLowerCase();
}

export async function generateMetadata({ params }: { params: Promise<{ day: string }> }): Promise<Metadata> {
  const { day } = await params;
  const meta = scheduleDayMetaBySlug(day);
  const label = meta ? dayLabel(meta.big) : 'Schedule';

  return {
    title: `${label} Schedule Builder — Lolla Lineup 2026`,
    description: `Build your Lollapalooza 2026 ${label} schedule. Pick artists, star must-sees, detect time conflicts, and export your route.`,
    robots: { index: false, follow: false },
    alternates: { canonical: `/schedule/${day}` },
  };
}

export default async function ScheduleDayPage({ params }: { params: Promise<{ day: string }> }) {
  const { day } = await params;
  const meta = scheduleDayMetaBySlug(day);
  if (!meta) notFound();

  const sets = setsForDay(meta.day);

  return <ScheduleBuilder dayMeta={meta} sets={sets} />;
}
