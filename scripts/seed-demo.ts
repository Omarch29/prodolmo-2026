/**
 * Carga datos de DEMO para testear la app con las pantallas "vivas":
 * resultados ya jugados (con puntos), pronósticos de varios usuarios, un
 * partido próximo sin cargar, snapshot de ayer (para deltas) y mensajes del día.
 *
 * Uso:  npm run seed:demo   (requiere usuarios sembrados: npm run seed:users)
 * Repetible. Para volver a cero: npm run db:reset && npm run seed:users
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../lib/database.types";
import { runDailyMessages } from "../lib/jobs/daily-messages";

config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) throw new Error("Faltan envs de Supabase en .env.local");

const sb = createClient<Database>(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const days = (n: number) => new Date(Date.now() + n * 86_400_000).toISOString();
const hours = (n: number) => new Date(Date.now() + n * 3_600_000).toISOString();

type Pred = { user: string; h: number; a: number };

async function main() {
  // ids por username y por código de equipo (home del partido)
  const { data: profiles } = await sb.from("profiles").select("id, username");
  const idByUser = new Map((profiles ?? []).map((p) => [p.username ?? "", p.id]));

  const { data: matches } = await sb
    .from("matches")
    .select("id, home_team:teams!matches_home_team_id_fkey(code)");
  const idByHome = new Map((matches ?? []).map((m) => [m.home_team?.code ?? "", m.id]));

  const uid = (u: string) => idByUser.get(u)!;
  const mid = (code: string) => idByHome.get(code)!;

  async function setPreds(code: string, preds: Pred[]) {
    await sb.from("predictions").upsert(
      preds.map((p) => ({
        user_id: uid(p.user),
        match_id: mid(code),
        pred_home_score: p.h,
        pred_away_score: p.a,
      })),
      { onConflict: "user_id,match_id" },
    );
  }

  async function finish(code: string, kickoff: string, h: number, a: number, preds: Pred[]) {
    // dejar scheduled + cargar pronósticos, luego finalizar (dispara el trigger de puntos)
    await sb
      .from("matches")
      .update({ kickoff_at: kickoff, status: "scheduled", home_score: null, away_score: null })
      .eq("id", mid(code));
    await setPreds(code, preds);
    await sb.from("matches").update({ status: "finished", home_score: h, away_score: a }).eq("id", mid(code));
  }

  // --- Jugados ---
  await finish("ARG", days(-2), 2, 1, [
    { user: "omar", h: 2, a: 1 }, // pleno
    { user: "juli", h: 2, a: 0 }, // resultado
    { user: "sofi", h: 1, a: 1 },
    { user: "carlos", h: 3, a: 1 }, // resultado
    { user: "mati", h: 0, a: 0 },
    { user: "lucia", h: 2, a: 1 }, // pleno
  ]);
  await finish("BRA", days(-1), 2, 1, [
    { user: "omar", h: 2, a: 1 }, // pleno
    { user: "juli", h: 1, a: 1 },
    { user: "carlos", h: 2, a: 1 }, // pleno
    { user: "mati", h: 0, a: 2 },
  ]);

  // --- Por jugar ---
  // CAN-JPN hoy: omar NO carga (para ver "próximo partido" + pendiente en el dashboard)
  await sb
    .from("matches")
    .update({ kickoff_at: hours(3), status: "scheduled", home_score: null, away_score: null })
    .eq("id", mid("CAN"));
  await setPreds("CAN", [
    { user: "juli", h: 1, a: 0 },
    { user: "sofi", h: 2, a: 1 },
  ]);
  // FRA-ENG: omar ya cargó (estado "cargado/editar")
  await sb.from("matches").update({ kickoff_at: days(2), status: "scheduled" }).eq("id", mid("FRA"));
  await setPreds("FRA", [{ user: "omar", h: 1, a: 0 }]);

  // Snapshot de AYER (para que la tabla muestre deltas ▲/▼)
  const yesterday = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Argentina/Buenos_Aires" })
    .format(new Date(Date.now() - 86_400_000));
  const ayer: Record<string, number> = { carlos: 1, omar: 2, lucia: 3, juli: 4, sofi: 5, mati: 5 };
  await sb.from("standings_snapshots").upsert(
    Object.entries(ayer).map(([u, pos]) => ({ user_id: uid(u), date: yesterday, posicion: pos, puntos: 0 })),
    { onConflict: "user_id,date" },
  );

  // Mensajes del día + snapshot de hoy (plantillas; con GEMINI_API_KEY el cron los reescribe)
  const res = await runDailyMessages(sb);

  console.log("✅ Demo lista:", res);
  console.log("   Ingresá como omar@prode.local / prode2026 (o juli, sofi, carlos, mati, lucia).");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
