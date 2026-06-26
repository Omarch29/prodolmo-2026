import type { Database } from "@/lib/database.types";
import type { FdTeam, FdMatch } from "./types";
import { TEAM_NAMES_ES } from "./team-names-es";

type MatchStatus = Database["public"]["Enums"]["match_status"];

/** Estado de la API -> nuestro enum match_status. */
export function mapStatus(apiStatus: string): MatchStatus {
  switch (apiStatus) {
    case "FINISHED":
    case "AWARDED":
      return "finished";
    case "IN_PLAY":
    case "PAUSED":
    case "SUSPENDED":
      return "in_progress";
    default:
      return "scheduled"; // SCHEDULED, TIMED, POSTPONED, etc.
  }
}

/**
 * Etapa de la API -> sort_order de nuestra tabla `stages`
 * (1 grupos … 6 final/3.º). null si no la reconocemos.
 */
export function mapStageSortOrder(apiStage: string): number | null {
  switch (apiStage) {
    case "GROUP_STAGE":
      return 1;
    case "LAST_32":
    case "ROUND_OF_32":
      return 2;
    case "LAST_16":
    case "ROUND_OF_16":
      return 3;
    case "QUARTER_FINALS":
      return 4;
    case "SEMI_FINALS":
      return 5;
    case "FINAL":
    case "THIRD_PLACE":
      return 6;
    default:
      return null;
  }
}

/** "GROUP A" / "GROUP_A" -> "A"; null en eliminatorias. */
export function mapGroupLetter(apiGroup: string | null): string | null {
  if (!apiGroup) return null;
  const last = apiGroup.trim().toUpperCase().split(/[\s_]+/).pop();
  return last && /^[A-L]$/.test(last) ? last : null;
}

export type NormalizedTeam = {
  externalId: number;
  name: string;
  code: string;
  flagUrl: string | null;
};

export function normalizeTeam(t: FdTeam): NormalizedTeam {
  // si falta el tla, derivar un código de respaldo del nombre
  const code = (t.tla ?? t.name.slice(0, 3)).toUpperCase();
  return {
    externalId: t.id,
    name: TEAM_NAMES_ES[code] ?? t.name, // español si lo tenemos
    code,
    flagUrl: t.crest,
  };
}

export type RefereeInfo = { name: string; role: string | null; nationality: string | null };

export type NormalizedMatch = {
  externalId: number;
  stageSort: number | null;
  matchday: number | null;
  groupLetter: string | null;
  homeExternalId: number | null;
  awayExternalId: number | null;
  kickoffAt: string;
  status: MatchStatus;
  homeScore: number | null;
  awayScore: number | null;
  referees: RefereeInfo[];
};

export function normalizeReferees(m: FdMatch): RefereeInfo[] {
  return (m.referees ?? [])
    .filter((r) => r.name)
    .map((r) => ({ name: r.name as string, role: r.type, nationality: r.nationality }));
}

export type MatchResultState = {
  status: MatchStatus;
  homeScore: number | null;
  awayScore: number | null;
};

const hasResult = (s: MatchResultState | undefined): s is MatchResultState =>
  s?.status === "finished" && s.homeScore !== null && s.awayScore !== null;

/**
 * Resultado final a persistir, protegiendo un partido ya cerrado con marcador
 * (p. ej. cargado a mano por el admin) de que el sync lo pise con datos sin
 * marcador. football-data en plan gratis a veces reporta el partido sin goles;
 * solo dejamos que la API sobrescriba un resultado existente si trae OTRO
 * resultado completo (finished + goles no nulos).
 */
export function resolveMatchResult(
  existing: MatchResultState | undefined,
  incoming: MatchResultState,
): MatchResultState {
  if (!hasResult(existing)) return incoming;
  return hasResult(incoming) ? incoming : existing;
}

/**
 * Equipo a persistir para un lado del partido, protegiendo un cruce ya resuelto
 * de que el sync lo degrade a "por definir". football-data arma el cuadro a
 * medida que terminan los grupos y a veces revierte un cruce a null mientras
 * recalcula; si ya teníamos el equipo, lo conservamos. Si la API trae un equipo
 * (no nulo) manda la API (permite corregir el cruce).
 */
export function resolveTeamId(
  existing: string | null | undefined,
  incoming: string | null | undefined,
): string | null {
  return incoming ?? existing ?? null;
}

export function normalizeMatch(m: FdMatch): NormalizedMatch {
  return {
    externalId: m.id,
    stageSort: mapStageSortOrder(m.stage),
    matchday: m.matchday ?? null,
    groupLetter: mapGroupLetter(m.group),
    homeExternalId: m.homeTeam?.id ?? null,
    awayExternalId: m.awayTeam?.id ?? null,
    kickoffAt: m.utcDate,
    status: mapStatus(m.status),
    homeScore: m.score?.fullTime?.home ?? null,
    awayScore: m.score?.fullTime?.away ?? null,
    referees: normalizeReferees(m),
  };
}
