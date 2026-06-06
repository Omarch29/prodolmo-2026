/**
 * Crea los usuarios del grupo (lista cerrada) usando la service-role key.
 * El perfil se autocrea por trigger (handle_new_user) a partir del user_metadata.
 *
 * Uso:  npm run seed:users
 * Requiere: supabase local corriendo + .env.local con SUPABASE_SERVICE_ROLE_KEY.
 *
 * Editá la lista USERS para tu grupo. La contraseña por defecto sale de
 * SEED_DEFAULT_PASSWORD (.env.local). Idempotente: si el email ya existe, lo saltea.
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../lib/database.types";

config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const password = process.env.SEED_DEFAULT_PASSWORD ?? "prode2026";

if (!url || !serviceKey) {
  throw new Error(
    "Faltan NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY en .env.local",
  );
}

type SeedUser = {
  username: string;
  display_name: string;
  email: string;
  es_bot?: boolean;
};

// --- Editá esta lista con tu grupo (15-20 personas) ---
const USERS: SeedUser[] = [
  { username: "omar", display_name: "Omar", email: "omar@prode.local" },
  { username: "juli", display_name: "Julián", email: "juli@prode.local" },
  { username: "sofi", display_name: "Sofi", email: "sofi@prode.local" },
  { username: "carlos", display_name: "Carlos", email: "carlos@prode.local" },
  { username: "mati", display_name: "Mati", email: "mati@prode.local" },
  { username: "lucia", display_name: "Lucía", email: "lucia@prode.local" },
];

async function main() {
  const admin = createClient<Database>(url!, serviceKey!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Emails ya existentes (para idempotencia).
  const { data: existing, error: listErr } = await admin.auth.admin.listUsers({
    perPage: 1000,
  });
  if (listErr) throw listErr;
  const existingEmails = new Set(existing.users.map((u) => u.email?.toLowerCase()));

  for (const u of USERS) {
    if (existingEmails.has(u.email.toLowerCase())) {
      console.log(`⏭  ${u.email} ya existe, salteado`);
      continue;
    }
    const { error } = await admin.auth.admin.createUser({
      email: u.email,
      password,
      email_confirm: true,
      user_metadata: {
        username: u.username,
        display_name: u.display_name,
        es_bot: u.es_bot ?? false,
      },
    });
    if (error) {
      console.error(`❌ ${u.email}: ${error.message}`);
    } else {
      console.log(`✅ ${u.email} creado (pass: ${password})`);
    }
  }

  console.log("\nListo. Probá el login con cualquiera de los emails de arriba.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
