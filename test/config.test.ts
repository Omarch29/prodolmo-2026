import { describe, it, expect } from "vitest";
import {
  isPredictionEditable,
  arePredictionsVisible,
  othersPicksVisible,
  PREDICTION_LOCK_HOURS,
} from "@/lib/config";

const kickoff = new Date("2026-06-10T20:00:00Z");

describe("regla de cierre/visibilidad de pronósticos", () => {
  it("el lock es de 1 hora", () => {
    expect(PREDICTION_LOCK_HOURS).toBe(1);
  });

  it("editable bastante antes del kickoff", () => {
    const now = new Date("2026-06-10T18:00:00Z"); // 2h antes
    expect(isPredictionEditable(kickoff, now)).toBe(true);
    expect(arePredictionsVisible(kickoff, now)).toBe(false);
  });

  it("se cierra y se vuelve visible dentro de la última hora", () => {
    const now = new Date("2026-06-10T19:30:00Z"); // 30 min antes
    expect(isPredictionEditable(kickoff, now)).toBe(false);
    expect(arePredictionsVisible(kickoff, now)).toBe(true);
  });

  it("justo en el borde (kickoff - 1h) ya está cerrado", () => {
    const now = new Date("2026-06-10T19:00:00Z");
    expect(isPredictionEditable(kickoff, now)).toBe(false);
    expect(arePredictionsVisible(kickoff, now)).toBe(true);
  });

  it("después del kickoff sigue cerrado y visible", () => {
    const now = new Date("2026-06-10T21:00:00Z");
    expect(isPredictionEditable(kickoff, now)).toBe(false);
    expect(arePredictionsVisible(kickoff, now)).toBe(true);
  });

  it("editable y visibilidad son complementarios", () => {
    for (const t of ["18:00:00", "19:00:00", "19:30:00", "21:00:00"]) {
      const now = new Date(`2026-06-10T${t}Z`);
      expect(isPredictionEditable(kickoff, now)).toBe(!arePredictionsVisible(kickoff, now));
    }
  });
});

describe("visibilidad de pronósticos ajenos por etapa", () => {
  const lejos = new Date("2026-06-10T18:00:00Z"); // 2h antes (no bloqueado)
  const cerca = new Date("2026-06-10T19:30:00Z"); // 30m antes (bloqueado)

  it("grupos (1) y ronda de 32 (2) se ven siempre, aún sin bloquear", () => {
    expect(othersPicksVisible(1, kickoff, lejos)).toBe(true);
    expect(othersPicksVisible(2, kickoff, lejos)).toBe(true);
  });

  it("octavos (3) en adelante: ocultos hasta el cierre", () => {
    expect(othersPicksVisible(3, kickoff, lejos)).toBe(false);
    expect(othersPicksVisible(6, kickoff, lejos)).toBe(false);
    expect(othersPicksVisible(3, kickoff, cerca)).toBe(true);
    expect(othersPicksVisible(6, kickoff, cerca)).toBe(true);
  });
});
