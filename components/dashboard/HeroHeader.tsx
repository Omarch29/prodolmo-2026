import { Avatar } from "@/components/ui/Avatar";

function StatChip({ label, value, valueClass }: { label: string; value: string; valueClass: string }) {
  return (
    <div className="flex flex-col items-center bg-scoreboard-ink border-pixel shadow-pixel-xs px-2.5 py-1.5">
      <span className="font-display text-[7px] tracking-[1px] text-card-yellow">{label}</span>
      <span className={`font-mono text-2xl leading-none mt-0.5 ${valueClass}`}>{value}</span>
    </div>
  );
}

export function HeroHeader({
  displayName,
  points,
  rank,
  playerCount,
}: {
  displayName: string;
  points: number;
  rank: number;
  playerCount: number;
}) {
  return (
    <header className="flex items-center gap-3 bg-scoreboard-black border-b-[4px] border-border p-4">
      <Avatar name={displayName} size={56} />
      <div className="flex-1 min-w-0">
        <div className="font-display text-[8px] tracking-[1.5px] text-pitch-green-lighter">HOLA 👋</div>
        <div className="font-display text-line-white text-sm mt-1 truncate">
          {displayName.toUpperCase()}
        </div>
        <div className="font-body text-xs text-grey-300 mt-1">{playerCount} jugadores</div>
      </div>
      <StatChip label="PUNTOS" value={String(points)} valueClass="text-goal-orange" />
      <StatChip label="PUESTO" value={`#${rank}`} valueClass="text-pitch-green-lighter" />
    </header>
  );
}
