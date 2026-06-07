"use client";

import { useState, useTransition } from "react";
import { saveSimPick, resetSim } from "@/actions/simulations";
import { Button } from "@/components/ui/Button";
import { Flag } from "@/components/ui/Flag";
import { cn } from "@/lib/utils";
import { participantsOf, winnerOf, championOf } from "@/lib/sim/bracket";
import type { BracketSlot, TeamInfo } from "@/lib/queries/sim";

const ROUND_LABEL: Record<string, string> = {
  "QF-1": "CUARTOS · LLAVE 1",
  "QF-2": "CUARTOS · LLAVE 2",
  "QF-3": "CUARTOS · LLAVE 3",
  "QF-4": "CUARTOS · LLAVE 4",
  "SF-1": "SEMIFINAL 1",
  "SF-2": "SEMIFINAL 2",
  FINAL: "FINAL DEL MUNDIAL",
};

export function Simulator({
  slots,
  teams,
  initialPicks,
}: {
  slots: BracketSlot[];
  teams: Record<string, TeamInfo>;
  initialPicks: Record<string, string>;
}) {
  const [picks, setPicks] = useState<Record<string, string>>(initialPicks);
  const [, startTransition] = useTransition();

  const participants = (slot: BracketSlot) => participantsOf(slot, slots, picks);
  const winner = (slot: BracketSlot) => winnerOf(slot, slots, picks);

  const pickTeam = (slot: BracketSlot, teamId: string | null) => {
    if (!teamId) return;
    setPicks((prev) => ({ ...prev, [slot.slot]: teamId }));
    startTransition(async () => {
      await saveSimPick({ slot: slot.slot, teamId });
    });
  };

  const onReset = () => {
    setPicks({});
    startTransition(async () => {
      await resetSim();
    });
  };

  const champId = championOf(slots, picks);
  const champ = champId ? teams[champId] : undefined;

  // Agrupar slots por etapa, en orden.
  const rounds: { stageName: string; slots: BracketSlot[] }[] = [];
  for (const s of slots) {
    const last = rounds[rounds.length - 1];
    if (last && last.stageName === s.stageName) last.slots.push(s);
    else rounds.push({ stageName: s.stageName, slots: [s] });
  }

  return (
    <div>
      <header className="flex items-center justify-between bg-scoreboard-black border-b-[4px] border-border px-4 py-3">
        <span className="font-display text-line-white text-sm flex items-center gap-2">🎮 SIMULADOR</span>
        <span className="font-display text-[8px] border-pixel px-2 py-1 bg-sky-blue text-line-white">HIPOTÉTICO</span>
      </header>

      <div className="flex flex-col gap-5 py-5">
        <div className="mx-4 flex items-start gap-2 bg-scoreboard-slate border-pixel px-3 py-2">
          <span className="text-lg">🧪</span>
          <p className="font-body text-xs text-grey-300">
            Probá quién sale campeón completando el cuadro. <strong className="text-line-white">No afecta</strong> tus pronósticos del PRODE.
          </p>
        </div>

        {/* Campeón proyectado */}
        <div className="mx-4 bg-bg-field border-pixel-thick shadow-pixel-lg p-5 text-center">
          <div className="font-display text-[8px] tracking-[1px] text-line-white mb-3">🏆 CAMPEÓN DEL MUNDIAL</div>
          {champ ? (
            <>
              <div className="flex justify-center">
                <Flag flag={champ.flag} size={48} />
              </div>
              <div className="font-display text-line-white text-sm mt-3">{champ.name}</div>
            </>
          ) : (
            <>
              <div className="text-5xl leading-none opacity-40">🏆</div>
              <div className="font-body text-sm text-grey-300 mt-3">
                Completá la final para ver al campeón.
              </div>
            </>
          )}
        </div>

        {/* Rondas */}
        {rounds.map((round) => (
          <div key={round.stageName} className="flex flex-col gap-3">
            <div className="px-4 font-display text-[10px] tracking-[1px] text-line-white">
              {round.stageName.toUpperCase()}
            </div>
            {round.slots.map((slot) => {
              const [homeId, awayId] = participants(slot);
              const win = winner(slot);
              return (
                <div key={slot.slot} className="mx-4 bg-scoreboard-black border-pixel-thick shadow-pixel-sm">
                  <div className="font-display text-[7px] tracking-[1px] text-grey-300 px-3 py-2 border-b-[2px] border-scoreboard-slate">
                    {ROUND_LABEL[slot.slot] ?? slot.slot}
                  </div>
                  {[homeId, awayId].map((teamId, idx) => {
                    const t = teamId ? teams[teamId] : undefined;
                    const selected = win !== null && win === teamId;
                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={!teamId}
                        onClick={() => pickTeam(slot, teamId)}
                        className={cn(
                          "w-full flex items-center gap-2 px-3 py-2.5 border-b-[2px] border-scoreboard-slate last:border-b-0 text-left",
                          selected ? "bg-pitch-green text-ink" : "text-line-white disabled:text-grey-500",
                        )}
                      >
                        <Flag flag={t?.flag ?? null} size={20} />
                        <span className="font-display text-[10px] flex-1">{t?.name ?? "Por definir"}</span>
                        <span className="font-display text-[7px] tracking-[0.5px]">
                          {selected ? "✓ PASA" : teamId ? "ELEGIR" : "—"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ))}

        <div className="px-4">
          <Button variant="info" block onClick={onReset}>
            ↺ Reiniciar simulación
          </Button>
        </div>
      </div>
    </div>
  );
}
