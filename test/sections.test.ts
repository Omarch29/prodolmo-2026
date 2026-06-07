import { describe, it, expect } from "vitest";
import { sectionOf, sectionsFrom, defaultSectionKey } from "@/lib/cargar/sections";
import type { CargarMatch } from "@/lib/queries/cargar";

function m(partial: Partial<CargarMatch>): CargarMatch {
  return {
    id: Math.random().toString(),
    kickoffAt: "2026-06-11T19:00:00Z",
    status: "scheduled",
    isKnockout: false,
    stageName: "Fase de grupos",
    matchday: 1,
    home: { name: "A", code: "A", flag: null },
    away: { name: "B", code: "B", flag: null },
    myPred: null,
    ...partial,
  };
}

describe("sectionOf", () => {
  it("parte los grupos por fecha", () => {
    expect(sectionOf({ stageName: "Fase de grupos", matchday: 2 })).toMatchObject({ key: "g2", label: "Grupos F2", isGroup: true });
  });
  it("etiqueta las eliminatorias", () => {
    expect(sectionOf({ stageName: "Ronda de 32", matchday: null })).toMatchObject({ key: "Ronda de 32", label: "16avos", isGroup: false });
    expect(sectionOf({ stageName: "Final y 3.º puesto", matchday: null }).label).toBe("Final/3º");
  });
});

describe("sectionsFrom", () => {
  it("lista secciones únicas y ordenadas", () => {
    const matches = [
      m({ stageName: "Cuartos", matchday: null }),
      m({ stageName: "Fase de grupos", matchday: 3 }),
      m({ stageName: "Fase de grupos", matchday: 1 }),
      m({ stageName: "Fase de grupos", matchday: 1 }),
    ];
    expect(sectionsFrom(matches).map((s) => s.key)).toEqual(["g1", "g3", "Cuartos"]);
  });
});

describe("defaultSectionKey", () => {
  const now = Date.parse("2026-06-12T00:00:00Z");
  it("elige la sección del próximo partido a jugarse", () => {
    const matches = [
      m({ stageName: "Fase de grupos", matchday: 1, status: "finished", kickoffAt: "2026-06-11T19:00:00Z" }),
      m({ stageName: "Fase de grupos", matchday: 2, status: "scheduled", kickoffAt: "2026-06-13T19:00:00Z" }),
      m({ stageName: "Cuartos", matchday: null, status: "scheduled", kickoffAt: "2026-07-01T19:00:00Z" }),
    ];
    expect(defaultSectionKey(matches, now)).toBe("g2");
  });
  it("cae a la primera sección si no hay próximos", () => {
    const matches = [m({ stageName: "Fase de grupos", matchday: 1, status: "finished", kickoffAt: "2026-06-11T19:00:00Z" })];
    expect(defaultSectionKey(matches, now)).toBe("g1");
  });
});
