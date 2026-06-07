# Arquitectura — PRODOLMO

Detalle técnico de **cómo está hecho** el proyecto. Para el qué/para qué ver el
[README](../README.md) y la [spec funcional](Prode-Mundial-2026-Spec.md).

## Visión general

```
┌─────────────── Vercel (Next.js 16) ───────────────┐        ┌──── Supabase Cloud ────┐
│  RSC (lecturas)   Server Actions (mutaciones)      │  RLS   │  Postgres + Auth        │
│  /app  ── proxy de sesión ──┐                      │ ◄────► │  Triggers (puntos)      │
│  /api/cron (sync + mensajes)│ service-role         │        │  Storage (avatares)     │
└─────────────────────────────┼──────────────────────┘        └────────────┬───────────┘
                              │                                             │
                  Gemini Flash (IA)                          football-data.org (resultados)
```

- **Render**: las pantallas leen con **React Server Components** usando el cliente
  de Supabase de servidor. Las **mutaciones** son **Server Actions** (no hay API
  routes para el CRUD). Las API routes existen solo para los **cron** (`/api/cron/*`).
- **Sesión**: un *proxy* (`proxy.ts` → `lib/supabase/middleware.ts`, convención de
  Next 16) refresca la sesión en cada request y protege las rutas privadas.
- **Frontera de seguridad**: **RLS** en Postgres. El front y las Server Actions
  validan por UX, pero quien realmente autoriza es la base.

## Rutas

```
app/
  (auth)/login        # público; si hay sesión redirige a /dashboard
  (app)/              # protegido (guard en el layout + proxy)
    dashboard         # próximo partido + mensajes del día (mobile y desktop 2 col)
    cargar            # fixture filtrable
    cargar/[matchId]  # cargar/editar pronóstico + previa IA + picks ajenos + comentarios
    tabla             # ranking del grupo
    jugador/[id]      # KPIs + desglose por ronda
    sim               # simulador (wizard)
  api/cron/sync-fixtures
  api/cron/daily-messages
```

## Clientes de Supabase

- `lib/supabase/server.ts` — RSC y Server Actions (cookies de la request).
- `lib/supabase/client.ts` — Client Components (anon key + RLS).
- `lib/supabase/admin.ts` — **service-role** (bypassa RLS); solo en jobs/scripts.
- `lib/supabase/middleware.ts` — refresh de sesión + protección de rutas.

Las variables de entorno se validan con **Zod** (`lib/env.ts`): públicas
(`NEXT_PUBLIC_*`) vs. de servidor (`serverEnv()`, perezosas, nunca llegan al bundle).

## Modelo de datos

Migraciones versionadas en `supabase/migrations/` (`0001`…`0010`). Tablas
principales:

- `profiles` (espeja `auth.users`, se autocrea por trigger), `groups`, `stages`
  (puntos por ronda), `teams` (con `external_id` para el sync).
- `matches` (`stage_id`, `group_id`, `matchday`, equipos, `kickoff_at`, `status`,
  marcador, `external_id`, `ai_preview`).
- `predictions` (UNIQUE `user_id+match_id`, `points_earned`).
- `comments`, `daily_messages`, `standings_snapshots`.
- `simulations` (con `state` jsonb), `simulation_picks`/`bracket_slots` (legado).

## Reglas en la base

- **Cálculo de puntos** (`0003`/`0008`): trigger `AFTER INSERT OR UPDATE ON matches`.
  Al quedar `finished` con marcador, calcula los puntos de todos los pronósticos
  del partido: marcador exacto → `points_exact`; mismo signo de diferencia →
  `points_outcome`; si no → 0. Los valores por ronda salen de `stages`
  (×1 grupos … ×6 final). Nunca suma exacto + resultado.
- **Cierre/visibilidad**: función SQL `prediction_lock_interval()` (= 1 h). RLS de
  `predictions` permite leer las ajenas solo si `now() ≥ kickoff − 1 h`, e
  insertar/editar solo antes de ese momento. Espejado en `lib/config.ts` para la UI.
- **RLS** (`0004`): lectura de datos de referencia para autenticados; cada quien
  gestiona lo suyo (pronósticos, comentarios, simulación); escritura de
  fixture/resultados solo service-role.

## Server Actions

`actions/` — todas validan con **Zod** y revalidan reglas en el backend:
`auth` (login/logout), `predictions` (upsert con guard de cierre y de equipos
definidos), `comments`, `simulations` (guarda el estado del simulador).

## Jobs y cron

`vercel.json` define dos cron (en Hobby corren ~1×/día):

- **`/api/cron/sync-fixtures`** → `lib/jobs/sync-fixtures.ts`: trae selecciones y
  fixture/resultados de football-data.org y hace upsert por `external_id`/`code`.
  Al pasar un partido a `finished`, el trigger recalcula puntos. Idempotente.
- **`/api/cron/daily-messages`** → `lib/jobs/daily-messages.ts`: calcula la tabla,
  guarda un snapshot del día y genera mensajes por usuario (pendientes de hoy, te
  pasaron, gap al líder, último, racha, goleada que nadie acertó, acierto
  solitario). Además genera previas de partidos próximos. Ambos endpoints están
  protegidos por `CRON_SECRET`.

## Integración football-data.org

`lib/integrations/football-data/`: cliente (`client-core` sin `server-only`,
reusable en scripts; `client` con token de env) + **mapeo puro** (`map.ts`,
testeado) que traduce la respuesta de la API (estado, etapa, grupo, equipos,
marcador, jornada) a nuestro esquema. El sync inyecta el cliente (DI) para poder
mockearlo en tests.

## IA (Gemini)

`lib/gemini/`: wrapper (`server-only`, lee `GEMINI_API_KEY`) + **lógica pura**
(construcción de prompts y parseo defensivo, testeada). La IA **solo redacta**
sobre hechos ya calculados; nunca inventa datos. Si falla o no hay key, se usan
plantillas (mensajes) y no se generan previas.

## Simulador (formato 2026)

`lib/sim/wc2026.ts` (puro, testeado): define el cuadro (16avos→final, dos
mitades), resuelve cada slot a partir del estado del usuario (1.º/2.º por grupo,
8 mejores terceros, ganadores elegidos) y deriva el campeón, ignorando picks que
dejaron de ser válidos al cambiar una ronda previa. El **sembrado de los terceros**
es determinístico y está aislado en `thirdSeeding()` (reemplazable por la tabla
oficial de FIFA). El estado se guarda como un único objeto JSON en
`simulations.state`.

## Design system

Pixel-art retro. Los **tokens** (colores semánticos, bordes gruesos, sombras
duras sin blur, fuentes retro) viven en `@theme` de Tailwind v4 (`app/globals.css`,
portados de `design/tokens.css`). Componentes en `components/ui/` (Button con
estado "presionado", Flag que renderiza escudo o emoji, Avatar, Countdown, etc.).
Mobile-first: bottom-nav en mobile, sidebar en desktop.

## Tests

**Vitest** sobre lógica pura (sin DB ni red), en `test/`: puntaje/ranking
(`standings/rank`), reglas de cierre (`config`), cuadro del simulador (`wc2026`),
secciones del fixture (`cargar/sections`), mapeo de la API (`football-data`),
prompts de IA (`gemini`) y validaciones Zod. Lo ligado a Supabase (triggers, RLS,
queries) se verifica con los scripts y a mano.

## Entornos / variables

`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (públicas);
`SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, `FOOTBALL_DATA_TOKEN`,
`CRON_SECRET` (servidor). Ver `.env.example`.
