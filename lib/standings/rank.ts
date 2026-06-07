/**
 * Lógica pura de ordenamiento/posiciones de la tabla (sin DB), testeable.
 */

export type StandingAggregate = {
  userId: string;
  displayName: string;
  avatarUrl?: string | null;
  esBot?: boolean;
  points: number;
  plenos: number;
  aciertos: number;
};

export type RankedStanding = StandingAggregate & {
  rank: number;
  /** Movimiento vs ayer (positivo = subió); null si no hay snapshot. */
  delta: number | null;
};

/**
 * Ordena por puntos desc, desempata por plenos desc y luego por nombre.
 * Asigna posición con empates (mismo puntos+plenos = misma posición).
 * Si se pasa `posAyer` (mapa userId -> posición de ayer), calcula el delta.
 */
export function rankStandings(
  rows: StandingAggregate[],
  posAyer?: Map<string, number>,
): RankedStanding[] {
  const sorted = [...rows].sort(
    (a, b) =>
      b.points - a.points ||
      b.plenos - a.plenos ||
      a.displayName.localeCompare(b.displayName),
  );

  let rank = 0;
  let prevKey = "";
  return sorted.map((r, i) => {
    const key = `${r.points}-${r.plenos}`;
    if (key !== prevKey) {
      rank = i + 1;
      prevKey = key;
    }
    const ayer = posAyer?.get(r.userId);
    const delta = ayer != null ? ayer - rank : null;
    return { ...r, rank, delta };
  });
}
