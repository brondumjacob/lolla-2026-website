-- Lolla 2026 Website — Phase 6 (multi-schedule builder + export)
-- Source: 2026-07-09_lolla-accounts-migration-plan.md, Phase 6
-- Applied via Supabase MCP `apply_migration` against the live project.
--
-- Adds a per-set "must-see" flag to schedule_artists so the star from the
-- original static builders (schedule-*.html: `.must` CSS class) survives the
-- move to Supabase-backed schedules — Jacob's explicit instruction was to
-- keep this fidelity while otherwise staying on the lightweight artist_id
-- model (see the plan's Phase 6 decision #3). Additive, non-breaking, no
-- backfill needed: existing rows (there are none yet, table is unused in
-- production) default to false. Inherits schedule_artists' existing
-- join-based RLS policies unchanged — no new policy needed for a plain column.

alter table schedule_artists
  add column is_must_see boolean not null default false;
