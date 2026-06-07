-- ============================================================
-- Visibilidad de pronósticos: el grupo quiere ver los pronósticos de todos en
-- cualquier momento (se quita la regla anti-trampa de solo-visible-desde-kickoff-1h).
-- El CIERRE DE EDICIÓN se mantiene (no se puede cargar/editar a <1h del partido,
-- ver políticas de insert/update/delete de 0004).
-- ============================================================
drop policy if exists "ver mis pronósticos y los ajenos visibles" on public.predictions;

create policy "pronósticos legibles por autenticados"
  on public.predictions for select to authenticated
  using (true);
