"use client";

import { useSyncExternalStore } from "react";

// Recordar el descarte en localStorage (por id), con store externo para no
// romper SSR ni usar setState-en-effect.
const storageKey = (id: string) => `prodolmo:dismiss:${id}`;
const cache = new Map<string, boolean>();
const subs = new Set<() => void>();

function isDismissed(id: string): boolean {
  if (!cache.has(id)) {
    cache.set(id, typeof window !== "undefined" && window.localStorage.getItem(storageKey(id)) === "1");
  }
  return cache.get(id) ?? false;
}
function dismiss(id: string): void {
  cache.set(id, true);
  if (typeof window !== "undefined") window.localStorage.setItem(storageKey(id), "1");
  subs.forEach((f) => f());
}
function subscribe(cb: () => void): () => void {
  subs.add(cb);
  return () => {
    subs.delete(cb);
  };
}

/**
 * Aviso que se puede cerrar con la ✕; recuerda el descarte (localStorage) por id,
 * así no vuelve a aparecer. Pasale el estilo del recuadro por `className`.
 */
export function DismissableNote({
  id,
  className,
  children,
}: {
  id: string;
  className?: string;
  children: React.ReactNode;
}) {
  const dismissed = useSyncExternalStore(subscribe, () => isDismissed(id), () => false);
  if (dismissed) return null;
  return (
    <div className={className}>
      {children}
      <button
        type="button"
        onClick={() => dismiss(id)}
        aria-label="Ocultar aviso"
        className="shrink-0 self-start font-display text-grey-400 hover:text-line-white text-xs px-1 -mt-0.5"
      >
        ✕
      </button>
    </div>
  );
}
