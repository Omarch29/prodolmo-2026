# CLAUDE.md — Convenciones del proyecto

Guía para trabajar en **PRODE Mundial 2026**. Leé también `README.md` (setup) y
`docs/Prode-Mundial-2026-Spec.md` (spec funcional/técnica: modelo de datos,
sistema de puntos, pantallas, reglas).

## Stack y decisiones fijas
- **Next.js (App Router) + TypeScript estricto**. Sin `any`.
- **Mutaciones solo por Server Actions** (`actions/`). Lecturas por RSC con el
  cliente de servidor (`lib/supabase/server.ts`).
- **Tailwind CSS v4**: tokens del design system en `@theme` (`app/globals.css`).
- **Supabase** como backend único (Postgres + Auth + Storage).
- **Gemini Flash** para IA de texto (wrapper en `lib/gemini/`, aún sin features).
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

## Tests
- **Vitest** para lógica pura (sin DB ni red), en `test/*.test.ts`.
- Patrón: extraer la lógica con miga a módulos puros y testearla ahí
  (ej. `lib/sim/bracket.ts`, `lib/standings/rank.ts`, `lib/config.ts`, schemas Zod).
  Las queries/acciones con Supabase se verifican aparte (scripts / a mano).
- Importar `describe/it/expect` desde `"vitest"` (sin globals).

## Verificación antes de dar algo por hecho
- `npm run typecheck`, `npm run test` y `npm run build` en verde.
- `npm run lint` sin errores.
- Probar el flujo real en `npm run dev` cuando aplique.
