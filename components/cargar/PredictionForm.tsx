"use client";

import { useActionState, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { savePrediction, type SavePredictionState } from "@/actions/predictions";
import { Stepper } from "@/components/ui/Stepper";
import { Button } from "@/components/ui/Button";
import { Flag } from "@/components/ui/Flag";
import { useConfirmSave } from "@/components/fx/useConfirmSave";
import { cn } from "@/lib/utils";
import type { TeamLite } from "@/lib/queries/dashboard";

const initialState: SavePredictionState = { error: null };

// Feature graciosa (rama fun): al guardar, un personaje random aparece y un
// globo de diálogo flotando arriba pregunta si estás seguro. Imágenes en
// public/pixelart/ (redimensionadas desde docs/IMAGES/PixelArt).
const CHARACTERS = [
  "Lito1.png", "Mateo1.png", "Pablo2.png", "Lucho1.png", "Pablo1.png", "Jula1.png",
  "makki1.png", "makki3.png", "makki2.png", "Santi2.png", "matt2.png", "Santi1.png",
  "Matt1.png", "Gabo1.png", "fer2.png", "Carlos1.png", "fer1.png",
] as const;

/** Índice random distinto del actual (para que el personaje cambie en cada apertura). */
function randomCharacter(exclude: number): number {
  if (CHARACTERS.length <= 1) return 0;
  const i = Math.floor(Math.random() * (CHARACTERS.length - 1));
  return i >= exclude ? i + 1 : i;
}

export function PredictionForm({
  matchId,
  home,
  away,
  homeTeamId,
  awayTeamId,
  isKnockout,
  initial,
  back = "/cargar",
}: {
  matchId: string;
  home: TeamLite;
  away: TeamLite;
  homeTeamId: string | null;
  awayTeamId: string | null;
  isKnockout: boolean;
  initial: { home: number; away: number; winnerTeamId: string | null } | null;
  back?: string;
}) {
  const [h, setH] = useState(initial?.home ?? 0);
  const [a, setA] = useState(initial?.away ?? 0);
  const [winner, setWinner] = useState(initial?.winnerTeamId ?? "");
  const [state, action, pending] = useActionState(savePrediction, initialState);

  // Feature graciosa: "predecir con IA" no predice nada, tira un chiste y se va.
  const [aiState, setAiState] = useState<"idle" | "shown" | "gone">("idle");
  const triggerAi = () => {
    setAiState("shown");
    setTimeout(() => setAiState("gone"), 2600);
  };

  // Modal de confirmación con personaje random (rama fun). Se puede desactivar
  // con el toggle "Confirmar guardar" (guarda directo, sin el modal).
  const confirmSave = useConfirmSave();
  const [confirming, setConfirming] = useState(false);
  const [charIdx, setCharIdx] = useState(0);
  const openConfirm = () => {
    setCharIdx((c) => randomCharacter(c));
    setConfirming(true);
  };

  const tie = isKnockout && h === a;

  return (
    <form action={action} className="flex flex-col gap-4 px-4">
      <input type="hidden" name="matchId" value={matchId} />
      <input type="hidden" name="back" value={back} />
      <input type="hidden" name="predHome" value={h} />
      <input type="hidden" name="predAway" value={a} />
      {tie && <input type="hidden" name="winnerTeamId" value={winner} />}

      <div className="flex items-center justify-center gap-4">
        <Stepper value={h} onChange={setH} />
        <span className="font-display text-line-white text-xl">-</span>
        <Stepper value={a} onChange={setA} />
      </div>

      {tie && (
        <div className="bg-scoreboard-black border-pixel-thick shadow-pixel-sm p-3">
          <div className="font-display text-[8px] tracking-[1px] text-goal-orange mb-2">
            ⚠ EMPATE — ¿QUIÉN PASA DE RONDA?
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: homeTeamId, t: home },
              { id: awayTeamId, t: away },
            ].map(({ id, t }) => (
              <button
                key={t.code}
                type="button"
                onClick={() => id && setWinner(id)}
                className={cn(
                  "font-display text-[9px] border-pixel px-2 py-2 flex items-center justify-center gap-1.5",
                  winner && winner === id
                    ? "bg-pitch-green text-ink"
                    : "bg-scoreboard-slate text-line-white",
                )}
              >
                <Flag flag={t.flag} size={18} /> {t.code}
              </button>
            ))}
          </div>
        </div>
      )}

      {state.error && (
        <p className="font-body text-sm text-card-red bg-scoreboard-slate border-pixel px-3 py-2">
          {state.error}
        </p>
      )}

      {aiState === "idle" && (
        <button
          type="button"
          onClick={triggerAi}
          className="font-display text-[9px] tracking-[1px] border-pixel px-3 py-2 bg-sky-blue text-line-white flex items-center justify-center gap-2 shadow-pixel-xs active:translate-x-[2px] active:translate-y-[2px] active:shadow-pixel-pressed"
        >
          ✨ PREDECIR RESULTADO CARGANDO IA
        </button>
      )}
      {aiState === "shown" && (
        <p className="font-body text-sm text-line-white bg-scoreboard-slate border-pixel border-l-[6px] border-l-card-red px-3 py-2">
          Que te pensás que me regalan los tokens? gordo.
        </p>
      )}

      <Button
        type={confirmSave ? "button" : "submit"}
        block
        onClick={confirmSave ? openConfirm : undefined}
        disabled={pending}
      >
        {pending ? "Guardando..." : "⚽ Guardar pronóstico"}
      </Button>

      <AnimatePresence>
        {confirming && (
          <motion.div
            className="fixed inset-0 z-[80] flex flex-col items-center gap-2 bg-black/80 p-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Cuadro de diálogo flotando arriba, apuntando al personaje */}
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 420, damping: 22, delay: 0.06 }}
              className="relative z-10 mt-1 w-full max-w-xs shrink-0 bg-scoreboard-black border-pixel-thick shadow-pixel-lg p-4"
            >
              <p className="font-display text-line-white text-[11px] text-center leading-relaxed mb-4">
                Esa boludes vas a cagar?
              </p>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={pending}
                  className="flex-1 font-display text-[9px] tracking-[1px] border-pixel px-2 py-2.5 bg-pitch-green text-ink shadow-pixel-xs active:translate-x-[2px] active:translate-y-[2px] active:shadow-pixel-pressed disabled:opacity-60"
                >
                  {pending ? "GUARDANDO..." : "✓ GUARDAR RESULTADO"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  disabled={pending}
                  className="flex-1 font-display text-[9px] tracking-[1px] border-pixel px-2 py-2.5 bg-card-red text-line-white shadow-pixel-xs active:translate-x-[2px] active:translate-y-[2px] active:shadow-pixel-pressed disabled:opacity-60"
                >
                  ✕ CANCELAR
                </button>
              </div>
              {/* colita del globo apuntando al personaje */}
              <div className="absolute left-1/2 -bottom-[14px] -translate-x-1/2 h-0 w-0 border-l-[10px] border-r-[10px] border-t-[14px] border-l-transparent border-r-transparent border-t-scoreboard-black" />
            </motion.div>

            {/* Personaje gigante: ocupa todo el alto restante (parece que habla) */}
            <motion.img
              key={charIdx}
              src={`/pixelart/${CHARACTERS[charIdx] ?? CHARACTERS[0]}`}
              alt=""
              draggable={false}
              initial={{ opacity: 0, y: 40, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="min-h-0 w-full flex-1 object-contain"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}
