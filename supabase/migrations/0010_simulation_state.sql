-- ============================================================
-- Estado del simulador del Mundial como un único objeto JSON por simulación:
-- { groupOrder: {A:[teamIds...]}, thirds:[grupos], ko:{matchId:teamId} }.
-- Más simple que una fila por slot para un cuadro completo de 48 selecciones.
-- ============================================================
alter table public.simulations
  add column state jsonb not null default '{}'::jsonb;
