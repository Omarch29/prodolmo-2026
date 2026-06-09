-- ============================================================
-- Visibilidad de pronósticos por ETAPA (reemplaza la apertura total de 0011):
--   • Fase de grupos (sort_order 1) y Ronda de 32 (2): visibles siempre.
--   • Octavos (3) en adelante: los AJENOS solo se ven una vez bloqueado el
--     partido (now() >= kickoff − prediction_lock_interval()).
-- Los propios siempre visibles. El cierre de edición (insert/update) no cambia.
-- ============================================================
drop policy if exists "pronósticos legibles por autenticados" on public.predictions;

create policy "pronósticos: grupos/R32 siempre; KO desde el cierre"
  on public.predictions for select to authenticated
  using (
    auth.uid() = user_id
    or exists (
      select 1
      from public.matches m
      join public.stages s on s.id = m.stage_id
      where m.id = predictions.match_id
        and (
          s.sort_order <= 2
          or now() >= m.kickoff_at - public.prediction_lock_interval()
        )
    )
  );
