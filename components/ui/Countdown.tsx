"use client";

import { Fragment, useSyncExternalStore } from "react";

type Seg = [number, string];

function segments(ms: number): Seg[] | null {
  if (ms <= 0) return null;
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (d > 0) return [[d, "DÍAS"], [h, "HS"], [m, "MIN"]];
  if (h > 0) return [[h, "HS"], [m, "MIN"], [sec, "SEG"]];
  return [[m, "MIN"], [sec, "SEG"]];
}

// Reloj compartido vía useSyncExternalStore: tickea cada segundo sin
// setState-en-effect y sin mismatch de hidratación (server -> null).
function subscribe(onChange: () => void): () => void {
  const id = setInterval(onChange, 1000);
  return () => clearInterval(id);
}
function getSnapshot(): number {
  return Math.floor(Date.now() / 1000); // segundos: snapshot estable dentro del mismo segundo
}
function getServerSnapshot(): null {
  return null;
}

/** Cuenta regresiva al estilo marcador hacia `target` (ISO). */
export function Countdown({ target }: { target: string }) {
  const nowSec = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (nowSec === null) {
    return <span className="font-mono text-grey-400 text-2xl">··:··</span>;
  }

  const segs = segments(new Date(target).getTime() - nowSec * 1000);
  if (!segs) {
    return <span className="font-display text-card-red text-xs tracking-wide">EN JUEGO</span>;
  }

  return (
    <div className="inline-flex items-stretch gap-1">
      {segs.map(([value, unit], i) => (
        <Fragment key={unit}>
          {i > 0 && <span className="font-mono text-grey-400 self-center text-xl">:</span>}
          <div className="bg-scoreboard-ink border-pixel px-1.5 py-1 text-center min-w-[34px]">
            <div className="font-mono text-card-yellow text-2xl leading-none">
              {String(value).padStart(2, "0")}
            </div>
            <span className="font-display text-grey-300 text-[6px] tracking-[1.5px] block mt-0.5">
              {unit}
            </span>
          </div>
        </Fragment>
      ))}
    </div>
  );
}
