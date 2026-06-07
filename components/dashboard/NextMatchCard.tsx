import Link from "next/link";
import { Countdown } from "@/components/ui/Countdown";
import { Flag } from "@/components/ui/Flag";
import { buttonClassName } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { NextMatch, TeamLite } from "@/lib/queries/dashboard";

function Team({ t }: { t: TeamLite }) {
  return (
    <div className="flex flex-col items-center gap-1 w-20">
      <Flag flag={t.flag} size={40} />
      <span className="font-display text-[10px] text-line-white">{t.code}</span>
    </div>
  );
}

export function NextMatchCard({ match, bare = false }: { match: NextMatch; bare?: boolean }) {
  return (
    <div
      className={cn(
        bare ? "" : "mx-4",
        "ds-pitch border-pixel-thick shadow-pixel",
        // si todavía no cargaste, resaltar con borde punteado
        !match.alreadyPredicted && "outline outline-2 outline-dashed outline-card-yellow -outline-offset-4",
      )}
    >
      <div className="flex justify-between items-center bg-scoreboard-ink px-3 py-2 font-display text-[8px] tracking-[1.5px] text-line-white">
        <span>⚽ PRÓXIMO PARTIDO</span>
        <span className="text-pitch-green-lighter">{match.stageName}</span>
      </div>

      <div className="flex items-center justify-around py-5 px-3">
        <Team t={match.home} />
        <span className="font-display text-line-white text-xs">VS</span>
        <Team t={match.away} />
      </div>

      <div className="flex flex-col items-center gap-2 pb-4">
        <span className="font-display text-[8px] tracking-[1.5px] text-grey-300">EMPIEZA EN</span>
        <Countdown target={match.kickoffAt} />
      </div>

      <div className="px-3 pb-3">
        <Link href="/cargar" className={buttonClassName({ size: "sm", block: true })}>
          {match.alreadyPredicted ? "✓ Ya cargado — editar" : "⚽ Cargar pronóstico"}
        </Link>
      </div>
    </div>
  );
}
