import type { BracketSlot } from "@/lib/queries/sim";

/**
 * Lógica pura del cuadro de eliminación (sin React ni DB), para poder testearla.
 * Un slot tiene equipos fijos (primera ronda) o se llena con los ganadores de
 * los slots que lo alimentan (feeds_slot / feeds_side).
 */

/** Los dos equipos que disputan un slot (null si aún no están definidos). */
export function participantsOf(
  slot: BracketSlot,
  slots: BracketSlot[],
  picks: Record<string, string>,
): [string | null, string | null] {
  if (slot.homeTeamId || slot.awayTeamId) return [slot.homeTeamId, slot.awayTeamId];
  const homeFeeder = slots.find((s) => s.feedsSlot === slot.slot && s.feedsSide === "home");
  const awayFeeder = slots.find((s) => s.feedsSlot === slot.slot && s.feedsSide === "away");
  return [
    homeFeeder ? winnerOf(homeFeeder, slots, picks) : null,
    awayFeeder ? winnerOf(awayFeeder, slots, picks) : null,
  ];
}

/**
 * Ganador elegido de un slot. Un pick solo es válido si el equipo elegido es
 * uno de los participantes actuales (si una ronda previa cambió, el pick
 * desactualizado se ignora).
 */
export function winnerOf(
  slot: BracketSlot,
  slots: BracketSlot[],
  picks: Record<string, string>,
): string | null {
  const [home, away] = participantsOf(slot, slots, picks);
  const pick = picks[slot.slot];
  return pick && (pick === home || pick === away) ? pick : null;
}

/** Campeón = ganador del slot final. */
export function championOf(
  slots: BracketSlot[],
  picks: Record<string, string>,
  finalSlot = "FINAL",
): string | null {
  const final = slots.find((s) => s.slot === finalSlot);
  return final ? winnerOf(final, slots, picks) : null;
}
