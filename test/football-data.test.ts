import { describe, it, expect } from "vitest";
import {
  mapStatus,
  mapStageSortOrder,
  mapGroupLetter,
  normalizeTeam,
  normalizeMatch,
  resolveMatchResult,
  resolveTeamId,
  resolveScore,
  type MatchResultState,
} from "@/lib/integrations/football-data/map";
import type { FdMatch, FdTeam } from "@/lib/integrations/football-data/types";

describe("mapStatus", () => {
  it("mapea estados de la API a nuestro enum", () => {
    expect(mapStatus("SCHEDULED")).toBe("scheduled");
    expect(mapStatus("TIMED")).toBe("scheduled");
    expect(mapStatus("IN_PLAY")).toBe("in_progress");
    expect(mapStatus("PAUSED")).toBe("in_progress");
    expect(mapStatus("FINISHED")).toBe("finished");
    expect(mapStatus("CUALQUIERA")).toBe("scheduled");
  });
});

describe("mapStageSortOrder", () => {
  it("mapea etapas conocidas", () => {
    expect(mapStageSortOrder("GROUP_STAGE")).toBe(1);
    expect(mapStageSortOrder("LAST_32")).toBe(2);
    expect(mapStageSortOrder("LAST_16")).toBe(3);
    expect(mapStageSortOrder("QUARTER_FINALS")).toBe(4);
    expect(mapStageSortOrder("SEMI_FINALS")).toBe(5);
    expect(mapStageSortOrder("FINAL")).toBe(6);
    expect(mapStageSortOrder("THIRD_PLACE")).toBe(6);
  });
  it("devuelve null para etapas desconocidas", () => {
    expect(mapStageSortOrder("PRESEASON")).toBeNull();
  });
});

describe("mapGroupLetter", () => {
  it("extrae la letra del grupo", () => {
    expect(mapGroupLetter("GROUP A")).toBe("A");
    expect(mapGroupLetter("GROUP_A")).toBe("A"); // football-data usa guión bajo
    expect(mapGroupLetter("group l")).toBe("L");
  });
  it("null en eliminatorias o formato raro", () => {
    expect(mapGroupLetter(null)).toBeNull();
    expect(mapGroupLetter("GROUP Z")).toBeNull();
  });
});

describe("normalizeTeam", () => {
  it("normaliza con tla y crest", () => {
    const t: FdTeam = { id: 762, name: "Argentina", tla: "ARG", crest: "https://x/arg.png" };
    expect(normalizeTeam(t)).toEqual({
      externalId: 762,
      name: "Argentina",
      code: "ARG",
      flagUrl: "https://x/arg.png",
    });
  });
  it("deriva código si falta el tla", () => {
    const t: FdTeam = { id: 1, name: "Brasil", tla: null, crest: null };
    expect(normalizeTeam(t).code).toBe("BRA");
  });
});

describe("normalizeMatch", () => {
  const base: FdMatch = {
    id: 1,
    utcDate: "2026-06-12T19:00:00Z",
    status: "FINISHED",
    stage: "GROUP_STAGE",
    matchday: 1,
    group: "GROUP A",
    homeTeam: { id: 762, name: "Argentina", tla: "ARG" },
    awayTeam: { id: 763, name: "México", tla: "MEX" },
    score: { fullTime: { home: 2, away: 1 } },
  };

  it("normaliza un partido de grupos finalizado", () => {
    expect(normalizeMatch(base)).toEqual({
      externalId: 1,
      stageSort: 1,
      matchday: 1,
      groupLetter: "A",
      homeExternalId: 762,
      awayExternalId: 763,
      kickoffAt: "2026-06-12T19:00:00Z",
      status: "finished",
      homeScore: 2,
      awayScore: 1,
      homePenalties: null,
      awayPenalties: null,
      decidedWinner: null,
      referees: [],
    });
  });

  it("eliminatoria por penales: marcador real es 90'+alargue, no fullTime", () => {
    // Caso real Alemania-Paraguay: terminó 1-1, fullTime trae el agregado con
    // penales (5-6). El marcador de fútbol debe ser 1-1 y Paraguay (away) avanza.
    const m: FdMatch = {
      ...base,
      id: 200,
      stage: "LAST_32",
      group: null,
      homeTeam: { id: 759, name: "Germany", tla: "GER" },
      awayTeam: { id: 770, name: "Paraguay", tla: "PAR" },
      score: {
        duration: "PENALTY_SHOOTOUT",
        fullTime: { home: 5, away: 6 },
        regularTime: { home: 1, away: 1 },
        extraTime: { home: 0, away: 0 },
        penalties: { home: 5, away: 5 },
      },
    };
    const out = normalizeMatch(m);
    expect(out.homeScore).toBe(1);
    expect(out.awayScore).toBe(1);
    expect(out.homePenalties).toBe(5);
    expect(out.awayPenalties).toBe(6);
    expect(out.decidedWinner).toBe("away");
  });

  it("maneja eliminatoria con equipo por definir y sin marcador", () => {
    const m: FdMatch = {
      ...base,
      id: 99,
      status: "SCHEDULED",
      stage: "SEMI_FINALS",
      group: null,
      awayTeam: { id: null, name: null, tla: null },
      score: { fullTime: { home: null, away: null } },
    };
    const out = normalizeMatch(m);
    expect(out.stageSort).toBe(5);
    expect(out.groupLetter).toBeNull();
    expect(out.awayExternalId).toBeNull();
    expect(out.status).toBe("scheduled");
    expect(out.homeScore).toBeNull();
  });
});

describe("resolveMatchResult", () => {
  const finished2_0: MatchResultState = { status: "finished", homeScore: 2, awayScore: 0 };
  const noScore: MatchResultState = { status: "scheduled", homeScore: null, awayScore: null };

  it("usa el dato de la API si no hay resultado guardado", () => {
    expect(resolveMatchResult(undefined, finished2_0)).toEqual(finished2_0);
    expect(resolveMatchResult(noScore, finished2_0)).toEqual(finished2_0);
  });

  it("protege un resultado ya cargado cuando la API no trae marcador", () => {
    // Caso real: partido cargado a mano y la API lo reporta TIMED/sin goles.
    expect(resolveMatchResult(finished2_0, noScore)).toEqual(finished2_0);
    expect(
      resolveMatchResult(finished2_0, { status: "finished", homeScore: null, awayScore: null }),
    ).toEqual(finished2_0);
  });

  it("deja que la API corrija si trae OTRO resultado completo", () => {
    const official: MatchResultState = { status: "finished", homeScore: 3, awayScore: 1 };
    expect(resolveMatchResult(finished2_0, official)).toEqual(official);
  });

  it("no considera 'resultado' a un finished sin goles", () => {
    const finishedNull: MatchResultState = { status: "finished", homeScore: null, awayScore: null };
    expect(resolveMatchResult(finishedNull, finished2_0)).toEqual(finished2_0);
  });
});

describe("resolveTeamId", () => {
  it("usa el equipo de la API cuando hay uno", () => {
    expect(resolveTeamId(null, "team-a")).toBe("team-a");
    expect(resolveTeamId("team-a", "team-b")).toBe("team-b"); // permite corrección
  });

  it("conserva el equipo ya resuelto cuando la API lo revierte a 'por definir'", () => {
    // Caso real: la API arma el cruce de eliminatoria, lo asigna y después lo
    // vuelve a dejar null mientras recalcula el cuadro. No lo degradamos.
    expect(resolveTeamId("team-a", null)).toBe("team-a");
    expect(resolveTeamId("team-a", undefined)).toBe("team-a");
  });

  it("null si nunca hubo equipo", () => {
    expect(resolveTeamId(null, null)).toBeNull();
    expect(resolveTeamId(undefined, undefined)).toBeNull();
  });
});

describe("resolveScore", () => {
  it("partido normal: marcador = fullTime, sin penales", () => {
    expect(resolveScore({ duration: "REGULAR", fullTime: { home: 2, away: 1 } })).toEqual({
      homeScore: 2,
      awayScore: 1,
      homePenalties: null,
      awayPenalties: null,
      decidedWinner: null,
    });
  });

  it("definido en el alargue (sin penales): usa fullTime", () => {
    expect(
      resolveScore({
        duration: "EXTRA_TIME",
        fullTime: { home: 2, away: 1 },
        regularTime: { home: 1, away: 1 },
        extraTime: { home: 1, away: 0 },
      }),
    ).toEqual({
      homeScore: 2,
      awayScore: 1,
      homePenalties: null,
      awayPenalties: null,
      decidedWinner: null,
    });
  });

  it("penales: marcador real = regularTime+alargue; penales y ganador aparte", () => {
    expect(
      resolveScore({
        duration: "PENALTY_SHOOTOUT",
        fullTime: { home: 5, away: 6 },
        regularTime: { home: 1, away: 1 },
        extraTime: { home: 0, away: 0 },
      }),
    ).toEqual({
      homeScore: 1,
      awayScore: 1,
      homePenalties: 5,
      awayPenalties: 6,
      decidedWinner: "away",
    });
  });

  it("penales con goles en el alargue: suma 90'+alargue", () => {
    const r = resolveScore({
      duration: "PENALTY_SHOOTOUT",
      fullTime: { home: 8, away: 7 },
      regularTime: { home: 1, away: 1 },
      extraTime: { home: 1, away: 1 },
    });
    expect(r.homeScore).toBe(2);
    expect(r.awayScore).toBe(2);
    expect(r.decidedWinner).toBe("home");
  });
});
