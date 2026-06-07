/**
 * Sincroniza selecciones y fixture/resultados desde football-data.org a la BD.
 * Uso:  npm run sync:fixtures   (requiere FOOTBALL_DATA_TOKEN en .env.local)
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../lib/database.types";
import { createFootballDataClient } from "../lib/integrations/football-data/client-core";
import { syncFixtures } from "../lib/jobs/sync-fixtures";

config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const token = process.env.FOOTBALL_DATA_TOKEN;
if (!url || !serviceKey) throw new Error("Faltan envs de Supabase en .env.local");
if (!token) throw new Error("Falta FOOTBALL_DATA_TOKEN en .env.local");

async function main() {
  const sb = createClient<Database>(url!, serviceKey!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const res = await syncFixtures(sb, createFootballDataClient(token!));
  console.log("Sync OK:", res);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
