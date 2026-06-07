/**
 * Cuadro de eliminación del Mundial 2026 (formato 48 selecciones) — lógica pura.
 *
 * 12 grupos (A–L): clasifican 1° y 2° de cada grupo + los 8 mejores terceros = 32.
 * Cuadro de 16avos → octavos → cuartos → semis → final, en dos mitades.
 *
 * Sembrado de terceros: REGLA DETERMINÍSTICA (no la tabla oficial de FIFA).
 * Los grupos de los 8 terceros elegidos se ordenan alfabéticamente y se asignan
 * a los slots de tercero (T0..T7). Aislado en `thirdSeeding()` para poder
 * reemplazarlo por la tabla oficial sin tocar el resto.
 */

export const GROUPS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"] as const;
export type GroupLetter = (typeof GROUPS)[number];

export type Round = "R32" | "R16" | "QF" | "SF" | "F";

export type SlotSpec =
  | { kind: "winner"; group: GroupLetter }
  | { kind: "runnerup"; group: GroupLetter }
  | { kind: "third"; index: number } // 0..7, según thirdSeeding
  | { kind: "matchWinner"; matchId: string };

export type KoMatch = { id: string; round: Round; a: SlotSpec; b: SlotSpec };

const W = (group: GroupLetter): SlotSpec => ({ kind: "winner", group });
const R = (group: GroupLetter): SlotSpec => ({ kind: "runnerup", group });
const T = (index: number): SlotSpec => ({ kind: "third", index });
const MW = (matchId: string): SlotSpec => ({ kind: "matchWinner", matchId });

// 16avos: cada token (1A..1L, 2A..2L, T0..T7) aparece exactamente una vez.
const R32_PAIRS: [SlotSpec, SlotSpec][] = [
  [W("A"), T(0)],
  [W("B"), T(1)],
  [W("C"), T(2)],
  [W("D"), T(3)],
  [W("E"), T(4)],
  [W("F"), T(5)],
  [W("G"), T(6)],
  [W("H"), T(7)],
  [W("I"), R("A")],
  [W("J"), R("B")],
  [W("K"), R("C")],
  [W("L"), R("D")],
  [R("E"), R("F")],
  [R("G"), R("H")],
  [R("I"), R("J")],
  [R("K"), R("L")],
];

function buildBracket(): KoMatch[] {
  const matches: KoMatch[] = [];
  R32_PAIRS.forEach((pair, i) => matches.push({ id: `R32-${i + 1}`, round: "R32", a: pair[0], b: pair[1] }));
  const chain = (round: Round, count: number, prev: Round) => {
    for (let k = 1; k <= count; k++) {
      matches.push({ id: `${round}-${k}`, round, a: MW(`${prev}-${2 * k - 1}`), b: MW(`${prev}-${2 * k}`) });
    }
  };
  chain("R16", 8, "R32");
  chain("QF", 4, "R16");
  chain("SF", 2, "QF");
  matches.push({ id: "F", round: "F", a: MW("SF-1"), b: MW("SF-2") });
  return matches;
}

export const KO_MATCHES: KoMatch[] = buildBracket();
const BY_ID = new Map(KO_MATCHES.map((m) => [m.id, m]));

// ---- Estado de la simulación (lo que el usuario eligió) ----
export type SimState = {
  /** Orden por grupo: array de teamIds [1°, 2°]. */
  groupOrder: Partial<Record<GroupLetter, string[]>>;
  /** Terceros que clasifican: grupo -> teamId elegido (deben ser 8). */
  thirds: Partial<Record<GroupLetter, string>>;
  /** Ganador elegido por partido de eliminación: matchId -> teamId. */
  ko: Record<string, string>;
};

export const emptyState = (): SimState => ({ groupOrder: {}, thirds: {}, ko: {} });

/** Orden determinístico de los grupos de los terceros clasificados (T0..T7). */
export function thirdSeeding(groups: GroupLetter[]): GroupLetter[] {
  return [...groups].sort();
}

/** Equipo que ocupa un slot, o null si aún no está definido. */
export function resolveSlot(spec: SlotSpec, state: SimState): string | null {
  switch (spec.kind) {
    case "winner":
      return state.groupOrder[spec.group]?.[0] ?? null;
    case "runnerup":
      return state.groupOrder[spec.group]?.[1] ?? null;
    case "third": {
      const groups = thirdSeeding(Object.keys(state.thirds) as GroupLetter[]);
      const g = groups[spec.index];
      return g ? state.thirds[g] ?? null : null;
    }
    case "matchWinner":
      return winnerOfMatch(spec.matchId, state);
  }
}

/** Los dos equipos de un partido (pueden ser null si faltan rondas previas). */
export function participantsOf(matchId: string, state: SimState): [string | null, string | null] {
  const m = BY_ID.get(matchId);
  if (!m) return [null, null];
  return [resolveSlot(m.a, state), resolveSlot(m.b, state)];
}

/** Ganador elegido de un partido; el pick solo vale si sigue siendo participante. */
export function winnerOfMatch(matchId: string, state: SimState): string | null {
  const [a, b] = participantsOf(matchId, state);
  const pick = state.ko[matchId];
  return pick && (pick === a || pick === b) ? pick : null;
}

export function champion(state: SimState): string | null {
  return winnerOfMatch("F", state);
}

export const matchesByRound = (round: Round): KoMatch[] => KO_MATCHES.filter((m) => m.round === round);
