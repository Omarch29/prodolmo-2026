"use client";

import { useState, useTransition } from "react";
import { saveSimState, resetSim } from "@/actions/simulations";
import { Flag } from "@/components/ui/Flag";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import {
  GROUPS,
  matchesByRound,
  participantsOf,
  winnerOfMatch,
  champion,
  emptyState,
  type SimState,
  type GroupLetter,
  type Round,
} from "@/lib/sim/wc2026";
import type { GroupRoster, TeamInfo } from "@/lib/queries/sim";

type Step = "grupos" | "terceros" | "llaves";
type Teams = Record<string, TeamInfo>;
type PickFn = (matchId: string, teamId: string | null) => void;

const ROUND_LABEL: Record<Round, string> = {
  R32: "16avos",
  R16: "Octavos",
  QF: "Cuartos",
  SF: "Semis",
  F: "Final",
};

function MatchCard({
  matchId,
  state,
  teams,
  onPick,
}: {
  matchId: string;
  state: SimState;
  teams: Teams;
  onPick: PickFn;
}) {
  const [a, b] = participantsOf(matchId, state);
  const win = winnerOfMatch(matchId, state);

  const row = (teamId: string | null, key: string) => {
    const t = teamId ? teams[teamId] : undefined;
    const selected = win !== null && win === teamId;
    return (
      <button
        key={key}
        type="button"
        disabled={!teamId}
        onClick={() => teamId && onPick(matchId, teamId)}
        className={cn(
          "w-full flex items-center gap-2 px-2.5 py-2 text-left",
          selected ? "bg-pitch-green text-ink" : "text-line-white disabled:text-grey-500",
        )}
      >
        <Flag flag={t?.flag ?? null} size={18} />
        <span className="font-display text-[9px] truncate">{t?.code ?? "—"}</span>
      </button>
    );
  };

  return (
    <div className="bg-scoreboard-black border-pixel w-full">
      {row(a, "a")}
      <div className="border-t-[2px] border-scoreboard-slate" />
      {row(b, "b")}
    </div>
  );
}

function BracketColumn({
  ids,
  label,
  state,
  teams,
  onPick,
}: {
  ids: string[];
  label: string;
  state: SimState;
  teams: Teams;
  onPick: PickFn;
}) {
  return (
    <div className="flex flex-col justify-around gap-4 w-[140px] shrink-0">
      <div className="font-display text-[8px] tracking-[1px] text-grey-400 text-center">{label}</div>
      {ids.map((id) => (
        <MatchCard key={id} matchId={id} state={state} teams={teams} onPick={onPick} />
      ))}
    </div>
  );
}

function half(round: Round, side: "L" | "R"): string[] {
  const all = matchesByRound(round);
  const mid = all.length / 2;
  return (side === "L" ? all.slice(0, mid) : all.slice(mid)).map((m) => m.id);
}

export function Simulator({
  groups,
  teams,
  initial,
}: {
  groups: GroupRoster[];
  teams: Teams;
  initial: SimState;
}) {
  const [state, setState] = useState<SimState>(initial);
  const [step, setStep] = useState<Step>("grupos");
  const [, startTransition] = useTransition();

  const persist = (next: SimState) => {
    setState(next);
    startTransition(async () => {
      await saveSimState(next);
    });
  };

  // Solo 1.º y 2.º por grupo. Al cambiar el orden, se limpia el tercero de ese grupo.
  const toggleRank = (g: GroupLetter, teamId: string) => {
    const cur = state.groupOrder[g] ?? [];
    const next = cur.includes(teamId)
      ? cur.filter((id) => id !== teamId)
      : cur.length < 2
        ? [...cur, teamId]
        : cur;
    const nextThirds = { ...state.thirds };
    delete nextThirds[g];
    persist({ ...state, groupOrder: { ...state.groupOrder, [g]: next }, thirds: nextThirds });
  };
  const groupComplete = (g: GroupLetter) => (state.groupOrder[g]?.length ?? 0) === 2;
  const allGroupsComplete = GROUPS.every(groupComplete);

  const thirdsCount = Object.keys(state.thirds).length;
  // Elegir el tercero de un grupo (uno por grupo, 8 en total).
  const toggleThird = (g: GroupLetter, teamId: string) => {
    const cur = state.thirds[g];
    const next = { ...state.thirds };
    if (cur === teamId) delete next[g];
    else if (cur) next[g] = teamId; // cambiar de equipo dentro del grupo
    else if (thirdsCount < 8) next[g] = teamId;
    else return; // ya hay 8
    persist({ ...state, thirds: next });
  };
  const thirdsComplete = thirdsCount === 8;

  const pickKo: PickFn = (matchId, teamId) => {
    if (!teamId) return;
    persist({ ...state, ko: { ...state.ko, [matchId]: teamId } });
  };

  const onReset = () => {
    setState(emptyState());
    startTransition(async () => {
      await resetSim();
    });
  };

  const champId = champion(state);
  const champ = champId ? teams[champId] : undefined;

  return (
    <div>
      <header className="flex items-center justify-between bg-scoreboard-black border-b-[4px] border-border px-4 py-3">
        <span className="font-display text-line-white text-sm flex items-center gap-2">🎮 SIMULADOR</span>
        <span className="font-display text-[8px] border-pixel px-2 py-1 bg-sky-blue text-line-white">HIPOTÉTICO</span>
      </header>

      <div className="flex gap-2 px-4 pt-4">
        {(
          [
            ["grupos", "1 · Grupos"],
            ["terceros", "2 · Terceros"],
            ["llaves", "3 · Llaves"],
          ] as [Step, string][]
        ).map(([s, label]) => (
          <button
            key={s}
            type="button"
            onClick={() => setStep(s)}
            className={cn(
              "font-display text-[8px] tracking-[1px] border-pixel px-2.5 py-2",
              step === s ? "bg-pitch-green text-ink" : "bg-scoreboard-slate text-grey-300",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="p-4 flex flex-col gap-4">
        {step === "grupos" && (
          <>
            <p className="font-body text-xs text-grey-300">
              En cada grupo, tocá el <strong className="text-line-white">1.º</strong> y el{" "}
              <strong className="text-line-white">2.º</strong>. Los terceros se eligen en el paso siguiente.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {groups.map((gr) => {
                const g = gr.group as GroupLetter;
                const order = state.groupOrder[g] ?? [];
                return (
                  <div key={g} className="bg-scoreboard-black border-pixel-thick shadow-pixel-sm p-3">
                    <div className="font-display text-[9px] tracking-[1px] text-line-white mb-2 flex items-center gap-2">
                      GRUPO {g}
                      {groupComplete(g) && <span className="text-pitch-green-lighter">✓</span>}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {gr.teams.map((t) => {
                        const pos = order.indexOf(t.id);
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => toggleRank(g, t.id)}
                            className={cn(
                              "flex items-center gap-2 px-2 py-1.5 border-pixel",
                              pos >= 0 ? "bg-scoreboard-slate text-line-white" : "bg-scoreboard-ink text-grey-300",
                            )}
                          >
                            <span
                              className={cn(
                                "w-5 h-5 flex items-center justify-center font-display text-[9px] shrink-0",
                                pos >= 0 ? "bg-card-yellow text-ink" : "bg-scoreboard-slate text-grey-400",
                              )}
                            >
                              {pos >= 0 ? pos + 1 : "·"}
                            </span>
                            <Flag flag={t.flag} size={18} />
                            <span className="font-body text-sm truncate">{t.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            <Button block onClick={() => setStep("terceros")} disabled={!allGroupsComplete}>
              {allGroupsComplete ? "Siguiente: terceros ▸" : "Completá el podio de los 12 grupos"}
            </Button>
          </>
        )}

        {step === "terceros" && (
          <>
            <p className="font-body text-xs text-grey-300">
              De los equipos que quedaron 3.º/4.º, elegí los{" "}
              <strong className="text-line-white">8 mejores terceros</strong> (uno por grupo).{" "}
              <span className="text-card-yellow">{thirdsCount}/8</span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {groups.map((gr) => {
                const g = gr.group as GroupLetter;
                const top2 = state.groupOrder[g] ?? [];
                const remaining = gr.teams.filter((t) => !top2.includes(t.id));
                const chosen = state.thirds[g];
                return (
                  <div key={g} className="bg-scoreboard-black border-pixel-thick shadow-pixel-sm p-3">
                    <div className="font-display text-[9px] tracking-[1px] text-line-white mb-2">GRUPO {g}</div>
                    <div className="flex flex-col gap-1.5">
                      {remaining.map((t) => {
                        const on = chosen === t.id;
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => toggleThird(g, t.id)}
                            className={cn(
                              "flex items-center gap-2 px-2 py-1.5 border-pixel",
                              on ? "bg-pitch-green text-ink" : "bg-scoreboard-ink text-grey-300",
                            )}
                          >
                            <Flag flag={t.flag} size={18} />
                            <span className="font-body text-sm flex-1 truncate text-left">{t.name}</span>
                            <span className="font-display text-[8px]">{on ? "✓ 3.º" : ""}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setStep("grupos")}>
                ◂ Grupos
              </Button>
              <Button block onClick={() => setStep("llaves")} disabled={!thirdsComplete}>
                {thirdsComplete ? "Siguiente: llaves ▸" : `Faltan ${8 - thirdsCount}`}
              </Button>
            </div>
          </>
        )}

        {step === "llaves" && (
          <>
            <div className="ds-pitch border-pixel-thick shadow-pixel-lg p-4 text-center outline outline-2 outline-dashed outline-card-yellow -outline-offset-[6px]">
              <div className="font-display text-[8px] tracking-[1px] text-line-white mb-2">🏆 CAMPEÓN</div>
              {champ ? (
                <>
                  <div className="flex justify-center">
                    <Flag flag={champ.flag} size={44} />
                  </div>
                  <div className="font-display text-line-white text-sm mt-2">{champ.name}</div>
                </>
              ) : (
                <div className="font-body text-sm text-grey-300">Completá las llaves hasta la final.</div>
              )}
            </div>

            {/* Mobile: por ronda */}
            <div className="lg:hidden flex flex-col gap-4">
              {(["R32", "R16", "QF", "SF", "F"] as Round[]).map((r) => (
                <div key={r}>
                  <div className="font-display text-[9px] tracking-[1px] text-line-white mb-2">{ROUND_LABEL[r]}</div>
                  <div className="grid grid-cols-2 gap-2">
                    {matchesByRound(r).map((m) => (
                      <MatchCard key={m.id} matchId={m.id} state={state} teams={teams} onPick={pickKo} />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: dos mitades enfrentadas (scroll horizontal si no entra) */}
            <div className="hidden lg:block overflow-x-auto pb-2">
              <div className="flex gap-3 w-max mx-auto">
                <BracketColumn ids={half("R32", "L")} label="16avos" state={state} teams={teams} onPick={pickKo} />
                <BracketColumn ids={half("R16", "L")} label="Octavos" state={state} teams={teams} onPick={pickKo} />
                <BracketColumn ids={half("QF", "L")} label="Cuartos" state={state} teams={teams} onPick={pickKo} />
                <BracketColumn ids={half("SF", "L")} label="Semis" state={state} teams={teams} onPick={pickKo} />
                <BracketColumn ids={["F"]} label="Final" state={state} teams={teams} onPick={pickKo} />
                <BracketColumn ids={half("SF", "R")} label="Semis" state={state} teams={teams} onPick={pickKo} />
                <BracketColumn ids={half("QF", "R")} label="Cuartos" state={state} teams={teams} onPick={pickKo} />
                <BracketColumn ids={half("R16", "R")} label="Octavos" state={state} teams={teams} onPick={pickKo} />
                <BracketColumn ids={half("R32", "R")} label="16avos" state={state} teams={teams} onPick={pickKo} />
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setStep("terceros")}>
                ◂ Terceros
              </Button>
              <Button variant="info" block onClick={onReset}>
                ↺ Reiniciar
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
