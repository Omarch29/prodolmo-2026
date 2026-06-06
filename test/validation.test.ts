import { describe, it, expect } from "vitest";
import { loginSchema } from "@/lib/validation/auth";
import { savePredictionSchema } from "@/lib/validation/prediction";

const UUID = "123e4567-e89b-42d3-a456-426614174000";

describe("loginSchema", () => {
  it("acepta email + password válidos", () => {
    expect(loginSchema.safeParse({ email: "omar@prode.local", password: "prode2026" }).success).toBe(true);
  });
  it("rechaza email inválido", () => {
    expect(loginSchema.safeParse({ email: "no-es-email", password: "prode2026" }).success).toBe(false);
  });
  it("rechaza contraseña corta", () => {
    expect(loginSchema.safeParse({ email: "omar@prode.local", password: "123" }).success).toBe(false);
  });
});

describe("savePredictionSchema", () => {
  it("coacciona marcadores string (FormData) a number", () => {
    const r = savePredictionSchema.safeParse({ matchId: UUID, predHome: "2", predAway: "1", winnerTeamId: "" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.predHome).toBe(2);
      expect(r.data.predAway).toBe(1);
      expect(r.data.winnerTeamId).toBeUndefined(); // "" -> undefined
    }
  });

  it("acepta winnerTeamId uuid válido", () => {
    const r = savePredictionSchema.safeParse({ matchId: UUID, predHome: "1", predAway: "1", winnerTeamId: UUID });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.winnerTeamId).toBe(UUID);
  });

  it("rechaza marcador negativo o fuera de rango", () => {
    expect(savePredictionSchema.safeParse({ matchId: UUID, predHome: "-1", predAway: "0" }).success).toBe(false);
    expect(savePredictionSchema.safeParse({ matchId: UUID, predHome: "99", predAway: "0" }).success).toBe(false);
  });

  it("rechaza matchId que no es uuid", () => {
    expect(savePredictionSchema.safeParse({ matchId: "abc", predHome: "1", predAway: "0" }).success).toBe(false);
  });

  it("rechaza winnerTeamId que no es uuid", () => {
    expect(savePredictionSchema.safeParse({ matchId: UUID, predHome: "1", predAway: "1", winnerTeamId: "nope" }).success).toBe(false);
  });
});
