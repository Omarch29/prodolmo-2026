-- ============================================================
-- IDs externos para sincronizar con la API de resultados
-- (football-data.org). Permiten upsert idempotente.
-- ============================================================
alter table public.teams
  add column external_id bigint unique;

alter table public.matches
  add column external_id bigint unique;
