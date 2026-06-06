import "server-only";
import { getGeminiClient, GEMINI_MODEL } from "./client";
import { buildMessagesPrompt, parseRewrites, type RewriteItem } from "./messages-prompt";

/**
 * Reescribe los mensajes diarios con Gemini (un solo request en batch).
 * Ante cualquier problema, parseRewrites devuelve los textos originales.
 */
export async function rewriteMessages(items: RewriteItem[]): Promise<string[]> {
  if (items.length === 0) return [];
  const ai = getGeminiClient();
  const res = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: buildMessagesPrompt(items),
    config: { responseMimeType: "application/json", temperature: 0.9 },
  });
  return parseRewrites(res.text ?? "", items);
}
