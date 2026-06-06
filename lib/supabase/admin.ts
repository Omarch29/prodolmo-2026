import "server-only";
import { createClient } from "@supabase/supabase-js";
import { env, serverEnv } from "@/lib/env";
import type { Database } from "@/lib/database.types";

/**
 * Cliente con service-role: bypassa RLS. SOLO para servidor/jobs/admin
 * (ej. el job de mensajes diarios que lee a todos y escribe daily_messages).
 * Nunca usarlo para servir requests de usuarios.
 */
export function createAdminClient() {
  return createClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    serverEnv().SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
