-- ============================================================
-- Árbitros del partido (de football-data). Se asignan cerca del torneo; el sync
-- los completa. Guardados como JSON: [{ name, role, nationality }].
-- ============================================================
alter table public.matches
  add column referees jsonb not null default '[]'::jsonb;
