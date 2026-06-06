import { describe, it, expect } from "vitest";
import { participantsOf, winnerOf, championOf } from "@/lib/sim/bracket";
import type { BracketSlot } from "@/lib/queries/sim";

// Cuadro demo (igual al seed): QF-1..4 -> SF-1/2 -> FINAL.
function qf(
  slot: string,
  feedsSlot: string,
  feedsSide: "home" | "away",
  home: string,
  away: string,
): BracketSlot {
  return { slot, stageName: "Cuartos", sortOrder: 0, feedsSlot, feedsSide, homeTeamId: home, awayTeamId: away };
}
function inner(slot: string, feedsSlot: string | null, feedsSide: "home" | "away" | null): BracketSlot {
  return { slot, stageName: "x", sortOrder: 0, feedsSlot, feedsSide, homeTeamId: null, awayTeamId: null };
}

const slots: BracketSlot[] = [
  qf("QF-1", "SF-1", "home", "ARG", "FRA"),
  qf("QF-2", "SF-1", "away", "BRA", "ESP"),
  qf("QF-3", "SF-2", "home", "ENG", "POR"),
  qf("QF-4", "SF-2", "away", "GER", "URU"),
  inner("SF-1", "FINAL", "home"),
  inner("SF-2", "FINAL", "away"),
  inner("FINAL", null, null),
];
const get = (s: string) => slots.find((x) => x.slot === s)!;

describe("bracket", () => {
  it("la primera ronda tiene equipos fijos", () => {
    expect(participantsOf(get("QF-1"), slots, {})).toEqual(["ARG", "FRA"]);
  });

  it("los slots posteriores empiezan sin participantes", () => {
    expect(participantsOf(get("SF-1"), slots, {})).toEqual([null, null]);
    expect(championOf(slots, {})).toBeNull();
  });

  it("propaga los ganadores hacia arriba", () => {
    const picks = { "QF-1": "ARG", "QF-2": "BRA" };
    expect(participantsOf(get("SF-1"), slots, picks)).toEqual(["ARG", "BRA"]);
  });

  it("deriva el campeón con el cuadro completo", () => {
    const picks: Record<string, string> = {
      "QF-1": "ARG",
      "QF-2": "BRA",
      "QF-3": "ENG",
      "QF-4": "GER",
      "SF-1": "ARG",
      "SF-2": "ENG",
      FINAL: "ARG",
    };
    expect(championOf(slots, picks)).toBe("ARG");
  });

  it("ignora un pick que ya no es participante (ronda previa cambiada)", () => {
    // SF-1 elegido ARG, pero luego QF-1 pasa a FRA => ARG ya no juega la semi
    const picks: Record<string, string> = { "QF-1": "FRA", "QF-2": "BRA", "SF-1": "ARG" };
    expect(participantsOf(get("SF-1"), slots, picks)).toEqual(["FRA", "BRA"]);
    expect(winnerOf(get("SF-1"), slots, picks)).toBeNull();
    expect(championOf(slots, picks)).toBeNull();
  });

  it("un pick para un slot sin participantes definidos no cuenta", () => {
    // FINAL elegido sin haber resuelto las semis
    expect(winnerOf(get("FINAL"), slots, { FINAL: "ARG" })).toBeNull();
  });
});
