/** Lógica pura para la previa de partido (construcción del prompt). Testeable. */

export type PreviewInput = {
  home: string;
  away: string;
  stage: string;
  group: string | null;
};

export function buildPreviewPrompt(input: PreviewInput): string {
  const contexto = input.group ? `${input.stage} · Grupo ${input.group}` : input.stage;
  return `Sos el comentarista de un grupo de amigos del PRODE del Mundial.
Escribí una previa BREVE (1-2 frases, máx ~160 caracteres) del partido, con tono
rioplatense y entusiasta, para motivar a cargar el pronóstico. No inventes datos,
estadísticas ni resultados: solo el cruce y la instancia. Máximo 1 emoji.

Partido: ${input.home} vs ${input.away}
Instancia: ${contexto}

Devolvé SOLO el texto de la previa, sin comillas.`;
}
