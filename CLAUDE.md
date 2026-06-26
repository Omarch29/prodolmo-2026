# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Convenciones para trabajar en **PRODE Mundial 2026** (PRODOLMO). Leé también
`README.md` (setup), `docs/ARCHITECTURE.md` (cómo está hecho, con diagrama y flujos)
y `docs/Prode-Mundial-2026-Spec.md` (spec funcional/técnica: modelo de datos,
sistema de puntos, pantallas, reglas).

## Comandos
- **Dev / build**: `npm run dev` · `npm run build` · `npm run start`.
- **Calidad** (correr antes de dar algo por hecho): `npm run typecheck`
  (`tsc --noEmit`) · `npm run lint` (`eslint`) · `npm run test` (Vitest, una vez).
- **Tests unitarios**: `npm run test:watch` (watch). Un solo archivo:
  `npx vitest run test/wc2026.test.ts`. Por nombre: `npx vitest run -t "campeón"`.
- **E2E (Cypress)**: `npm run e2e` (headless) · `npm run e2e:open` (UI) ·
  `npm run e2e:ci` (levanta `dev` y corre; necesita Supabase arriba).
- **Supabase local** (Docker): `npm run db:start` / `db:stop` / `db:reset`
  (reset reaplica migraciones + seed). Tras cambiar el esquema: `npm run db:types`
  regenera `lib/database.types.ts`.
- **Seeds / jobs**: `npm run seed:users` (lista cerrada, service-role) ·
  `npm run seed:demo` (datos de prueba) · `npm run sync:fixtures`
  (football-data.org) · `npm run job:daily` (mensajes del día).

## Stack y decisiones fijas
- **Next.js (App Router) + TypeScript estricto**. Sin `any`.
- **Mutaciones solo por Server Actions** (`actions/`). Lecturas por RSC con el
  cliente de servidor (`lib/supabase/server.ts`).
- **Tailwind CSS v4**: tokens del design system en `@theme` (`app/globals.css`).
- **Supabase** como backend único (Postgres + Auth + Storage).
- **Gemini Flash** para IA de texto (`lib/gemini/`): redacta los mensajes diarios
  y las previas de partido en el cron. La IA **solo redacta** sobre hechos ya
  calculados; nunca inventa datos. Lógica pura (prompts/parseo) separada y testeada.
- Target de deploy: **Vercel Hobby** — no usar nada que rompa en serverless
  (sin estado en memoria entre requests, sin procesos long-running).
- **Mobile-first**: la mayoría entra desde el celular. BottomNav en mobile,
  Sidebar en desktop (`md:`).

## TypeScript
- `strict`, `noUncheckedIndexedAccess`, `noImplicitOverride` activos.
- Nada de `any`. Usá los tipos generados `Database` de `lib/database.types.ts`.
- Tras cambiar el esquema: `npm run db:types` para regenerar los tipos.

## Validación
- **Zod valida TODO input de Server Action** (schemas en `lib/validation/`).
  Validá con `safeParse` y devolvé errores legibles; nunca confíes en el front.

## Supabase / clientes
- Cliente de **servidor**: `lib/supabase/server.ts` (RSC, Server Actions).
- Cliente de **navegador**: `lib/supabase/client.ts` (Client Components).
- El **proxy** (`proxy.ts` → `lib/supabase/middleware.ts`) refresca la sesión y
  protege rutas (convención Next 16). No metas lógica entre `createServerClient` y `getUser`.
- La **service-role key** solo en servidor/scripts (`lib/env.ts` → `serverEnv()`).
  Nunca importarla en código de cliente.

## Base de datos
- Cambios de esquema = **nueva migración** en `supabase/migrations/` (`npx supabase
  migration new <nombre>`). No editar migraciones ya aplicadas/commiteadas.
- **RLS siempre on**. Toda tabla nueva: habilitar RLS y escribir políticas.
- **Cálculo de puntos vive en la BD** (trigger `0003`), no en la app.
- Regla de cierre (kickoff − 1h): fuente de verdad en SQL
  (`prediction_lock_interval()`), espejada para la UI en `lib/config.ts`.
- Fechas en `timestamptz` (UTC); convertir por `profiles.timezone` solo al mostrar.

## Auth
- **Lista cerrada**, sin auto-registro (`enable_signup = false`). Los usuarios se
  crean con `npm run seed:users` (service-role). Login por email + password.

## Design system (pixel-art)
- **Única fuente de estilos: los tokens** (`app/globals.css` / `design/tokens.css`).
  Nada de colores o sombras hardcodeados — usá utilidades Tailwind de los tokens
  (`bg-pitch-green`, `shadow-pixel`, `border-pixel`, etc.).
- Sin radios (pixel = cuadrado). Bordes gruesos. Sombras duras **sin blur**.
- Botones: estado "presionado" que se hunde (ver `components/ui/Button.tsx`).
- Fuentes: `font-display` (Press Start 2P, títulos), `font-mono` (VT323,
  marcadores), `font-body` (Space Grotesk, UI). Inyectadas vía `next/font`.
- Referencia visual: `design/` (mockups + estilos de las pantallas).

## Integraciones externas
- Resultados/fixture desde **football-data.org** (`lib/integrations/football-data/`).
  Cliente core sin `server-only` (reusable en scripts) + wrapper server-only que
  lee el token. El **mapeo** (API → esquema) es puro y testeado.
- El **sync** (`lib/jobs/sync-fixtures.ts`) hace upsert por `external_id`/`code`;
  al pasar un partido a finished con marcador, el trigger recalcula puntos.
  Inyectá el `client` (DI) para testear/mockear sin red.
- Cron en `vercel.json` (`/api/cron/sync-fixtures` y `/api/cron/daily-messages`).
  Nota: en Vercel **Hobby** los cron corren ~1 vez/día; para resultados más
  frecuentes, disparar manualmente o usar Pro.

## Tests
- **Vitest** para lógica pura (sin DB ni red), en `test/*.test.ts`.
- Patrón: extraer la lógica con miga a módulos puros y testearla ahí
  (ej. `lib/sim/wc2026.ts`, `lib/standings/rank.ts`, `lib/config.ts`, schemas Zod).
  Las queries/acciones con Supabase se verifican aparte (scripts / a mano).
- Importar `describe/it/expect` desde `"vitest"` (sin globals).
- **E2E (Cypress)** en `cypress/e2e/` cubren login y navegación; necesitan
  Supabase corriendo (`npm run e2e:ci`).

## Verificación antes de dar algo por hecho
- `npm run typecheck`, `npm run test` y `npm run build` en verde.
- `npm run lint` sin errores.
- Probar el flujo real en `npm run dev` cuando aplique.
