import type { CargarMatch } from "@/lib/queries/cargar";

export type Section = { key: string; label: string; isGroup: boolean; order: number };

const KO_ORDER: Record<string, number> = {
  "Ronda de 32": 4,
  Octavos: 5,
  Cuartos: 6,
  Semifinales: 7,
  "Final y 3.º puesto": 8,
};

const KO_LABEL: Record<string, string> = {
  "Ronda de 32": "16avos",
  Octavos: "Octavos",
  Cuartos: "Cuartos",
  Semifinales: "Semis",
  "Final y 3.º puesto": "Final/3º",
};

/** Sección a la que pertenece un partido (grupos se parten por fecha). */
export function sectionOf(m: Pick<CargarMatch, "stageName" | "matchday">): Section {
  if (m.stageName === "Fase de grupos") {
    const md = m.matchday ?? 1;
    return { key: `g${md}`, label: `Grupos F${md}`, isGroup: true, order: md };
  }
  return {
    key: m.stageName,
    label: KO_LABEL[m.stageName] ?? m.stageName,
    isGroup: false,
    order: KO_ORDER[m.stageName] ?? 99,
  };
}

/** Secciones presentes en el fixture, ordenadas. */
export function sectionsFrom(matches: CargarMatch[]): Section[] {
  const map = new Map<string, Section>();
  for (const m of matches) {
    const s = sectionOf(m);
    if (!map.has(s.key)) map.set(s.key, s);
  }
  return [...map.values()].sort((a, b) => a.order - b.order);
}

/** Sección del próximo partido a jugarse (o la primera). `nowMs` inyectable (tests). */
export function defaultSectionKey(matches: CargarMatch[], nowMs: number = Date.now()): string {
  const next = matches
    .filter((m) => m.status === "scheduled" && new Date(m.kickoffAt).getTime() > nowMs)
    .sort((a, b) => new Date(a.kickoffAt).getTime() - new Date(b.kickoffAt).getTime())[0];
  return next ? sectionOf(next).key : sectionsFrom(matches)[0]?.key ?? "";
}
