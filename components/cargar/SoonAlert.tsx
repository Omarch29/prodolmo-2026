import Link from "next/link";
import { Countdown } from "@/components/ui/Countdown";
import { Flag } from "@/components/ui/Flag";
import { cn } from "@/lib/utils";
import type { SoonMatch } from "@/lib/queries/dashboard";

/**
 * Alerta roja: el partido arranca en menos de 2h y todavía no lo cargaste.
 * Linkea a la pantalla de carga. Se usa en el inicio y en el detalle.
 */
export function SoonAlert({ match, className }: { match: SoonMatch; className?: string }) {
  return (
    <Link
      href={`/cargar/${match.id}`}
      className={cn(
        "flex items-center gap-3 bg-card-red border-pixel-thick shadow-pixel-sm px-3 py-2",
        className,
      )}
    >
      <span className="text-2xl shrink-0">⚠️</span>
      <div className="flex-1 min-w-0">
        <div className="font-display text-[9px] tracking-[1px] text-line-white">
          ¡NO CARGASTE ESTE PARTIDO!
        </div>
        <div className="flex items-center gap-1.5 font-display text-[10px] text-line-white mt-1">
          <Flag flag={match.home.flag} size={16} /> {match.home.code}
          <span className="text-line-white/70">vs</span>
          {match.away.code} <Flag flag={match.away.flag} size={16} />
        </div>
      </div>
      <Countdown target={match.kickoffAt} />
    </Link>
  );
}
