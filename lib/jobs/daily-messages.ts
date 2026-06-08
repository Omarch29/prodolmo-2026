import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import type { RewriteItem } from "@/lib/gemini/messages-prompt";
import { getActualChampion, CHAMPION_BONUS } from "@/lib/queries/champion";

type DailyMessageType = Database["public"]["Enums"]["daily_message_type"];
type MessageInsert = Database["public"]["Tables"]["daily_messages"]["Insert"];

/** Zona horaria del grupo para bucketear "hoy"/"ayer". */
const APP_TZ = "America/Argentina/Buenos_Aires";

/** Mínimo de plenos en el día para considerar "racha". */
const STREAK_MIN = 2;
/** Diferencia de goles para considerar "goleada". */
const ROUT_DIFF = 3;

function dateInTz(d: Date, tz: string = APP_TZ): string {
  // en-CA => YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(d);
}

export type JobResult = { snapshots: number; messages: number; date: string };

/** `rewrite`: opcional, reescribe los textos con IA (mismo orden); si falla, se usan las plantillas. */
export type RunOptions = {
  now?: Date;
  rewrite?: (items: RewriteItem[]) => Promise<string[]>;
};

type ProfileRow = { id: string; display_name: string; champion_team_id: string | null };
type MatchRow = {
  id: string;
  kickoff_at: string;
  status: Database["public"]["Enums"]["match_status"];
  home_score: number | null;
  away_score: number | null;
  home_team: { name: string } | null;
  away_team: { name: string } | null;
};
type PredRow = {
  user_id: string;
  match_id: string;
  pred_home_score: number;
  pred_away_score: number;
  points_earned: number | null;
};

type Standing = { userId: string; displayName: string; points: number; rank: number };

function computeStandings(
  profiles: ProfileRow[],
  preds: PredRow[],
  finishedIds: Set<string>,
  actualChampion: string | null,
): Standing[] {
  const points = new Map<string, number>();
  for (const p of profiles) {
    points.set(p.id, actualChampion && p.champion_team_id === actualChampion ? CHAMPION_BONUS : 0);
  }
  for (const p of preds) {
    if (!finishedIds.has(p.match_id)) continue;
    points.set(p.user_id, (points.get(p.user_id) ?? 0) + (p.points_earned ?? 0));
  }
  const nameById = new Map(profiles.map((p) => [p.id, p.display_name]));
  const rows = profiles
    .map((p) => ({
      userId: p.id,
      displayName: nameById.get(p.id) ?? "?",
      points: points.get(p.id) ?? 0,
    }))
    .sort((a, b) => b.points - a.points || a.displayName.localeCompare(b.displayName));

  let rank = 0;
  let prev = Number.NaN;
  return rows.map((r, i) => {
    if (r.points !== prev) {
      rank = i + 1;
      prev = r.points;
    }
    return { ...r, rank };
  });
}

/**
 * Job diario (§6): snapshot de la tabla + mensajes personalizados por usuario.
 * Idempotente para el día: reemplaza los mensajes y el snapshot de hoy.
 * Usa un cliente service-role (lee a todos, escribe sin RLS).
 */
export async function runDailyMessages(
  supabase: SupabaseClient<Database>,
  opts: RunOptions = {},
): Promise<JobResult> {
  const now = opts.now ?? new Date();
  const today = dateInTz(now);
  const yesterday = dateInTz(new Date(now.getTime() - 86_400_000));

  const [{ data: profiles }, { data: matches }, { data: preds }] = await Promise.all([
    supabase.from("profiles").select("id, display_name, champion_team_id"),
    supabase
      .from("matches")
      .select(
        `id, kickoff_at, status, home_score, away_score,
         home_team:teams!matches_home_team_id_fkey(name),
         away_team:teams!matches_away_team_id_fkey(name)`,
      ),
    supabase
      .from("predictions")
      .select("user_id, match_id, pred_home_score, pred_away_score, points_earned"),
  ]);

  const profs = (profiles ?? []) as ProfileRow[];
  const ms = (matches ?? []) as MatchRow[];
  const ps = (preds ?? []) as PredRow[];

  const finishedIds = new Set(ms.filter((m) => m.status === "finished").map((m) => m.id));
  const todayMatchIds = new Set(ms.filter((m) => dateInTz(new Date(m.kickoff_at)) === today).map((m) => m.id));
  const yesterdayMatches = ms.filter(
    (m) => m.status === "finished" && dateInTz(new Date(m.kickoff_at)) === yesterday,
  );

  // ---- Standings de hoy + snapshot ----
  const actualChampion = await getActualChampion(supabase);
  const standings = computeStandings(profs, ps, finishedIds, actualChampion);
  const leaderPoints = standings[0]?.points ?? 0;
  const maxRank = standings.reduce((mx, s) => Math.max(mx, s.rank), 0);

  await supabase.from("standings_snapshots").upsert(
    standings.map((s) => ({ user_id: s.userId, date: today, puntos: s.points, posicion: s.rank })),
    { onConflict: "user_id,date" },
  );

  // ---- Snapshot de ayer (para "te pasaron") ----
  const { data: ySnaps } = await supabase
    .from("standings_snapshots")
    .select("user_id, posicion")
    .eq("date", yesterday);
  const posAyer = new Map((ySnaps ?? []).map((s) => [s.user_id, s.posicion]));

  // ---- Análisis de partidos de ayer (plenos por partido) ----
  const isPleno = (p: PredRow, m: MatchRow) =>
    p.pred_home_score === m.home_score && p.pred_away_score === m.away_score;
  const predsByMatch = new Map<string, PredRow[]>();
  for (const p of ps) {
    const arr = predsByMatch.get(p.match_id);
    if (arr) arr.push(p);
    else predsByMatch.set(p.match_id, [p]);
  }
  const nameById = new Map(profs.map((p) => [p.id, p.display_name]));

  // mensajes "globales" (mismo body para todos) derivados de ayer
  const globalMessages: { type: DailyMessageType; body: string; priority: number }[] = [];
  for (const m of yesterdayMatches) {
    const mp = predsByMatch.get(m.id) ?? [];
    const plenos = mp.filter((p) => isPleno(p, m));
    const label = `${m.home_team?.name ?? "?"} ${m.home_score}-${m.away_score} ${m.away_team?.name ?? "?"}`;
    if (
      m.home_score != null &&
      m.away_score != null &&
      Math.abs(m.home_score - m.away_score) >= ROUT_DIFF &&
      plenos.length === 0
    ) {
      globalMessages.push({
        type: "surprise_result",
        body: `Golazo de la jornada: ${label}. ¡Nadie la vio venir!`,
        priority: 7,
      });
    }
    if (plenos.length === 1) {
      const first = plenos[0];
      const who = first ? nameById.get(first.user_id) ?? "Alguien" : "Alguien";
      globalMessages.push({
        type: "lone_hit",
        body: `Sorpresa: ${who} fue el único que clavó ${label}.`,
        priority: 6,
      });
    }
  }

  // plenos de ayer por usuario (para racha)
  const plenosAyerByUser = new Map<string, number>();
  for (const m of yesterdayMatches) {
    for (const p of predsByMatch.get(m.id) ?? []) {
      if (isPleno(p, m)) plenosAyerByUser.set(p.user_id, (plenosAyerByUser.get(p.user_id) ?? 0) + 1);
    }
  }

  // predicciones de hoy por usuario (para pending_today)
  const loadedTodayByUser = new Map<string, number>();
  for (const p of ps) {
    if (todayMatchIds.has(p.match_id)) {
      loadedTodayByUser.set(p.user_id, (loadedTodayByUser.get(p.user_id) ?? 0) + 1);
    }
  }
  const matchesTodayCount = todayMatchIds.size;

  // ---- Construir mensajes por usuario ----
  const inserts: MessageInsert[] = [];
  for (const s of standings) {
    const uid = s.userId;

    // pending_today
    if (matchesTodayCount > 0 && (loadedTodayByUser.get(uid) ?? 0) === 0) {
      inserts.push({
        user_id: uid,
        message_date: today,
        type: "pending_today",
        priority: 1,
        body: `Hoy hay ${matchesTodayCount} partido${matchesTodayCount > 1 ? "s" : ""} y todavía no cargaste ninguno. ¡No te quedes afuera!`,
      });
    }

    // overtaken (bajaste de puesto vs ayer)
    const ayer = posAyer.get(uid);
    if (ayer != null && s.rank > ayer) {
      inserts.push({
        user_id: uid,
        message_date: today,
        type: "overtaken",
        priority: 2,
        body: `Te pasaron: caíste del puesto #${ayer} al #${s.rank}. ¡A remontar!`,
      });
    }

    // gap_to_leader
    if (s.rank > 1) {
      const gap = leaderPoints - s.points;
      if (gap > 0) {
        inserts.push({
          user_id: uid,
          message_date: today,
          type: "gap_to_leader",
          priority: 3,
          body: `Estás a ${gap} punto${gap > 1 ? "s" : ""} del líder.`,
        });
      }
    }

    // last_place
    if (maxRank > 1 && s.rank === maxRank) {
      inserts.push({
        user_id: uid,
        message_date: today,
        type: "last_place",
        priority: 4,
        body: `Estás último en la tabla. El Mundial es largo, ¡a no aflojar!`,
      });
    }

    // streak (plenos de ayer)
    const racha = plenosAyerByUser.get(uid) ?? 0;
    if (racha >= STREAK_MIN) {
      inserts.push({
        user_id: uid,
        message_date: today,
        type: "streak",
        priority: 5,
        body: `Estás en racha: ${racha} plenos ayer. 🔥`,
      });
    }

    // globales
    for (const g of globalMessages) {
      inserts.push({ user_id: uid, message_date: today, type: g.type, priority: g.priority, body: g.body });
    }
  }

  // ---- Reescritura con IA (opcional; fallback a las plantillas) ----
  if (opts.rewrite && inserts.length > 0) {
    try {
      const items: RewriteItem[] = inserts.map((ins) => ({
        type: ins.type,
        body: ins.body,
        displayName: ins.user_id ? nameById.get(ins.user_id) ?? "" : "",
      }));
      const rewritten = await opts.rewrite(items);
      inserts.forEach((ins, i) => {
        const r = rewritten[i];
        if (r) ins.body = r;
      });
    } catch {
      // mantener las plantillas
    }
  }

  // ---- Persistir (idempotente para hoy) ----
  await supabase.from("daily_messages").delete().eq("message_date", today);
  if (inserts.length > 0) {
    await supabase.from("daily_messages").insert(inserts);
  }

  return { snapshots: standings.length, messages: inserts.length, date: today };
}
