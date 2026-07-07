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
