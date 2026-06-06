-- ============================================================
-- Row Level Security.
-- Grupo cerrado: todo usuario autenticado ve datos de referencia y
-- perfiles. Los pronósticos ajenos solo son visibles a partir de
-- kickoff − prediction_lock_interval() (regla anti-trampa, §4).
-- La service-role (scripts/admin) bypassa RLS para cargar fixture/resultados.
-- ============================================================

-- ---- habilitar RLS en todas las tablas ----
alter table public.profiles            enable row level security;
alter table public.groups              enable row level security;
alter table public.stages              enable row level security;
alter table public.teams               enable row level security;
alter table public.matches             enable row level security;
alter table public.predictions         enable row level security;
alter table public.comments            enable row level security;
alter table public.daily_messages      enable row level security;
alter table public.standings_snapshots enable row level security;
alter table public.bracket_slots       enable row level security;
alter table public.simulations         enable row level security;
alter table public.simulation_picks    enable row level security;

-- ============================================================
-- profiles
-- ============================================================
create policy "profiles legibles por autenticados"
  on public.profiles for select to authenticated
  using (true);

create policy "actualizar mi propio perfil"
  on public.profiles for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ============================================================
-- Datos de referencia (solo lectura para autenticados; escritura = service-role)
-- ============================================================
create policy "groups legibles" on public.groups
  for select to authenticated using (true);

create policy "stages legibles" on public.stages
  for select to authenticated using (true);

create policy "teams legibles" on public.teams
  for select to authenticated using (true);

create policy "matches legibles" on public.matches
  for select to authenticated using (true);

create policy "bracket_slots legibles" on public.bracket_slots
  for select to authenticated using (true);

create policy "standings legibles" on public.standings_snapshots
  for select to authenticated using (true);

-- ============================================================
-- predictions
--   SELECT: las propias siempre; las ajenas solo si el partido ya es visible.
--   INSERT/UPDATE/DELETE: solo las propias y solo antes del cierre.
-- ============================================================
create policy "ver mis pronósticos y los ajenos visibles"
  on public.predictions for select to authenticated
  using (
    auth.uid() = user_id
    or now() >= (
      select m.kickoff_at - public.prediction_lock_interval()
      from public.matches m
      where m.id = predictions.match_id
    )
  );

create policy "cargar mi pronóstico antes del cierre"
  on public.predictions for insert to authenticated
  with check (
    auth.uid() = user_id
    and now() < (
      select m.kickoff_at - public.prediction_lock_interval()
      from public.matches m
      where m.id = predictions.match_id
    )
  );

create policy "editar mi pronóstico antes del cierre"
  on public.predictions for update to authenticated
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and now() < (
      select m.kickoff_at - public.prediction_lock_interval()
      from public.matches m
      where m.id = predictions.match_id
    )
  );

create policy "borrar mi pronóstico antes del cierre"
  on public.predictions for delete to authenticated
  using (
    auth.uid() = user_id
    and now() < (
      select m.kickoff_at - public.prediction_lock_interval()
      from public.matches m
      where m.id = predictions.match_id
    )
  );

-- ============================================================
-- comments — lectura para todos; escritura/edición/borrado solo propios
-- ============================================================
create policy "comentarios legibles" on public.comments
  for select to authenticated using (true);

create policy "crear mi comentario" on public.comments
  for insert to authenticated with check (auth.uid() = user_id);

create policy "editar mi comentario" on public.comments
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "borrar mi comentario" on public.comments
  for delete to authenticated using (auth.uid() = user_id);

-- ============================================================
-- daily_messages — cada usuario ve solo los suyos (los inserta el job/service-role)
-- ============================================================
create policy "ver mis mensajes del día" on public.daily_messages
  for select to authenticated using (auth.uid() = user_id);

-- ============================================================
-- simulations — CRUD solo del propio usuario
-- ============================================================
create policy "gestionar mis simulaciones" on public.simulations
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- simulation_picks — vía propiedad de la simulación
-- ============================================================
create policy "gestionar picks de mis simulaciones" on public.simulation_picks
  for all to authenticated
  using (
    exists (
      select 1 from public.simulations s
      where s.id = simulation_picks.simulation_id and s.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.simulations s
      where s.id = simulation_picks.simulation_id and s.user_id = auth.uid()
    )
  );
