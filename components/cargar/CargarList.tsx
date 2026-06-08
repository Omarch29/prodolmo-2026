"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { MatchListRow } from "./MatchListRow";
import { cn } from "@/lib/utils";
import { sectionOf, sectionsFrom, defaultSectionKey } from "@/lib/cargar/sections";
import type { CargarMatch } from "@/lib/queries/cargar";

type Tab = "play" | "done";

const TZ = "America/Argentina/Buenos_Aires";
const dayKey = (iso: string) => new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date(iso));
const dayLabel = (iso: string) =>
  new Intl.DateTimeFormat("es-AR", { timeZone: TZ, weekday: "short", day: "2-digit", month: "2-digit" }).format(
    new Date(iso),
  );

const asc = (a: CargarMatch, b: CargarMatch) =>
  new Date(a.kickoffAt).getTime() - new Date(b.kickoffAt).getTime();

export function CargarList({ matches }: { matches: CargarMatch[] }) {
  const porJugar = useMemo(() => matches.filter((m) => m.status !== "finished"), [matches]);
  const jugados = useMemo(() => matches.filter((m) => m.status === "finished"), [matches]);

  const playDefault = useMemo(() => defaultSectionKey(porJugar), [porJugar]);
  const doneDefault = useMemo(() => {
    const last = [...jugados].sort((a, b) => -asc(a, b))[0];
    return last ? sectionOf(last).key : sectionsFrom(jugados)[0]?.key ?? "";
  }, [jugados]);

  // Estado inicial desde la URL (?tab=&sec=&day=) para conservar dónde estabas
  // al volver desde el detalle de un partido. Lo escribimos con history.replaceState
  // (sin recargar datos del server) al cambiar de tab/sección/día.
  const sp = useSearchParams();
  const [tab, setTab] = useState<Tab>(sp.get("tab") === "done" ? "done" : "play");
  const [sectionKey, setSectionKey] = useState(
    sp.get("sec") ?? (sp.get("tab") === "done" ? doneDefault : playDefault),
  );
  const [day, setDay] = useState<string | null>(sp.get("day"));

  const subset = tab === "play" ? porJugar : jugados;
  const sections = useMemo(() => sectionsFrom(subset), [subset]);
  const activeSection = sections.find((s) => s.key === sectionKey) ?? sections[0];

  const sectionMatches = useMemo(() => {
    const list = subset.filter((m) => sectionOf(m).key === activeSection?.key).sort(asc);
    return tab === "done" ? list.reverse() : list;
  }, [subset, activeSection, tab]);

  const days = useMemo(() => {
    if (!activeSection?.isGroup) return [] as [string, string][];
    const map = new Map<string, string>();
    for (const m of sectionMatches) map.set(dayKey(m.kickoffAt), dayLabel(m.kickoffAt));
    return [...map.entries()];
  }, [activeSection, sectionMatches]);

  const effectiveDay = activeSection?.isGroup
    ? day && days.some(([k]) => k === day)
      ? day
      : days[0]?.[0] ?? null
    : null;

  const visible = effectiveDay
    ? sectionMatches.filter((m) => dayKey(m.kickoffAt) === effectiveDay)
    : sectionMatches;

  // Refleja el filtro actual en la URL sin disparar navegación/refetch.
  const persist = (t: Tab, s: string, d: string | null) => {
    const params = new URLSearchParams();
    if (t !== "play") params.set("tab", t);
    if (s) params.set("sec", s);
    if (d) params.set("day", d);
    const qs = params.toString();
    window.history.replaceState(window.history.state, "", qs ? `/cargar?${qs}` : "/cargar");
  };

  const selectTab = (t: Tab) => {
    const s = t === "play" ? playDefault : doneDefault;
    setTab(t);
    setSectionKey(s);
    setDay(null);
    persist(t, s, null);
  };
  const selectSection = (k: string) => {
    setSectionKey(k);
    setDay(null);
    persist(tab, k, null);
  };
  const selectDay = (k: string) => {
    setDay(k);
    persist(tab, sectionKey, k);
  };

  const tabBtn = "font-display text-[10px] tracking-[1px] border-pixel px-3 py-2";
  const sec = "font-display text-[8px] tracking-[1px] border-pixel px-2.5 py-2";
  const chip = "font-body text-xs border-pixel px-2 py-1";

  return (
    <div className="flex flex-col gap-3">
      {/* Toggle Por jugar / Jugados */}
      <div className="flex gap-2 px-4">
        <button
          type="button"
          onClick={() => selectTab("play")}
          className={cn(tabBtn, tab === "play" ? "bg-card-yellow text-ink" : "bg-scoreboard-slate text-grey-300")}
        >
          ⚽ POR JUGAR
        </button>
        <button
          type="button"
          onClick={() => selectTab("done")}
          className={cn(tabBtn, tab === "done" ? "bg-card-yellow text-ink" : "bg-scoreboard-slate text-grey-300")}
        >
          ✓ JUGADOS
        </button>
      </div>

      {subset.length === 0 ? (
        <div className="mx-4 bg-scoreboard-slate border-pixel-thick shadow-pixel p-6 font-body text-sm text-grey-300">
          {tab === "play" ? "No hay partidos por jugar." : "Todavía no se jugó ningún partido."}
        </div>
      ) : (
        <>
          {/* Secciones */}
          <div className="flex flex-wrap gap-2 px-4">
            {sections.map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => selectSection(s.key)}
                className={cn(
                  sec,
                  s.key === activeSection?.key ? "bg-pitch-green text-ink" : "bg-scoreboard-slate text-grey-300",
                )}
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
                  onClick={() => selectDay(k)}
                  className={cn(chip, effectiveDay === k ? "bg-card-yellow text-ink" : "bg-scoreboard-black text-grey-300")}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* Lista: 1 columna en mobile, varias en desktop */}
          <div key={`${tab}-${activeSection?.key}-${effectiveDay ?? ""}`} className="grid grid-cols-1 lg:grid-cols-2 gap-3 px-4">
            {visible.map((m, i) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15, delay: Math.min(i * 0.015, 0.25) }}
              >
                <MatchListRow m={m} />
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
