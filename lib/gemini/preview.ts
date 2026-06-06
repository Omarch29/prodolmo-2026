import "server-only";
import { getGeminiClient, GEMINI_MODEL } from "./client";
import { buildPreviewPrompt, type PreviewInput } from "./preview-prompt";

/** Genera la previa de un partido con Gemini. Devuelve "" si no hay texto. */
export async function generatePreview(input: PreviewInput): Promise<string> {
  const ai = getGeminiClient();
  const res = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: buildPreviewPrompt(input),
    config: { temperature: 0.9 },
  });
  return (res.text ?? "").trim();
}
