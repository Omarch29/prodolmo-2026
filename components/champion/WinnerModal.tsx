"use client";

import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Confetti } from "@/components/fx/Confetti";

export type Winner = {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  points: number;
};

/**
 * Consagración del ganador del prode: se muestra en cada visita con el mundial
 * ya terminado. Las guirnaldas (confetti en loop) no paran hasta cerrar el
 * modal — al desmontar muere la animación. Sin persistencia: cerrar lo oculta
 * solo hasta la próxima carga de página.
 */
export function WinnerModal({ winners }: { winners: Winner[] }) {
  const [open, setOpen] = useState(true);
  if (!open || winners.length === 0) return null;

  const title = winners.length > 1 ? "CAMPEONES DEL PRODE" : "CAMPEÓN DEL PRODE";

  return (
    <div className="fixed inset-0 z-[80] bg-scoreboard-ink/85 flex items-center justify-center p-4">
      <Confetti loop />
      <div className="relative z-10 w-full max-w-md bg-scoreboard-black border-pixel-thick shadow-pixel-lg p-5 flex flex-col items-center gap-4 text-center">
        <div className="font-display text-[10px] tracking-[2px] text-line-white">👑 {title} 👑</div>
        {winners.map((w) => (
          <div key={w.userId} className="flex flex-col items-center gap-3">
            <Avatar name={w.displayName} src={w.avatarUrl} size={72} />
            <div className="font-display text-sm text-card-yellow leading-relaxed">
              🏆 {w.displayName} 🏆
            </div>
            <div className="font-mono text-card-yellow text-4xl">{w.points} PTS</div>
          </div>
        ))}
        <p className="font-body text-xs text-grey-300">
          Se terminó el Mundial 2026. ¡Gracias por jugar el prode!
        </p>
        <Button type="button" variant="secondary" size="sm" onClick={() => setOpen(false)}>
          CERRAR
        </Button>
      </div>
    </div>
  );
}
