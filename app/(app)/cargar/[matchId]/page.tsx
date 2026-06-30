import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getMatchForPrediction,
  getFriendPicks,
  getNextMatchId,
  getPrevMatchId,
} from "@/lib/queries/cargar";
import { getComments } from "@/lib/queries/comments";
import { isPredictionEditable, othersPicksVisible, isMatchSoon } from "@/lib/config";
import { PredictionForm } from "@/components/cargar/PredictionForm";
import { FriendPicks } from "@/components/cargar/FriendPicks";
import { MatchComments } from "@/components/cargar/MatchComments";
import { MatchDetails } from "@/components/cargar/MatchDetails";
import { AdvancesBadge, resolveAdvancingTeam } from "@/components/cargar/AdvancesBadge";
import { BackButton } from "@/components/cargar/BackButton";
import { SoonAlert } from "@/components/cargar/SoonAlert";
import { Countdown } from "@/components/ui/Countdown";
import { Flag } from "@/components/ui/Flag";
import { buttonClassName } from "@/components/ui/Button";
import { googleCalendarUrl } from "@/lib/calendar/google";
import { flagEmojiForCode } from "@/lib/flags/team-flag";
import type { TeamLite } from "@/lib/queries/dashboard";

/** Emoji de bandera de un equipo: el flag si ya es emoji (seed), si no por código FIFA. */
function teamFlagEmoji(t: TeamLite): string {
  if (t.flag && !/^https?:\/\//.test(t.flag)) return t.flag;
  return flagEmojiForCode(t.code);
}

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
  searchParams,
}: {
  params: Promise<{ matchId: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { matchId } = await params;
  // A dónde volver tras guardar: el filtro de origen del listado (sanitizado).
  const { from } = await searchParams;
  const back = typeof from === "string" && from.startsWith("/cargar") ? from : "/cargar";
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
  // Desde Octavos, los pronósticos ajenos recién se ven al bloquearse el partido.
  const othersVisible = othersPicksVisible(m.stageSortOrder, kickoff);
  // Alerta roja: arranca en <2h y no lo cargaste.
  const showSoonAlert = !finished && !m.myPred && isMatchSoon(kickoff);
  const playable = m.homeTeamId !== null && m.awayTeamId !== null;
  // Si mi pronóstico fue empate en eliminatoria, a quién elegí que pase de ronda.
  const myAdvancing =
    m.myPred && m.myPred.home === m.myPred.away
      ? resolveAdvancingTeam(m.myPred.winnerTeamId, m.homeTeamId, m.awayTeamId, m.home, m.away)
      : null;
  const [prevMatchId, nextMatchId] = await Promise.all([
    getPrevMatchId(supabase, m.kickoffAt, m.id),
    getNextMatchId(supabase, m.kickoffAt, m.id),
  ]);
  const navHref = (id: string) => `/cargar/${id}?from=${encodeURIComponent(back)}`;
  const friendPicks = playable && othersVisible ? await getFriendPicks(supabase, user.id, matchId) : [];
  const comments = playable ? await getComments(supabase, matchId) : [];

  return (
    <div className="md:max-w-2xl md:mx-auto">
      <header className="flex items-center gap-3 bg-scoreboard-black border-b-[4px] border-border px-4 py-3">
        <BackButton />
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
        {showSoonAlert && (
          <SoonAlert
            match={{ id: m.id, kickoffAt: m.kickoffAt, home: m.home, away: m.away }}
            className="mx-4"
          />
        )}

        {/* Partido */}
        <div className="mx-4 ds-pitch border-pixel-thick shadow-pixel">
          <div className="flex items-center justify-around py-5 px-3">
            <Team t={m.home} />
            {finished ? (
              <div className="flex flex-col items-center gap-1">
                <span className="font-mono text-card-yellow text-4xl">
                  {m.homeScore}-{m.awayScore}
                </span>
                {m.homePenalties != null && m.awayPenalties != null && (
                  <span className="font-display text-[8px] tracking-[1px] text-grey-300">
                    PENALES {m.homePenalties}-{m.awayPenalties}
                  </span>
                )}
              </div>
            ) : (
              <span className="font-display text-line-white text-sm">VS</span>
            )}
            <Team t={m.away} />
          </div>
          {!finished && (
            <div className="flex flex-col items-center gap-2 pb-4">
              <span className="font-display text-[8px] tracking-[1.5px] text-grey-300">EMPIEZA EN</span>
              <Countdown target={m.kickoffAt} />
              <a
                href={googleCalendarUrl({
                  homeCode: m.home.code,
                  awayCode: m.away.code,
                  homeName: m.home.name,
                  awayName: m.away.name,
                  homeFlag: teamFlagEmoji(m.home),
                  awayFlag: teamFlagEmoji(m.away),
                  kickoffISO: m.kickoffAt,
                  stageName: m.stageName,
                  matchday: m.matchday,
                })}
                target="_blank"
                rel="noopener noreferrer"
                className="font-display text-[8px] tracking-[1px] text-pitch-green-lighter underline underline-offset-2 mt-1"
              >
                📅 AGENDAR EN GOOGLE CALENDAR
              </a>
            </div>
          )}
        </div>

        {/* Ficha del partido (fecha, instancia, sede, árbitros) detrás de un desplegable */}
        {playable && (
          <MatchDetails
            kickoffAt={m.kickoffAt}
            stageName={m.stageName}
            groupName={m.groupName}
            matchday={m.matchday}
            venue={m.venue}
            referees={m.referees}
          />
        )}

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
            back={back}
          />
        ) : (
          <div className="mx-4 flex flex-col gap-3">
            <div className="bg-scoreboard-black border-pixel-thick shadow-pixel-sm p-4 text-center">
              <div className="font-display text-[8px] tracking-[1px] text-grey-300 mb-2">TU PRONÓSTICO</div>
              {m.myPred ? (
                <div className="flex flex-col items-center gap-2">
                  <span className="font-mono text-card-yellow text-4xl">
                    {m.myPred.home} - {m.myPred.away}
                  </span>
                  {myAdvancing && <AdvancesBadge team={myAdvancing} />}
                </div>
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

        {/* Pronósticos del grupo (desde Octavos, ocultos hasta el cierre) */}
        {playable &&
          (othersVisible ? (
            <FriendPicks
              picks={friendPicks}
              title={finished ? "Análisis del grupo · quién sumó" : "Pronósticos del grupo"}
              reveal={finished}
              home={m.home}
              away={m.away}
              homeTeamId={m.homeTeamId}
              awayTeamId={m.awayTeamId}
            />
          ) : (
            <div className="mx-4 flex items-start gap-2 bg-scoreboard-slate border-pixel px-3 py-2">
              <span className="text-lg">🔒</span>
              <p className="font-body text-xs text-grey-300">
                Desde <span className="text-line-white">Octavos</span>, los pronósticos del resto
                recién se ven cuando el partido se <span className="text-line-white">bloquea</span> (1 h
                antes de empezar). Hasta entonces, el de cada uno es secreto.
              </p>
            </div>
          ))}

        {/* Comentarios */}
        {playable && <MatchComments matchId={m.id} comments={comments} />}

        {/* Navegación entre partidos (conserva el filtro de origen) */}
        {(prevMatchId || nextMatchId) && (
          <nav className="mx-4 grid grid-cols-2 gap-2">
            {prevMatchId ? (
              <Link
                href={navHref(prevMatchId)}
                className={buttonClassName({ variant: "ghost", size: "sm", className: "justify-center" })}
              >
                ← Anterior
              </Link>
            ) : (
              <span />
            )}
            {nextMatchId ? (
              <Link
                href={navHref(nextMatchId)}
                className={buttonClassName({ variant: "secondary", size: "sm", className: "justify-center" })}
              >
                Siguiente →
              </Link>
            ) : (
              <span />
            )}
          </nav>
        )}
      </div>
    </div>
  );
}
