// Whether the festival has finished — the first "is the festival over" check
// in this codebase (see the SoundCloud search-link feature that needed it:
// pre-festival it links to "<Artist> live", post-festival to
// "<Artist> <FESTIVAL.fullName>"). Deliberately takes `now` as a parameter
// rather than reading Date.now() itself, so callers control where "now" comes
// from — this is meant to be called server-side (page components) with a
// fresh `new Date()`, not from a client component's render (which would risk
// hydration mismatch against the server-rendered HTML).
import { FESTIVAL } from './festival';

/** The instant music actually ends on the festival's last day, as a real
    Date — `FESTIVAL.endDate` + `FESTIVAL.musicEndTime`, in the venue's own
    timezone (`FESTIVAL.timezoneOffset`). Mirrors the ISO-instant pattern
    already used for the MusicFestival/MusicEvent JSON-LD in
    lib/structured-data.ts's `isoDateTime()`. */
export function festivalEndInstant(): Date {
  return new Date(`${FESTIVAL.endDate}T${FESTIVAL.musicEndTime}:00${FESTIVAL.timezoneOffset}`);
}

export function isFestivalOver(now: Date): boolean {
  return now.getTime() > festivalEndInstant().getTime();
}
