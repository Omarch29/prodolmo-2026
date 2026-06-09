"use client";

import { useSyncExternalStore } from "react";

// Preferencia "confirmar guardar" persistida en localStorage, vía store externo
// (mismo patrón que useConfetti, sin setState-en-effect ni mismatch de hidratación).
// ON (default) = al guardar un pronóstico se muestra el paso de confirmación.
const KEY = "prodolmo:confirmsave";
let cache: boolean | null = null;
const subs = new Set<() => void>();

function getSnapshot(): boolean {
  if (cache === null) {
    cache = typeof window !== "undefined" ? window.localStorage.getItem(KEY) !== "0" : true;
  }
  return cache;
}
function getServerSnapshot(): boolean {
  return true;
}
function subscribe(cb: () => void): () => void {
  subs.add(cb);
  return () => {
    subs.delete(cb);
  };
}

export function toggleConfirmSave(): void {
  const next = !getSnapshot();
  cache = next;
  if (typeof window !== "undefined") window.localStorage.setItem(KEY, next ? "1" : "0");
  subs.forEach((f) => f());
}

export function useConfirmSave(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
