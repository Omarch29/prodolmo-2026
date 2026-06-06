import { z } from "zod";

/**
 * Validación de variables de entorno con Zod.
 *
 * - `env`: variables públicas (NEXT_PUBLIC_*). Se inlinean en el bundle y
 *   pueden usarse tanto en cliente como en servidor.
 * - `serverEnv()`: variables sensibles, solo accesibles en el servidor.
 *   Se validan de forma perezosa para no filtrarlas al bundle del cliente.
 */

const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

export const env = publicSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});

// Para variables opcionales: tratar "" (común en .env) como ausente.
const optionalSecret = z.preprocess(
  (v) => (v === "" || v == null ? undefined : v),
  z.string().min(1).optional(),
);

const serverSchema = z.object({
  // Clave service-role: NUNCA exponer al cliente. Se usa en scripts/admin.
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  // Gemini: opcional por ahora (las features de IA no están implementadas).
  GEMINI_API_KEY: optionalSecret,
  // Secreto para autorizar el cron del job de mensajes diarios.
  CRON_SECRET: optionalSecret,
});

type ServerEnv = z.infer<typeof serverSchema>;
let cachedServerEnv: ServerEnv | null = null;

export function serverEnv(): ServerEnv {
  if (typeof window !== "undefined") {
    throw new Error("serverEnv() solo puede usarse en el servidor.");
  }
  if (!cachedServerEnv) {
    cachedServerEnv = serverSchema.parse({
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    });
  }
  return cachedServerEnv;
}
