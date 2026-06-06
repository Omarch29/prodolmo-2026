-- ============================================================
-- Equipos iniciales del cuadro (primera ronda de eliminación).
-- bracket_slots define la estructura/propagación; estas columnas fijan
-- los equipos del primer cruce. Las rondas siguientes se llenan por
-- propagación (feeds_slot / feeds_side) a partir de los ganadores elegidos.
-- ============================================================
alter table public.bracket_slots
  add column home_team_id uuid references public.teams (id),
  add column away_team_id uuid references public.teams (id);
