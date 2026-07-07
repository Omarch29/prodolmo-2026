import { describe, it, expect } from "vitest";
import { pickWinners, type RankedStanding } from "@/lib/standings/rank";

function row(partial: Partial<RankedStanding> & { userId: string }): RankedStanding {
  return {
    displayName: partial.userId,
    avatarUrl: null,
    esBot: false,
    points: 0,
    plenos: 0,
    aciertos: 0,
    rank: 1,
    delta: null,
    ...partial,
  };
}

describe("pickWinners", () => {
  it("devuelve el único primero", () => {
    const rows = [row({ userId: "a", rank: 1 }), row({ userId: "b", rank: 2 })];
    expect(pickWinners(rows).map((w) => w.userId)).toEqual(["a"]);
  });
  it("co-campeones: todos los de rank 1", () => {
    const rows = [row({ userId: "a", rank: 1 }), row({ userId: "b", rank: 1 }), row({ userId: "c", rank: 3 })];
    expect(pickWinners(rows).map((w) => w.userId)).toEqual(["a", "b"]);
  });
  it("excluye bots aunque estén primeros", () => {
    const rows = [row({ userId: "bot", rank: 1, esBot: true }), row({ userId: "a", rank: 2 })];
    expect(pickWinners(rows).map((w) => w.userId)).toEqual(["a"]);
  });
  it("lista vacía => []", () => {
    expect(pickWinners([])).toEqual([]);
  });
});
