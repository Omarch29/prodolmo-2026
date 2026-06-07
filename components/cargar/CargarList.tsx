"use client";

import { useMemo, useState } from "react";
import { MatchListRow } from "./MatchListRow";
import { cn } from "@/lib/utils";
import { sectionOf, sectionsFrom } from "@/lib/cargar/sections";
import type { CargarMatch } from "@/lib/queries/cargar";

const TZ = "America/Argentina/Buenos_Aires";
const dayKey = (iso: string) => new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date(iso));
const dayLabel = (iso: string) =>
  new Intl.DateTimeFormat("es-AR", { timeZone: TZ, weekday: "short", day: "2-digit", month: "2-digit" }).format(
    new Date(iso),
  );

const byKickoff = (a: CargarMatch, b: CargarMatch) =>
  new Date(a.kickoffAt).getTime() - new Date(b.kickoffAt).getTime();

export function CargarList({ matches, defaultKey }: { matches: CargarMatch[]; defaultKey: string }) {
  const sections = useMemo(() => sectionsFrom(matches), [matches]);

  const [sectionKey, setSectionKey] = useState(defaultKey);
  const [day, setDay] = useState<string | null>(null);

  const activeSection = sections.find((s) => s.key === sectionKey) ?? sections[0];

  const sectionMatches = useMemo(
    () => matches.filter((m) => sectionOf(m).key === sectionKey).sort(byKickoff),
    [matches, sectionKey],
  );

  const days = useMemo(() => {
    if (!activeSection?.isGroup) return [] as [string, string][];
    const map = new Map<string, string>();
    for (const m of sectionMatches) map.set(dayKey(m.kickoffAt), dayLabel(m.kickoffAt));
    return [...map.entries()];
  }, [activeSection, sectionMatches]);

  // En grupos siempre hay un día seleccionado (sin "Todos"); por defecto el primero.
  const effectiveDay = activeSection?.isGroup
    ? day && days.some(([k]) => k === day)
      ? day
      : days[0]?.[0] ?? null
    : null;

  const visible = effectiveDay
    ? sectionMatches.filter((m) => dayKey(m.kickoffAt) === effectiveDay)
    : sectionMatches;

  const selectSection = (k: string) => {
    setSectionKey(k);
    setDay(null);
  };

  const tab = "font-display text-[8px] tracking-[1px] border-pixel px-2.5 py-2";
  const chip = "font-body text-xs border-pixel px-2 py-1";

  return (
    <div className="flex flex-col gap-3">
      {/* Tabs por sección (envuelven a la fila de abajo si no entran) */}
      <div className="flex flex-wrap gap-2 px-4">
        {sections.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => selectSection(s.key)}
            className={cn(tab, s.key === sectionKey ? "bg-pitch-green text-ink" : "bg-scoreboard-slate text-grey-300")}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Subfiltro por día (solo grupos) */}
      {activeSection?.isGroup && days.length > 1 && (
        <div className="flex flex-wrap gap-2 px-4">
          {days.map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => setDay(k)}
              className={cn(chip, effectiveDay === k ? "bg-card-yellow text-ink" : "bg-scoreboard-black text-grey-300")}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Lista: 1 columna en mobile, varias en desktop */}
      {visible.length === 0 ? (
        <div className="mx-4 bg-scoreboard-slate border-pixel-thick shadow-pixel p-6 font-body text-sm text-grey-300">
          No hay partidos en esta sección.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 px-4">
          {visible.map((m) => (
            <MatchListRow key={m.id} m={m} />
          ))}
        </div>
      )}
    </div>
  );
}
