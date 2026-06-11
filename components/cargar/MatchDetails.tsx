import { countryFlag } from "@/lib/flags/country";
import type { MatchReferee } from "@/lib/queries/cargar";

const REFEREE_ROLE: Record<string, string> = {
  REFEREE: "Árbitro",
  ASSISTANT_REFEREE_N1: "Asistente 1",
  ASSISTANT_REFEREE_N2: "Asistente 2",
  FOURTH_OFFICIAL: "Cuarto árbitro",
  VIDEO_ASSISTANT_REFEREE_N1: "VAR",
  VIDEO_ASSISTANT_REFEREE_N2: "AVAR",
};

const fmtKickoff = (iso: string) =>
  new Intl.DateTimeFormat("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 px-3 py-2 border-b-[2px] border-scoreboard-slate last:border-b-0">
      <span className="font-display text-[7px] tracking-[0.5px] text-grey-400 w-20 shrink-0 pt-0.5">
        {label}
      </span>
      <span className="font-body text-sm text-line-white flex-1 min-w-0">{children}</span>
    </li>
  );
}

/**
 * Ficha del partido detrás de un desplegable ("Ver detalles del partido").
 * Usa <details> nativo: sin JS de cliente, colapsado por defecto para no recargar
 * la pantalla. Muestra fecha, instancia, grupo/jornada, sede y árbitros (estos
 * últimos los completa la FIFA cerca del torneo).
 */
export function MatchDetails({
  kickoffAt,
  stageName,
  groupName,
  matchday,
  venue,
  referees,
}: {
  kickoffAt: string;
  stageName: string;
  groupName: string | null;
  matchday: number | null;
  venue: string | null;
  referees: MatchReferee[];
}) {
  const instancia =
    groupName && matchday
      ? `${stageName} · Grupo ${groupName} · Fecha ${matchday}`
      : groupName
        ? `${stageName} · Grupo ${groupName}`
        : stageName;

  return (
    <details className="mx-4 group bg-scoreboard-black border-pixel-thick shadow-pixel-sm">
      <summary className="flex items-center gap-2 px-3 py-2 cursor-pointer select-none list-none font-display text-[9px] tracking-[1px] text-line-white">
        <span>📋 VER DETALLES DEL PARTIDO</span>
        <span className="ml-auto text-grey-400 group-open:rotate-90 transition-transform">▸</span>
      </summary>

      <ul className="border-t-[3px] border-border">
        <Row label="Cuándo">
          <span className="capitalize">{fmtKickoff(kickoffAt)}</span> hs
        </Row>
        <Row label="Instancia">{instancia}</Row>
        {venue && <Row label="Sede">{venue}</Row>}

        {referees.length > 0 ? (
          referees.map((r, i) => (
            <Row key={i} label={(r.role && REFEREE_ROLE[r.role]) ?? "Árbitro"}>
              <span className="flex items-center gap-2">
                <span className="flex-1 truncate">{r.name}</span>
                {r.nationality && (
                  <span className="text-xs text-grey-300 flex items-center gap-1 shrink-0">
                    <span className="text-base">{countryFlag(r.nationality) ?? "🏳️"}</span>
                    {r.nationality}
                  </span>
                )}
              </span>
            </Row>
          ))
        ) : (
          <Row label="Árbitros">
            <span className="text-grey-400 text-xs">Aún no los asignó la FIFA.</span>
          </Row>
        )}
      </ul>
    </details>
  );
}
