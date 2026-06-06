/**
 * Corre el job de mensajes diarios contra la BD local (service-role).
 * Uso: npm run job:daily
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../lib/database.types";
import { runDailyMessages } from "../lib/jobs/daily-messages";

config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY en .env.local");
}

async function main() {
  const sb = createClient<Database>(url!, serviceKey!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const result = await runDailyMessages(sb);
  console.log("Job OK:", result);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
