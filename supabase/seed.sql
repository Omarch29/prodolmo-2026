-- ============================================================
-- Seed de datos de referencia para desarrollo local.
-- Se carga en `supabase db reset`. Solo datos NO ligados a usuarios
-- (los usuarios se crean con `npm run seed:users`).
--
-- Nota: el draw real del Mundial 2026 no está cerrado; este seed usa un
-- subconjunto representativo de selecciones y un fixture demo con kickoffs
-- relativos a now() para que el dashboard siempre tenga "próximo partido".
-- flag_url guarda el emoji de bandera (suficiente para el mockup pixel-art).
-- ============================================================

-- ---- Grupos A–L ----
insert into public.groups (name)
select unnest(array['A','B','C','D','E','F','G','H','I','J','K','L']);

-- ---- Etapas (puntos = base × multiplicador de ronda, §3) ----
insert into public.stages (name, sort_order, points_outcome, points_exact) values
  ('Fase de grupos',     1, 1, 3),
  ('Ronda de 32',        2, 2, 6),
  ('Octavos',            3, 3, 9),
  ('Cuartos',            4, 4, 12),
  ('Semifinales',        5, 5, 15),
  ('Final y 3.º puesto', 6, 6, 18);

-- ---- Selecciones (subconjunto demo, asignadas a grupos A–D) ----
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
  ('Países Bajos',   'NED', '🇳🇱', (select id from public.groups where name = 'D'));

-- NOTA: el fixture y los resultados reales se traen con `npm run sync:fixtures`
-- (football-data.org). No sembramos partidos demo acá para no mezclar datos
-- falsos con los reales. Para datos de prueba en dev: `npm run seed:demo`.

-- ============================================================
-- Bracket de eliminación para el SIMULADOR (demo: desde Cuartos).
-- Estructura data-driven: feeds_slot/feeds_side propagan al ganador.
-- Orden de inserción según la FK self-referente: FINAL -> SF -> QF.
-- ============================================================
insert into public.bracket_slots (slot, stage_id, sort_order, feeds_slot, feeds_side, home_team_id, away_team_id) values
  ('FINAL', (select id from public.stages where sort_order = 6), 100, null, null, null, null);

insert into public.bracket_slots (slot, stage_id, sort_order, feeds_slot, feeds_side, home_team_id, away_team_id) values
  ('SF-1', (select id from public.stages where sort_order = 5), 90, 'FINAL', 'home', null, null),
  ('SF-2', (select id from public.stages where sort_order = 5), 91, 'FINAL', 'away', null, null);

insert into public.bracket_slots (slot, stage_id, sort_order, feeds_slot, feeds_side, home_team_id, away_team_id) values
  ('QF-1', (select id from public.stages where sort_order = 4), 80, 'SF-1', 'home',
   (select id from public.teams where code = 'ARG'), (select id from public.teams where code = 'FRA')),
  ('QF-2', (select id from public.stages where sort_order = 4), 81, 'SF-1', 'away',
   (select id from public.teams where code = 'BRA'), (select id from public.teams where code = 'ESP')),
  ('QF-3', (select id from public.stages where sort_order = 4), 82, 'SF-2', 'home',
   (select id from public.teams where code = 'ENG'), (select id from public.teams where code = 'POR')),
  ('QF-4', (select id from public.stages where sort_order = 4), 83, 'SF-2', 'away',
   (select id from public.teams where code = 'GER'), (select id from public.teams where code = 'URY'));
