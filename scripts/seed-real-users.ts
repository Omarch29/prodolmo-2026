/**
 * Reemplaza TODOS los usuarios por la lista de scripts/usuarios.json
 * (gitignored: tiene emails/contraseñas reales). DESTRUCTIVO: borra los usuarios
 * actuales y sus datos (pronósticos, comentarios, simulaciones — en cascada).
 *
 * Local:  npm run seed:real
 * Nube:   NEXT_PUBLIC_SUPABASE_URL="https://<ref>.supabase.co" \
 *         SUPABASE_SERVICE_ROLE_KEY="<service_role>" npm run seed:real
 *
 * Al terminar genera credenciales.csv (gitignored) con email + contraseña.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../lib/database.types";

config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");

type User = { email: string; displayName: string; username: string; password: string };
const users: User[] = JSON.parse(readFileSync("scripts/usuarios.json", "utf8"));

const admin = createClient<Database>(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  // 1) Borrar todos los usuarios actuales (cascada -> profiles y datos).
  const { data: existing, error: listErr } = await admin.auth.admin.listUsers({ perPage: 1000 });
  if (listErr) throw listErr;
  for (const u of existing.users) {
    const { error } = await admin.auth.admin.deleteUser(u.id);
    console.log(error ? `❌ borrar ${u.email}: ${error.message}` : `🗑  borrado ${u.email}`);
  }

  // 2) Crear los nuevos.
  for (const u of users) {
    const { error } = await admin.auth.admin.createUser({
      email: u.email.toLowerCase(),
      password: u.password,
      email_confirm: true,
      user_metadata: { username: u.username, display_name: u.displayName },
    });
    console.log(error ? `❌ ${u.email}: ${error.message}` : `✅ ${u.email} (${u.displayName})`);
  }

  // 3) Archivo de credenciales para repartir.
  const csv =
    "nombre,email,password\n" +
    users
      .map((u) => `"${u.displayName.replace(/"/g, '""')}",${u.email.toLowerCase()},${u.password}`)
      .join("\n") +
    "\n";
  writeFileSync("credenciales.csv", csv);
  console.log(`\n📄 credenciales.csv generado (${users.length} usuarios).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
