# Modal "Campeón del PRODE" — Diseño

**Fecha:** 2026-07-07 · **Estado:** aprobado

## Problema

Cuando termine el mundial, la app no consagra a nadie: la tabla queda quieta y
listo. Queremos que al entrar cualquiera del grupo se encuentre con la
celebración del ganador del prode.

## Alcance

Un modal que, con el mundial terminado, aparece **en cada visita a la app**
(cada carga de página, cualquier pantalla), **para siempre**: muestra al
**ganador del PRODE** con trofeos a los costados y guirnaldas (papelitos)
cayendo sin parar hasta que se cierra. Cerrarlo lo oculta solo hasta la
próxima visita; no hay persistencia. Navegar dentro de la app no lo re-abre
(el layout de App Router no se re-monta en navegación cliente).

## Diseño

### 1. Detección de fin de mundial (+ fix de bug latente)

- **La final** = el partido con el kickoff más tardío de la etapa
  `sort_order = 6` ("Final y 3.º puesto", que incluye el 3er puesto).
- **Modo campeón activo** ⟺ esa final está `finished` (con ganador
  determinable: goles o `decided_winner_team_id`).
- **Fix incluido:** `getActualChampion` (lib/queries/champion.ts) hoy toma el
  último partido *terminado* de la etapa 6: entre el 3er puesto y la final
  devuelve al ganador del 3er puesto como campeón del mundo, regalando el
  bonus de +20 durante ese hueco (puede hasta alterar el 1er puesto). Se
  corrige con el mismo criterio: solo la final (max kickoff), solo si está
  terminada.
- Lógica pura en un módulo testeable (p. ej. `lib/champion/final.ts`):
  `resolveFinalMatch(matches)` y `championFromFinal(final)` con tests que
  cubran: 3er puesto terminado + final pendiente → null; final terminada por
  goles → ganador; final empatada → `decided_winner_team_id`.

### 2. Quién es el campeón del prode

- El **primer puesto** de `getStandings` (ya incluye suma real vía RPC
  `standings_aggregate`, desempates por plenos y bonus de campeón).
- Bots (`es_bot`) excluidos.
- Si tras los desempates hay **empate exacto en el rank 1**, se muestran
  todos los campeones (título en plural: "CAMPEONES DEL PRODE").
- Datos mostrados por campeón: avatar, nombre, puntos.
- Selección en helper puro (p. ej. `pickWinners(rows)`) con tests: único
  campeón, co-campeones, bots fuera.

### 3. Integración

- En `app/(app)/layout.tsx`, patrón `ChampionPrompt`: el layout (server)
  evalúa el modo campeón; si está activo obtiene el/los ganadores y monta
  `<WinnerModal winners={...} />` (client component,
  `components/champion/WinnerModal.tsx`).
- Estado `open` local con `useState(true)`; CERRAR → `setOpen(false)` y se
  desmonta todo (incluidas las guirnaldas). Sin localStorage.

### 4. UI (pixel-art, solo tokens del design system)

- Overlay oscuro fijo por encima de la navegación (z sobre el 60 del
  confetti; usar z-[70] para overlay y z-[80] para la tarjeta).
- Tarjeta centrada `bg-scoreboard-black` + `border-pixel-thick` +
  `shadow-pixel`, ancho acotado mobile-first.
- Contenido: título `👑 CAMPEÓN DEL PRODE` en `font-display` chico; nombre
  en `font-display` amarillo (`text-card-yellow`) flanqueado por 🏆 a cada
  costado; avatar grande (`Avatar`); puntos en `font-mono` grande; botón
  CERRAR (`Button` del design system).
- **Guirnaldas:** `Confetti` gana un prop `loop?: boolean` — con `loop`, la
  animación CSS usa `animation-iteration-count: infinite` (los papelitos
  vuelven a caer sin parar). El modal la monta dentro de su overlay; al
  cerrar, se desmonta y la animación muere. Sin `loop`, comportamiento
  actual intacto (una pasada, `forwards`).
- La celebración no respeta el toggle de confetti de preferencias: es el
  momento cúlmine del juego y se puede cerrar.

### 5. Verificación

- Vitest para la lógica pura nueva (`lib/champion/final.ts`, `pickWinners`).
- E2E local: escenario con la final terminada → el modal aparece con el
  nombre del 1° de la tabla y las guirnaldas; con la final pendiente (o solo
  el 3er puesto jugado) → no aparece y el bonus +20 no se reparte.
- Gates: `npm run typecheck` · `lint` · `test` · `build` en verde.

### 6. Ramas

Implementar en `main`; merge `main` → `fun` al terminar. No hay migraciones:
todo es lectura sobre datos existentes.
