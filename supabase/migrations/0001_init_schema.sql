-- ============================================================
-- PRODE Mundial 2026 — Esquema inicial
-- Modelo de datos completo (ver docs/Prode-Mundial-2026-Spec.md §2).
-- ============================================================

-- ---- Enums ----
create type public.match_status as enum ('scheduled', 'in_progress', 'finished');
create type public.team_status  as enum ('active', 'eliminated');
create type public.daily_message_type as enum (
  'pending_today', 'overtaken', 'gap_to_leader', 'last_place',
  'surprise_result', 'lone_hit', 'streak'
);

-- ============================================================
-- Regla de negocio parametrizable: cierre/visibilidad de pronósticos.
-- Fuente de verdad de "kickoff − N" (espejada en lib/config.ts para la UI).
-- ============================================================
create or replace function public.prediction_lock_interval()
returns interval
language sql
immutable
as $$
  select interval '1 hour';
$$;

-- ============================================================
-- profiles — espeja auth.users (1:1). Se autocrea por trigger (0002).
-- ============================================================
create table public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  username     text unique,
  display_name text not null,
  avatar_url   text,
  timezone     text not null default 'America/Argentina/Buenos_Aires',
  es_bot       boolean not null default false,
  created_at   timestamptz not null default now()
);

comment on table public.profiles is 'Perfil de cada usuario; espeja auth.users.';

-- ============================================================
-- groups — grupos A–L
-- ============================================================
create table public.groups (
  id   uuid primary key default gen_random_uuid(),
  name text not null unique
);

-- ============================================================
-- stages — etapas/secciones (con puntos por multiplicador de ronda)
-- ============================================================
create table public.stages (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  sort_order     int  not null unique,
  points_outcome int  not null,  -- 1 × multiplicador
  points_exact   int  not null   -- 3 × multiplicador
);

-- ============================================================
-- teams — selecciones
-- ============================================================
create table public.teams (
  id       uuid primary key default gen_random_uuid(),
  name     text not null,
  code     text not null unique,            -- "ARG"
  group_id uuid references public.groups (id) on delete set null,
  flag_url text,
  status   public.team_status not null default 'active'
);

-- ============================================================
-- matches — partidos
-- ============================================================
create table public.matches (
  id            uuid primary key default gen_random_uuid(),
  stage_id      uuid not null references public.stages (id),
  group_id      uuid references public.groups (id),       -- null en eliminatorias
  matchday      int,                                      -- jornada en fase de grupos
  home_team_id  uuid references public.teams (id),        -- null si aún es "ganador de X"
  away_team_id  uuid references public.teams (id),
  kickoff_at    timestamptz not null,
  venue         text,
  status        public.match_status not null default 'scheduled',
  home_score    int,
  away_score    int,
  -- Para empates en eliminación resueltos por penales (def. del ganador).
  decided_winner_team_id uuid references public.teams (id)
);

create index matches_kickoff_idx  on public.matches (kickoff_at);
create index matches_status_idx   on public.matches (status);
create index matches_stage_idx    on public.matches (stage_id);
create index matches_group_idx    on public.matches (group_id);

-- ============================================================
-- predictions — pronósticos (uno por usuario por partido)
-- ============================================================
create table public.predictions (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles (id) on delete cascade,
  match_id        uuid not null references public.matches (id) on delete cascade,
  pred_home_score int not null,
  pred_away_score int not null,
  -- ganador elegido (eliminatorias con empate en los 90'): opcional
  pred_winner_team_id uuid references public.teams (id),
  points_earned   int,                       -- se calcula al finalizar (trigger 0003)
  submitted_at    timestamptz not null default now(),
  created_at      timestamptz not null default now(),
  unique (user_id, match_id)
);

create index predictions_match_idx on public.predictions (match_id);
create index predictions_user_idx  on public.predictions (user_id);

-- ============================================================
-- comments — comentarios en partidos
-- ============================================================
create table public.comments (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  match_id   uuid not null references public.matches (id) on delete cascade,
  body       text not null,
  created_at timestamptz not null default now()
);

create index comments_match_idx on public.comments (match_id, created_at);

-- ============================================================
-- daily_messages — mensajes diarios precomputados (job §6)
-- ============================================================
create table public.daily_messages (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles (id) on delete cascade,
  message_date date not null,
  type         public.daily_message_type not null,
  body         text not null,
  priority     int  not null default 0,
  metadata     jsonb,
  created_at   timestamptz not null default now()
);

create index daily_messages_user_date_idx on public.daily_messages (user_id, message_date);

-- ============================================================
-- standings_snapshots — foto diaria de la tabla (para "te pasó/subiste")
-- ============================================================
create table public.standings_snapshots (
  user_id  uuid not null references public.profiles (id) on delete cascade,
  date     date not null,
  puntos   int  not null default 0,
  posicion int  not null,
  primary key (user_id, date)
);

-- ============================================================
-- bracket_slots — config data-driven del cuadro de eliminación
-- ============================================================
create table public.bracket_slots (
  slot        text primary key,                 -- "R32-1", "QF-3", "FINAL"
  stage_id    uuid not null references public.stages (id),
  sort_order  int  not null,
  -- a qué slot alimenta el ganador de éste (null para la final)
  feeds_slot  text references public.bracket_slots (slot),
  -- en qué lado del slot destino entra (home/away)
  feeds_side  text check (feeds_side in ('home', 'away'))
);

-- ============================================================
-- simulations — escenarios hipotéticos por usuario (no afectan puntos reales)
-- ============================================================
create table public.simulations (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  name       text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.simulation_picks (
  id             uuid primary key default gen_random_uuid(),
  simulation_id  uuid not null references public.simulations (id) on delete cascade,
  match_id       uuid references public.matches (id),       -- fase de grupos (fixture fijo)
  bracket_slot   text references public.bracket_slots (slot), -- eliminatorias
  winner_team_id uuid not null references public.teams (id),
  home_score     int,
  away_score     int,
  unique (simulation_id, bracket_slot)
);

create index simulation_picks_sim_idx on public.simulation_picks (simulation_id);

-- ---- mantener simulations.updated_at ----
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_simulations_updated_at
before update on public.simulations
for each row execute function public.set_updated_at();
