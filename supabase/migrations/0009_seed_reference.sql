-- ============================================================
-- Datos de referencia (estructurales) que deben existir en TODOS los entornos
-- (local y nube). Al estar en una migración, `supabase db push` los provisiona
-- en producción sin pasos manuales. Idempotente (ON CONFLICT DO NOTHING).
--
-- El fixture/resultados reales se traen aparte con `npm run sync:fixtures`.
-- Las selecciones acá son una base mínima (para el bracket del simulador y dev);
-- el sync completa las 48 y las mergea por `code`.
-- ============================================================

-- ---- Grupos A–L ----
insert into public.groups (name)
select unnest(array['A','B','C','D','E','F','G','H','I','J','K','L'])
on conflict (name) do nothing;

-- ---- Etapas (puntos = base × multiplicador de ronda) ----
insert into public.stages (name, sort_order, points_outcome, points_exact) values
  ('Fase de grupos',     1, 1, 3),
  ('Ronda de 32',        2, 2, 6),
  ('Octavos',            3, 3, 9),
  ('Cuartos',            4, 4, 12),
  ('Semifinales',        5, 5, 15),
  ('Final y 3.º puesto', 6, 6, 18)
on conflict (sort_order) do nothing;

-- ---- Selecciones base (el sync completa/mergea por code) ----
insert into public.teams (name, code, flag_url, group_id) values
  ('Argentina',      'ARG', '🇦🇷', (select id from public.groups where name = 'A')),
  ('México',         'MEX', '🇲🇽', (select id from public.groups where name = 'A')),
  ('Canadá',         'CAN', '🇨🇦', (select id from public.groups where name = 'A')),
  ('Japón',          'JPN', '🇯🇵', (select id from public.groups where name = 'A')),
  ('Brasil',         'BRA', '🇧🇷', (select id from public.groups where name = 'B')),
  ('España',         'ESP', '🇪🇸', (select id from public.groups where name = 'B')),
  ('Marruecos',      'MAR', '🇲🇦', (select id from public.groups where name = 'B')),
  ('Corea del Sur',  'KOR', '🇰🇷', (select id from public.groups where name = 'B')),
  ('Francia',        'FRA', '🇫🇷', (select id from public.groups where name = 'C')),
  ('Inglaterra',     'ENG', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', (select id from public.groups where name = 'C')),
  ('Estados Unidos', 'USA', '🇺🇸', (select id from public.groups where name = 'C')),
  ('Senegal',        'SEN', '🇸🇳', (select id from public.groups where name = 'C')),
  ('Alemania',       'GER', '🇩🇪', (select id from public.groups where name = 'D')),
  ('Portugal',       'POR', '🇵🇹', (select id from public.groups where name = 'D')),
  ('Uruguay',        'URY', '🇺🇾', (select id from public.groups where name = 'D')),
  ('Países Bajos',   'NED', '🇳🇱', (select id from public.groups where name = 'D'))
on conflict (code) do nothing;

-- ---- Bracket del simulador (desde Cuartos). Orden FK: FINAL -> SF -> QF. ----
insert into public.bracket_slots (slot, stage_id, sort_order, feeds_slot, feeds_side, home_team_id, away_team_id) values
  ('FINAL', (select id from public.stages where sort_order = 6), 100, null, null, null, null)
on conflict (slot) do nothing;

insert into public.bracket_slots (slot, stage_id, sort_order, feeds_slot, feeds_side, home_team_id, away_team_id) values
  ('SF-1', (select id from public.stages where sort_order = 5), 90, 'FINAL', 'home', null, null),
  ('SF-2', (select id from public.stages where sort_order = 5), 91, 'FINAL', 'away', null, null)
on conflict (slot) do nothing;

insert into public.bracket_slots (slot, stage_id, sort_order, feeds_slot, feeds_side, home_team_id, away_team_id) values
  ('QF-1', (select id from public.stages where sort_order = 4), 80, 'SF-1', 'home',
   (select id from public.teams where code = 'ARG'), (select id from public.teams where code = 'FRA')),
  ('QF-2', (select id from public.stages where sort_order = 4), 81, 'SF-1', 'away',
   (select id from public.teams where code = 'BRA'), (select id from public.teams where code = 'ESP')),
  ('QF-3', (select id from public.stages where sort_order = 4), 82, 'SF-2', 'home',
   (select id from public.teams where code = 'ENG'), (select id from public.teams where code = 'POR')),
  ('QF-4', (select id from public.stages where sort_order = 4), 83, 'SF-2', 'away',
   (select id from public.teams where code = 'GER'), (select id from public.teams where code = 'URY'))
on conflict (slot) do nothing;
