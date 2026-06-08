import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPlayerDetail } from "@/lib/queries/player";
import { getStandings } from "@/lib/queries/standings";
import { Avatar } from "@/components/ui/Avatar";
import { Flag } from "@/components/ui/Flag";
import { RoundBar } from "@/components/jugador/RoundBar";
import { AvatarUpload } from "@/components/jugador/AvatarUpload";
import { ChampionPicker } from "@/components/champion/ChampionPicker";
import { getTournamentStart, getTeamsList, isChampionEditable } from "@/lib/queries/champion";
import { cn } from "@/lib/utils";

function Kpi({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center bg-scoreboard-ink border-pixel shadow-pixel-xs py-2">
      <span className="font-mono text-2xl text-card-yellow leading-none">{value}</span>
      <span className="font-display text-[6px] tracking-[1px] text-grey-300 mt-1">{label}</span>
    </div>
  );
}

export default async function JugadorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [detail, standings] = await Promise.all([
    getPlayerDetail(supabase, id),
    getStandings(supabase),
  ]);
  if (!detail) notFound();

  const rank = standings.find((s) => s.userId === id)?.rank ?? standings.length;
  const isMe = id === user.id;

  // Vecinos en la tabla (§5.5 E): el de arriba, este jugador y el de abajo.
  const idx = standings.findIndex((s) => s.userId === id);
  const neighbors = idx >= 0 ? standings.slice(Math.max(0, idx - 1), idx + 2) : [];

  // Campeón: ¿este jugador (propio) todavía puede elegirlo?
  const start = await getTournamentStart(supabase);
  const canPickChampion = isMe && isChampionEditable(start, detail.championTeamId);
  const champTeams = canPickChampion ? await getTeamsList(supabase) : [];

  return (
    <div className="md:max-w-2xl md:mx-auto">
      <header className="flex items-center gap-3 bg-scoreboard-black border-b-[4px] border-border px-4 py-3">
        <Link href="/tabla" className="font-display text-line-white text-xs">
          ◂
        </Link>
        <span className="font-display text-line-white text-sm flex-1">DETALLE</span>
      </header>

      {/* Hero */}
      <div className="flex items-center gap-3 bg-scoreboard-black border-b-[4px] border-border p-4">
        <Avatar name={detail.displayName} src={detail.avatarUrl} size={54} />
        <div className="flex-1 min-w-0">
          <div className="font-display text-line-white text-sm truncate">
            {detail.displayName.toUpperCase()}
            {detail.esBot ? " 🤖" : ""}
            {isMe ? " (VOS)" : ""}
          </div>
          <div className="font-body text-xs text-grey-300 mt-1">
            Puesto #{rank} · {detail.overallPct}% del total posible
          </div>
        </div>
        <div className="flex flex-col items-center bg-scoreboard-ink border-pixel shadow-pixel-xs px-2.5 py-1.5">
          <span className="font-display text-[7px] tracking-[1px] text-card-yellow">PUNTOS</span>
          <span className="font-mono text-2xl text-goal-orange leading-none mt-0.5">
            {detail.kpis.puntos}
          </span>
        </div>
      </div>

      {/* Cambiar foto (solo el propio perfil) */}
      {isMe && <AvatarUpload />}

      {/* Campeón elegido */}
      {detail.champion && (
        <div className="flex items-center gap-2 px-4 py-3 border-b-[2px] border-scoreboard-slate">
          <span className="font-display text-[8px] tracking-[1px] text-grey-300">🏆 CAMPEÓN</span>
          <span className="flex items-center gap-1.5 font-body text-sm text-line-white ml-auto">
            <Flag flag={detail.champion.flag} size={20} />
            {detail.champion.name}
          </span>
        </div>
      )}

      {/* Elegir campeón (propio y antes del inicio del Mundial) */}
      {canPickChampion && (
        <div className="flex flex-col gap-2 p-4 border-b-[2px] border-scoreboard-slate">
          <div className="font-display text-[10px] tracking-[1px] text-line-white">🏆 ELEGÍ TU CAMPEÓN</div>
          <p className="font-body text-xs text-grey-300">
            Solo hasta que arranque el Mundial y una sola vez · <span className="text-card-yellow">+20</span> si acertás.
          </p>
          <ChampionPicker teams={champTeams} />
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-2 px-4 pt-5">
        <Kpi label="PLENOS" value={detail.kpis.plenos} />
        <Kpi label="ACIERTOS" value={detail.kpis.aciertos} />
        <Kpi label="CARGADOS" value={detail.kpis.cargados} />
      </div>

      {/* Hábitos de carga */}
      <div className="grid grid-cols-2 gap-2 px-4 pt-2 pb-5">
        <div className="flex flex-col items-center bg-scoreboard-ink border-pixel shadow-pixel-xs py-2">
          <span className="font-mono text-xl text-pitch-green-lighter leading-none">
            🕒 {detail.habits.avgLoadTime ?? "—"}
          </span>
          <span className="font-display text-[6px] tracking-[1px] text-grey-300 mt-1">HORARIO DE CARGA</span>
        </div>
        <div className="flex flex-col items-center bg-scoreboard-ink border-pixel shadow-pixel-xs py-2">
          <span className="font-mono text-xl text-pitch-green-lighter leading-none">
            ⏱ {detail.habits.avgLeadTime ?? "—"}
          </span>
          <span className="font-display text-[6px] tracking-[1px] text-grey-300 mt-1">ANTICIPACIÓN</span>
        </div>
      </div>

      {/* Posición y vecinos en la tabla (§5.5 E) */}
      {neighbors.length > 1 && (
        <div className="px-4 pb-5">
          <div className="font-display text-[10px] tracking-[1px] text-line-white mb-2">🏆 EN LA TABLA</div>
          <div className="bg-scoreboard-black border-pixel-thick shadow-pixel-sm">
            {neighbors.map((n) => (
              <div
                key={n.userId}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 border-b-[2px] border-scoreboard-slate last:border-b-0",
                  n.userId === id ? "bg-scoreboard-slate" : "",
                )}
              >
                <span className="w-5 text-center font-display text-[10px] text-grey-300">{n.rank}</span>
                <Avatar name={n.displayName} src={n.avatarUrl} size={24} />
                <span className="flex-1 truncate font-body text-sm text-line-white">
                  {n.displayName}
                  {n.esBot ? " 🤖" : ""}
                  {n.userId === id ? " (este)" : ""}
                </span>
                <span className="font-mono text-card-yellow text-lg">{n.points}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Desglose por ronda */}
      <div className="flex flex-col gap-4 pb-8">
        <div className="px-4 font-display text-[10px] tracking-[1px] text-line-white">
          📊 DESGLOSE POR RONDA
        </div>
        {detail.rounds.map((r) => (
          <RoundBar key={r.stageName} r={r} />
        ))}
      </div>
    </div>
  );
}
