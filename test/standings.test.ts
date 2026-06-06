import { describe, it, expect } from "vitest";
import { rankStandings, type StandingAggregate } from "@/lib/standings/rank";

function agg(
  userId: string,
  displayName: string,
  points: number,
  plenos = 0,
  aciertos = 0,
): StandingAggregate {
  return { userId, displayName, points, plenos, aciertos };
}

describe("rankStandings", () => {
  it("ordena por puntos descendente", () => {
    const r = rankStandings([agg("a", "Ana", 5), agg("b", "Beto", 10), agg("c", "Cami", 7)]);
    expect(r.map((x) => x.displayName)).toEqual(["Beto", "Cami", "Ana"]);
    expect(r.map((x) => x.rank)).toEqual([1, 2, 3]);
  });

  it("desempata por plenos a igualdad de puntos", () => {
    const r = rankStandings([agg("a", "Ana", 10, 1), agg("b", "Beto", 10, 3)]);
    expect(r.map((x) => x.displayName)).toEqual(["Beto", "Ana"]);
    expect(r.map((x) => x.rank)).toEqual([1, 2]);
  });

  it("asigna la misma posición a empates totales y saltea la siguiente", () => {
    const r = rankStandings([
      agg("a", "Ana", 10, 2),
      agg("b", "Beto", 10, 2),
      agg("c", "Cami", 5, 0),
    ]);
    expect(r.map((x) => x.rank)).toEqual([1, 1, 3]);
  });

  it("calcula delta vs la posición de ayer (positivo = subió)", () => {
    const posAyer = new Map([
      ["a", 1],
      ["b", 2],
    ]);
    const r = rankStandings([agg("a", "Ana", 5), agg("b", "Beto", 10)], posAyer);
    const beto = r.find((x) => x.userId === "b")!;
    const ana = r.find((x) => x.userId === "a")!;
    expect(beto.rank).toBe(1);
    expect(beto.delta).toBe(1); // de #2 a #1 => +1
    expect(ana.rank).toBe(2);
    expect(ana.delta).toBe(-1); // de #1 a #2 => -1
  });

  it("delta es null si no hay snapshot de ayer para el usuario", () => {
    const r = rankStandings([agg("a", "Ana", 5)]);
    expect(r[0]!.delta).toBeNull();
  });

  it("no muta el array de entrada", () => {
    const input = [agg("a", "Ana", 5), agg("b", "Beto", 10)];
    const copy = [...input];
    rankStandings(input);
    expect(input).toEqual(copy);
  });
});
