import { describe, it, expect } from "vitest";
import {
  KO_MATCHES,
  GROUPS,
  thirdSeeding,
  resolveSlot,
  participantsOf,
  winnerOfMatch,
  champion,
  emptyState,
  type SimState,
} from "@/lib/sim/wc2026";

describe("estructura del cuadro", () => {
  it("tiene 31 partidos (16+8+4+2+1)", () => {
    expect(KO_MATCHES).toHaveLength(31);
    expect(KO_MATCHES.filter((m) => m.round === "R32")).toHaveLength(16);
    expect(KO_MATCHES.filter((m) => m.round === "F")).toHaveLength(1);
  });

  it("cada token (1X, 2X, T0..7) aparece una sola vez en 16avos", () => {
    const tokens: string[] = [];
    for (const m of KO_MATCHES.filter((x) => x.round === "R32")) {
      for (const s of [m.a, m.b]) {
        if (s.kind === "winner") tokens.push(`1${s.group}`);
        else if (s.kind === "runnerup") tokens.push(`2${s.group}`);
        else if (s.kind === "third") tokens.push(`T${s.index}`);
      }
    }
    expect(tokens).toHaveLength(32);
    expect(new Set(tokens).size).toBe(32);
    // 12 ganadores + 12 segundos + 8 terceros
    expect(GROUPS.every((g) => tokens.includes(`1${g}`) && tokens.includes(`2${g}`))).toBe(true);
  });
});

describe("thirdSeeding", () => {
  it("ordena alfabéticamente los grupos de terceros", () => {
    expect(thirdSeeding(["F", "A", "C"])).toEqual(["A", "C", "F"]);
  });
});

describe("terceros como grupo->equipo", () => {
  it("third index usa el orden alfabético de los grupos elegidos", () => {
    const s = emptyState();
    s.thirds = { C: "C3", A: "A3", F: "F3" };
    expect(resolveSlot({ kind: "third", index: 0 }, s)).toBe("A3");
    expect(resolveSlot({ kind: "third", index: 1 }, s)).toBe("C3");
    expect(resolveSlot({ kind: "third", index: 2 }, s)).toBe("F3");
    expect(resolveSlot({ kind: "third", index: 3 }, s)).toBeNull();
  });
});

// Estado de ejemplo: todos los grupos ordenados con ids "g{letra}{pos}"
function fullState(): SimState {
  const s = emptyState();
  for (const g of GROUPS) s.groupOrder[g] = [`${g}1`, `${g}2`];
  // 8 terceros (grupo -> equipo)
  for (const g of ["A", "B", "C", "D", "E", "F", "G", "H"] as const) s.thirds[g] = `${g}3`;
  return s;
}

describe("resolución de slots", () => {
  it("winner/runnerup leen 1° y 2° del grupo", () => {
    const s = fullState();
    expect(resolveSlot({ kind: "winner", group: "A" }, s)).toBe("A1");
    expect(resolveSlot({ kind: "runnerup", group: "B" }, s)).toBe("B2");
  });

  it("third usa el seeding (index 0 = primer grupo alfabético)", () => {
    const s = fullState();
    expect(resolveSlot({ kind: "third", index: 0 }, s)).toBe("A3"); // A es el primero
    expect(resolveSlot({ kind: "third", index: 7 }, s)).toBe("H3");
  });

  it("slot sin datos devuelve null", () => {
    expect(resolveSlot({ kind: "winner", group: "A" }, emptyState())).toBeNull();
  });
});

describe("propagación y campeón", () => {
  it("sin picks no hay campeón", () => {
    expect(champion(fullState())).toBeNull();
  });

  it("eligiendo siempre el equipo 'a' se propaga hasta el campeón", () => {
    const s = fullState();
    // Elegir el primer participante de cada partido, ronda por ronda.
    for (const round of ["R32", "R16", "QF", "SF", "F"] as const) {
      for (const m of KO_MATCHES.filter((x) => x.round === round)) {
        const [a] = participantsOf(m.id, s);
        if (a) s.ko[m.id] = a;
      }
    }
    expect(champion(s)).not.toBeNull();
    // el campeón sale del slot 'a' de la final, que viene de SF-1 -> ... -> R32-1 (1A)
    expect(champion(s)).toBe("A1");
  });

  it("ignora un pick que dejó de ser participante", () => {
    const s = fullState();
    s.ko["R32-1"] = "B1"; // B1 no juega R32-1 (es 1A vs 3er)
    expect(winnerOfMatch("R32-1", s)).toBeNull();
  });
});
