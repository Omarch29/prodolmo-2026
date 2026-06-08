-- ============================================================
-- Campeón elegido por cada usuario (una selección). Se puede elegir solo antes
-- de que arranque el Mundial; acertarlo suma 20 puntos (se calcula al leer la
-- tabla, cuando se conoce el ganador de la final).
-- ============================================================
alter table public.profiles
  add column champion_team_id uuid references public.teams (id);
