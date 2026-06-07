# PRODOLMO · Prode del Mundial 2026 ⚽

App web de **prode** (pool de pronósticos) para un grupo cerrado de amigos: cada
uno pronostica los resultados del Mundial 2026, suma puntos según acierte y
compite en una tabla de posiciones. Incluye simulador del cuadro, comentarios por
partido y "mensajes del día" con onda generados por IA. Estética **pixel-art**
retro, **mobile-first** y responsive.

🔗 **Demo:** https://prodolmo-2026.vercel.app · 📄 [Spec funcional](docs/Prode-Mundial-2026-Spec.md) · 🏗️ [Arquitectura](docs/ARCHITECTURE.md) · 🚀 [Deploy](docs/DEPLOY.md)

> Proyecto de práctica profesional, real y deployable. Lista cerrada de usuarios
> (sin registro abierto).

---

## ✨ Features

- **Login** con Supabase Auth (email + password), lista cerrada sin auto-registro.
- **Dashboard**: próximo partido por cargar (con cuenta regresiva) + mensajes
  personalizados del día. Layout de 2 columnas en desktop.
- **Cargar pronósticos**: fixture filtrable por sección (Grupos F1/F2/F3, 16avos,
  octavos, cuartos, semis, final) y por día; carga/edición hasta **1 h antes** del
  partido; podés ver los pronósticos del resto del grupo; **comentarios** por partido.
- **Tabla de posiciones**: ranking con desempate por plenos, medallas y
  movimiento ▲/▼ respecto al día anterior.
- **Detalle de jugador**: KPIs (puntos, plenos, aciertos) y desglose por ronda.
- **Simulador del Mundial 2026**: wizard para elegir 1.º/2.º de los 12 grupos,
  los 8 mejores terceros y completar el cuadro de eliminación (dos llaves
  enfrentadas) hasta el campeón. No afecta los puntos reales.
- **Resultados reales** sincronizados desde [football-data.org](https://www.football-data.org).
- **IA (Gemini Flash)**: reescribe los mensajes del día con tono rioplatense y
  genera previas de partido. Degradación elegante si no hay API key.

## 🧰 Tecnologías

| Capa | Stack |
|---|---|
| Framework | **Next.js 16** (App Router, Server Components, Server Actions) · **React 19** |
| Lenguaje | **TypeScript** estricto (sin `any`) |
| Estilos | **Tailwind CSS v4** (design tokens pixel-art en `@theme`) |
| Backend | **Supabase** — Postgres + Auth + Storage, **RLS** y triggers |
| Validación | **Zod** en todos los inputs de Server Actions |
| IA | **Gemini Flash** (`@google/genai`) |
| Datos | **football-data.org** (fixture/resultados del Mundial) |
| Tests | **Vitest** (lógica pura) |
| Deploy | **Vercel** (Hobby + Cron) + **Supabase Cloud** |

## 🏛️ Cómo está hecho (resumen)

- **Lecturas** por React Server Components; **mutaciones** solo por **Server
  Actions** validadas con Zod. Nada de API routes para el CRUD.
- **Seguridad en la base**: la barrera real es **RLS** (no el front). Ej.: un
  pronóstico ajeno solo es legible a partir de `kickoff − 1 h`; el cierre de carga
  se valida en el backend y en RLS.
- **Reglas en la base**: el **cálculo de puntos** vive en un **trigger** de
  Postgres (se dispara al finalizar un partido). El esquema está en migraciones
  versionadas (`supabase/migrations/`).
- **Jobs (cron en Vercel)**: sincronización de fixture/resultados y generación de
  los mensajes del día + snapshots de la tabla.
- **Lógica con miga aislada y testeada**: sistema de puntos, ranking, reglas de
  cierre, cuadro del simulador y mapeos de la API son funciones puras con tests.

Detalle completo en **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)**.

## ⚙️ Cómo funciona (flujos clave)

- **Pronóstico → puntos**: cargás un marcador (Server Action + Zod). Cuando el
  partido pasa a `finished` (vía sync de la API), un trigger calcula los puntos de
  todos los pronósticos de ese partido: **3** por marcador exacto, **1** por
  acertar el resultado, **0** si no, multiplicado por la ronda (×1 grupos … ×6
  final).
- **Cierre de edición**: podés cargar/editar hasta `kickoff − 1 h`; después queda
  fijo (validado en backend y RLS). Los pronósticos del grupo son visibles para todos.
- **Mensajes del día**: un cron toma una foto de la tabla (snapshot), calcula
  hechos por usuario (te pasaron, gap al líder, racha, goleada que nadie acertó…)
  y los redacta con Gemini (con plantillas como fallback).

## 📁 Estructura

```
app/                 # rutas (App Router): (auth) público · (app) protegido · api/cron
components/          # ui/ (design system) · nav/ · dashboard/ · cargar/ · tabla/ · jugador/ · sim/
lib/
  supabase/          # clientes server/browser/admin + proxy de sesión
  queries/           # lecturas (RSC)
  sim/               # lógica pura del cuadro (wc2026)
  integrations/      # football-data.org (cliente + mapeo)
  jobs/              # daily-messages, match-previews, sync-fixtures
  gemini/            # wrapper + prompts
  validation/        # schemas Zod
actions/             # Server Actions (mutaciones)
supabase/migrations/ # esquema versionado (0001..0010) + seed
scripts/             # seed-users, seed-demo, sync-fixtures, run-daily-messages
test/                # Vitest (lógica pura)
design/              # mockups + design system pixel-art (referencia)
docs/                # spec, arquitectura, deploy
```

## 🚀 Setup local

Requisitos: Node 20+, Docker (para Supabase local), Supabase CLI (vía `npx`).

```bash
npm install
npm run db:start        # Supabase local (Postgres + Auth + Storage en Docker)
npm run db:reset        # aplica migraciones + datos de referencia
cp .env.example .env.local   # completá las keys (npx supabase status)
npm run seed:users      # crea los usuarios del grupo (lista cerrada)
npm run seed:demo       # (opcional) datos de prueba para ver las pantallas "vivas"
npm run dev             # http://localhost:3000  (login: omar@prode.local / prode2026)
```

Para traer datos reales en vez del demo: poné `FOOTBALL_DATA_TOKEN` en `.env.local`
y corré `npm run sync:fixtures`.

## 📜 Scripts

| Script | Qué hace |
|---|---|
| `npm run dev` / `build` / `start` | Desarrollo / build / producción |
| `npm run typecheck` · `lint` · `test` | `tsc --noEmit` · ESLint · Vitest |
| `npm run db:start` / `db:stop` / `db:reset` | Supabase local |
| `npm run db:types` | Genera los tipos de la BD |
| `npm run seed:users` · `seed:demo` | Usuarios del grupo · datos de prueba |
| `npm run sync:fixtures` | Sincroniza fixture/resultados (football-data.org) |
| `npm run job:daily` | Corre el job de mensajes del día |

## ✅ Calidad

`npm run typecheck`, `npm run lint`, `npm run test` y `npm run build` en verde.
Los tests cubren la lógica pura más propensa a romperse (puntaje/ranking, reglas
de cierre, cuadro del simulador, mapeos de la API y validaciones Zod).

## ☁️ Deploy

Vercel (Hobby + Cron) + Supabase Cloud (free). Paso a paso en
**[docs/DEPLOY.md](docs/DEPLOY.md)**.
