# Quién ya cargó (KO abierto) — Diseño

**Fecha:** 2026-07-04 · **Estado:** aprobado

## Problema

Desde Octavos, los pronósticos ajenos son secretos hasta que el partido se
bloquea (kickoff − 1h; RLS de la migración `0015`). Mientras la carga está
abierta, la página del partido solo muestra el cartel 🔒 "el de cada uno es
secreto": no hay forma de saber **quién ya cargó**. Una vez bloqueado, ya se
muestra todo (`FriendPicks`) — eso no cambia.

## Alcance

Mostrar, **solo en la página del partido** (`/cargar/[matchId]`) y **solo
mientras un partido KO (Octavos en adelante) sigue abierto**, la lista de
quienes ya cargaron su pronóstico — sin revelar qué cargaron y sin señalar a
los que faltan. Grupos y Ronda de 32 no cambian (los picks ya se ven
completos siempre). El listado `/cargar` no cambia.

## Diseño

### 1. Base de datos — migración `0017_match_predictors.sql`

Función RPC `public.match_predictors(p_match_id uuid)`:

- Devuelve `user_id, display_name, avatar_url` (join `predictions` ×
  `profiles`) de quienes tienen pronóstico en ese partido, ordenado por
  `display_name`.
- `security definer` — es la vía deliberada para exponer *existencia* sin
  abrir la RLS de `predictions`. Aunque se llame a mano desde la consola,
  solo devuelve nombres, nunca resultados ni ganador.
- Hygiene: `stable`, `set search_path = ''`, `revoke execute from public,
  anon` y `grant execute to authenticated`.
- Alternativas descartadas: vista security-definer (menos explícita, la
  marca el linter de Supabase) y service-role en el RSC (las reglas de
  visibilidad viven en la BD).

Tras la migración: `npm run db:types` para regenerar `lib/database.types.ts`.

### 2. Queries — `lib/queries/cargar.ts`

`getMatchPredictors(supabase, matchId)` → llama al RPC y devuelve
`{ userId, displayName, avatarUrl }[]`. La página lo invoca solo cuando
`playable && !othersVisible` (KO abierto); en cualquier otro estado no se
consulta.

### 3. UI — `app/(app)/cargar/[matchId]/page.tsx`

En el bloque actual del cartel 🔒 "Desde Octavos… es secreto", debajo del
texto se agrega una tira:

- Título `YA CARGARON (N)` en `font-display` chico, y una fila de avatares
  con `AvatarHoverCard` (como en `FriendPicks`), envolviendo a varias líneas
  si son muchos.
- Incluye a todos los que cargaron (también el usuario actual).
- Si `N === 0`, no se muestra la tira (queda solo el cartel actual, mismo
  patrón que `FriendPicks` con lista vacía).
- Estilos solo con tokens del design system (sin colores hardcodeados).

### 4. Verificación

- No hay lógica pura nueva con miga → sin tests unitarios nuevos; la regla
  de visibilidad (`othersPicksVisible`) ya está testeada.
- Manual: `npm run db:reset` + `seed:demo`, probar en `npm run dev` un
  partido KO abierto (tira visible, picks ocultos), uno bloqueado
  (`FriendPicks` igual que hoy) y uno de grupos (sin tira).
- Gates: `npm run typecheck` · `lint` · `test` · `build` en verde.

### 5. Ramas

Implementar en `main`; al terminar, merge `main` → `fun` (fun es prod).
