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
