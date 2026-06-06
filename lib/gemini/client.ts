import "server-only";
import { GoogleGenAI } from "@google/genai";
import { serverEnv } from "@/lib/env";

/**
 * Wrapper de Gemini (Flash) para las features de IA de texto.
 *
 * Lo usan (en el cron, precomputado): los mensajes diarios con onda
 * (lib/gemini/messages.ts) y las previas de partido (lib/gemini/preview.ts).
 * La IA solo redacta sobre hechos ya calculados; nunca inventa datos.
 *
 * `server-only` impide importar esto desde el cliente (la API key es secreta).
 */

/** Modelo por defecto: Gemini Flash (rápido y barato para texto). */
export const GEMINI_MODEL = "gemini-flash-latest";

let client: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  const { GEMINI_API_KEY } = serverEnv();
  if (!GEMINI_API_KEY) {
    throw new Error(
      "GEMINI_API_KEY no está configurada. Completá .env.local para usar las features de IA.",
    );
  }
  if (!client) {
    client = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  }
  return client;
}
