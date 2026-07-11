-- Phase 2's genre audit corrected Worship's genre (Rock -> Electronic) but
-- never touched the `description` column, which still described them as a
-- rock act. Source: MusicBrainz disambiguation for Worship
-- (c9d357fe-a149-4556-9174-305f81f2a289) — "Drum & Bass supergroup composed
-- of Sub Focus, Dimension, Culture Shock, and 1991."
update artists
set description = 'Drum & bass supergroup uniting Sub Focus, Dimension, Culture Shock, and 1991. Genre-collapsing sets built for a festival main stage.'
where slug = 'worship'
  and festival_id = (select id from festivals where slug = 'lollapalooza-2026');
