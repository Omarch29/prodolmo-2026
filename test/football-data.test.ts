import { describe, it, expect } from "vitest";
import {
  mapStatus,
  mapStageSortOrder,
  mapGroupLetter,
  normalizeTeam,
  normalizeMatch,
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
      referees: [],
    });
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
