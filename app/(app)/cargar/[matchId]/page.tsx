import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMatchForPrediction, getFriendPicks } from "@/lib/queries/cargar";
import { getComments } from "@/lib/queries/comments";
import { isPredictionEditable } from "@/lib/config";
import { PredictionForm } from "@/components/cargar/PredictionForm";
import { FriendPicks } from "@/components/cargar/FriendPicks";
import { MatchComments } from "@/components/cargar/MatchComments";
import { Countdown } from "@/components/ui/Countdown";
import { Flag } from "@/components/ui/Flag";
import type { TeamLite } from "@/lib/queries/dashboard";

function Team({ t }: { t: TeamLite }) {
  return (
    <div className="flex flex-col items-center gap-1 w-24">
      <Flag flag={t.flag} size={40} />
      <span className="font-display text-[10px] text-line-white text-center">{t.code}</span>
    </div>
  );
}

export default async function CargarMatchPage({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const { matchId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const m = await getMatchForPrediction(supabase, user.id, matchId);
  if (!m) notFound();

  const kickoff = new Date(m.kickoffAt);
  const editable = m.status === "scheduled" && isPredictionEditable(kickoff);
  const finished = m.status === "finished";
  const playable = m.homeTeamId !== null && m.awayTeamId !== null;
  const friendPicks = playable ? await getFriendPicks(supabase, user.id, matchId) : [];
  const comments = playable ? await getComments(supabase, matchId) : [];

  return (
    <div className="md:max-w-2xl md:mx-auto">
      <header className="flex items-center gap-3 bg-scoreboard-black border-b-[4px] border-border px-4 py-3">
        <Link href="/cargar" className="font-display text-line-white text-xs">
          ◂
        </Link>
        <span className="font-display text-line-white text-sm flex-1 truncate">{m.stageName}</span>
        {!playable ? (
          <span className="font-display text-[8px] border-pixel px-2 py-1 bg-scoreboard-slate text-grey-300">POR DEFINIR</span>
        ) : editable ? (
          <span className="font-display text-[8px] border-pixel px-2 py-1 bg-goal-orange text-ink">EDITABLE</span>
        ) : finished ? (
          <span className="font-display text-[8px] border-pixel px-2 py-1 bg-pitch-green-light text-ink">✓ JUGADO</span>
        ) : (
          <span className="font-display text-[8px] border-pixel px-2 py-1 bg-grey-300 text-ink">🔒 CERRADO</span>
        )}
      </header>

      <div className="flex flex-col gap-5 py-5">
        {/* Partido */}
        <div className="mx-4 bg-bg-field border-pixel-thick shadow-pixel">
          <div className="flex items-center justify-around py-5 px-3">
            <Team t={m.home} />
            {finished ? (
              <span className="font-mono text-card-yellow text-4xl">
                {m.homeScore}-{m.awayScore}
              </span>
            ) : (
              <span className="font-display text-line-white text-sm">VS</span>
            )}
            <Team t={m.away} />
          </div>
          {!finished && (
            <div className="flex flex-col items-center gap-2 pb-4">
              <span className="font-display text-[8px] tracking-[1.5px] text-grey-300">EMPIEZA EN</span>
              <Countdown target={m.kickoffAt} />
            </div>
          )}
        </div>

        {/* Previa generada por IA */}
        {!finished && m.aiPreview && (
          <div className="mx-4 flex items-start gap-2 bg-scoreboard-black border-pixel px-3 py-2">
            <span className="text-lg">🎙️</span>
            <p className="font-body text-xs text-grey-300 italic">{m.aiPreview}</p>
          </div>
        )}

        {/* Carga / vista */}
        {!playable ? (
          <div className="mx-4 flex items-start gap-2 bg-scoreboard-slate border-pixel px-3 py-2">
            <span className="text-lg">⏳</span>
            <p className="font-body text-xs text-grey-300">
              Todavía no están definidos los equipos de este cruce. Vas a poder cargar tu
              pronóstico cuando se sepan (al cerrarse la ronda anterior).
            </p>
          </div>
        ) : editable ? (
          <PredictionForm
            matchId={m.id}
            home={m.home}
            away={m.away}
            homeTeamId={m.homeTeamId}
            awayTeamId={m.awayTeamId}
            isKnockout={m.isKnockout}
            initial={m.myPred}
          />
        ) : (
          <div className="mx-4 flex flex-col gap-3">
            <div className="bg-scoreboard-black border-pixel-thick shadow-pixel-sm p-4 text-center">
              <div className="font-display text-[8px] tracking-[1px] text-grey-300 mb-2">TU PRONÓSTICO</div>
              {m.myPred ? (
                <span className="font-mono text-card-yellow text-4xl">
                  {m.myPred.home} - {m.myPred.away}
                </span>
              ) : (
                <span className="font-body text-sm text-grey-400">No cargaste este partido.</span>
              )}
            </div>
            <div className="flex items-start gap-2 bg-scoreboard-slate border-pixel px-3 py-2">
              <span className="text-lg">🔒</span>
              <p className="font-body text-xs text-grey-300">
                La carga está cerrada (faltaba menos de 1h para el partido). Ya no se puede editar.
              </p>
            </div>
          </div>
        )}

        {/* Pronósticos del grupo */}
        {playable && (
          <FriendPicks
            picks={friendPicks}
            title={finished ? "Análisis del grupo · quién sumó" : "Pronósticos del grupo"}
            reveal={finished}
          />
        )}

        {/* Comentarios */}
        {playable && <MatchComments matchId={m.id} comments={comments} />}
      </div>
    </div>
  );
}
