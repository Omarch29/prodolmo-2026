import type { Database } from "@/lib/database.types";
import type { FdTeam, FdMatch } from "./types";

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
  return {
    externalId: t.id,
    name: t.name,
    // si falta el tla, derivar un código de respaldo del nombre
    code: (t.tla ?? t.name.slice(0, 3)).toUpperCase(),
    flagUrl: t.crest,
  };
}

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
};

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
  };
}
