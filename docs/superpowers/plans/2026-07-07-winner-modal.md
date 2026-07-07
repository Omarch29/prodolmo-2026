# Modal "Campeón del PRODE" — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Con el mundial terminado, cada visita a la app abre un modal pixel-art que consagra al ganador del PRODE, con 🏆 a los costados y guirnaldas que caen sin parar hasta cerrarlo.

**Architecture:** Lógica pura nueva en `lib/champion/final.ts` (identificar LA final y su campeón — arregla el bug del 3er puesto) y `pickWinners` en `lib/standings/rank.ts` (1° de la tabla, bots afuera, co-campeones). `getActualChampion` se reescribe sobre esos helpers. El layout de la app (server) evalúa el modo campeón y monta `WinnerModal` (client) con los ganadores; el modal monta `Confetti` con un prop nuevo `loop` (animación infinita) que muere al desmontar.

**Tech Stack:** Next.js App Router (RSC + client components) · TypeScript estricto · Tailwind v4 tokens pixel-art · Vitest.

**Spec:** `docs/superpowers/specs/2026-07-07-winner-modal-design.md`

## Global Constraints

- TypeScript estricto, **sin `any`**; tipos `Database` generados.
- Estilos **solo con tokens** (`bg-scoreboard-black`, `border-pixel-thick`, `shadow-pixel-lg`, `font-display`, `text-card-yellow`…). Sin radios ni colores hardcodeados.
- Sin migraciones: todo es lectura de datos existentes.
- Vitest importando `describe/it/expect` desde `"vitest"`; lógica pura en módulos sin DB.
- Trabajar en **`main`**; al final merge `main` → `fun`. No tocar `docs/IMAGES/` ni `docs/Sonidos/` (sin trackear).
- Gates: `npm run typecheck` · `npm run lint` · `npm run test` · `npm run build` en verde.

---

### Task 1: Lógica pura de la final — `lib/champion/final.ts`

**Files:**
- Create: `lib/champion/final.ts`
- Test: `test/champion-final.test.ts`

**Interfaces:**
- Consumes: nada (módulo puro).
- Produces:
  - `export type FinalMatch = { homeTeamId: string | null; awayTeamId: string | null; homeScore: number | null; awayScore: number | null; decidedWinnerTeamId: string | null; kickoffAt: string; status: string }`
  - `export function resolveFinalMatch(matches: FinalMatch[]): FinalMatch | null` — el de kickoff más tardío (sin importar status); null si lista vacía.
  - `export function championFromFinal(final: FinalMatch | null): string | null` — null si no hay final o no está `finished`; si hay goles, gana el que más hizo; empate → `decidedWinnerTeamId`.

- [ ] **Step 1: Test que falla**

Crear `test/champion-final.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { resolveFinalMatch, championFromFinal, type FinalMatch } from "@/lib/champion/final";

const base = {
  homeTeamId: "ARG",
  awayTeamId: "FRA",
  homeScore: null,
  awayScore: null,
  decidedWinnerTeamId: null,
};

// El 3er puesto se juega ANTES; la final es el kickoff más tardío.
const tercerPuesto: FinalMatch = {
  ...base,
  homeTeamId: "URU",
  awayTeamId: "MEX",
  homeScore: 2,
  awayScore: 0,
  kickoffAt: "2026-07-18T18:00:00Z",
  status: "finished",
};
const final: FinalMatch = { ...base, kickoffAt: "2026-07-19T18:00:00Z", status: "scheduled" };

describe("resolveFinalMatch", () => {
  it("elige el partido de kickoff más tardío aunque no esté terminado", () => {
    expect(resolveFinalMatch([tercerPuesto, final])).toEqual(final);
    expect(resolveFinalMatch([final, tercerPuesto])).toEqual(final);
  });
  it("devuelve null sin partidos", () => {
    expect(resolveFinalMatch([])).toBeNull();
  });
});

describe("championFromFinal", () => {
  it("3er puesto terminado + final pendiente => NO hay campeón todavía", () => {
    expect(championFromFinal(resolveFinalMatch([tercerPuesto, final]))).toBeNull();
  });
  it("final terminada por goles => gana el que más hizo", () => {
    expect(championFromFinal({ ...final, status: "finished", homeScore: 3, awayScore: 1 })).toBe("ARG");
    expect(championFromFinal({ ...final, status: "finished", homeScore: 0, awayScore: 1 })).toBe("FRA");
  });
  it("final empatada => decide decidedWinnerTeamId (penales)", () => {
    expect(
      championFromFinal({
        ...final,
        status: "finished",
        homeScore: 1,
        awayScore: 1,
        decidedWinnerTeamId: "FRA",
      }),
    ).toBe("FRA");
  });
  it("final empatada sin decided_winner => null (datos incompletos)", () => {
    expect(championFromFinal({ ...final, status: "finished", homeScore: 1, awayScore: 1 })).toBeNull();
  });
  it("null si no hay final", () => {
    expect(championFromFinal(null)).toBeNull();
  });
});
```

- [ ] **Step 2: Verificar que falla**

Run: `npx vitest run test/champion-final.test.ts`
Expected: FAIL — no existe `@/lib/champion/final`.

- [ ] **Step 3: Implementación mínima**

Crear `lib/champion/final.ts`:

```ts
/**
 * Lógica pura de LA final del mundial (sin DB), testeable.
 * La etapa 6 ("Final y 3.º puesto") tiene DOS partidos; la final es el de
 * kickoff más tardío. El campeón solo existe cuando ESA final terminó —
 * mirar "el último partido terminado" regalaba el título (y el bonus +20)
 * al ganador del 3er puesto durante un día.
 */

export type FinalMatch = {
  homeTeamId: string | null;
  awayTeamId: string | null;
  homeScore: number | null;
  awayScore: number | null;
  decidedWinnerTeamId: string | null;
  kickoffAt: string;
  status: string;
};

export function resolveFinalMatch(matches: FinalMatch[]): FinalMatch | null {
  let last: FinalMatch | null = null;
  for (const m of matches) {
    if (!last || new Date(m.kickoffAt).getTime() > new Date(last.kickoffAt).getTime()) last = m;
  }
  return last;
}

export function championFromFinal(final: FinalMatch | null): string | null {
  if (!final || final.status !== "finished") return null;
  if (final.homeScore == null || final.awayScore == null) return final.decidedWinnerTeamId;
  if (final.homeScore > final.awayScore) return final.homeTeamId;
  if (final.awayScore > final.homeScore) return final.awayTeamId;
  return final.decidedWinnerTeamId;
}
```

- [ ] **Step 4: Verificar que pasa**

Run: `npx vitest run test/champion-final.test.ts`
Expected: PASS (7 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/champion/final.ts test/champion-final.test.ts
git commit -m "Lógica pura de la final: campeón solo cuando LA final terminó"
```

---

### Task 2: `getActualChampion` usa la lógica de la final (fix del 3er puesto)

**Files:**
- Modify: `lib/queries/champion.ts:29-45` (función `getActualChampion`)

**Interfaces:**
- Consumes: `resolveFinalMatch`, `championFromFinal`, `FinalMatch` de `lib/champion/final.ts` (Task 1).
- Produces: `getActualChampion(supabase): Promise<string | null>` — misma firma que hoy; ahora devuelve null hasta que LA final esté terminada. Lo consumen `getStandings` (sin cambios) y el layout (Task 5).

- [ ] **Step 1: Reemplazar la implementación**

En `lib/queries/champion.ts`, agregar el import arriba:

```ts
import { resolveFinalMatch, championFromFinal, type FinalMatch } from "@/lib/champion/final";
```

y reemplazar la función `getActualChampion` completa (líneas 29-45) por:

```ts
/**
 * Campeón real = ganador de LA final (kickoff más tardío de la última etapa),
 * solo si ya terminó. La etapa 6 incluye el 3er puesto: mirar "el último
 * terminado" coronaba mal durante el día entre ambos partidos.
 */
export async function getActualChampion(supabase: SupabaseClient<Database>): Promise<string | null> {
  const { data } = await supabase
    .from("matches")
    .select(
      "home_team_id, away_team_id, home_score, away_score, decided_winner_team_id, kickoff_at, status, stage:stages!inner(sort_order)",
    )
    .eq("stage.sort_order", 6);

  const matches: FinalMatch[] = (data ?? []).map((m) => ({
    homeTeamId: m.home_team_id,
    awayTeamId: m.away_team_id,
    homeScore: m.home_score,
    awayScore: m.away_score,
    decidedWinnerTeamId: m.decided_winner_team_id,
    kickoffAt: m.kickoff_at,
    status: m.status,
  }));
  return championFromFinal(resolveFinalMatch(matches));
}
```

Nota: la query anterior filtraba `status=finished` y filtraba la etapa en JS; ahora trae los (2) partidos de la etapa 6 en cualquier estado, que es lo que la lógica necesita.

- [ ] **Step 2: Verificar**

Run: `npm run typecheck && npm run test`
Expected: sin errores; los 84+7 tests siguen en verde (nadie testeaba el comportamiento buggy).

- [ ] **Step 3: Commit**

```bash
git add lib/queries/champion.ts
git commit -m "getActualChampion: solo LA final corona (fix bonus +20 en el hueco del 3er puesto)"
```

---

### Task 3: `pickWinners` — 1° de la tabla, bots afuera, co-campeones

**Files:**
- Modify: `lib/standings/rank.ts` (agregar al final)
- Test: `test/pick-winners.test.ts`

**Interfaces:**
- Consumes: `RankedStanding` (ya definido en `lib/standings/rank.ts`).
- Produces: `export function pickWinners(rows: RankedStanding[]): RankedStanding[]` — no-bots con el mejor (menor) rank entre no-bots; `[]` si no hay filas. Lo consume el layout (Task 5).

- [ ] **Step 1: Test que falla**

Crear `test/pick-winners.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { pickWinners, type RankedStanding } from "@/lib/standings/rank";

function row(partial: Partial<RankedStanding> & { userId: string }): RankedStanding {
  return {
    displayName: partial.userId,
    avatarUrl: null,
    esBot: false,
    points: 0,
    plenos: 0,
    aciertos: 0,
    rank: 1,
    delta: null,
    ...partial,
  };
}

describe("pickWinners", () => {
  it("devuelve el único primero", () => {
    const rows = [row({ userId: "a", rank: 1 }), row({ userId: "b", rank: 2 })];
    expect(pickWinners(rows).map((w) => w.userId)).toEqual(["a"]);
  });
  it("co-campeones: todos los de rank 1", () => {
    const rows = [row({ userId: "a", rank: 1 }), row({ userId: "b", rank: 1 }), row({ userId: "c", rank: 3 })];
    expect(pickWinners(rows).map((w) => w.userId)).toEqual(["a", "b"]);
  });
  it("excluye bots aunque estén primeros", () => {
    const rows = [row({ userId: "bot", rank: 1, esBot: true }), row({ userId: "a", rank: 2 })];
    expect(pickWinners(rows).map((w) => w.userId)).toEqual(["a"]);
  });
  it("lista vacía => []", () => {
    expect(pickWinners([])).toEqual([]);
  });
});
```

- [ ] **Step 2: Verificar que falla**

Run: `npx vitest run test/pick-winners.test.ts`
Expected: FAIL — `pickWinners` no existe.

- [ ] **Step 3: Implementación mínima**

Al final de `lib/standings/rank.ts`:

```ts
/**
 * Ganador(es) del prode: los no-bots con el mejor puesto entre no-bots.
 * Más de uno solo si el empate persiste tras los desempates (co-campeones).
 */
export function pickWinners(rows: RankedStanding[]): RankedStanding[] {
  const humans = rows.filter((r) => !r.esBot);
  const best = humans.reduce((min, r) => Math.min(min, r.rank), Infinity);
  return humans.filter((r) => r.rank === best);
}
```

- [ ] **Step 4: Verificar que pasa**

Run: `npx vitest run test/pick-winners.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/standings/rank.ts test/pick-winners.test.ts
git commit -m "pickWinners: campeón(es) del prode desde la tabla rankeada"
```

---

### Task 4: `Confetti` con `loop` + componente `WinnerModal`

**Files:**
- Modify: `components/fx/Confetti.tsx`
- Create: `components/champion/WinnerModal.tsx`

**Interfaces:**
- Consumes: `Avatar` (`components/ui/Avatar.tsx`: props `name`, `src`, `size`), `Button` (`components/ui/Button.tsx`), `Confetti`.
- Produces:
  - `Confetti({ loop = false }: { loop?: boolean })` — con `loop`, `animation-iteration-count: infinite` (cae sin parar mientras esté montado); sin `loop`, comportamiento actual (`forwards`).
  - `export type Winner = { userId: string; displayName: string; avatarUrl: string | null; points: number }`
  - `WinnerModal({ winners }: { winners: Winner[] })` — client component; `useState(true)`; CERRAR desmonta todo.

- [ ] **Step 1: Prop `loop` en Confetti**

En `components/fx/Confetti.tsx`, reemplazar la función `Confetti` por:

```tsx
/**
 * Papelitos cayendo. Las animaciones CSS arrancan al montar; al cambiar de tab
 * se remonta (key) y vuelven a caer. Decorativo: no captura clicks.
 * `loop`: caen sin parar (guirnaldas de festejo) hasta desmontar.
 */
export function Confetti({ loop = false }: { loop?: boolean }) {
  return (
    <div aria-hidden className="confetti-overlay pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      {PIECES.map((p, i) => {
        const style: CSSProperties = {
          left: `${p.left}%`,
          width: p.size,
          height: p.size,
          backgroundColor: p.color,
          animation: `confetti-fall ${p.duration}s linear ${p.delay}s ${loop ? "infinite" : "forwards"}`,
        };
        return <span key={i} className="absolute -top-3 block" style={style} />;
      })}
    </div>
  );
}
```

- [ ] **Step 2: WinnerModal**

Crear `components/champion/WinnerModal.tsx`:

```tsx
"use client";

import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Confetti } from "@/components/fx/Confetti";

export type Winner = {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  points: number;
};

/**
 * Consagración del ganador del prode: se muestra en cada visita con el mundial
 * ya terminado. Las guirnaldas (confetti en loop) no paran hasta cerrar el
 * modal — al desmontar muere la animación. Sin persistencia: cerrar lo oculta
 * solo hasta la próxima carga de página.
 */
export function WinnerModal({ winners }: { winners: Winner[] }) {
  const [open, setOpen] = useState(true);
  if (!open || winners.length === 0) return null;

  const title = winners.length > 1 ? "CAMPEONES DEL PRODE" : "CAMPEÓN DEL PRODE";

  return (
    <div className="fixed inset-0 z-[80] bg-scoreboard-ink/85 flex items-center justify-center p-4">
      <Confetti loop />
      <div className="relative z-10 w-full max-w-md bg-scoreboard-black border-pixel-thick shadow-pixel-lg p-5 flex flex-col items-center gap-4 text-center">
        <div className="font-display text-[10px] tracking-[2px] text-line-white">👑 {title} 👑</div>
        {winners.map((w) => (
          <div key={w.userId} className="flex flex-col items-center gap-3">
            <Avatar name={w.displayName} src={w.avatarUrl} size={72} />
            <div className="font-display text-sm text-card-yellow leading-relaxed">
              🏆 {w.displayName} 🏆
            </div>
            <div className="font-mono text-card-yellow text-4xl">{w.points} PTS</div>
          </div>
        ))}
        <p className="font-body text-xs text-grey-300">
          Se terminó el Mundial 2026. ¡Gracias por jugar el prode!
        </p>
        <Button type="button" variant="secondary" size="sm" onClick={() => setOpen(false)}>
          CERRAR
        </Button>
      </div>
    </div>
  );
}
```

Nota: `Button` extiende `ButtonHTMLAttributes<HTMLButtonElement>` (acepta `onClick` y `type`), con props `variant`/`size`/`block` — la llamada de arriba compila tal cual.

- [ ] **Step 3: Verificar**

Run: `npm run typecheck && npm run lint`
Expected: sin errores.

- [ ] **Step 4: Commit**

```bash
git add components/fx/Confetti.tsx components/champion/WinnerModal.tsx
git commit -m "WinnerModal: consagración del campeón con guirnaldas en loop"
```

---

### Task 5: Integración en el layout + verificación E2E

**Files:**
- Modify: `app/(app)/layout.tsx`

**Interfaces:**
- Consumes: `getActualChampion` (Task 2), `getStandings` (`lib/queries/standings.ts`), `pickWinners` (Task 3), `WinnerModal`/`Winner` (Task 4).

- [ ] **Step 1: Montar el modal desde el layout**

En `app/(app)/layout.tsx`, agregar imports:

```ts
import { WinnerModal, type Winner } from "@/components/champion/WinnerModal";
import { getStandings } from "@/lib/queries/standings";
import { pickWinners } from "@/lib/standings/rank";
import { getActualChampion } from "@/lib/queries/champion";
```

(`getTournamentStart`, `getTeamsList`, `isChampionEditable` ya se importan de `@/lib/queries/champion`; unificar en un solo import.)

Después del bloque de `canPickChampion` (línea ~31), agregar:

```ts
// ¿Terminó el mundial? => consagrar al/los campeón(es) del prode en cada visita.
const tournamentOver = (await getActualChampion(supabase)) !== null;
let winners: Winner[] = [];
if (tournamentOver) {
  const standings = await getStandings(supabase);
  winners = pickWinners(standings).map((w) => ({
    userId: w.userId,
    displayName: w.displayName,
    avatarUrl: w.avatarUrl ?? null,
    points: w.points,
  }));
}
```

y en el JSX, junto a `ChampionPrompt`:

```tsx
      {winners.length > 0 && <WinnerModal winners={winners} />}
```

- [ ] **Step 2: Gates**

Run: `npm run typecheck && npm run lint && npm run test && npm run build`
Expected: todo en verde.

- [ ] **Step 3: Verificación E2E local**

Con Supabase local corriendo y usuarios seedeados (`npm run db:reset && npm run seed:users` si hace falta), armar el torneo terminado:

```bash
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" <<'SQL'
-- grupos: un partido terminado que le da puntos a un usuario (el campeón esperado)
with t as (
  select (select id from public.teams order by name limit 1) as a,
         (select id from public.teams order by name offset 1 limit 1) as b,
         (select id from public.groups order by name limit 1) as grp
), g as (
  insert into public.matches (stage_id, group_id, home_team_id, away_team_id, kickoff_at, status, venue)
  select (select id from public.stages where sort_order = 1), grp, a, b, now() - interval '20 days', 'scheduled', 'TEST GRUPO'
  from t returning id
)
insert into public.predictions (user_id, match_id, pred_home_score, pred_away_score)
select (select id from public.profiles order by display_name limit 1), g.id, 2, 0 from g;
update public.matches set status='finished', home_score=2, away_score=0 where venue='TEST GRUPO';

-- etapa 6: 3er puesto TERMINADO + final PENDIENTE (no debe salir modal)
insert into public.matches (stage_id, home_team_id, away_team_id, kickoff_at, status, home_score, away_score, venue)
select (select id from public.stages where sort_order = 6),
       (select id from public.teams order by name limit 1),
       (select id from public.teams order by name offset 1 limit 1),
       now() - interval '1 day', 'finished', 2, 0, 'TEST 3ER PUESTO';
insert into public.matches (stage_id, home_team_id, away_team_id, kickoff_at, status, venue)
select (select id from public.stages where sort_order = 6),
       (select id from public.teams order by name offset 2 limit 1),
       (select id from public.teams order by name offset 3 limit 1),
       now() + interval '1 day', 'scheduled', 'TEST FINAL';
SQL
```

Levantar `npm run dev`, loguearse (`omar@prode.local` / `prode2026`) y visitar `/dashboard`:
- **Sin modal** (3er puesto terminado no corona — verifica el fix).

Terminar la final y volver a cargar:

```bash
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -c \
  "update public.matches set status='finished', home_score=1, away_score=0, kickoff_at=now() - interval '1 hour' where venue='TEST FINAL';"
```

- **Con modal**: título `👑 CAMPEÓN DEL PRODE 👑`, el nombre del 1° (el usuario con los 3 puntos del pleno) entre 🏆, sus puntos, guirnaldas cayendo en loop, y CERRAR lo saca.

Limpiar al terminar: `npm run db:reset && npm run seed:users`.

- [ ] **Step 4: Commit**

```bash
git add "app/(app)/layout.tsx"
git commit -m "Modal Campeón del PRODE al terminar el mundial"
```

---

### Task 6: Merge a `fun` y deploy

**Files:** ninguno nuevo.

- [ ] **Step 1: Merge y gates en fun**

```bash
git checkout fun
git merge main --no-edit
npm run typecheck && npm run build
```

Expected: merge sin conflictos, gates en verde.

- [ ] **Step 2: Deploy (procedimiento establecido; sin migraciones esta vez)**

```bash
git push origin main fun
```

Verificar en Vercel que el deploy de producción quede READY. En prod NO debe verse el modal todavía (la final real es el 19/7); el fix de `getActualChampion` sí queda activo para el hueco 3er puesto → final.
