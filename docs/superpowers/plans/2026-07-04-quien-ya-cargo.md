# "Quién ya cargó" (KO abierto) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** En partidos de Octavos en adelante que siguen abiertos, mostrar en `/cargar/[matchId]` quiénes ya cargaron su pronóstico (solo avatares/nombres), sin revelar qué cargaron.

**Architecture:** La RLS (migración `0015`) oculta los pronósticos ajenos de KO hasta el cierre, así que la existencia se expone con una función SQL `security definer` (`match_predictors`) que devuelve solo `user_id + perfil`. Un query nuevo (`getMatchPredictors`) la llama por RPC y la página renderiza una tira de avatares dentro del cartel 🔒 existente. Nada cambia para grupos/R32, partidos bloqueados o finalizados.

**Tech Stack:** Next.js App Router (RSC) · Supabase (Postgres + RLS) · TypeScript estricto · Tailwind v4 con tokens pixel-art.

**Spec:** `docs/superpowers/specs/2026-07-04-quien-ya-cargo-design.md`

## Global Constraints

- TypeScript estricto, **sin `any`**; usar los tipos generados `Database` de `lib/database.types.ts`.
- Cambios de esquema = **nueva migración** (`supabase/migrations/`); nunca editar migraciones ya commiteadas. Tras cambiar el esquema: `npm run db:types`.
- Estilos **solo con tokens** del design system (`bg-scoreboard-slate`, `border-pixel`, `font-display`, etc.). Sin colores hardcodeados, sin radios.
- Lecturas por RSC con `lib/supabase/server.ts`; la service-role key no se toca.
- Trabajar en **`main`** (ya estamos parados ahí). Al final, merge `main` → `fun`. Los directorios sin trackear `docs/IMAGES/` y `docs/Sonidos/` no se tocan ni se commitean.
- Gates antes de dar por terminado: `npm run typecheck` · `npm run lint` · `npm run test` · `npm run build`.

---

### Task 1: Migración `0017_match_predictors.sql`

**Files:**
- Create: `supabase/migrations/0017_match_predictors.sql`
- Regenerate: `lib/database.types.ts` (vía `npm run db:types`, no editar a mano)

**Interfaces:**
- Consumes: tablas `public.predictions (user_id, match_id, …)` y `public.profiles (id, display_name, avatar_url)` de `0001`.
- Produces: RPC `public.match_predictors(p_match_id uuid)` → filas `{ user_id: uuid, display_name: text, avatar_url: text | null }`, ejecutable solo por `authenticated`. En `lib/database.types.ts` aparecerá en `public.Functions` como `match_predictors: { Args: { p_match_id: string }; Returns: { user_id: string; display_name: string; avatar_url: string | null }[] }`.

- [ ] **Step 1: Crear la migración**

Crear `supabase/migrations/0017_match_predictors.sql` con exactamente:

```sql
-- ============================================================
-- Quién ya cargó (sin revelar el pronóstico).
-- Desde Octavos los pronósticos ajenos son secretos hasta el cierre (RLS de
-- 0015), así que esta función security definer expone SOLO la existencia
-- (user_id + perfil) de quienes ya cargaron un partido. Nunca devuelve el
-- resultado ni el ganador elegido. Todas las columnas van calificadas y el
-- search_path vacío evita resolver nombres fuera de lo esperado.
-- ============================================================
create or replace function public.match_predictors(p_match_id uuid)
returns table (user_id uuid, display_name text, avatar_url text)
language sql
stable
security definer
set search_path = ''
as $$
  select p.user_id, pr.display_name, pr.avatar_url
  from public.predictions p
  join public.profiles pr on pr.id = p.user_id
  where p.match_id = p_match_id
  order by pr.display_name;
$$;

revoke execute on function public.match_predictors(uuid) from public, anon;
grant execute on function public.match_predictors(uuid) to authenticated;
```

- [ ] **Step 2: Aplicar la migración en local**

Supabase local tiene que estar corriendo (si no: `npm run db:start`).

Run: `npm run db:reset`
Expected: termina sin errores, listando las migraciones aplicadas hasta `0017_match_predictors.sql` inclusive.

- [ ] **Step 3: Verificar permisos y salida de la función (equivale al test)**

Run (el puerto sale de `supabase/config.toml`, por defecto 54322):

```bash
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" <<'SQL'
-- como authenticated: debe funcionar y devolver 0+ filas sin scores
set role authenticated;
select * from public.match_predictors((select id from public.matches limit 1));
reset role;
-- como anon: debe fallar con "permission denied for function match_predictors"
set role anon;
select * from public.match_predictors((select id from public.matches limit 1));
SQL
```

Expected: la primera consulta devuelve columnas `user_id, display_name, avatar_url` (0 filas si el seed no carga pronósticos); la segunda falla con `permission denied for function match_predictors`.

- [ ] **Step 4: Regenerar tipos**

Run: `npm run db:types`
Expected: `lib/database.types.ts` cambia; en `public.Functions` aparece `match_predictors` junto a `prediction_lock_interval`.

Run: `npm run typecheck`
Expected: sin errores.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/0017_match_predictors.sql lib/database.types.ts
git commit -m "Función match_predictors: quién cargó un partido, sin el resultado"
```

---

### Task 2: Query `getMatchPredictors`

**Files:**
- Modify: `lib/queries/cargar.ts` (agregar al final, después de `getFriendPicks`, ~línea 233)

**Interfaces:**
- Consumes: RPC `match_predictors` (Task 1); `SupabaseClient<Database>` ya importado en el archivo.
- Produces: `export type MatchPredictor = { userId: string; displayName: string; avatarUrl: string | null }` y `export async function getMatchPredictors(supabase: SupabaseClient<Database>, matchId: string): Promise<MatchPredictor[]>`.

- [ ] **Step 1: Agregar tipo y función**

Al final de `lib/queries/cargar.ts`:

```ts
export type MatchPredictor = {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
};

/**
 * Quiénes ya cargaron pronóstico en un partido, sin revelar qué cargaron.
 * RPC security definer: funciona aunque la RLS todavía oculte los pronósticos
 * ajenos (KO abierto), que es el único estado en el que la página lo usa.
 */
export async function getMatchPredictors(
  supabase: SupabaseClient<Database>,
  matchId: string,
): Promise<MatchPredictor[]> {
  const { data } = await supabase.rpc("match_predictors", { p_match_id: matchId });
  return (data ?? []).map((p) => ({
    userId: p.user_id,
    displayName: p.display_name,
    avatarUrl: p.avatar_url,
  }));
}
```

Nota: si `typecheck` marca que `avatar_url` no es `string | null` en el tipo generado, revisar el `Returns` generado en Task 1 — no castear con `as`.

- [ ] **Step 2: Verificar**

Run: `npm run typecheck`
Expected: sin errores (confirma que el RPC quedó bien tipado).

- [ ] **Step 3: Commit**

```bash
git add lib/queries/cargar.ts
git commit -m "Query getMatchPredictors (RPC match_predictors)"
```

---

### Task 3: Tira "YA CARGARON (N)" en la página del partido

**Files:**
- Modify: `app/(app)/cargar/[matchId]/page.tsx` (imports ~líneas 4-24, fetch ~línea 79, bloque 🔒 ~líneas 228-237)

**Interfaces:**
- Consumes: `getMatchPredictors` / `MatchPredictor` (Task 2); `AvatarHoverCard` de `@/components/ui/AvatarHoverCard` (props: `userId`, `name`, `avatarUrl`, `size`).
- Produces: UI final; nada más consume esto.

- [ ] **Step 1: Imports y fetch**

En el import existente de `@/lib/queries/cargar` agregar `getMatchPredictors`:

```ts
import {
  getMatchForPrediction,
  getFriendPicks,
  getMatchPredictors,
  getNextMatchId,
  getPrevMatchId,
} from "@/lib/queries/cargar";
```

Agregar junto a los demás imports de componentes:

```ts
import { AvatarHoverCard } from "@/components/ui/AvatarHoverCard";
```

Debajo de la línea `const friendPicks = ...` (~línea 79) agregar:

```ts
// KO abierto: solo se muestra QUIÉN cargó (la RLS todavía oculta los pronósticos).
const predictors = playable && !othersVisible ? await getMatchPredictors(supabase, matchId) : [];
```

- [ ] **Step 2: Reemplazar el bloque del cartel 🔒**

Reemplazar el bloque actual (rama `!othersVisible`, ~líneas 228-237):

```tsx
          ) : (
            <div className="mx-4 flex items-start gap-2 bg-scoreboard-slate border-pixel px-3 py-2">
              <span className="text-lg">🔒</span>
              <p className="font-body text-xs text-grey-300">
                Desde <span className="text-line-white">Octavos</span>, los pronósticos del resto
                recién se ven cuando el partido se <span className="text-line-white">bloquea</span> (1 h
                antes de empezar). Hasta entonces, el de cada uno es secreto.
              </p>
            </div>
          ))}
```

por:

```tsx
          ) : (
            <div className="mx-4 flex flex-col gap-2 bg-scoreboard-slate border-pixel px-3 py-2">
              <div className="flex items-start gap-2">
                <span className="text-lg">🔒</span>
                <p className="font-body text-xs text-grey-300">
                  Desde <span className="text-line-white">Octavos</span>, los pronósticos del resto
                  recién se ven cuando el partido se <span className="text-line-white">bloquea</span> (1 h
                  antes de empezar). Hasta entonces, el de cada uno es secreto.
                </p>
              </div>
              {predictors.length > 0 && (
                <div className="border-t-[2px] border-border pt-2">
                  <div className="font-display text-[8px] tracking-[1px] text-grey-300 mb-2">
                    YA CARGARON ({predictors.length})
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {predictors.map((p) => (
                      <AvatarHoverCard
                        key={p.userId}
                        userId={p.userId}
                        name={p.displayName}
                        avatarUrl={p.avatarUrl}
                        size={28}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
```

- [ ] **Step 3: Gates**

Run: `npm run typecheck && npm run lint && npm run test`
Expected: todo en verde (los tests existentes no tocan esta página).

Run: `npm run build`
Expected: build OK.

- [ ] **Step 4: Commit**

```bash
git add app/\(app\)/cargar/\[matchId\]/page.tsx
git commit -m "Quién ya cargó: tira de avatares en partidos KO abiertos"
```

---

### Task 4: Verificación manual en dev + merge a `fun`

**Files:**
- Ninguno nuevo (verificación y merge).

**Interfaces:**
- Consumes: todo lo anterior aplicado en local (`db:reset` de Task 1 ya corrió).

- [ ] **Step 1: Armar un escenario KO abierto con pronósticos**

El seed no deja partidos de Octavos jugables, así que armarlo a mano en la BD local:

Un solo statement (CTE) para que el `update` y el `insert` apunten al MISMO partido:

```bash
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" <<'SQL'
with target as (
  select m.id from public.matches m
  join public.stages s on s.id = m.stage_id
  where s.sort_order = 3
  order by m.kickoff_at limit 1
), upd as (
  -- lo hago jugable, abierto y con kickoff en 3 días
  update public.matches
  set home_team_id = (select id from public.teams order by name limit 1),
      away_team_id = (select id from public.teams order by name offset 1 limit 1),
      kickoff_at   = now() + interval '3 days',
      status       = 'scheduled'
  where id = (select id from target)
  returning id
)
-- 3 usuarios con pronóstico cargado en ese partido
insert into public.predictions (user_id, match_id, pred_home_score, pred_away_score)
select pr.id, upd.id, 1, 0
from public.profiles pr cross join upd
order by pr.display_name
limit 3
on conflict (user_id, match_id) do nothing
returning match_id;
SQL
```

Expected: devuelve hasta 3 filas con el mismo `match_id` (anotarlo: es el `matchId` a visitar).

- [ ] **Step 2: Probar el flujo real**

Run: `npm run dev`, loguearse con un usuario del seed y visitar `/cargar/<matchId>` (el id del paso anterior).

Expected:
- Partido KO abierto: badge `EDITABLE`, cartel 🔒 con la tira `YA CARGARON (3)` y 3 avatares; **no** se ve ningún marcador ajeno; hover sobre un avatar muestra la tarjeta del jugador.
- Un partido de **grupos** cualquiera: sin tira, `FriendPicks` visible como siempre.
- Un partido **bloqueado o jugado**: `FriendPicks` con los pronósticos, igual que hoy (sin tira).

- [ ] **Step 3: Limpiar el escenario de prueba**

Run: `npm run db:reset`
Expected: la BD local vuelve al estado del seed (el escenario del Step 1 era solo para mirar la UI).

- [ ] **Step 4: Merge a `fun`**

```bash
git checkout fun
git merge main
npm run typecheck && npm run build
```

Expected: merge sin conflictos (si los hay, resolverlos conservando ambas features y re-correr gates) y gates en verde también en `fun`.

- [ ] **Step 5: Confirmar push con el usuario**

`fun` deploya producción: **no pushear sin confirmación explícita**. Preguntar al usuario si pushear `main` y `fun` a `origin`.
