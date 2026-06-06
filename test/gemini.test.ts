import { describe, it, expect } from "vitest";
import { buildMessagesPrompt, parseRewrites } from "@/lib/gemini/messages-prompt";
import { buildPreviewPrompt } from "@/lib/gemini/preview-prompt";

const originals = [{ body: "Estás a 5 puntos del líder." }, { body: "Estás último." }];

describe("parseRewrites", () => {
  it("usa los textos reescritos cuando el JSON es válido y del mismo largo", () => {
    const out = parseRewrites('["A", "B"]', originals);
    expect(out).toEqual(["A", "B"]);
  });

  it("tolera fences ```json del modelo", () => {
    const out = parseRewrites('```json\n["A","B"]\n```', originals);
    expect(out).toEqual(["A", "B"]);
  });

  it("cae a las plantillas si el JSON es inválido", () => {
    expect(parseRewrites("no soy json", originals)).toEqual(originals.map((o) => o.body));
  });

  it("cae a las plantillas si la cantidad no coincide", () => {
    expect(parseRewrites('["solo uno"]', originals)).toEqual(originals.map((o) => o.body));
  });

  it("por elemento, cae al original si viene vacío o no es string", () => {
    const out = parseRewrites('["", 123]', originals);
    expect(out).toEqual(originals.map((o) => o.body));
  });

  it("trimea los textos reescritos", () => {
    expect(parseRewrites('["  hola  ", "B"]', originals)).toEqual(["hola", "B"]);
  });
});

describe("buildMessagesPrompt", () => {
  it("incluye los textos a reescribir", () => {
    const p = buildMessagesPrompt([{ type: "gap_to_leader", body: "Estás a 5 puntos.", displayName: "Omar" }]);
    expect(p).toContain("Estás a 5 puntos.");
    expect(p).toContain("Omar");
    expect(p.toLowerCase()).toContain("json");
  });
});

describe("buildPreviewPrompt", () => {
  it("incluye equipos e instancia con grupo", () => {
    const p = buildPreviewPrompt({ home: "Argentina", away: "Brasil", stage: "Fase de grupos", group: "C" });
    expect(p).toContain("Argentina");
    expect(p).toContain("Brasil");
    expect(p).toContain("Grupo C");
  });

  it("omite el grupo en eliminación (group null)", () => {
    const p = buildPreviewPrompt({ home: "Argentina", away: "Francia", stage: "Cuartos", group: null });
    expect(p).toContain("Cuartos");
    expect(p).not.toContain("Grupo");
  });
});
