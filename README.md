# PRODE Mundial 2026 ⚽

App web de PRODE del Mundial 2026 para un grupo cerrado de amigos: pronosticá
resultados, sumá puntos y competí en la tabla. Proyecto de práctica profesional
con estética pixel-art retro.

**Stack:** Next.js (App Router) · TypeScript estricto · Tailwind CSS v4 ·
Supabase (Postgres + Auth + Storage) · Server Actions · Gemini Flash (IA, pendiente).

> Estado: **cimientos**. Base de datos, auth y ruteo cableados; las pantallas son
> placeholders navegables. Las features completas y la IA vienen después.

---

## Requisitos

- Node.js 20+ (ver `.nvmrc`)
- Docker (corriendo) — para Supabase local
- Supabase CLI (se usa vía `npx`, no requiere instalación global)

## Setup local

```bash
# 1. Dependencias
npm install

# 2. Levantar Supabase local (Postgres + Auth + Storage en Docker)
npm run db:start
#    La primera vez baja imágenes; puede tardar unos minutos.

# 3. Aplicar migraciones + seed de datos de referencia
npm run db:reset

# 4. Configurar variables de entorno
cp .env.example .env.local
#    Completá NEXT_PUBLIC_SUPABASE_ANON_KEY y SUPABASE_SERVICE_ROLE_KEY con
#    los valores que imprime:
npx supabase status

# 5. Crear los usuarios del grupo (lista cerrada, sin auto-registro)
npm run seed:users
#    Editá la lista en scripts/seed-users.ts. Contraseña por defecto: prode2026.

# 6. (Opcional) Regenerar los tipos de la BD
npm run db:types

# 7. Levantar la app
npm run dev
```

Abrí http://localhost:3000 e ingresá con uno de los emails sembrados
(ej. `omar@prode.local` / `prode2026`).

## Scripts

| Script | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` / `start` | Build y arranque de producción |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run test` / `test:watch` | Tests unitarios (Vitest) |
| `npm run db:start` / `db:stop` | Levanta/apaga Supabase local |
| `npm run db:reset` | Recrea la BD: migraciones + seed |
| `npm run db:types` | Genera `lib/database.types.ts` desde el esquema |
| `npm run seed:users` | Crea los usuarios del grupo (service-role) |
| `npm run job:daily` | Corre el job de mensajes diarios contra la BD local |
| `npm run sync:fixtures` | Sincroniza fixture/resultados desde football-data.org |

## Base de datos

- Esquema en migraciones versionadas: `supabase/migrations/`.
  - `0001` esquema (tablas, enums, índices) · `0002` trigger `profiles` ·
    `0003` trigger de **cálculo de puntos** · `0004` **RLS**.
- Datos de referencia (grupos, etapas, selecciones, fixture demo): `supabase/seed.sql`.
- Sistema de puntos y reglas: ver `docs/Prode-Mundial-2026-Spec.md`.

### Cómo correr migraciones
- Local: `npm run db:reset` aplica todas las migraciones + seed.
- Nueva migración: `npx supabase migration new <nombre>` y escribí el SQL.
- Remoto (deploy, más adelante): `npx supabase db push`.

## Estructura

```
app/            # rutas (App Router): (auth) público, (app) protegido
components/     # ui/ (design system) + nav/
lib/            # supabase/, gemini/, validation/, env, config, types
actions/        # Server Actions (mutaciones)
supabase/       # config, migrations/, seed.sql
scripts/        # seed-users.ts
design/         # mockups + design system pixel-art (referencia)
docs/           # spec funcional + técnica
```

## Resultados reales (football-data.org)

El fixture y los resultados se pueden traer de [football-data.org](https://www.football-data.org)
(competición FIFA World Cup, code `WC`).

1. Registrate gratis y poné el token en `.env.local`: `FOOTBALL_DATA_TOKEN="..."`.
2. Sincronizá: `npm run sync:fixtures` (importa selecciones + fixture; actualiza
   marcador/estado de los partidos → al finalizar, el trigger recalcula los puntos).
3. En producción corre por cron (`vercel.json` → `/api/cron/sync-fixtures`).

Es idempotente (upsert por `external_id`). Sin token, la app usa el seed/demo.
> El esquema mapea cualquier proveedor con un cambio acotado (`lib/integrations/`).

## Deploy (pendiente)

Objetivo: Vercel Hobby + Supabase Cloud (free). Se documentará al final.
